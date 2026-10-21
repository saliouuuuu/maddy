(function () {
  var o = document.querySelector('[data-occhio]');
  if (!o) return;
  var iride = o.querySelector('.occhio-iride');
  var fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gx = 0, gy = 0, ix = 0, iy = 0, visibile = false, timer;

  function sbatti() {
    o.classList.add('chiuso');
    setTimeout(function () { o.classList.remove('chiuso'); }, 170);
  }
  function prossimo() {
    clearTimeout(timer);
    timer = setTimeout(function () { if (visibile) sbatti(); prossimo(); }, 2600 + Math.random() * 3200);
  }
  function guarda(x, y) {
    var r = o.getBoundingClientRect();
    var dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    var d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
    gx = dx / d * 34 * k; gy = dy / d * 16 * k;
  }
  function anima() {
    ix += (gx - ix) * 0.12; iy += (gy - iy) * 0.12;
    iride.setAttribute('transform', 'translate(' + ix.toFixed(2) + ' ' + iy.toFixed(2) + ')');
    if (visibile) requestAnimationFrame(anima);
  }

  o.addEventListener('click', sbatti);
  if (fermo) return;
  addEventListener('pointermove', function (e) { guarda(e.clientX, e.clientY); }, { passive: true });
  addEventListener('touchstart', function (e) { if (e.touches[0]) guarda(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  addEventListener('touchmove', function (e) { if (e.touches[0]) guarda(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  var ultimo = scrollY;
  addEventListener('scroll', function () {
    var v = scrollY - ultimo; ultimo = scrollY;
    if (Math.abs(v) > 2) { gy = Math.max(-16, Math.min(16, v * 0.6)); gx *= 0.9; }
  }, { passive: true });
  new IntersectionObserver(function (es) {
    var era = visibile; visibile = es[0].isIntersecting;
    if (visibile && !era) { requestAnimationFrame(anima); prossimo(); }
  }).observe(o);
})();
