/* A árvore da apresentação reunida pelas folhas que saem dos símbolos. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const width = 1920, height = 1080, ground = 936;
  const make = (tag, attrs, parent) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
    parent.appendChild(node);
    return node;
  };
  const curve = (a, b, c, d, t) => {
    const m = 1 - t;
    return m ** 3 * a + 3 * m ** 2 * t * b + 3 * m * t ** 2 * c + t ** 3 * d;
  };

  function createLeafLitter(scene) {
    const litter = make('g', { id: 'farewellLitter', opacity: 0, 'aria-hidden': 'true' }, scene);
    const fade = make('linearGradient', { id: 'farewellLitterFade', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 914, x2: 0, y2: 1080 }, litter);
    make('stop', { offset: 0, 'stop-color': '#e6d8c2', 'stop-opacity': 0 }, fade);
    make('stop', { offset: '.43', 'stop-color': '#e6d8c2', 'stop-opacity': '.43' }, fade);
    make('stop', { offset: 1, 'stop-color': '#efe5d5', 'stop-opacity': '.24' }, fade);
    make('path', { d: 'M0 959Q210 924 445 947T880 940T1360 935T1920 952V1080H0Z', fill: 'url(#farewellLitterFade)' }, litter);
    const colors = ['#bca384', '#c9af8e', '#a99e88', '#d1bc9b'];
    for (let i = 0; i < 112; i++) {
      const x = (i * 239 + i % 7 * 31) % (width + 50) - 25;
      const depth = (i * 37 + i % 9 * 13) % 96 / 96;
      const y = ground + 2 + depth * 129 + 7 * Math.sin(x / 161);
      const size = (.57 + i % 5 * .12) * (.54 + depth * .55);
      const leaf = make('g', { transform: `translate(${x} ${y}) rotate(${(i * 59) % 115 - 57}) scale(${size})`, opacity: .22 + depth * .22 }, litter);
      make('path', { d: i % 3 ? 'M-12 1Q-3-8 12-4Q8 4-7 4Z' : 'M-11 3Q-7-1-9-5Q0-8 12-3Q8 5-5 5Z', fill: colors[i % colors.length] }, leaf);
      make('path', { d: 'M-15 3Q-3 0 8-2', fill: 'none', stroke: '#a3927a', 'stroke-width': .9, 'stroke-linecap': 'round' }, leaf);
    }
    return litter;
  }

  function createFauna(scene, groundLayer) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pace = 1.24;
    const animals = make('g', { 'aria-hidden': 'true' }, scene);
    const groundFauna = window.createFarewellGroundFauna({ behindTree: groundLayer, inFront: animals });
    const bird = window.createPerchingBird({ scene: animals, id: 'farewellBird',
      perchPoint: { x: 1218, y: 556 }, scale: .85, wait: .45, speed: 2 * pace });
    const butterfly = make('g', { id: 'farewellButterfly', 'data-state': 'away' }, animals);
    const model = make('g', { transform: 'rotate(-19)' }, butterfly);
    const wings = make('g', { class: 'farewellButterflyWings', stroke: '#543625', 'stroke-width': 1.7 }, model);
    [-1, 1].forEach(side => {
      const wing = make('g', { transform: `scale(${side} 1)` }, wings);
      make('path', { d: 'M0 3C10-15 31-29 39-22C43-14 31 1 15 6C32 5 33 20 22 22C13 22 6 15 0 6Z', fill: '#c48641' }, wing);
      make('path', { d: 'M4 2Q22-18 34-18M11 9Q25 11 24 17', fill: 'none', stroke: '#f7d493', 'stroke-width': 2.7, 'stroke-linecap': 'round' }, wing);
    });
    make('path', { d: 'M0 11V-5M0-5Q-3-13-7-13M0-5Q3-13 7-13', fill: 'none', stroke: '#543625', 'stroke-width': 2, 'stroke-linecap': 'round' }, model);

    let flight, visits;
    const activeVisitors = new Set();
    const showVisitors = () => {
      if (activeVisitors.size) scene.dataset.visitors = [...activeVisitors].join(' ');
      else delete scene.dataset.visitors;
    };
    const stopButterfly = () => {
      flight?.kill();
      flight = null;
      gsap.set(butterfly, { autoAlpha: 0 });
      butterfly.dataset.state = 'away';
    };
    const stage = name => { butterfly.dataset.state = name; };
    const flyButterfly = () => {
      if (reduced) {
        gsap.set(butterfly, { x: 744, y: 551, autoAlpha: 1 });
        stage('resting');
        return;
      }
      flight = gsap.timeline().timeScale(1.33 * pace);
      flight.set(butterfly, { x: 2005, y: 745, autoAlpha: 0 }, 0)
        .call(() => stage('flying'), [], .32)
        .set(butterfly, { autoAlpha: 1 }, .32)
        .to(butterfly, { x: 1510, y: 669, duration: 1.3, ease: 'sine.inOut' }, .32)
        .to(butterfly, { x: 1030, y: 700, duration: 1.08, ease: 'sine.inOut' }, 1.62)
        .to(butterfly, { x: 744, y: 551, duration: 1.28, ease: 'sine.out' }, 2.7)
        .call(() => stage('resting'), [], 3.98)
        .call(() => stage('flying'), [], 6.45)
        .to(butterfly, { x: 457, y: 470, duration: .96, ease: 'sine.in' }, 6.45)
        .to(butterfly, { x: -105, y: 353, duration: 1.4, ease: 'sine.out' }, 7.41)
        .set(butterfly, { autoAlpha: 0 }, 8.81)
        .call(() => stage('away'), [], 8.81);
    };

    const stop = () => {
      visits?.kill();
      visits = null;
      bird.stop();
      groundFauna.stop();
      stopButterfly();
      activeVisitors.clear();
      showVisitors();
    };
    const start = () => {
      stop();
      visits = gsap.timeline({ repeat: -1, repeatDelay: 2.1 }).timeScale(reduced ? 1 : pace);
      const cue = (name, at, duration, play, finish) => {
        const end = at + (reduced ? 5 : duration);
        visits.call(() => {
          activeVisitors.add(name);
          showVisitors();
          play();
        }, [], at);
        visits.call(() => {
          finish();
          activeVisitors.delete(name);
          showVisitors();
        }, [], end);
        return end;
      };
      const cueGround = (name, at) => cue(name, at, groundFauna.duration(name), () => groundFauna.start(name, pace), groundFauna.stop);
      const gap = .43;
      const birdAt = .35;
      cue('bird', birdAt, 7.75, bird.start, bird.stop);
      const diggingAt = birdAt + (reduced ? 4.15 : bird.departureDelay * pace);
      let nextAt = cueGround('armadillo', diggingAt) + gap;
      for (const name of ['jaguar', 'guest', 'chase', 'anteater']) {
        nextAt = cueGround(name, nextAt) + gap;
      }
      const butterflyEnd = cue('butterfly', nextAt, 6.75, flyButterfly, stopButterfly);
      const frogEnd = cueGround('frog', nextAt + 1.35);
      cueGround('agouti', Math.max(butterflyEnd, frogEnd) + gap);
    };
    return { start, stop };
  }

  window.createFarewellTree = ({ scene, symbols, docks, drawLeaf }) => {
    const palette = ['#356837', '#487e41', '#668f42', '#7da54c', '#9cba62', '#5e8c45'];
    const crown = [
      [-173, -542], [-109, -597], [-36, -565], [42, -610], [119, -577], [185, -547],
      [-275, -494], [-219, -530], [-121, -489], [78, -530], [202, -511], [290, -498],
      [-325, -433], [-246, -451], [-157, -427], [137, -452], [237, -450], [332, -423],
      [-242, -389], [-147, -385], [-64, -450], [47, -437], [151, -389], [239, -381],
    ];
    const addLeaf = (parent, index, opacity) => {
      const node = make('g', {}, parent);
      drawLeaf(node, index, opacity);
      node.querySelector('path').setAttribute('fill', palette[index % palette.length]);
      return node;
    };

    const litter = createLeafLitter(scene);
    const groundShade = make('ellipse', { cx: width / 2, cy: ground + 8, rx: 200, ry: 14, fill: '#8c9874' }, scene);
    const groundLayer = make('g', {}, scene);
    const base = make('g', { transform: `translate(${width / 2} ${ground}) scale(1.17 1.16)` }, scene);
    const wood = document.querySelector('#wood').cloneNode(true);
    const trunk = wood.querySelector('#trunk');
    const branches = [...wood.querySelectorAll('.br')];
    [wood, ...wood.querySelectorAll('*')].forEach(node => {
      ['id', 'style', 'transform', 'data-svg-origin'].forEach(name => node.removeAttribute(name));
    });
    branches.forEach(node => node.setAttribute('pathLength', 1));
    base.appendChild(wood);

    const breeze = make('g', { fill: 'none', stroke: '#8da171', 'stroke-linecap': 'round' }, scene);
    const windPaths = [
      'M112 790 Q378 790 553 606 T871 405',
      'M1785 750 Q1528 791 1374 604 T1068 425',
      'M94 470 Q327 367 560 437',
      'M1828 439 Q1583 375 1377 453',
    ].map(d => make('path', { d, 'stroke-width': 2.2, pathLength: 1 }, breeze));
    const foliage = make('g', {}, scene);
    const byName = new Map(symbols.map(symbol => [symbol.dataset.symbol, symbol]));

    const clusters = Object.entries(docks).map(([name, dock], index) => {
      const [x, y] = crown[index];
      const column = index % 6;
      const side = column < 3 ? -1 : 1;
      const target = { x: width / 2 + x, y: ground + y };
      const group = make('g', { 'data-farewell-leaf': name }, foliage);
      const leaves = Array.from({ length: 12 }, (_, i) => {
        const angle = i * 2.39996 + index * .59;
        const radius = Math.sqrt((i + .5) / 12);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const leaf = addLeaf(group, index * 5 + i, i % 3 === 0 ? .94 : .84);
        return {
          leaf,
          bud: { x: x * 40, y: y * 31, rotation: angle * 47 - 24, scale: .28 + (i % 6) * .085 },
          open: { x: x * 77, y: y * 56, rotation: angle * 47 + index * 11, scale: .49 + (i % 6) * .105 },
        };
      });
      const origin = { x: width * Number.parseFloat(dock.left) / 100, y: height * Number.parseFloat(dock.top) / 100 };
      const position = t => {
        const lift = 82 + index % 4 * 22;
        const flutter = Math.sin(Math.PI * t);
        const x = curve(origin.x, origin.x + side * 48, target.x + side * 145, target.x, t);
        const y = curve(origin.y, origin.y - lift, target.y - 108 + index % 5 * 16, target.y, t);
        const rotation = side * (18 * (1 - t) + 133 * flutter + 16 * Math.sin(4 * Math.PI * t) * flutter);
        const scale = .94 + .16 * flutter + .06 * t;
        group.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + rotation + ') scale(' + scale + ')');
      };
      const delay = [2, 1, 0, 0, 1, 2][column] * .17 + Math.floor(index / 6) * .20;
      return { symbol: byName.get(name), scale: dock.scale, leaves, group, position, delay };
    });
    const fauna = createFauna(scene, groundLayer);
    // As folhas usam coordenadas locais do conjunto, inclusive depois de voltar ao slide.
    const bloom = (leaves, progress) => leaves.forEach(({ leaf, bud, open }, index) => {
      const p = Math.max(0, Math.min(1, (progress - index * .019) / .77));
      const t = 1 - (1 - p)**3;
      const mix = key => bud[key] + (open[key] - bud[key]) * t;
      leaf.setAttribute('transform', `translate(${mix('x')} ${mix('y')}) rotate(${mix('rotation')}) scale(${mix('scale')})`);
    });

    const show = () => {
      gsap.set(scene, { autoAlpha: 1 });
      gsap.set(litter, { opacity: 1 });
      gsap.set(groundShade, { opacity: .27 });
      gsap.set(trunk, { scaleX: 1, scaleY: 1, opacity: 1 });
      gsap.set(branches, { strokeDashoffset: 0, opacity: 1 });
      clusters.forEach(({ group, leaves, position }) => {
        position(1);
        gsap.set(group, { opacity: 1 });
        bloom(leaves, 1);
      });
      scene.removeAttribute('aria-hidden');
      fauna.start();
    };

    const reset = () => {
      fauna.stop();
      gsap.set(scene, { autoAlpha: 0 });
      gsap.set(litter, { opacity: 0 });
      gsap.set(groundShade, { opacity: 0 });
      gsap.set(trunk, { svgOrigin: '0 0', scaleX: .50, scaleY: .37, opacity: 0 });
      gsap.set(branches, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
      gsap.set(windPaths, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
      clusters.forEach(({ group, leaves, position }) => {
        position(0);
        gsap.set(group, { opacity: 0 });
        bloom(leaves, 0);
      });
      scene.setAttribute('aria-hidden', 'true');
    };

    const animate = (timeline, at) => {
      timeline.set(scene, { autoAlpha: 1 }, at)
        .to(litter, { opacity: 1, duration: 1.25 }, at + .38)
        .to(groundShade, { opacity: .27, duration: 1.25 }, at + .38)
        .to(trunk, { opacity: 1, scaleX: 1, scaleY: 1, duration: 1.35, ease: 'power2.out' }, at + .28)
        .to(branches, { opacity: 1, strokeDashoffset: 0, duration: 1.04, stagger: .058, ease: 'sine.out' }, at + 1.12);
      timeline.to(windPaths, { opacity: .3, duration: .5, stagger: .11 }, at + .46)
        .to(windPaths, { strokeDashoffset: 0, duration: 1.48, stagger: .11, ease: 'sine.inOut' }, at + .46)
        .to(windPaths, { opacity: 0, duration: .88, stagger: .10 }, at + 1.78);
      clusters.forEach(({ symbol, scale, leaves, group, position, delay }) => {
        const start = at + .25 + delay;
        const duration = 2.45 + delay * .25;
        const arrival = start + .46 + duration;
        const path = { value: 0 };
        timeline.to(symbol, { scale: scale * .45, autoAlpha: 0, duration: .56, ease: 'power2.inOut' }, start)
          .to(group, { opacity: 1, duration: .42, ease: 'sine.inOut' }, start + .14)
          .to(path, { value: 1, duration, ease: 'sine.inOut', onUpdate: () => position(path.value) }, start + .46);
        const opening = { value: 0 };
        timeline.to(opening, { value: 1, duration: .97, ease: 'none', onUpdate: () => bloom(leaves, opening.value) }, arrival - .3);
      });
      const end = timeline.duration();
      timeline.call(show, [], end);
      return end;
    };

    return { animate, reset, show };
  };
})();
