(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var intro = $('.intro');
  var tratti = [];

  function fine() {
    root.classList.add('intro-fatta');
    if (intro) intro.remove();
  }

  disegnaSopracciglio();

  if (fermo || !window.gsap || !window.ScrollTrigger) {
    root.classList.add('no-intro');
    var g = $('.lv'); if (g) g.classList.add('statico');
    fine();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.SplitText) gsap.registerPlugin(SplitText);
  var mobile = innerWidth < 900;

  /* ── apertura: l'anello si disegna, poi l'occhio si apre sull'hero ── */
  var heroImg = $('.hero-foto .arco img');
  var lettere = [];
  if (window.SplitText) {
    $$('[data-lettere]').forEach(function (el) {
      var s = SplitText.create(el, { type: 'chars', mask: 'chars', aria: 'none' });
      lettere = lettere.concat(s.chars);
    });
  }
  gsap.set(lettere, { yPercent: 115, rotate: 8 });
  gsap.set('.hero .occhiello, .hero-frase, .hero .btn', { autoAlpha: 0, y: 24 });
  gsap.set('.giro', { autoAlpha: 0, scale: .6 });
  gsap.set('.mini, .pil', { autoAlpha: 0 });

  function entraHero(t) {
    var tl = gsap.timeline({ delay: t || 0 });
    tl.to(lettere, { yPercent: 0, rotate: 0, duration: 1.3, ease: 'expo.out', stagger: 0.06 }, 0)
      .fromTo(heroImg, { scale: 1.45 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0)
      .fromTo('.hero-foto .arco', { clipPath: 'inset(100% 0 0 0 round 999px 999px 22px 22px)' }, { clipPath: 'inset(0% 0 0 0 round 999px 999px 22px 22px)', duration: 1.5, ease: 'expo.inOut' }, 0)
      .add(tracciaSopracciglio, 0.7)
      .to('.hero .occhiello, .hero-frase, .hero .btn', { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12 }, 0.6)
      .to('.giro', { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'back.out(1.6)' }, 1)
      .fromTo('.mini', { autoAlpha: 0, scale: 0.4, rotate: -25 }, { autoAlpha: 1, scale: 1, rotate: 7, duration: 1.3, ease: 'back.out(1.5)' }, 0.9)
      .fromTo('.pil', { autoAlpha: 0, y: 30, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.8)', stagger: 0.15 }, 1.1);
    return tl;
  }

  if (intro && !root.classList.contains('no-intro')) {
    var md = $$('.intro-md span'), nome = $('.intro-nome');
    var lato = Math.max(innerWidth, innerHeight) * 3.2;
    var tl = gsap.timeline({ onComplete: fine });
    tl.from(md, { yPercent: 100, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12 })
      .to('.intro-anello circle', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0)
      .from(nome, { autoAlpha: 0, letterSpacing: '1.2em', duration: 1, ease: 'expo.out' }, 0.3)
      .to([md, nome], { autoAlpha: 0, y: -20, duration: 0.5, ease: 'power2.in', stagger: 0.04 }, 1.35)
      .to('.intro-anello', { scale: 9, autoAlpha: 0, duration: 1.2, ease: 'power3.in' }, 1.45)
      .to(intro, { '--apre': lato + 'px', duration: 1.25, ease: 'power3.in' }, 1.55)
      .add(entraHero(), 2.0);
  } else {
    fine();
    entraHero(0.1);
  }

  /* ── parallasse leggera sulle foto ── */
  $$('[data-parallasse]').forEach(function (el) {
    var v = parseFloat(el.getAttribute('data-parallasse')) * (mobile ? 0.5 : 1);
    gsap.fromTo(el, { yPercent: -v }, { yPercent: v, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.to('.hero-titolo', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ── titoli riga per riga ── */
  if (window.SplitText) {
    $$('[data-righe]').forEach(function (el) {
      SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, aria: 'none', onSplit: function (s) {
        return gsap.from(s.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 86%' } });
      } });
    });
    /* il paragrafo si colora parola per parola mentre scorri */
    $$('[data-colora]').forEach(function (el) {
      var s = SplitText.create(el, { type: 'words', wordsClass: 'parola', aria: 'none' });
      gsap.to(s.words, { color: '#2B1E1A', stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true } });
    });
  }
  $$('.occhiello:not(.hero .occhiello), .testo, .chi-testo .link, .cont-testo address, .cont-link li, .modulo, .pd-testo .link').forEach(function (el) {
    gsap.from(el, { y: 26, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* ── foto che si scoprono ── */
  $$('.rivela').forEach(function (el) {
    var img = $('img', el);
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.2);
  });
  gsap.from('.chi-tondo', { scale: 0, rotate: -40, duration: 1.4, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.chi-foto', start: 'top 70%' } });

  /* ── nastro: accelera con lo scorrimento ── */
  var nastro = $('.nastro-in'), anim = nastro && nastro.getAnimations ? nastro.getAnimations()[0] : null;
  if (anim) {
    ScrollTrigger.create({ onUpdate: function (s) { anim.playbackRate = 1 + Math.min(5, Math.abs(s.getVelocity()) / 400); } });
    gsap.ticker.add(function () { anim.playbackRate += (1 - anim.playbackRate) * 0.05; });
  }

  /* ── trattamenti: righe che entrano, occhio che si apre ── */
  gsap.from('.voce', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.tratt-lista', start: 'top 85%' } });
  gsap.from('.occhio', { scaleY: 0, transformOrigin: '50% 50%', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.occhio', start: 'top 85%' } });

  /* ── galleria: binario di card che scorrono, ruotano e si girano sull'asse ── */
  (function () {
    var lv = $('[data-lavori]'), pann = $('.lv-pannello'), scena = $('.lv-scena');
    var carte = $$('.lv-card'), imgs = carte.map(function (c) { return $('img', c); }), n = carte.length;
    var stato = { p: 0 }, entra = carte.map(function () { return 0; });
    var nEl = $('[data-lv-n]'), prev = $('[data-lv-prev]'), next = $('[data-lv-next]');
    $('[data-lv-tot]').textContent = String(n).padStart(2, '0');

    function disegna() {
      var w = carte[0].offsetWidth, passo = w * (mobile ? 0.8 : 1.06);
      for (var i = 0; i < n; i++) {
        var d = i - stato.p, ad = Math.abs(d), sg = d < 0 ? -1 : 1, e = entra[i];
        var x = sg * (Math.min(ad, 1) * passo + Math.max(0, ad - 1) * passo * 0.82);
        var y = -Math.min(ad, 2.5) * 16 + (1 - e) * 180;
        var z = -Math.min(ad, 3) * 110;
        var ry = Math.max(-2.6, Math.min(2.6, d)) * 24;
        var rz = Math.max(-2, Math.min(2, d)) * 2.2;
        var rx = (1 - e) * -88;
        var sc = 1 - Math.min(ad, 3) * 0.06;
        carte[i].style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        carte[i].style.zIndex = 100 - Math.round(ad * 10);
        carte[i].style.opacity = (ad > 3.4 ? 0 : 1) * Math.min(1, e * 1.4);
        imgs[i].style.transform = 'translateX(' + (-Math.max(-2, Math.min(2, d)) * 5).toFixed(2) + '%) scale(1.12)';
      }
      var k = Math.round(stato.p);
      nEl.textContent = String(k + 1).padStart(2, '0');
      prev.disabled = stato.p < 0.3; next.disabled = stato.p > n - 1.3;
    }

    var altezza = function () { return Math.round(innerHeight * (mobile ? 0.55 : 0.6) * (n - 1)); };
    var st = ScrollTrigger.create({
      trigger: pann, start: 'center center', end: function () { return '+=' + altezza(); },
      pin: lv, pinSpacing: true, scrub: true, invalidateOnRefresh: true,
      animation: gsap.to(stato, { p: n - 1, ease: 'none', duration: 1, onUpdate: disegna })
    });
    function vaiA(i) {
      i = Math.max(0, Math.min(n - 1, i));
      var y = st.start + (st.end - st.start) * (i / (n - 1));
      window.scrollTo({ top: y + 1, behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { vaiA(Math.round(stato.p) - 1); });
    next.addEventListener('click', function () { vaiA(Math.round(stato.p) + 1); });

    /* trascinando di lato le card scorrono; un gesto verticale resta uno scroll normale */
    var tr = null;
    scena.style.touchAction = 'pan-y';
    scena.addEventListener('pointerdown', function (e) { tr = { x: e.clientX, y: e.clientY, y0: scrollY, attivo: false }; });
    addEventListener('pointermove', function (e) {
      if (!tr) return;
      var dx = e.clientX - tr.x, dy = e.clientY - tr.y;
      if (!tr.attivo) {
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { tr = null; return; }
        if (Math.abs(dx) < 12) return;
        tr.attivo = true;
      }
      window.scrollTo(0, tr.y0 - dx * ((st.end - st.start) / (n - 1)) / (carte[0].offsetWidth * 0.8));
    });
    function fineTrascina() { if (tr && tr.attivo) vaiA(Math.round(stato.p)); tr = null; }
    addEventListener('pointerup', fineTrascina);
    addEventListener('pointercancel', function () { tr = null; });

    /* all'ingresso le card si girano sull'asse x una dopo l'altra */
    var proxy = { t: 0 };
    gsap.to(proxy, { t: 1, duration: 1.8, ease: 'none', scrollTrigger: { trigger: pann, start: 'top 75%' }, onUpdate: function () {
      for (var i = 0; i < n; i++) {
        var u = Math.max(0, Math.min(1, (proxy.t * 1.8 - i * 0.12)));
        entra[i] = 1 - Math.pow(1 - u, 3) + Math.sin(u * Math.PI) * 0.06;
      }
      disegna();
    } });

    /* titoli: la parola gigante si gira lettera per lettera */
    if (window.SplitText) {
      var g = SplitText.create('.lv-gigante', { type: 'chars', aria: 'none' });
      gsap.set('.lv-gigante', { perspective: 600 });
      gsap.from(g.chars, { rotateX: -100, yPercent: 60, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: pann, start: 'top 80%' } });
      $$('.lv-titolo span').forEach(function (r, i) {
        gsap.from(r, { xPercent: i ? 12 : -12, autoAlpha: 0, duration: 1.3, ease: 'expo.out', delay: i * 0.12, scrollTrigger: { trigger: '.lv-testa', start: 'top 85%' } });
      });
    }
    gsap.from('.lv-sotto, .lv-mini', { y: 20, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: '.lv-testa', start: 'top 80%' } });
    gsap.fromTo(pann, { clipPath: 'inset(8% 6% 8% 6% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: pann, start: 'top 85%' } });
    disegna();
  })();

  /* prima e dopo: la linea al centro si disegna */
  /* il cursore del prima/dopo si muove da solo una volta, per far capire che si trascina */
  if (window.pdImposta) {
    var pdv = { v: 50 };
    gsap.timeline({ scrollTrigger: { trigger: '.pd', start: 'top 70%' } })
      .from('.pd', { clipPath: 'inset(100% 0% 0% 0% round 22px)', duration: 1.3, ease: 'expo.inOut' })
      .to(pdv, { v: 82, duration: 0.9, ease: 'power2.inOut', onUpdate: function () { pdImposta(pdv.v); } }, '-=.2')
      .to(pdv, { v: 18, duration: 1.2, ease: 'power2.inOut', onUpdate: function () { pdImposta(pdv.v); } })
      .to(pdv, { v: 50, duration: 0.9, ease: 'power2.inOut', onUpdate: function () { pdImposta(pdv.v); } });
  }

  /* ── come funziona: la sezione scura si allarga e il filo d'oro si disegna ── */
  gsap.fromTo('.come', { clipPath: 'inset(6% 5% 0% 5% round 48px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.come', start: 'top bottom', end: 'top 25%', scrub: true } });
  var filo = $('[data-filo]'), passi = $$('.passi li');
  ScrollTrigger.create({
    trigger: filo, start: 'top 72%', end: 'bottom 55%', scrub: true,
    onUpdate: function (s) {
      filo.style.setProperty('--p', s.progress.toFixed(3));
      passi.forEach(function (p, i) { p.classList.toggle('on', s.progress >= i / (passi.length - 1) - 0.04); });
    }
  });

  ['.come', '.piede'].forEach(function (sel) {
    ScrollTrigger.create({ trigger: sel, start: 'top 40px', end: 'bottom 40px', toggleClass: { targets: '#nav', className: 'su-scuro' } });
  });

  /* ── chi sono: valori e firma scritta a mano ── */
  gsap.from('.valori li', { y: 40, autoAlpha: 0, rotate: -2, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.valori', start: 'top 88%' } });
  var firma = $('[data-firma] text');
  if (firma) {
    gsap.set(firma, { strokeDasharray: 900, strokeDashoffset: 900 });
    gsap.timeline({ scrollTrigger: { trigger: '.firma', start: 'top 88%' } })
      .to(firma, { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut' })
      .to(firma, { fill: '#A9844C', duration: 0.8, ease: 'power1.out' }, '-=0.6');
  }

  /* ── il metodo: la mappa del sopracciglio si disegna sul viso ── */
  (function () {
    var foto = $('[data-mv-foto]');
    if (!foto) return;
    var li = $$('.mv-punti li');
    function accendi(i) { li.forEach(function (x, k) { x.classList.toggle('on', k <= i); }); }
    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: mobile
      ? { trigger: foto, start: 'top 75%', end: 'bottom 35%', scrub: 0.8 }
      : { trigger: '.mv-scena', start: 'top top', end: '+=' + Math.round(innerHeight * 1.6), pin: true, scrub: 0.8 } });
    tl.fromTo('.mv-foto img, .mv-linee', { scale: 1 }, { scale: 1.24, duration: 3, ease: 'none' }, 0)
      .to('.mv-righello', { scaleX: 0, duration: 0.01 }, 0)
      .fromTo('.mv-righello', { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, 0)
      .to('.pn', { scale: 1, duration: 0.3 }, 0.2);
    [0, 1, 2].forEach(function (i) {
      var t = 0.4 + i * 0.75;
      tl.to('.g' + i, { strokeDashoffset: 0, duration: 0.5 }, t)
        .to('.p' + i, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, t + 0.42)
        .to('.e' + i, { opacity: 1, duration: 0.25 }, t + 0.45)
        .call(accendi, [i], t + 0.45);
    });
    tl.to('.mv-arco', { strokeDashoffset: 0, duration: 0.7 }, 2.7)
      .to('.mv-guide path', { opacity: 0.35, duration: 0.3 }, 3);
  })();

  /* ── nastro di foto: la velocità segue lo scroll ── */
  var righe = $$('.str-riga').map(function (r) { return r.getAnimations ? r.getAnimations()[0] : null; }).filter(Boolean);
  if (righe.length) {
    ScrollTrigger.create({ onUpdate: function (s) { var v = 1 + Math.min(6, Math.abs(s.getVelocity()) / 300); righe.forEach(function (a) { a.playbackRate = v; }); } });
    gsap.ticker.add(function () { righe.forEach(function (a) { a.playbackRate += (1 - a.playbackRate) * 0.05; }); });
  }
  gsap.fromTo('.str-riga', { rotate: 2 }, { rotate: -1, ease: 'none', scrollTrigger: { trigger: '.striscia', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ── invito: la frase si riempie parola per parola, il cerchio rotola dentro ── */
  if (window.SplitText) {
    var inv = SplitText.create('[data-riempi]', { type: 'words', wordsClass: 'parola', aria: 'none' });
    gsap.to(inv.words, { color: function (i, el) { return el.closest('em') ? '#86642F' : '#2B1E1A'; }, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '.invito', start: 'top 70%', end: 'center 45%', scrub: true } });
  }
  gsap.from('.cerchio', { xPercent: 120, rotate: 220, autoAlpha: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.invito', start: 'top 60%' } });

  /* ── nome in fondo: le lettere salgono a onda ── */
  gsap.from('.piede-nome .lettera', { yPercent: 100, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.piede', start: 'top 80%' } });

  /* ── bottoni magnetici (solo mouse) ── */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnete').forEach(function (b) {
      var x = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3' }), y = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.3); y((e.clientY - r.top - r.height / 2) * 0.4); });
      b.addEventListener('pointerleave', function () { x(0); y(0); });
    });
  }

  addEventListener('load', function () { ScrollTrigger.refresh(); });

  /* ── sopracciglio fatto di tratti sottili, come un hairstroke ── */
  function disegnaSopracciglio() {
    var svg = $('[data-sopracciglio]');
    if (!svg) return;
    var seme = 7;
    function caso() { seme = (seme * 16807) % 2147483647; return (seme - 1) / 2147483646; }
    function punto(t) {
      var a = [18, 92], b = [222, 6], c = [388, 72], u = 1 - t;
      return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
    }
    function tangente(t) {
      var a = [18, 92], b = [222, 6], c = [388, 72];
      var x = 2 * (1 - t) * (b[0] - a[0]) + 2 * t * (c[0] - b[0]), y = 2 * (1 - t) * (b[1] - a[1]) + 2 * t * (c[1] - b[1]);
      var l = Math.hypot(x, y); return [x / l, y / l];
    }
    var NS = 'http://www.w3.org/2000/svg', N = 78, frag = document.createDocumentFragment();
    for (var i = 0; i < N; i++) {
      var t = Math.min(0.99, i / N + caso() * 0.012);
      var C = punto(t), T = tangente(t), Nn = [-T[1], T[0]];
      var w = 30 * Math.pow(1 - t, 0.75) + 3;
      var r = -0.1 + caso() * 1.05;
      var base = [C[0] + Nn[0] * w * 0.5 * r, C[1] + Nn[1] * w * 0.5 * r];
      var s = t / 0.5; s = s > 1 ? 1 : s * s * (3 - 2 * s);
      var mix = 0.18 + 0.7 * s;
      var dx = -Nn[0] * (1 - mix) + T[0] * mix, dy = -Nn[1] * (1 - mix) + T[1] * mix, dl = Math.hypot(dx, dy);
      dx /= dl; dy /= dl;
      var lung = w * (0.85 + caso() * 0.55) + 5;
      var punta = [base[0] + dx * lung, base[1] + dy * lung];
      var curva = (caso() - 0.35) * 5;
      var ctrl = [(base[0] + punta[0]) / 2 - dy * curva, (base[1] + punta[1]) / 2 + dx * curva];
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', 'M' + base[0].toFixed(1) + ' ' + base[1].toFixed(1) + 'Q' + ctrl[0].toFixed(1) + ' ' + ctrl[1].toFixed(1) + ' ' + punta[0].toFixed(1) + ' ' + punta[1].toFixed(1));
      p.setAttribute('stroke-width', (0.9 + caso() * 0.9).toFixed(2));
      p.setAttribute('opacity', (0.5 + caso() * 0.45).toFixed(2));
      frag.appendChild(p);
      tratti.push(p);
    }
    svg.appendChild(frag);
    if (!fermo && window.gsap) tratti.forEach(function (p) { var l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
  }
  function tracciaSopracciglio() {
    gsap.to(tratti, { strokeDashoffset: 0, duration: 0.35, ease: 'power1.out', stagger: 0.018 });
  }
})();
