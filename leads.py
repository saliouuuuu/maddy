"""Trova attività locali senza sito web vero tramite Google Places API (New).

Uso:
  python leads.py --niche "nail artist" --cities "Savigliano,Alba" --n 15
  python leads.py                      # usa niches.txt e cities.txt
  python leads.py coverage             # tabella nicchia x città dei lead restituiti
"""
import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import date
from urllib.parse import urlparse

DIR = os.path.dirname(os.path.abspath(__file__))
SERVED = os.path.join(DIR, "served.csv")
CONTACTED = os.path.join(DIR, "contacted.csv")
OUTPUT = os.path.join(DIR, "oggi.csv")
ENDPOINT = "https://places.googleapis.com/v1/places:searchText"
FIELDS = ["id", "displayName", "nationalPhoneNumber", "internationalPhoneNumber", "websiteUri",
          "rating", "userRatingCount", "googleMapsUri", "formattedAddress", "businessStatus"]
FIELD_MASK = ",".join("places." + f for f in FIELDS) + ",nextPageToken"
SOCIAL_DOMAINS = ["instagram.com", "facebook.com", "linktr.ee", "wa.me", "beacons.ai", "tiktok.com"]
SERVED_COLS = ["place_id", "telefono", "nicchia", "citta", "data"]


def load_key():
    key = os.environ.get("GOOGLE_API_KEY")
    env = os.path.join(DIR, ".env")
    if not key and os.path.exists(env):
        for line in open(env, encoding="utf-8"):
            k, _, v = line.strip().partition("=")
            if k.strip() == "GOOGLE_API_KEY":
                key = v.strip().strip("'\"")
    if not key:
        sys.exit("GOOGLE_API_KEY mancante in .env")
    return key


def read_list(path):
    if not os.path.exists(path):
        sys.exit(f"File mancante: {path}")
    return [l.strip() for l in open(path, encoding="utf-8") if l.strip()]


def norm_phone(p):
    d = re.sub(r"\D", "", p or "")
    if d.startswith("0039"):
        d = d[4:]
    elif d.startswith("39") and len(d) > 10:
        d = d[2:]
    return d


