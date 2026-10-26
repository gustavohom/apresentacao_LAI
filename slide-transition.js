/* Passagem pelo dossel com a arte de folhas já usada na apresentação. */
(() => {
  window.createSceneTransition = () => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stage = document.querySelector('#stage');
    const root = document.createElement('div');
    root.id = 'slideTransition'; root.setAttribute('aria-hidden', 'true');
    const backdrop = document.createElement('div'); backdrop.className = 'transitionBackdrop';
    root.appendChild(backdrop);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1920 1080'); root.appendChild(svg); stage.appendChild(root);
    const template = document.querySelector('#leaves > g');
    const palette = ['#517747', '#86a65f', '#b0c782', '#628c51'];
    const leaves = Array.from({ length: 9 }, (_, i) => {
      const leaf = template.cloneNode(true);
      [leaf, ...leaf.querySelectorAll('*')].forEach(el => {
        ['id', 'style', 'transform', 'data-svg-origin', 'data-light-palette'].forEach(key => el.removeAttribute(key));
      });
      leaf.querySelector('path').setAttribute('fill', palette[i % palette.length]);
      svg.appendChild(leaf); return leaf;
    });
    let motion = null, generation = 0, running = false;
    const cancel = () => {
      generation++; motion?.kill(); motion = null; running = false;
      gsap.set(root, { autoAlpha: 0 }); stage.dataset.transition = 'idle';
    };
    const play = action => {
      cancel();
      if (reduced) { action(); return; }
      const token = generation;
      running = true; stage.dataset.transition = 'playing';
      root.dataset.surface = document.body.classList.contains('projector') || stage.classList.contains('light-slide') ? 'light' : 'dark';
      gsap.set(root, { autoAlpha: 1 });
      gsap.set(backdrop, { opacity: 0 });
      motion = gsap.timeline({ onComplete: () => {
        if (token !== generation) return;
        gsap.set(root, { autoAlpha: 0 }); running = false; stage.dataset.transition = 'idle'; motion = null;
      } });
      motion.to(backdrop, { opacity: 1, duration: .17, ease: 'sine.in' }, .08)
        .call(() => { if (token === generation) action(); }, [], .28)
        .to(backdrop, { opacity: 0, duration: .25, ease: 'sine.out' }, .4);
      leaves.forEach((leaf, i) => {
        const y = 100 + i % 4 * 290;
        motion.fromTo(leaf, { x: 2310 + i % 3 * 170, y, rotation: -35 + i * 7, scale: 23 + i % 3 * 5, svgOrigin: '0 0', smoothOrigin: false },
          { x: -900, y: y + 55, rotation: 30 + i * 6, duration: .78, ease: 'power2.inOut', immediateRender: true }, i * .018);
      });
    };
    cancel();
    return { play, cancel, isRunning: () => running };
  };
})();
