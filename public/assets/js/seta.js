(function () {
  var c = document.querySelector('.seta');
  if (!c || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = c.getContext('2d');
  var scala = 0.32, W = 0, H = 0, attivo = true;
  var px = 0.5, py = 0.5, tx = 0.5, ty = 0.5;
  var macchie = [
    { c: '232,207,196', r: 0.55, sx: 0.00021, sy: 0.00017, f: 0.0, d: 1 },
    { c: '216,190,140', r: 0.42, sx: 0.00016, sy: 0.00023, f: 1.7, d: -1 },
    { c: '217,179,166', r: 0.5, sx: 0.00013, sy: 0.00019, f: 3.1, d: 1 },
    { c: '246,239,231', r: 0.46, sx: 0.00024, sy: 0.00012, f: 4.6, d: -1 },
    { c: '201,160,142', r: 0.36, sx: 0.00019, sy: 0.00026, f: 2.4, d: 1 }
  ];
  if (innerWidth < 700) macchie.pop();
  var scintille = [];
  for (var k = 0; k < (innerWidth < 700 ? 22 : 40); k++) scintille.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6, v: 0.00004 + Math.random() * 0.00012, f: Math.random() * 6.28 });

  function misura() {
    W = c.width = Math.max(2, Math.round(c.clientWidth * scala));
    H = c.height = Math.max(2, Math.round(c.clientHeight * scala));
  }
  function disegna(t) {
    if (!attivo) return;
    px += (tx - px) * 0.04; py += (ty - py) * 0.04;
    ctx.fillStyle = '#F6EFE7';
    ctx.fillRect(0, 0, W, H);
    var m = Math.max(W, H);
    for (var i = 0; i < macchie.length; i++) {
      var b = macchie[i];
      var x = W * (0.5 + 0.4 * Math.sin(t * b.sx + b.f)) + (px - 0.5) * W * 0.3 * b.d;
      var y = H * (0.5 + 0.38 * Math.cos(t * b.sy + b.f * 1.3)) + (py - 0.5) * H * 0.3 * b.d;
      var r = m * b.r;
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(' + b.c + ',.9)');
      g.addColorStop(0.55, 'rgba(' + b.c + ',.35)');
      g.addColorStop(1, 'rgba(' + b.c + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    for (var j = 0; j < scintille.length; j++) {
      var q = scintille[j];
      q.y -= q.v * 16; if (q.y < -0.02) { q.y = 1.02; q.x = Math.random(); }
      var a = 0.35 + 0.35 * Math.sin(t * 0.002 + q.f);
      ctx.fillStyle = 'rgba(216,190,140,' + a.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc((q.x + Math.sin(t * 0.0004 + q.f) * 0.02) * W, q.y * H, q.r * scala * 2.2, 0, 6.283); ctx.fill();
    }
    requestAnimationFrame(disegna);
  }
  function punta(x, y) { tx = x / innerWidth; ty = y / innerHeight; }
  addEventListener('pointermove', function (e) { punta(e.clientX, e.clientY); }, { passive: true });
  addEventListener('touchmove', function (e) { if (e.touches[0]) punta(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  addEventListener('resize', misura);
  new IntersectionObserver(function (es) {
    var vis = es[0].isIntersecting;
    if (vis && !attivo) { attivo = true; requestAnimationFrame(disegna); }
    attivo = vis;
  }).observe(c);
  misura();
  requestAnimationFrame(disegna);
})();
