/* Pássaro vetorial da abertura e do encerramento: aproximação, pouso no título e decolagem. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, parent) => {
    const element = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value));
    parent.appendChild(element); return element;
  };
  window.createPerchingBird = ({ scene, id, perchSelector }) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bird = make('g', { id, 'data-bird-state': 'resting' }, scene);
    const defs = make('defs', {}, bird);
    const gradient = make('linearGradient', { id: `${id}Body`, x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
    make('stop', { offset: '0', 'stop-color': '#56c5c4' }, gradient);
    make('stop', { offset: '1', 'stop-color': '#197889' }, gradient);
    const model = make('g', { 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, bird);
    make('path', { d: 'M-23-33L-87 2L-76-24L-36-48Z', fill: '#215774', stroke: '#17475d', 'stroke-width': 1.8 }, model);
    make('path', { d: 'M-31-30L-75-2M-39-34L-79-13', fill: 'none', stroke: '#6194a4', 'stroke-width': 2 }, model);
    const flightWing = make('g', {}, model);
    make('path', { d: 'M-17-43Q-64-75-77-133Q-60-122-48-101Q-48-122-40-124Q-20-102 4-58L16-43Z', fill: '#2d8695', stroke: '#1c6177', 'stroke-width': 2 }, flightWing);
    make('path', { d: 'M-15-50Q-42-79-57-107M-5-52Q-26-80-39-103', fill: 'none', stroke: '#71c8c5', 'stroke-width': 2.6 }, flightWing);
    make('ellipse', { cx: -2, cy: -39, rx: 40, ry: 29, transform: 'rotate(-18 -2 -39)', fill: `url(#${id}Body)`, stroke: '#216d76', 'stroke-width': 1.8 }, model);
    make('path', { d: 'M15-64Q44-56 32-29Q18-8-4-14Q11-33 15-64Z', fill: '#edd477' }, model);
    const foldedWing = make('g', {}, model);
    make('path', { d: 'M-24-59Q8-66 19-39Q5-17-35-14Q-48-37-24-59Z', fill: '#346c78', stroke: '#245964', 'stroke-width': 1.8 }, foldedWing);
    make('path', { d: 'M-28-48Q-3-54 10-38M-34-37Q-8-43 7-31M-33-27Q-12-32 0-24', fill: 'none', stroke: '#6bb4a5', 'stroke-width': 2.3 }, foldedWing);
    const head = make('g', {}, model);
    make('circle', { cx: 25, cy: -70, r: 23, fill: '#238ba1', stroke: '#23677c', 'stroke-width': 1.5 }, head);
    make('path', { d: 'M10-84Q24-96 40-83Q29-86 16-78Z', fill: '#75d1cd' }, head);
    make('path', { d: 'M25-79Q39-85 49-75L43-66L25-68Z', fill: '#214d63' }, head);
    make('path', { d: 'M26-84Q38-88 46-80', stroke: '#f4e8b9', 'stroke-width': 3, fill: 'none' }, head);
    make('path', { d: 'M46-76L70-71L47-66Z', fill: '#d9b65f', stroke: '#8e773f', 'stroke-width': 1.3 }, head);
    make('path', { d: 'M49-71H65', stroke: '#8e773f', 'stroke-width': 1.2 }, head);
    const eye = make('g', {}, head);
    make('circle', { cx: 37, cy: -76, r: 4.3, fill: '#112e3c' }, eye);
    make('circle', { cx: 38.2, cy: -77.3, r: 1.4, fill: '#fff' }, eye);
    const feet = make('g', { fill: 'none', stroke: '#63583b', 'stroke-width': 2.5 }, model);
    make('path', { d: 'M-7-14L-6-2L-15 1M-6-2L3 0M12-15L13-2L5 1M13-2L22 0' }, feet);

    const perch = () => {
      const letter = document.querySelector(perchSelector);
      const r = letter.getBoundingClientRect(), s = scene.getBoundingClientRect();
      const style = getComputedStyle(letter), size = Number.parseFloat(style.fontSize);
      const context = document.createElement('canvas').getContext('2d');
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const metrics = context.measureText(letter.textContent);
      const ascent = metrics.fontBoundingBoxAscent || size * .8;
      const descent = metrics.fontBoundingBoxDescent || size * .2;
      const line = Number.parseFloat(style.lineHeight) || size * 1.2;
      const glyphTop = r.top + (line - ascent - descent) / 2 + ascent - metrics.actualBoundingBoxAscent;
      return { x: (r.left + r.width / 2 - s.left) / s.width * 1920, y: (glyphTop - s.top) / s.height * 1080 + 1 };
    };
    gsap.set(bird, { autoAlpha: 0, svgOrigin: '0 0' });
    gsap.set(head, { svgOrigin: '25 -70' });
    gsap.set(eye, { svgOrigin: '37 -76' });
    gsap.set(flightWing, { svgOrigin: '-5 -44', autoAlpha: 0 });
    const flap = gsap.fromTo(flightWing, { rotation: -22, scaleY: .55 }, { rotation: 25, scaleY: 1, duration: .17, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true });
    let loop;
    const state = value => { bird.dataset.birdState = value; };
    const stop = () => { loop?.kill(); flap.pause(0); gsap.set(bird, { autoAlpha: 0 }); state('resting'); };
    const start = () => {
      stop();
      let p = perch();
      const scale = 1.15;
      const updatePerch = () => {
        p = perch();
        bird.dataset.perchX = p.x.toFixed(2); bird.dataset.perchY = p.y.toFixed(2);
      };
      if (reduced) {
        loop = gsap.timeline().call(() => {
          updatePerch();
          gsap.set(bird, { autoAlpha: 1, x: p.x, y: p.y, scale, rotation: 0 });
          gsap.set([foldedWing, feet], { autoAlpha: 1 }); state('perched');
        }, [], 2.4);
        return;
      }
      const arrive = 4.2, land = 8.05, leave = 14.65;
      loop = gsap.timeline({ repeat: -1, repeatDelay: 12, repeatRefresh: true });
      loop.set(bird, { autoAlpha: 0, x: -190, y: Math.max(140, p.y - 160), scale, rotation: -5 }, 0)
        .set(foldedWing, { autoAlpha: 0 }, 0).set(feet, { autoAlpha: 0 }, 0)
        .set(head, { rotation: 0 }, 0).set(eye, { scaleY: 1 }, 0)
        .call(() => { updatePerch(); state('arriving'); flap.restart(); }, [], arrive)
        .set(bird, { autoAlpha: 1 }, arrive).set(flightWing, { autoAlpha: 1 }, arrive)
        .to(bird, { x: () => p.x - 160, y: () => p.y - 100, rotation: 5, duration: 2.6, ease: 'sine.inOut' }, arrive)
        .to(bird, { x: () => p.x, y: () => p.y, rotation: 0, duration: 1.25, ease: 'power2.out' }, arrive + 2.6)
        .to(feet, { autoAlpha: 1, duration: .25 }, land - .45)
        .to(flightWing, { autoAlpha: 0, duration: .22 }, land - .2)
        .to(foldedWing, { autoAlpha: 1, duration: .25 }, land - .2)
        .call(() => { flap.pause(); state('perched'); }, [], land)
        .to(bird, { scaleY: scale * .94, duration: .12, yoyo: true, repeat: 1, ease: 'sine.inOut' }, land)
        .to(head, { rotation: -8, duration: .6, ease: 'sine.inOut' }, land + 1.1)
        .to(head, { rotation: 3, duration: .8, ease: 'sine.inOut' }, land + 2.6)
        .to(head, { rotation: 0, duration: .7, ease: 'sine.inOut' }, land + 4.1)
        .to(eye, { scaleY: .1, duration: .1, yoyo: true, repeat: 1 }, land + 3.5)
        .call(() => { state('departing'); flap.restart(); }, [], leave)
        .set(flightWing, { autoAlpha: 1 }, leave).set(foldedWing, { autoAlpha: 0 }, leave)
        .to(feet, { autoAlpha: 0, duration: .25 }, leave)
        .to(bird, { x: () => p.x + 360, y: () => Math.max(100, p.y - 220), rotation: -9, duration: 1.7, ease: 'power2.in' }, leave)
        .to(bird, { x: 2110, y: 160, rotation: 4, duration: 2.6, ease: 'sine.inOut' }, leave + 1.7)
        .to(bird, { autoAlpha: 0, duration: .3 }, leave + 4)
        .call(() => { flap.pause(); state('resting'); }, [], leave + 4.3);
    };
    return { start, stop };
  };
})();
