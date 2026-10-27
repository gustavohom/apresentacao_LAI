/* Uma rajada reaproveita as folhas da apresentação na passagem dos slides 3 e 4. */
(() => {
  window.createSceneTransition = () => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stage = document.querySelector('#stage');
    const root = document.createElement('div');
    root.id = 'slideTransition'; root.setAttribute('aria-hidden', 'true');
    const backdrop = document.createElement('div'); backdrop.className = 'transitionBackdrop';
    root.appendChild(backdrop);
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 1920 1080'); root.appendChild(svg); stage.appendChild(root);
    const noise = n => { const v = Math.sin(n * 127.1 + 39.4) * 43758.5453; return v - Math.floor(v); };
    const lines = Array.from({ length: 5 }, (_, i) => {
      const path = document.createElementNS(ns, 'path');
      const y = 120 + i * 205;
      path.setAttribute('d', `M-180 ${y + 110} C400 ${y - 160} 1000 ${y + 220} 2100 ${y - 50}`);
      path.setAttribute('class', 'transitionWindLine'); path.setAttribute('pathLength', '1');
      svg.appendChild(path); return path;
    });
    const template = document.querySelector('#leaves > g');
    const palette = ['#517747', '#86a65f', '#b0c782', '#628c51', '#b9a464'];
    const leaves = Array.from({ length: 56 }, (_, i) => {
      const leaf = template.cloneNode(true);
      [leaf, ...leaf.querySelectorAll('*')].forEach(el => {
        ['id', 'style', 'transform', 'data-svg-origin', 'data-light-palette'].forEach(key => el.removeAttribute(key));
      });
      leaf.querySelector('path').setAttribute('fill', palette[i % palette.length]);
      svg.appendChild(leaf);
      return {
        leaf, delay: i % 14 * .022, duration: 1.12 + noise(i + 2) * .23,
        y: 50 + noise(i + 3) * 1030, size: 1.5 + noise(i + 4) * (i % 7 === 0 ? 7 : 3.5),
        wave: 50 + noise(i + 5) * 130, phase: noise(i + 6) * Math.PI * 2,
        rotation: noise(i + 7) * 180, spin: 170 + noise(i + 8) * 260,
      };
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
      const wind = { time: 0 };
      const render = () => leaves.forEach(item => {
        const p = Math.max(0, Math.min(1, (wind.time - item.delay) / item.duration));
        const x = -320 + p * 2560;
        const y = item.y + Math.sin(p * Math.PI * 2 + item.phase) * item.wave - p * 150;
        const rotation = item.rotation + p * item.spin;
        const roll = .4 + Math.abs(Math.cos(p * Math.PI * 3 + item.phase)) * .6;
        item.leaf.setAttribute('transform', `translate(${x} ${y}) rotate(${rotation}) scale(${item.size} ${item.size * roll})`);
        item.leaf.setAttribute('opacity', p > 0 && p < 1 ? '.95' : '0');
      });
      running = true; stage.dataset.transition = 'playing';
      root.dataset.surface = document.body.classList.contains('projector') || stage.classList.contains('light-slide') ? 'light' : 'dark';
      gsap.set(root, { autoAlpha: 1 });
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(lines, { opacity: 0, strokeDasharray: 1, strokeDashoffset: 1 }); render();
      motion = gsap.timeline({ onComplete: () => {
        if (token !== generation) return;
        gsap.set(root, { autoAlpha: 0 }); running = false; stage.dataset.transition = 'idle'; motion = null;
      } });
      motion.to(wind, { time: 1.7, duration: 1.7, ease: 'none', onUpdate: render }, 0)
        .to(backdrop, { opacity: 1, duration: .25, ease: 'sine.inOut' }, .3)
        .call(() => { if (token === generation) action(); }, [], .62)
        .to(backdrop, { opacity: 0, duration: .55, ease: 'sine.out' }, .72)
        .to(lines, { opacity: .28, strokeDashoffset: 0, duration: .65, stagger: .035, ease: 'sine.out' }, .08)
        .to(lines, { opacity: 0, duration: .35, stagger: .025 }, .76);
    };
    cancel();
    return { play, cancel, isRunning: () => running };
  };
})();
