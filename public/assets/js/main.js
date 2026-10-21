(function () {
  var WA_NUMERO = '393284105399';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mouse = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $$('[data-anno]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var nav = $('#nav'), barra = $('.avanzamento'), tick = false;
  function suScroll() {
    tick = false;
    var max = document.documentElement.scrollHeight - innerHeight;
    barra.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    nav.classList.toggle('stretta', scrollY > innerHeight * 0.6);
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(suScroll); } }, { passive: true });
  suScroll();

  var menu = $('#menu'), apri = $('.nav-menu');
  function menuAperto(si) {
    menu.classList.toggle('aperto', si);
    apri.setAttribute('aria-expanded', si);
    document.body.style.overflow = si ? 'hidden' : '';
    if (si) $('.menu-chiudi').focus(); else apri.focus();
  }
  apri.addEventListener('click', function () { menuAperto(true); });
  $('.menu-chiudi').addEventListener('click', function () { menuAperto(false); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('aperto'); apri.setAttribute('aria-expanded', false); document.body.style.overflow = ''; }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('aperto')) menuAperto(false); });

  /* trattamenti: una voce aperta alla volta */
  var voci = $$('.voce');
  voci.forEach(function (v) {
    var b = $('button', v);
    b.addEventListener('click', function () {
      var aperta = !v.classList.contains('aperta');
      voci.forEach(function (x) { x.classList.remove('aperta'); $('button', x).setAttribute('aria-expanded', 'false'); });
      v.classList.toggle('aperta', aperta);
      b.setAttribute('aria-expanded', aperta);
    });
  });

  /* anteprima che segue il mouse sui trattamenti */
  var ant = $('.anteprima');
  if (mouse && ant && !fermo) {
    var aImg = $('img', ant), ax = 0, ay = 0, mx = 0, my = 0, vivo = false;
    function segui() { ax += (mx - ax) * 0.14; ay += (my - ay) * 0.14; ant.style.transform = 'translate(' + (ax + 26) + 'px,' + (ay - 140) + 'px) rotate(' + ((mx - ax) * 0.04).toFixed(2) + 'deg)'; if (vivo) requestAnimationFrame(segui); }
    voci.forEach(function (v) {
      v.addEventListener('pointerenter', function (e) {
        var src = v.getAttribute('data-img');
        if (!src) { ant.classList.remove('on'); return; }
        aImg.src = src; ant.classList.add('on');
        if (!vivo) { vivo = true; ax = mx = e.clientX; ay = my = e.clientY; requestAnimationFrame(segui); }
      });
    });
    $('.tratt-lista').addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; });
    $('.tratt-lista').addEventListener('pointerleave', function () { ant.classList.remove('on'); vivo = false; });
  }

  /* modulo: prepara il messaggio e apre WhatsApp */
  var form = $('#richiesta'), stato = $('.modulo-stato', form);
  function link(testo) { return 'https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(testo); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    if (!nome) { stato.textContent = 'Scrivi il tuo nome, così so chi sei.'; form.nome.focus(); return; }
    var t = 'Ciao Maddy, sono ' + nome + '.\nVorrei un appuntamento per: ' + form.trattamento.value + '.';
    if (form.telefono.value.trim()) t += '\nIl mio numero: ' + form.telefono.value.trim();
    if (form.messaggio.value.trim()) t += '\n' + form.messaggio.value.trim();
    stato.textContent = 'Si apre WhatsApp con il messaggio pronto: invialo tu.';
    window.open(link(t), '_blank', 'noopener');
  });

  /* mappa caricata solo quando ci si avvicina */
  var mappa = $('[data-mappa]');
  if (mappa) {
    var carica = function () {
      var f = document.createElement('iframe');
      f.src = mappa.getAttribute('data-src');
      f.title = 'Mappa: Corso Nizza 11, Cuneo';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      mappa.textContent = '';
      mappa.appendChild(f);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { carica(); io.disconnect(); } }, { rootMargin: '400px 0px' });
      io.observe(mappa);
    } else carica();
  }

  /* pulsante fisso sul telefono: dopo l'hero, nascosto vicino al modulo */
  var fisso = $('.wa-fisso'), dopoHero = false, vicinoModulo = false;
  function aggiornaFisso() { fisso.classList.toggle('su', dopoHero && !vicinoModulo); }
  new IntersectionObserver(function (es) { dopoHero = !es[0].isIntersecting; aggiornaFisso(); }).observe($('.hero'));
  new IntersectionObserver(function (es) { vicinoModulo = es[0].isIntersecting; aggiornaFisso(); }).observe($('#contatti'));

  /* lettere del nome in fondo */
  var piede = $('[data-piede]');
  if (piede) piede.innerHTML = piede.textContent.split('').map(function (l) { return l === ' ' ? ' ' : '<span class="lettera">' + l + '</span>'; }).join('');

  if (fermo) return;

  /* cerchio dorato dove tocchi */
  addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch') return;
    var t = document.createElement('i');
    t.className = 'tocco'; t.style.left = e.clientX + 'px'; t.style.top = e.clientY + 'px';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 820);
  }, { passive: true });

  /* cursore (solo mouse) */
  if (mouse) {
    var cur = $('.cursore'), cx = innerWidth / 2, cy = innerHeight / 2, kx = cx, ky = cy;
    addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY; cur.classList.remove('via');
      var t = e.target;
      cur.classList.toggle('link', !!t.closest('a, button, input, select, textarea, label, [data-occhio]'));
      cur.classList.toggle('scuro', !!t.closest('.come, .piede'));
    }, { passive: true });
    document.addEventListener('pointerleave', function () { cur.classList.add('via'); });
    (function giro() { kx += (cx - kx) * 0.22; ky += (cy - ky) * 0.22; cur.style.transform = 'translate(' + kx + 'px,' + ky + 'px)'; requestAnimationFrame(giro); })();
  }
})();
