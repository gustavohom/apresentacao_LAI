/* Ciclo lento da árvore no encerramento, independente da pausa da apresentação. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, parent) => {
    const element = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value));
    parent.appendChild(element); return element;
  };
  window.createClosingLifeTree = ({ scene, drawLeaf }) => {
    const tree = make('g', { id: 'closingLifeTree', transform: 'translate(1665 930)', 'data-life-state': 'seed' }, scene);
    const shadow = make('ellipse', { cx: 0, cy: 5, rx: 178, ry: 13, fill: '#dde7cf' }, tree);
    make('ellipse', { cx: 0, cy: 5, rx: 97, ry: 6, fill: '#ddd5bc', opacity: .42 }, tree);
    const seed = make('g', {}, tree);
    make('circle', { cx: 0, cy: -1, r: 4, fill: '#9b8c60' }, seed);
    make('path', { d: 'M0-1Q-5-13 0-26', fill: 'none', stroke: '#7f9c61', 'stroke-width': 2.7, 'stroke-linecap': 'round' }, seed);
    make('ellipse', { cx: -6, cy: -17, rx: 9, ry: 4, fill: '#9cb77c', transform: 'rotate(25 -6 -17)' }, seed);
    make('ellipse', { cx: 6, cy: -24, rx: 9, ry: 4, fill: '#789e58', transform: 'rotate(-25 6 -24)' }, seed);

    // Tronco, copa e folhas crescem juntos a partir do chão, como uma muda.
    const growth = make('g', { id: 'closingTreeGrowth' }, tree);
    const canopy = make('g', { id: 'closingTreeCanopy' }, growth);
    const clumps = [[-10,-456,72],[-120,-423,66],[125,-434,70],[-178,-363,57],[170,-359,60],[-85,-343,76],[79,-350,74],[0,-380,86],[-55,-492,52],[62,-490,52]];
    clumps.forEach(([cx, cy, r], i) => make('ellipse', { cx, cy, rx: r, ry: r * .72, fill: ['#a1be82','#96b778','#b1c995'][i % 3], opacity: .5 }, canopy));
    const wood = make('g', { id: 'closingTreeWood', fill: 'none', stroke: '#87674c', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, growth);
    const branches = [
      ['M0 0C-13-62-9-142-4-239',26,2,8],
      ['M-4-232C2-293-4-350-8-414',17,5.8,6],
      ['M-8-405Q-12-460-5-504',9,9.2,5],
      ['M-3-214Q-62-286-155-350',15,7,6],
      ['M-2-235Q67-303 165-364',15,7.5,6],
      ['M-64-286Q-69-369-117-429',9,9,5],
      ['M68-304Q79-392 136-442',9,9.4,5],
      ['M-95-313Q-156-319-205-373',7,10.1,4],
      ['M105-326Q168-327 204-377',7,10.5,4],
      ['M-7-365Q-50-422-68-486',7,10.8,4],
      ['M-8-388Q45-441 70-497',7,11,4],
      ['M-116-427Q-154-437-171-467',4.5,11.7,3.8],
      ['M136-442Q166-443 181-472',4.5,11.9,3.8],
      ['M-8-411Q-38-470-23-511',4.5,12.1,3.5],
      ['M-4-10Q-26 4-55 7',10,2.7,4],
      ['M4-10Q27 3 56 7',10,2.8,4],
    ].map(([d, width, at, duration]) => ({ path: make('path', { d, 'stroke-width': width, pathLength: 1 }, wood), at, duration }));
    const bark = make('g', { stroke: '#644b36', 'stroke-width': 2, opacity: .32 }, wood);
    make('path', { d: 'M-4-22Q-8-99-1-183M5-52Q7-135 3-208M-3-260Q-1-317-7-368' }, bark);
    const foliage = make('g', { id: 'closingTreeLeaves' }, growth);
    const palette = ['#5f8745','#7fa45a','#9bb76d','#48713b','#b0c681','#75994c'];
    const noise = n => { const value = Math.sin(n * 127.1 + 17) * 43758.5453; return value - Math.floor(value); };
    const leaves = Array.from({ length: 150 }, (_, i) => {
      const cluster = clumps[Math.floor(i / 15)], j = i % 15;
      const angle = j * 2.39996 + Math.floor(i / 15) * .41;
      const radius = cluster[2] * Math.sqrt((j + .7) / 15);
      const x = cluster[0] + Math.cos(angle) * radius;
      const y = cluster[1] + Math.sin(angle) * radius * .72;
      const leaf = make('g', { class: 'closingLifeLeaf' }, foliage);
      drawLeaf(leaf, i, .96);
      const rotation = noise(i + 3) * 160 - 80;
      const scale = .34 + noise(i + 8) * .28;
      gsap.set(leaf, { autoAlpha: 0, x, y, scale: .05, rotation });
      return { leaf, blade: leaf.querySelector('path'), x, y, rotation, scale };
    });
    gsap.set(branches.map(branch => branch.path), { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
    gsap.set([canopy, bark], { opacity: 0 });
    gsap.set(wood, { svgOrigin: '0 0' });
    gsap.set(growth, { svgOrigin: '0 0', scale: .16, opacity: 0 });
    const cycle = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2 });
    const state = name => { tree.dataset.lifeState = name; };
    cycle.call(() => state('seed'), [], 0)
      .set(wood, { scaleY: 1, opacity: 1, stroke: '#87674c' }, 0)
      .set(growth, { scale: .16, opacity: 0 }, 0)
      .set(seed, { opacity: .85 }, 0)
      .set(shadow, { scaleX: .16, opacity: .55, svgOrigin: '0 5' }, 0)
      .call(() => state('sapling'), [], .4)
      .to(seed, { opacity: 0, duration: .65 }, .4)
      .to(growth, { opacity: 1, scale: .32, duration: 2.2, ease: 'sine.inOut' }, .4)
      .to(shadow, { scaleX: .32, duration: 2.2, ease: 'sine.inOut' }, .4)
      .call(() => state('young'), [], 3.1)
      .to(growth, { scale: .52, duration: 3.4, ease: 'sine.inOut' }, 3.1)
      .to(shadow, { scaleX: .52, duration: 3.4, ease: 'sine.inOut' }, 3.1)
      .call(() => state('growing'), [], 7)
      .to(growth, { scale: .76, duration: 3.8, ease: 'sine.inOut' }, 7)
      .to(shadow, { scaleX: .76, duration: 3.8, ease: 'sine.inOut' }, 7)
      .to(growth, { scale: 1, duration: 4.2, ease: 'sine.inOut' }, 11.3)
      .to(shadow, { scaleX: 1, opacity: .9, duration: 4.2, ease: 'sine.inOut' }, 11.3);
    branches.forEach(({ path, at, duration }) => cycle.fromTo(path,
      { strokeDashoffset: 1, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: duration * .14, ease: 'sine.inOut', immediateRender: false }, .35 + (at - 2) * .08));
    cycle.to(bark, { opacity: .32, duration: 1.2 }, 1)
      .fromTo(canopy, { opacity: 0 }, { opacity: 1, duration: 1.8, ease: 'sine.inOut', immediateRender: false }, .9);
    leaves.forEach(({ leaf, blade, x, y, rotation, scale }, i) => {
      const at = .7 + i * .009;
      const fall = 26 + i * .014;
      cycle.set(blade, { fill: palette[i % palette.length] }, 0)
        .fromTo(leaf, { autoAlpha: 0, x, y, scale: .05, rotation }, {
          autoAlpha: 1, scale, duration: 1.1, ease: 'sine.out', immediateRender: false,
        }, at)
        .to(blade, { fill: ['#b8b17c','#b9a365','#c5b484'][i % 3], duration: 3, ease: 'sine.inOut' }, 22 + i * .006)
        .to(leaf, { x: x + 22 + noise(i + 1) * 38, y: y + 120, rotation: rotation + 60, duration: 1.8, ease: 'sine.inOut' }, fall)
        .to(leaf, { x: x + 50 + noise(i + 6) * 45, y: -2 + noise(i + 4) * 7, rotation: rotation + 155, duration: 2.8, ease: 'power1.in' }, fall + 1.8)
        .to(leaf, { autoAlpha: 0, duration: 1.1 }, fall + 4.8);
    });
    cycle.call(() => state('mature'), [], 15.8)
      .call(() => state('autumn'), [], 22)
      .call(() => state('falling'), [], 26)
      .to(canopy, { opacity: 0, duration: 4, ease: 'sine.inOut' }, 26)
      .call(() => state('bare'), [], 35)
      .to(wood, { stroke: '#a2a08f', duration: 2, ease: 'sine.inOut' }, 34)
      .call(() => state('dying'), [], 36)
      .to(wood, { opacity: 0, scaleY: .14, duration: 3, ease: 'sine.inOut' }, 36)
      .to(shadow, { scaleX: .16, opacity: .55, duration: 3, ease: 'sine.inOut' }, 36)
      .call(() => state('renewing'), [], 40)
      .to(seed, { opacity: .85, duration: 1.5 }, 40)
      .to({}, { duration: .5 }, 41.5);
    return cycle;
  };
})();
