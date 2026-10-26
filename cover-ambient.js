/* Animação ambiente da capa, independente das pausas da apresentação. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    parent.appendChild(el);
    return el;
  };

  window.createCoverAmbient = ({ scene, leaves, drawLeaf, vector }) => {
    const ambient = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 4 });

    // Uma rajada leve chega depois que a moldura se acomoda.
    leaves.forEach((leaf, i) => {
      const delay = (i % 9) * .045;
      if (i % 6 === 0) {
        const out = vector(leaf, 2160 - leaf.x, -70);
        const incoming = vector(leaf, -140 - leaf.x, 30);
        ambient.to(leaf.motion, { ...out, rotation: 90, opacity: 0, duration: 1.7, ease: 'power2.in' }, 2.8 + delay)
          .set(leaf.motion, { ...incoming, rotation: -65, opacity: 0 }, 4.7 + delay)
          .to(leaf.motion, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 2, ease: 'power3.out' }, 4.8 + delay);
      } else {
        const push = vector(leaf, 24 + i % 3 * 6, -8);
        ambient.to(leaf.motion, { ...push, rotation: 9, duration: 1.1, ease: 'sine.inOut' }, 2.8 + delay)
          .to(leaf.motion, { x: 0, y: 0, rotation: 0, duration: 2, ease: 'sine.inOut' }, 3.9 + delay);
      }
    });
    const windLeaves = make('g', { id: 'coverFlyingLeaves' }, scene);
    for (let i = 0; i < 7; i++) {
      const leaf = make('g', { class: 'coverFlyingLeaf' }, windLeaves);
      drawLeaf(leaf, i, .45);
      gsap.set(leaf, { autoAlpha: 0 });
      const start = 2.95 + i * .12;
      const y = i % 2 ? 965 + i % 3 * 20 : 110 + i % 3 * 28;
      ambient.set(leaf, { autoAlpha: 1, x: -130, y: y + 25, rotation: i * 25, scale: .48 + i % 3 * .12 }, start)
        .to(leaf, { x: 2080, y: y - 45, rotation: 180 + i * 25, duration: 3.4, ease: 'none' }, start)
        .to(leaf, { autoAlpha: 0, duration: .3 }, start + 3.1);
    }
    const windLines = make('g', { id: 'coverWindLines' }, scene);
    ['M-60 260 Q130 200 360 245', 'M1350 940 Q1630 875 1980 925'].forEach((d, i) => {
      const path = make('path', { d, fill: 'none', stroke: '#9bac8d', 'stroke-width': 1.6, pathLength: 1, 'stroke-linecap': 'round' }, windLines);
      gsap.set(path, { opacity: 0, strokeDasharray: 1, strokeDashoffset: 1 });
      ambient.fromTo(path, { opacity: .28, strokeDashoffset: 1 }, {
        opacity: 0, strokeDashoffset: -1, duration: 2.5, ease: 'sine.inOut', immediateRender: false,
      }, 3 + i * .3);
    });

    // A pequena árvore vive no espaço livre abaixo do título.
    const tree = make('g', { id: 'coverLifeTree', transform: 'translate(960 890)' }, scene);
    make('ellipse', { cx: 0, cy: 3, rx: 67, ry: 5, fill: '#dfe7d5', opacity: .6 }, tree);
    const seed = make('circle', { cx: 0, cy: -1, r: 3.2, fill: '#7b9468', opacity: .65 }, tree);
    const wood = make('g', { id: 'coverTreeWood', fill: 'none', stroke: '#7e936a', 'stroke-linecap': 'round' }, tree);
    [
      ['M0 0 C-5 -38 4 -77 0 -142', 4.5],
      ['M-1 -42 Q-22 -77 -49 -104', 2.6],
      ['M0 -56 Q25 -92 50 -109', 2.6],
      ['M0 -93 Q-22 -119 -31 -143', 2],
      ['M0 -113 Q19 -133 27 -151', 2],
      ['M-22 -77 Q-45 -79 -63 -113', 1.7],
      ['M25 -92 Q49 -89 64 -122', 1.7],
    ].forEach(([d, width]) => make('path', { d, 'stroke-width': width, pathLength: 1 }, wood));
    const branches = [...wood.children];
    gsap.set(branches, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
    ambient.set(wood, { scaleY: 1, opacity: 1, stroke: '#7e936a', transformOrigin: '0px 0px' }, 0)
      .to(seed, { opacity: 0, duration: .7 }, 6)
      .to(branches, { strokeDashoffset: 0, opacity: .85, duration: 2.1, stagger: .12, ease: 'power2.out' }, 6);

    const crown = make('g', { id: 'coverTreeCrown' }, tree);
    const green = ['#64864f', '#81a365', '#9ab780', '#b1c69b'];
    for (let i = 0; i < 22; i++) {
      const a = i * 2.39996;
      const radius = 16 + 48 * Math.sqrt((i + 1) / 22);
      const x = Math.cos(a) * radius;
      const y = -135 + Math.sin(a) * radius * .65;
      const leaf = make('g', { class: 'coverLifeLeaf' }, crown);
      drawLeaf(leaf, i, .76);
      const blade = leaf.querySelector('path');
      const rotation = Math.sin(i * 1.9) * 65;
      const size = .4 + i % 4 * .055;
      gsap.set(leaf, { autoAlpha: 0, x, y, scale: .08, rotation });
      ambient.set(blade, { fill: green[i % green.length] }, 0)
        .fromTo(leaf, { autoAlpha: 0, x, y, scale: .08, rotation }, {
          autoAlpha: 1, scale: size, duration: 1.3, ease: 'sine.out', immediateRender: false,
        }, 7.1 + i * .055)
        .to(blade, { fill: '#aeb38b', duration: 2.1, ease: 'sine.inOut' }, 19.3 + i * .025)
        .to(leaf, { x: x + 18 + i % 4 * 7, y: y + 55, rotation: rotation + 65, duration: 1.65, ease: 'sine.inOut' }, 21.2 + i * .055)
        .to(leaf, { x: x + 38 + i % 4 * 10, y: 1 + i % 4 * 2, rotation: rotation + 140, duration: 1.7, ease: 'sine.in' }, 22.85 + i * .055)
        .to(leaf, { autoAlpha: 0, duration: .85 }, 24.25 + i * .055);
    }
    ambient.to(wood, { stroke: '#a4aa98', duration: 1.5 }, 24.6)
      .to(wood, { opacity: 0, scaleY: .18, duration: 1.6, ease: 'sine.inOut' }, 26.5)
      .to(seed, { opacity: .65, duration: 1.1 }, 28);

    // O repouso e o pequeno broto conectam o fim ao próximo crescimento.
    ambient.to({}, { duration: .2 }, 30);
    return ambient;
  };
})();
