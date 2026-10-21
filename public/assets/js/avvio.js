(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    if (sessionStorage.getItem('md-intro') || matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('no-intro');
    sessionStorage.setItem('md-intro', '1');
  } catch (e) {}
  setTimeout(function () { if (!d.classList.contains('intro-fatta')) d.classList.add('no-intro'); }, 6000);
})();
