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
    var g = $('.gal'); if (g) g.classList.add('statico');
    fine();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
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

  function entraHero(t) {
    var tl = gsap.timeline({ delay: t || 0 });
    tl.to(lettere, { yPercent: 0, rotate: 0, duration: 1.3, ease: 'expo.out', stagger: 0.06 }, 0)
      .fromTo(heroImg, { scale: 1.45 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0)
      .fromTo('.hero-foto .arco', { clipPath: 'inset(100% 0 0 0 round 999px 999px 22px 22px)' }, { clipPath: 'inset(0% 0 0 0 round 999px 999px 22px 22px)', duration: 1.5, ease: 'expo.inOut' }, 0)
      .add(tracciaSopracciglio, 0.7)
      .to('.hero .occhiello, .hero-frase, .hero .btn', { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12 }, 0.6)
      .to('.giro', { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'back.out(1.6)' }, 1);
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

  /* ── galleria: il mazzo si apre a ventaglio ── */
  var carte = $$('.mazzo li'), n = carte.length, mezzo = (n - 1) / 2;
  carte.forEach(function (c, i) { gsap.set(c, { rotate: (i % 2 ? 1 : -1) * (2 + i), y: -i * 2, zIndex: i }); });
  var passo = mobile ? Math.min(innerWidth * 0.095, 40) : Math.min(innerWidth * 0.1, 150);
  var aperto = gsap.timeline({ scrollTrigger: { trigger: '.gal-scena', start: 'top top', end: '+=' + Math.round(innerHeight * (mobile ? 1.1 : 1.3)), pin: true, scrub: 0.8, anticipatePin: 1 } });
  carte.forEach(function (c, i) {
    var k = i - mezzo;
    aperto.to(c, { x: k * passo, y: Math.abs(k) * Math.abs(k) * (mobile ? 6 : 10) - 10, rotate: k * (mobile ? 8 : 7), scale: 1 - Math.abs(k) * 0.03, ease: 'power2.inOut', duration: 1 }, 0.1 + Math.abs(k) * 0.08);
  });
  aperto.to('.gal-nota', { autoAlpha: 0, duration: 0.2 }, 0);
  gsap.from('.mazzo', { scale: 0.7, rotate: -8, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.gal', start: 'top 70%' } });

  /* prima e dopo: la linea al centro si disegna */
  gsap.fromTo('.pd-foto', { '--linea-pd': 0 }, { '--linea-pd': 1, duration: 1.2, ease: 'expo.inOut', delay: 0.6, scrollTrigger: { trigger: '.pd-foto', start: 'top 80%' } });
  gsap.from('.pd-et', { y: -20, autoAlpha: 0, duration: 0.8, ease: 'back.out(2)', stagger: 0.15, delay: 1, scrollTrigger: { trigger: '.pd-foto', start: 'top 80%' } });

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
