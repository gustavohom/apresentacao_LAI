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

  window.addPresentationBookends = (tl, introDuration, onFarewellProgress) => {
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
    const farewellGuest = window.createClosingGuest({ root: document.querySelector('#closingGuest'), drawLeaf, onProgress: onFarewellProgress });
    const peopleClock = window.createPeopleClock({ scene: document.querySelector('#peopleClockScene') });
    window.playPeopleClock = () => peopleClock.trigger();
    window.resetPeopleClock = () => peopleClock.reset();
    tl.to('#coverSlide', { autoAlpha: 0, duration: .65 }, 3.2);

    // Cada entrada tem seu próprio ponto de pausa na timeline principal.
    enter('#peopleSlide', 3.2, { y: 0 }, .6);
    enter('.peopleTitle', 3.4, { y: 10 }, .7);
    const peopleEntryTimes = [4.4, 5.7, 7];
    const peopleEntryDuration = .8;
    ['#personGustavo', '#personEric', '#personJosi'].forEach((person, i) => {
      enter(person, peopleEntryTimes[i], { y: 30, scale: .96 }, peopleEntryDuration);
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

    const foliageIntro = window.addFoliageIntro(tl, introDuration);
    const farewellAt = introDuration + 417;
    enter('#farewellSlide', farewellAt, { y: 0 }, .7);
    enter('#farewellTitle', farewellAt + .25, { y: 14 }, .8);
    tl.to({}, { duration: .4 }, farewellAt + 1.8);

    // As folhagens nascem nos cantos inferiores, abaixo das marcas.
    const farewellFronds = document.querySelector('#farewellFronds');
    [0, 1].forEach(side => {
      const edge = mk('g', { transform: side ? 'translate(1950 1085) scale(-.97 .97)' : 'translate(-18 1085)' }, farewellFronds);
      const sprig = mk('g', { class: 'farewellFrond', style: `--phase:${side ? -1.6 : -.3}s` }, edge);
      mk('path', { class: 'farewellTwig', d: 'M0 10Q34-61 151-100M7 12Q61-37 192-32M0 14Q-4-42 44-108' }, sprig);
      [
        [21, -50, -79, .62], [39, -70, -55, .65], [44, -105, -57, .69],
        [63, -62, 13, .64], [80, -78, -40, .68], [109, -88, 10, .58], [142, -100, -27, .58],
        [64, -26, -38, .54], [98, -30, 23, .58], [131, -36, -21, .55], [172, -34, 12, .48],
      ].forEach(([x, y, rotation, size], i) => {
        const node = mk('g', { transform: `translate(${x} ${y}) rotate(${rotation}) scale(${size})` }, sprig);
        drawLeaf(node, i + side + 1, .52);
      });
    });

    const introCaption = document.querySelector('#presentationCaption');
    const captionFor = (scene, time, treeMode) => {
      if (scene === 'coverSlide') return 'A Amazônia muda de um lugar para outro. O que muda na quantidade de folhas da floresta?';
      if (scene === 'peopleSlide') {
        if (time < 4.4) return 'Antes de olhar para a floresta, conheça a equipe.';
        if (time < 5.7) return 'A pesquisa é de Gustavo Mourão, doutorando.';
        if (time < 7) return 'A orientação é do professor Eric Gorgens.';
        return 'A professora Josiane Bruzinga é responsável pela disciplina.';
      }
      if (scene === 'scopeSlide') return 'Olhe para a copa e para o chão sob ela. O LAI relaciona a área de folhas à área de solo.';
      if (scene === 'foliageImportanceSlide') return 'As folhas interceptam luz, liberam vapor de água e assimilam carbono. Mais área foliar pode mudar essas trocas.';
      if (scene === 'foliageComparisonSlide') {
        return time < 29.2 ? 'As três copas começam iguais. O que acontece com o LAI se as folhas mudarem de lugar?'
          : 'Uma copa espalha as folhas e a outra também cresce. A área de folhas por área de solo continua igual.';
      }
      if (scene === 'farewellSlide') return treeMode ? 'Obrigado! Dúvidas?' : 'Estas são algumas das ferramentas usadas ao longo da pesquisa.';
      return '';
    };
    let active = '', activeTreeMode = false;
    const toolsTitle = document.querySelector('#farewellToolsTitle');
    const thanksTitle = document.querySelector('#farewellThanksTitle');
    const startFarewell = treeMode => {
      activeTreeMode = treeMode;
      toolsTitle.hidden = treeMode;
      thanksTitle.hidden = !treeMode;
      if (treeMode) farewellGuest.startTree();
      else farewellGuest.start();
    };
    window.syncPresentationBookends = (time, scene, research = false) => {
      const next = research ? '' : time < 3.2 ? 'coverSlide' : time < 10.2 ? 'peopleSlide' : time < 17.2 ? 'scopeSlide' : time < 26 ? 'foliageImportanceSlide' : time < 42.2 ? 'foliageComparisonSlide' : time >= farewellAt ? 'farewellSlide' : '';
      const treeMode = next === 'farewellSlide' && scene === 68;
      if (next) {
        const caption = captionFor(next, time, treeMode);
        if (introCaption.textContent !== caption) introCaption.textContent = caption;
        introCaption.hidden = !caption;
      }
      foliageIntro.sync(time);
      peopleClock.sync(next === 'peopleSlide' && time >= peopleEntryTimes.at(-1) + (reduced ? .15 : peopleEntryDuration));
      const themedIntro = next === 'foliageImportanceSlide' || next === 'foliageComparisonSlide';
      document.getElementById('stage').classList.toggle('light-slide', Boolean(next) && !themedIntro);
      // A passagem para a árvore conserva a posição das marcas e a folhagem das bordas.
      if (next === active) {
        if (next === 'farewellSlide' && activeTreeMode !== treeMode) startFarewell(treeMode);
        return;
      }
      if (active) document.getElementById(active).classList.remove('is-active');
      if (next) document.getElementById(next).classList.add('is-active');
      // A capa nunca deve expor os objetos brutos de slides futuros, nem durante um seek.
      document.getElementById('stage').dataset.scene = next ? 'bookend' : 'science';
      document.getElementById('scene').style.opacity = next ? '0' : '1';
      if (next === 'coverSlide') {
        if (reduced) coverAmbient.pause(11);
        else coverAmbient.restart();
        coverBird.start();
      } else coverAmbient.pause(0);
      if (next !== 'coverSlide') coverBird.stop();
      if (next === 'farewellSlide') startFarewell(treeMode);
      else farewellGuest.stop();
      active = next;
    };
    return { foliageAnimations: foliageIntro.animationRanges, farewellGuest };
  };
})();
