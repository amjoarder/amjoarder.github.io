const links = [...document.querySelectorAll('nav a[href^="#"]')];
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    for (const link of links) {
      if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
}, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
for (const link of links) {
  const section = document.querySelector(link.hash);
  if (section) observer.observe(section);
}

// Smooth section navigation with interruption support.
let scrollFrame;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function cancelScroll() { cancelAnimationFrame(scrollFrame); }
for (const event of ['wheel', 'touchstart', 'keydown']) window.addEventListener(event, cancelScroll, {passive:true});
for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    const target = hash === '#' ? document.body : document.querySelector(hash);
    if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); cancelScroll();
    const from = window.scrollY;
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const to = Math.max(0, Math.min(document.documentElement.scrollHeight-innerHeight, target.getBoundingClientRect().top + from - offset));
    history.pushState(null, '', hash);
    function focusTarget() {
      if (target === document.body) return;
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once:true});
    }
    if (reduceMotion.matches) { window.scrollTo({top:to,behavior:'instant'}); focusTarget(); return; }
    const started = performance.now();
    const duration = Math.min(1050, 550 + Math.abs(to-from)*.08);
    function step(now) {
      const t = Math.min(1,(now-started)/duration);
      const eased = t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
      window.scrollTo({top:from+(to-from)*eased,behavior:'instant'});
      if (t < 1) scrollFrame=requestAnimationFrame(step); else focusTarget();
    }
    scrollFrame=requestAnimationFrame(step);
  });
}
