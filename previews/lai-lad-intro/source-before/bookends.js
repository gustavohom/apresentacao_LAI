/* Capa de espera, participantes, recorte e encerramento. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    parent.appendChild(el);
    return el;
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addPresentationBookends = (tl, introDuration) => {
    const enter = (selector, time, from = {}, duration = .8, stagger = 0) => {
      tl.fromTo(selector, { autoAlpha: 0, y: 25, ...from }, {
        autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0,
        duration: reduced ? .15 : duration, stagger: reduced ? 0 : stagger,
        ease: 'power3.out',
      }, time);
    };
    const colors = ['#8dab65', '#628d54', '#466f4c', '#b0c68c', '#b9a464'];
    const leafPath = 'M-24,0 C-13,-25 14,-25 27,0 C14,24 -12,24 -24,0Z';
    const drawLeaf = (parent, i, opacity = .9) => {
      const inner = mk('g', { class: 'closingLeafInner', style: `--phase:${-i * .27}s` }, parent);
      mk('path', { d: leafPath, fill: colors[i % colors.length], opacity }, inner);
      mk('path', { d: 'M-19,0 Q1,0 22,0', fill: 'none', stroke: '#f3f5e9', 'stroke-opacity': .4, 'stroke-width': 1.2 }, inner);
    };
    const localVector = (leaf, dx, dy) => {
      const a = leaf.rotation * Math.PI / 180;
      return { x: (dx * Math.cos(a) + dy * Math.sin(a)) / leaf.size, y: (-dx * Math.sin(a) + dy * Math.cos(a)) / leaf.size };
    };

    // A capa retoma a moldura botânica e a tipografia do encerramento.
    tl.set('#coverSlide', { autoAlpha: 1 }, 0);
    enter('.coverCopy h1', .2, { y: 18 }, 1.1);
    const coverLeaves = [];
    for (let i = 0; i < 48; i++) {
      const a = i / 48 * Math.PI * 2;
      const x = 960 + Math.cos(a) * (810 + 15 * Math.sin(i * 1.7));
      const y = 540 + Math.sin(a) * (390 + 12 * Math.cos(i * 1.3));
      const rotation = a * 180 / Math.PI + (i % 2 ? 40 : -40);
      const size = .75 + i % 4 * .16;
      const g = mk('g', {}, document.querySelector('#coverLeafWreath'));
      const motion = mk('g', { class: 'coverWindLeaf' }, g);
      drawLeaf(motion, i, .72);
      coverLeaves.push({ motion, x, y, rotation, size });
      tl.fromTo(g, { autoAlpha: 0, x: 960 + Math.cos(a - .7) * 1100, y: 540 + Math.sin(a - .7) * 650, rotation: rotation - 90, scale: .2 }, {
        autoAlpha: 1, x, y, rotation, scale: size,
        duration: reduced ? .1 : 1.25, ease: 'power3.out',
      }, .15 + (i % 12) * .055);
    }
    const coverAmbient = window.createCoverAmbient({
      scene: document.querySelector('#coverForest'), leaves: coverLeaves, drawLeaf, vector: localVector,
    });
    const coverBird = window.createPerchingBird({ scene: document.querySelector('#coverBirdScene'), id: 'coverBird', perchSelector: '#coverBirdPerch' });
    const closingBird = window.createPerchingBird({ scene: document.querySelector('#closingBirdScene'), id: 'closingBird', perchSelector: '#closingBirdPerch' });
    const closingTree = window.createClosingLifeTree({ scene: document.querySelector('#closingForest'), drawLeaf });
    const farewellGuest = window.createClosingGuest({ root: document.querySelector('#closingGuest') });
    const peopleClock = window.createPeopleClock({ scene: document.querySelector('#peopleClockScene') });
    window.playPeopleClock = () => peopleClock.trigger();
    window.resetPeopleClock = () => peopleClock.reset();
    tl.to('#coverSlide', { autoAlpha: 0, duration: .65 }, 3.2);

    // Cada entrada tem seu próprio ponto de pausa na timeline principal.
    enter('#peopleSlide', 3.2, { y: 0 }, .6);
    enter('.peopleTitle', 3.4, { y: 10 }, .7);
    ['#personGustavo', '#personEric', '#personJosi'].forEach((person, i) => {
      enter(person, [4.4, 5.7, 7][i], { y: 30, scale: .96 }, .8);
    });
    tl.to('#peopleSlide', { autoAlpha: 0, duration: .6 }, 10.2);

    enter('#scopeSlide', 10.2, { y: 0 }, .6);
    enter('.scopeEyebrow', 10.6);
    enter('.scopeCopy h2', 10.9, { y: 20 }, .9);
    enter('.scopeRule', 11.4, { scaleX: 0 }, .8);
    enter('.scopeLead', 11.8, { y: 16 }, .8);
    enter('.scopeSoil', 10.8, { scale: .7 }, .9);
    tl.fromTo('.scopeBranch', { strokeDasharray: 1, strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: reduced ? .1 : 1.3, stagger: reduced ? 0 : .09, ease: 'power2.out',
    }, 11.1);
    const noise = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
    const clumps = [[300, 160, 66], [225, 220, 66], [373, 215, 66], [200, 290, 62], [397, 282, 62], [300, 291, 77]];
    clumps.forEach(([cx, cy, r], clump) => {
      for (let i = 0; i < 12; i++) {
        const n = clump * 12 + i;
        const a = i / 12 * Math.PI * 2;
        const radius = r * (.25 + .7 * Math.sqrt(noise(n + 1)));
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        const g = mk('g', {}, document.querySelector('#scopeTreeLeafCloud'));
        drawLeaf(g, n, .94);
        tl.fromTo(g, { autoAlpha: 0, x: x + 80 + noise(n + 4) * 150, y: y - 150, rotation: -100, scale: .1 }, {
          autoAlpha: 1, x, y, rotation: noise(n + 2) * 180 - 90, scale: .65 + noise(n + 3) * .4,
          duration: reduced ? .1 : 1.2, ease: 'power3.out',
        }, 11.7 + clump * .2 + i * .035);
      }
    });
    tl.to('#scopeSlide', { autoAlpha: 0, duration: .8 }, 17.2);

    enter('#researchContributionSlide', 17.2, { y: 0 }, .7);
    tl.to('#researchContributionSlide', { autoAlpha: 0, duration: .8 }, introDuration - .8);

    const closingAt = introDuration + 417;
    const farewellAt = closingAt + 5.2;
    const leaves = [];
    const wreath = document.querySelector('#closingLeafWreath');
    for (let i = 0; i < 52; i++) {
      const a = i / 52 * Math.PI * 2;
      const x = 960 + Math.cos(a) * (710 + 18 * Math.sin(i * 2.1));
      const y = 540 + Math.sin(a) * (330 + 13 * Math.cos(i * 1.3));
      const rotation = a * 180 / Math.PI + (i % 2 ? 48 : -48);
      const size = .72 + (i % 5) * .14;
      const g = mk('g', {}, wreath);
      const motion = mk('g', { class: 'windWreathLeaf' }, g);
      drawLeaf(motion, i);
      leaves.push({ motion, x, y, rotation, size });
      tl.fromTo(g, { autoAlpha: 0, x: 960 + Math.cos(a - 1.1) * 1040, y: 540 + Math.sin(a - 1.1) * 600, rotation: rotation - 150, scale: .15 }, {
        autoAlpha: 1, x, y, rotation, scale: size,
        duration: reduced ? .15 : 2.1, ease: 'power3.out',
      }, closingAt + .35 + (i % 13) * .055);
    }
    const particles = document.querySelector('#closingLeafParticles');
    for (let i = 0; i < 12; i++) {
      const g = mk('g', {}, particles);
      drawLeaf(g, i, .3);
      const side = i % 2 ? 1 : -1;
      tl.fromTo(g, { autoAlpha: 0, x: 960 + side * (750 + i * 7), y: 1160, scale: .5, rotation: i * 27 }, {
        autoAlpha: 1, x: 960 + side * (800 + (i % 3) * 35), y: 80 + i * 76,
        rotation: i * 27 + 160, duration: reduced ? .1 : 2.4, ease: 'power2.out',
      }, closingAt + .2 + i * .055);
    }
    enter('#closingSlide', closingAt, { y: 0 }, .8);
    enter('#closingThanks span', closingAt + 1.1, { y: 50, rotation: 6, scale: .9 }, 1, .07);
    enter('.closingRule', closingAt + 2, { scaleX: 0 }, .9);
    enter('#closingQuestions', closingAt + 2.3, { y: 25 }, .9);
    tl.to({}, { duration: .4 }, closingAt + 4.2);
    tl.to('#closingSlide', { autoAlpha: 0, duration: .6 }, farewellAt);
    enter('#farewellSlide', farewellAt, { y: 0 }, .7);
    enter('#farewellTitle', farewellAt + .25, { y: 14 }, .8);
    tl.to({}, { duration: .4 }, farewellAt + 1.8);

    // Ciclo ambiente independente da timeline: funciona com o slide parado.
    const wind = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 3 });
    wind.to({}, { duration: 3.2 }, 0);
    leaves.forEach((leaf, i) => {
      const delay = (i % 10) * .045;
      if (i % 3 === 0) {
        const out = localVector(leaf, 2200 - leaf.x, -100 - 35 * Math.sin(i));
        const incoming = localVector(leaf, -180 - leaf.x, 65 * Math.cos(i));
        wind.to(leaf.motion, { ...out, rotation: 125, opacity: 0, duration: 1.9, ease: 'power2.in' }, 3.2 + delay)
          .set(leaf.motion, { ...incoming, rotation: -80, opacity: 0 }, 5.5 + delay)
          .to(leaf.motion, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 2.4, ease: 'power3.out' }, 5.6 + delay);
      } else {
        const push = localVector(leaf, 38 + i % 4 * 8, -12);
        wind.to(leaf.motion, { ...push, rotation: 14, duration: 1.1, ease: 'sine.inOut' }, 3.2 + delay)
          .to(leaf.motion, { x: 0, y: 0, rotation: 0, duration: 2.3, ease: 'sine.inOut' }, 4.3 + delay);
      }
    });
    const windLeaves = document.querySelector('#closingWindLeaves');
    for (let i = 0; i < 16; i++) {
      const g = mk('g', { class: 'windFlyingLeaf' }, windLeaves);
      drawLeaf(g, i, .72);
      gsap.set(g, { autoAlpha: 0 });
      const start = 3.4 + i * .09;
      const y = i % 2 ? 870 + i % 5 * 30 : 105 + i % 5 * 30;
      wind.set(g, { autoAlpha: 1, x: -150 - i % 4 * 50, y: y + 40, rotation: -50 + i * 13, scale: .55 + i % 4 * .13 }, start)
        .to(g, { x: 2200, y: y - 85, rotation: 210 + i * 17, duration: 3.1, ease: 'none' }, start)
        .to(g, { autoAlpha: 0, duration: .25 }, start + 2.85);
    }
    const windLines = document.querySelector('#closingWindLines');
    ['M-140 210 Q180 130 430 190', 'M50 900 Q350 830 640 880', 'M1300 155 Q1600 95 1980 160'].forEach((d, i) => {
      const path = mk('path', { d, fill: 'none', stroke: '#6c8960', 'stroke-width': 2, pathLength: 1, 'stroke-linecap': 'round' }, windLines);
      gsap.set(path, { opacity: 0, strokeDasharray: 1, strokeDashoffset: 1 });
      wind.fromTo(path, { opacity: .4, strokeDashoffset: 1 }, { opacity: 0, strokeDashoffset: -1, duration: 2.3, ease: 'sine.inOut', immediateRender: false }, 3.3 + i * .24);
    });
    wind.to({}, { duration: .2 }, 8.5);

    let active = '';
    window.syncPresentationBookends = (time) => {
      const next = time < 3.2 ? 'coverSlide' : time < 10.2 ? 'peopleSlide' : time < 17.2 ? 'scopeSlide' : time < introDuration ? 'researchContributionSlide' : time >= farewellAt ? 'farewellSlide' : time >= closingAt ? 'closingSlide' : '';
      peopleClock.sync(next === 'peopleSlide' && time >= 7.9);
      if (next === active) return;
      if (active) document.getElementById(active).classList.remove('is-active');
      if (next) document.getElementById(next).classList.add('is-active');
      document.getElementById('stage').classList.toggle('light-slide', Boolean(next));
      // A capa nunca deve expor os objetos brutos de slides futuros, nem durante um seek.
      document.getElementById('stage').dataset.scene = next ? 'bookend' : 'science';
      document.getElementById('scene').style.opacity = next ? '0' : '1';
      if (next === 'coverSlide') {
        if (reduced) coverAmbient.pause(11);
        else coverAmbient.restart();
        coverBird.start();
      } else coverAmbient.pause(0);
      if (next !== 'coverSlide') coverBird.stop();
      if (!reduced && next === 'closingSlide') wind.restart();
      else wind.pause();
      if (next === 'closingSlide') closingBird.start();
      else closingBird.stop();
      if (next === 'closingSlide') {
        if (reduced) closingTree.pause(18);
        else closingTree.restart();
      } else closingTree.pause();
      if (next === 'farewellSlide') farewellGuest.start();
      else farewellGuest.stop();
      active = next;
    };
  };
})();
