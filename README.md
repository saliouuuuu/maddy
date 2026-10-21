# Maddy Dabu Beauty Expert — sito one-page (demo)

Centro estetico a Cuneo, Corso Nizza 11. Sito statico: HTML, CSS e JavaScript, nessun build.

## Struttura

- `public/` è l'unica cartella pubblicata (Netlify: `publish = "public"`).
- `public/index.html` pagina principale; `privacy.html`, `404.html`.
- `public/assets/css/style.css` stili; `public/assets/js/` script (GSAP, ScrollTrigger e SplitText 3.13.0 ospitati in `vendor/`).
- `public/assets/fonts/` Cormorant Garamond e Jost; `public/assets/img/` foto in WebP con JPG di riserva.
- `originali/` foto sorgente, non pubblicate.

## Da completare

- P.IVA nel piè di pagina e in `privacy.html`, insieme a email, hosting, tempi di conservazione e data.
- Dominio: `canonical`, Open Graph e JSON-LD usano `dominio-da-completare.example`.
- Testi di "Chi sono" e descrizioni dei trattamenti da far confermare alla titolare.
- Foto originali ad alta risoluzione al posto dei ritagli attuali.
- Quando va online: togliere `noindex` (meta in `index.html`, `privacy.html`, intestazione in `netlify.toml`) e aprire `robots.txt`.

## Pubblicazione

Netlify: collegare il repository, ramo `main`, nessun comando di build, cartella `public`.