def search(key, query):
    """Tutte le pagine di risultati per una query (max 60, limite dell'API)."""
    places, token = [], None
    while True:
        body = {"textQuery": query, "languageCode": "it", "regionCode": "IT", "pageSize": 20}
        if token:
            body["pageToken"] = token
        req = urllib.request.Request(ENDPOINT, data=json.dumps(body).encode(), method="POST", headers={
            "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK})
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=30) as r:
                    data = json.load(r)
                break
            except urllib.error.HTTPError as e:
                if e.code < 500 or attempt == 2:
                    sys.exit(f"Errore API {e.code}: {e.read().decode(errors='replace')}")
                time.sleep(2 ** attempt)
        places += data.get("places", [])
        token = data.get("nextPageToken")
        if not token:
            return places


def social_link(uri):
    """None se non c'è sito, il link se è un social, False se è un sito vero."""
    if not uri:
        return None
    u = urlparse(uri if "://" in uri else "https://" + uri)
    host = (u.hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    if any(host == d or host.endswith("." + d) for d in SOCIAL_DOMAINS):
        return uri
    if host == "sites.google.com" or (host == "google.com" and u.path.startswith("/sites")):
        return uri
    return False


def check(p, city, min_reviews):
    """Restituisce (motivo, None) se passa, (None, scarto) altrimenti."""
    social = social_link(p.get("websiteUri"))
    if social is False:
        return None, "sito vero"
    if p.get("businessStatus") != "OPERATIONAL":
        return None, "non operativa"
    phone = p.get("internationalPhoneNumber") or p.get("nationalPhoneNumber")
    if not phone:
        return None, "senza telefono"
    reviews = p.get("userRatingCount", 0)
    if reviews < min_reviews:
        return None, "poche recensioni"
    addr = p.get("formattedAddress", "")
    if re.search(r"\b12\d{3}\b.*\bCN\b", addr):
        zona = "provincia di Cuneo"
    elif city.lower() in addr.lower():
        zona = f"indirizzo a {city}"
    else:
        return None, "fuori zona"
    sito = f"solo social ({social})" if social else "nessun sito"
    tel = "cellulare" if norm_phone(phone).startswith("3") else "fisso"
    return f"{sito}; OPERATIONAL; {tel} {phone}; {reviews} recensioni >= {min_reviews}; {zona}", None


def run(args):
    key = load_key()
    niches = [args.niche] if args.niche else read_list(os.path.join(DIR, "niches.txt"))
    cities = [c.strip() for c in args.cities.split(",") if c.strip()] if args.cities \
        else read_list(os.path.join(DIR, "cities.txt"))

    seen_ids, seen_phones = set(), set()
    if os.path.exists(SERVED):
        for r in csv.DictReader(open(SERVED, encoding="utf-8")):
            seen_ids.add(r["place_id"])
            seen_phones.add(norm_phone(r["telefono"]))
    if os.path.exists(CONTACTED):
        rows = list(csv.reader(open(CONTACTED, encoding="utf-8")))
        col = 0
        if rows and not any(len(norm_phone(c)) >= 6 for c in rows[0]):  # riga di intestazione
            hdr = [c.strip().lower() for c in rows[0]]
            col = next((i for i, h in enumerate(hdr) if h in ("telefono", "phone", "numero", "tel")), 0)
            rows = rows[1:]
        seen_phones |= {norm_phone(r[col]) for r in rows if len(r) > col and r[col].strip()}

    leads = []
    for niche in niches:
        for city in cities:
            for p in search(key, f"{niche} {city}"):
                phone = p.get("internationalPhoneNumber") or p.get("nationalPhoneNumber")
                if p["id"] in seen_ids or (phone and norm_phone(phone) in seen_phones):
                    continue
                reason, _ = check(p, city, args.min_reviews)
                if not reason:
                    continue
                seen_ids.add(p["id"])
                seen_phones.add(norm_phone(phone))
                leads.append((p, niche, city, phone, reason))

    # i cellulari hanno la precedenza per entrare negli N, poi ordine per recensioni
    leads.sort(key=lambda l: (not norm_phone(l[3]).startswith("3"), -l[0].get("userRatingCount", 0)))
    leads = leads[:args.n]
    leads.sort(key=lambda l: -l[0].get("userRatingCount", 0))

    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["nome", "nicchia", "citta", "telefono", "whatsapp", "recensioni", "rating", "maps", "social"])
        for p, niche, city, phone, _ in leads:
            w.writerow([p.get("displayName", {}).get("text", ""), niche, city, phone,
                        "https://wa.me/39" + norm_phone(phone), p.get("userRatingCount", 0),
                        p.get("rating", ""), p.get("googleMapsUri", ""),
                        social_link(p.get("websiteUri")) or ""])

    new_file = not os.path.exists(SERVED)
    with open(SERVED, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new_file:
            w.writerow(SERVED_COLS)
        for p, niche, city, phone, _ in leads:
            w.writerow([p["id"], phone, niche, city, date.today().isoformat()])

    for i, (p, niche, city, phone, reason) in enumerate(leads, 1):
        print(f"{i}. {p.get('displayName', {}).get('text', '')} — {reason}")
    print(f"\n{len(leads)} lead scritti in {OUTPUT}")


def coverage():
    if not os.path.exists(SERVED):
        sys.exit("served.csv non esiste ancora")
    counts, niches, cities = defaultdict(int), set(), set()
    for r in csv.DictReader(open(SERVED, encoding="utf-8")):
        counts[(r["nicchia"], r["citta"])] += 1
        niches.add(r["nicchia"])
        cities.add(r["citta"])
    cities = sorted(cities)
    w = max([len(n) for n in niches] + [7])
    print("nicchia".ljust(w) + "".join(c.rjust(max(len(c), 4) + 2) for c in cities))
    for n in sorted(niches):
        print(n.ljust(w) + "".join(str(counts[(n, c)]).rjust(max(len(c), 4) + 2) for c in cities))


if __name__ == "__main__":
    if sys.argv[1:2] == ["coverage"]:
        coverage()
    else:
        ap = argparse.ArgumentParser()
        ap.add_argument("--niche")
        ap.add_argument("--cities", help="separate da virgola")
        ap.add_argument("--n", type=int, default=15)
        ap.add_argument("--min-reviews", type=int, default=15)
        run(ap.parse_args())
