/* Brincadeiras com as marcas e passagem para a árvore de despedida. */
(() => {
  window.createClosingGuest = ({ root, drawLeaf, onProgress }) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motion = root.querySelector('.closingGuestMotion');
    const poses = [...root.querySelectorAll('.closingGuestPose')];
    const leaf = root.querySelector('#closingGuestLeaf');
    const slide = root.closest('#farewellSlide');
    const symbols = [...slide.querySelectorAll('.farewellSymbol')];
    const props = Object.fromEntries(symbols.map(element => [element.dataset.symbol, element]));
    const columns = [11, 22, 33, 67, 78, 89];
    const rows = [
      [['treelab', .44], ['r', .82], ['chatgpt', .84], ['gemini', .91], ['qgis', .88], ['excel', .85]],
      [['fusion', .48], ['eba', .64], ['zotero', .54], ['drive', .65], ['docs', .58], ['notion', .63]],
      [['periodicos', .47], ['cafe', .62], ['miro', .47], ['lidr', .62], ['terra', .49], ['sf', .64]],
      [['fapemig', .53], ['capes', .56], ['scihub', .45], ['ufvjm', .56], ['tidyverse', .49], ['pos-graduacao', .70]],
    ];
    const docks = Object.fromEntries(rows.flatMap((row, i) => row.map(([name, scale], j) => [
      name, { left: columns[j] + '%', top: (36.5 + 14.5 * i) + '%', scale },
    ])));
    const tree = window.createFarewellTree({ scene: slide.querySelector('#farewellTree'), symbols, docks, drawLeaf });
    const interaction = name => { root.dataset.interaction = name; };
    const pose = name => {
      poses.forEach(element => gsap.set(element, { opacity: element.dataset.pose === name ? 1 : 0 }));
      root.dataset.action = name;
    };
    let cycle = null;
    const progress = () => cycle?.progress() ?? Number(['ready', 'tree'].includes(root.dataset.interaction));
    const canAdvance = () => Boolean(cycle) && progress() < 1;

    function stop() {
      cycle?.kill();
      cycle = null;
      tree.reset();
      gsap.killTweensOf(root);
      gsap.set(root, { autoAlpha: 0 });
      gsap.set(motion, { xPercent: 0, yPercent: 0, rotation: 0, scaleX: 1, scaleY: 1, clearProps: 'filter' });
      gsap.set(leaf, { x: -100, y: 105, rotation: -25, scale: .85, opacity: 0, svgOrigin: '0 0', smoothOrigin: false });
      symbols.forEach(element => {
        element.classList.remove('is-docked');
        gsap.set(element, { ...docks[element.dataset.symbol], xPercent: -50, yPercent: -50, rotation: 0, autoAlpha: 0 });
      });
      root.dataset.action = 'idle';
      interaction('idle');
    }

    function start() {
      stop();
      if (reduced) {
        pose('wave');
        gsap.set([root, ...symbols], { autoAlpha: 1 });
        interaction('ready');
        return;
      }
      pose('wave');
      cycle = gsap.timeline({ onUpdate: () => onProgress(progress()) });
      cycle.to(root, { autoAlpha: 1, duration: .28 }, 0);
      const docked = name => props[name].classList.add('is-docked');
      const park = (name, at, duration = .55, ease = 'power2.inOut') => cycle.to(props[name], {
        ...docks[name], rotation: 0, yPercent: -50, duration, ease,
        onComplete: () => docked(name),
      }, at);
      const fly = (name, from, to, at, duration) => cycle.fromTo(props[name], {
        ...from, autoAlpha: 0,
      }, {
        ...to, autoAlpha: 1, duration, ease: 'power2.out', immediateRender: false,
      }, at);
      const enterGroup = (names, at) => names.forEach((name, index) => {
        const dock = docks[name];
        const column = Number.parseFloat(dock.left);
        const side = column < 50 ? -1 : 1;
        cycle.fromTo(props[name], {
          left: (column + 7 * side) + '%', top: (Number.parseFloat(dock.top) + 5) + '%',
          scale: dock.scale * .46, rotation: 17 * side, autoAlpha: 0,
        }, {
          ...dock, rotation: 0, autoAlpha: 1, duration: .65, ease: 'power2.out', immediateRender: false,
          onComplete: () => docked(name),
        }, at + index * .075);
      });
      const react = (name, at, duration = .095) => {
        if (!duration) {
          cycle.call(() => pose(name), [], at);
          return;
        }
        cycle.call(() => { root.dataset.action = name; }, [], at)
          .to(poses, { opacity: (_, element) => Number(element.dataset.pose === name), duration, ease: 'sine.inOut' }, at);
      };
      const chapter = (name, at) => cycle.call(() => interaction(name), [], at);

      chapter('greeting', 0);
      cycle.to(motion, { rotation: -1.3, duration: .18, yoyo: true, repeat: 1, ease: 'sine.inOut' }, .18);

      // O R entra sozinho depois do aceno. A careta e o espanto acompanham o pouso.
      chapter('r-balance', .68);
      fly('r', { left: '25%', top: '52%', scale: .38, rotation: -22 },
        { left: '43%', top: '29%', scale: .62, rotation: 13 }, .68, .76);
      react('balance', 1.07);
      cycle.to(props.r, { left: '50%', top: '29.4%', scale: .48, rotation: -8, duration: .44 }, 1.44)
        .to(motion, { rotation: -2.7, duration: .16, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 1.88)
        .to(props.r, { rotation: 12, duration: .13, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 1.88);
      react('grimace', 1.88, 0);
      react('shrug', 2.49);
      park('r', 2.53, .61);

      // O ChatGPT chega no gesto de silêncio; o Gemini entra antes do espirro.
      chapter('ai-sneeze', 3.3);
      react('shush', 3.3);
      fly('chatgpt', { left: '19%', top: '46%', scale: .3, rotation: -22 },
        { left: '39%', top: '43%', scale: .67, rotation: 0 }, 3.31, .83);
      fly('gemini', { left: '73%', top: '51%', scale: .3, rotation: 22 },
        { left: '61%', top: '46%', scale: .78, rotation: 0 }, 4.13, .61);
      const sneezeAt = 4.96;
      react('sneeze', sneezeAt, 0);
      cycle.to(motion, { yPercent: 2.2, rotation: -4, duration: .14, yoyo: true, repeat: 1 }, sneezeAt);
      park('chatgpt', sneezeAt, .92, 'power3.out');
      park('gemini', sneezeAt, .92, 'power3.out');

      // O QGIS e o Excel seguem as mãos, com um intervalo entre as entradas.
      chapter('qgis-excel-dance', 6.42);
      react('dance', 6.42);
      fly('qgis', { left: '76%', top: '57%', scale: .29, rotation: 14 },
        { left: '61%', top: '46%', scale: .65, rotation: -7 }, 6.42, .62);
      fly('excel', { left: '28%', top: '61%', scale: .25, rotation: -14 },
        { left: '39%', top: '38%', scale: .63, rotation: 7 }, 7.04, .55);
      cycle.to(motion, { rotation: 2.3, duration: .22, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 7.55)
        .to([props.excel, props.qgis], { yPercent: -56, duration: .22, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 7.55);
      park('qgis', 8.43, .5);
      park('excel', 8.48, .5);

      // O lidR cai de cima. A chegada do terra inicia o gesto alternado.
      chapter('r-packages', 9.2);
      react('catch', 9.2);
      fly('lidr', { left: '38%', top: '24%', scale: .29, rotation: -20 },
        { left: '44%', top: '35%', scale: .54, rotation: -8 }, 9.2, .72);
      react('juggle', 10.22);
      fly('terra', { left: '74%', top: '43%', scale: .3, rotation: 20 },
        { left: '58%', top: '47%', scale: .51, rotation: -9 }, 10.22, .55);
      cycle.to(props.lidr, { top: '47%', rotation: -9, duration: .32, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 10.78)
        .to(props.terra, { top: '33%', rotation: 10, duration: .32, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 10.78)
        .to(motion, { rotation: 2.1, duration: .32, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 10.78);
      park('lidr', 12.7, .54);
      park('terra', 12.75, .54);

      // O Zotero atravessa por cima enquanto o personagem se abaixa.
      chapter('zotero-dodge', 13.53);
      react('duck', 13.53);
      fly('zotero', { left: '20%', top: '47%', scale: .33, rotation: -15 },
        { left: '43%', top: '30%', scale: .54, rotation: 26 }, 13.53, .6);
      cycle.fromTo(leaf, { x: -105, y: 90, rotation: -25, opacity: 0 },
        { x: 630, y: 100, rotation: 160, opacity: 1, duration: 1.18, ease: 'none', immediateRender: false }, 13.62)
        .to(leaf, { opacity: 0, duration: .15 }, 14.69)
        .to(props.zotero, { left: '57%', top: '32%', rotation: 95, duration: .47 }, 14.13);
      park('zotero', 14.68, .58);

      chapter('writing-tools', 15.52);
      react('carry', 15.52);
      fly('drive', { left: '26%', top: '66%', scale: .3, rotation: -12 },
        { left: '44%', top: '53%', scale: .56, rotation: 4 }, 15.53, .62);
      fly('docs', { left: '73%', top: '65%', scale: .29, rotation: 13 },
        { left: '52%', top: '49%', scale: .53, rotation: -5 }, 16.19, .62);
      cycle.to(motion, { yPercent: 1.1, duration: .2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 16.56);
      park('drive', 17.32, .58);
      park('docs', 17.38, .58);

      // A reverência apresenta TreeLab e EBA, antes da entrada das demais marcas.
      chapter('research-community', 18.14);
      react('bow', 18.14);
      fly('treelab', { left: '19%', top: '70%', scale: .21, rotation: -15 },
        { left: '32%', top: '55%', scale: .66, rotation: -4 }, 18.19, .65);
      fly('eba', { left: '81%', top: '68%', scale: .3, rotation: 14 },
        { left: '68%', top: '55%', scale: .76, rotation: 4 }, 18.96, .62);
      park('treelab', 19.43, .61);
      park('eba', 19.63, .61);

      react('victory', 19.93);
      cycle.to(motion, { yPercent: -2.2, duration: .23, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 20.02);
      chapter('remaining-symbols', 20.54);
      react('heart', 20.54);
      enterGroup(['fusion', 'notion', 'sf', 'tidyverse'], 20.72);
      enterGroup(['periodicos', 'cafe', 'miro', 'scihub'], 21.42);
      enterGroup(['capes', 'fapemig', 'ufvjm', 'pos-graduacao'], 22.18);
      chapter('all-symbols', 23.48);
      react('wave', 23.48);
      cycle.to(motion, { rotation: -1.6, duration: .23, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 23.65);
      cycle.call(() => interaction('ready'), [], 24.8);
      cycle.timeScale(cycle.duration() / 15);
    }

    function startTree() {
      stop();
      pose('wave');
      gsap.set([root, ...symbols], { autoAlpha: 1 });
      interaction('forming-tree');
      if (reduced) {
        gsap.set([root, ...symbols], { autoAlpha: 0 });
        tree.show();
        interaction('tree');
        return;
      }
      cycle = gsap.timeline({ onUpdate: () => onProgress(progress()) });
      const liftAt = .48;
      cycle.to(motion, { scaleX: .24, scaleY: .95, filter: 'sepia(1) saturate(.65)', duration: 1.0, ease: 'sine.inOut' }, liftAt)
        .to(root, { autoAlpha: 0, duration: .72, ease: 'sine.inOut' }, liftAt + .42);
      cycle.call(() => interaction('tree'), [], tree.animate(cycle, liftAt));
    }

    function advance() {
      if (!canAdvance()) return false;
      cycle.seek(cycle.duration(), false);
      return true;
    }

    stop();
    return { start, startTree, stop, canAdvance, advance, progress };
  };
})();
