// Intro wordmark: type J/P, spring open the name, then reveal the portfolio.
(() => {
  const intro = document.querySelector('#brand-intro');
  if (!intro) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const word = intro.querySelector('.intro-word');
  const pageTitle = document.querySelector('.hero-name');
  pageTitle?.classList.add('title-awaiting-intro');
  // DOM order matches the visible project numbering (01, 02, 03...).
  const galleryCards = [...document.querySelectorAll('#orbit .gallery-card')];
  galleryCards.forEach(card => { card.style.opacity = '0'; });
  let stopped = false;
  const active = new Set();
  const timers = new Map();
  function wait(ms) { return new Promise(resolve => { const id = setTimeout(() => { timers.delete(id); resolve(); }, ms); timers.set(id, resolve); }); }
  function animate(element, frames, options) {
    if (stopped) return Promise.resolve();
    const animation = element.animate(frames, { fill: 'forwards', ...options });
    active.add(animation);
    return animation.finished.catch(() => {}).finally(() => active.delete(animation));
  }
  function finish() {
    if (stopped) return;
    stopped = true;
    active.forEach(animation => animation.cancel());
    timers.forEach((resolve, id) => { clearTimeout(id); resolve(); });
    timers.clear();
    intro.remove();
    document.body.classList.remove('intro-playing');
    galleryCards.forEach((card, index) => {
      card.style.removeProperty('opacity');
      if (reducedMotion.matches) return;
      // Animate opacity only: preserve orbit positions and image hover transforms.
      const reveal = card.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 550,
        delay: index * 160,
        easing: 'ease-out',
        fill: 'backwards'
      });
      reveal.finished.catch(() => {});
    });
    setTimeout(() => {
      // Opacity remains controlled by Orbit/Spread; this reveal only unmasks the title.
      pageTitle?.classList.remove('title-awaiting-intro');
    }, reducedMotion.matches ? 0 : 1500);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(event) { if (event.key === 'Escape') finish(); }
  intro.querySelector('button').addEventListener('click', finish);
  document.addEventListener('keydown', onKey);
  document.body.classList.add('intro-playing');
  async function play() {
    if (reducedMotion.matches) {
      intro.classList.add('intro-still');
      await wait(1000);
      finish();
      return;
    }
    // Use the same variable face as the existing wordmark, without delaying indefinitely.
    const fontReady = document.fonts?.load('600 100px InterVariableFramer').catch(() => {});
    await Promise.race([fontReady, wait(600)]);
    if (stopped) return;
    await wait(160);
    for (const initial of intro.querySelectorAll('.intro-initial')) {
      await animate(initial, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 130, easing: 'steps(2,end)' });
      await wait(170);
      if (stopped) return;
    }
    await wait(220);
    const expansions = [...intro.querySelectorAll('.intro-expansion')];
    // Measure before the parent starts stretching, in untransformed layout pixels.
    const expansionWidths = expansions.map(element => element.firstElementChild.offsetWidth);
    await Promise.all([
      animate(word, [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(5px) scale(1.035,.94)', offset: .18 },
        { transform: 'translateY(-16px) scale(.98,1.06)', offset: .45 },
        { transform: 'translateY(3px) scale(1.01,.99)', offset: .78 },
        { transform: 'translateY(0) scale(1)' }
      ], { duration: 780, easing: 'ease-in-out' }),
      ...expansions.map((element, index) => animate(element, [
        { width: '0px', opacity: 0 },
        { width: `${expansionWidths[index] * 1.06}px`, opacity: 1, offset: .78 },
        { width: `${expansionWidths[index]}px`, opacity: 1 }
      ], { duration: 680, delay: 130 + index * 75, easing: 'cubic-bezier(.22,.8,.3,1)' }))
    ]);
    if (stopped) return;
    await wait(650);
    await animate(intro, [{ opacity: 1 }, { opacity: 0 }], { duration: 550, easing: 'ease-in-out' });
    finish();
  }
  play().catch(finish);
  // Never leave an overlay blocking the site if a browser suspends an animation.
  setTimeout(finish, 6500);
})();
