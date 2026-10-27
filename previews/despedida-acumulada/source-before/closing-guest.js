/* Brincadeiras de Gustavo no slide de despedida, com poses novas e já existentes. */
(() => {
  window.createClosingGuest = ({ root }) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motion = root.querySelector('.closingGuestMotion');
    const shadow = root.querySelector('.closingGuestShadow');
    const poses = [...root.querySelectorAll('.closingGuestPose')];
    const leaf = root.querySelector('#closingGuestLeaf');
    const symbols = [...root.closest('#farewellSlide').querySelectorAll('.farewellSymbol')];
    const props = Object.fromEntries(symbols.map(element => [element.dataset.symbol, element]));
    const homes = {
      treelab: { left: '20%', top: '58%' },
      r: { left: '32%', top: '38%' },
      chatgpt: { left: '12%', top: '36%' },
      gemini: { left: '85%', top: '36%' },
      qgis: { left: '69%', top: '39%' },
      excel: { left: '32%', top: '65%' },
      fusion: { left: '77%', top: '78%' },
      eba: { left: '78%', top: '58%' },
      zotero: { left: '24%', top: '40%' },
      drive: { left: '18%', top: '66%' },
      docs: { left: '76%', top: '40%' },
      notion: { left: '82%', top: '66%' },
      miro: { left: '31%', top: '79%' },
      cafe: { left: '29%', top: '42%' },
      periodicos: { left: '77%', top: '49%' },
      scihub: { left: '25%', top: '72%' },
      lidr: { left: '25%', top: '42%' },
      terra: { left: '76%', top: '42%' },
      sf: { left: '25%', top: '72%' },
      tidyverse: { left: '76%', top: '72%' },
      capes: { left: '23%', top: '47%' },
      fapemig: { left: '78%', top: '45%' },
      ufvjm: { left: '78%', top: '72%' },
    };
    const groups = {
      tools: ['treelab', 'r', 'chatgpt', 'gemini', 'qgis', 'excel', 'fusion', 'eba'],
      writing: ['zotero', 'drive', 'docs', 'notion', 'miro'],
      reading: ['cafe', 'periodicos', 'scihub'],
      packages: ['lidr', 'terra', 'sf', 'tidyverse'],
      community: ['capes', 'fapemig', 'ufvjm'],
    };
    const resetSymbols = () => symbols.forEach(element => gsap.set(element, {
      ...homes[element.dataset.symbol], xPercent: -50, yPercent: -50,
      scale: 1, rotation: 0, autoAlpha: 0,
    }));
    const interaction = name => { root.dataset.interaction = name; };
    let cycle = null;
    const pose = name => {
      poses.forEach(element => gsap.set(element, { opacity: element.dataset.pose === name ? 1 : 0 }));
      root.dataset.action = name;
    };
    const stop = () => {
      cycle?.kill(); cycle = null;
      gsap.killTweensOf([root, motion, shadow, leaf, ...poses, ...symbols]);
      gsap.set(root, { autoAlpha: 0 });
      gsap.set(motion, { xPercent: 0, yPercent: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      gsap.set(shadow, { scaleX: 1, opacity: .38 });
      gsap.set(leaf, { x: -100, y: 105, rotation: -25, scale: .85, opacity: 0, svgOrigin: '0 0', smoothOrigin: false });
      pose('wave');
      root.dataset.action = 'idle';
      interaction('idle');
      resetSymbols();
    };
    const start = () => {
      stop();
      pose('wave');
      gsap.to(root, { autoAlpha: 1, duration: reduced ? .1 : .65 });
      if (reduced) {
        // Sem deslocamentos, manter todos os logos legíveis em páginas estáticas.
        cycle = gsap.timeline({ repeat: -1 });
        Object.entries(groups).forEach(([name, names], index) => {
          cycle.set(symbols, { autoAlpha: 0 }, index * 9)
            .set(names.map(key => props[key]), { autoAlpha: 1 }, index * 9)
            .call(() => interaction(name), [], index * 9);
        });
        cycle.to({}, { duration: 9 }, 36);
        return;
      }
      cycle = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      cycle.call(() => pose('wave'), [], 0)
        .set(motion, { xPercent: 0, yPercent: 0, rotation: 0, scaleX: 1, scaleY: 1 }, 0)
        .set(leaf, { x: -100, y: 105, rotation: -25, opacity: 0 }, 0)
        .to(motion, { rotation: 1.3, yPercent: -.5, duration: 1.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, .5)
        .set(leaf, { opacity: 1 }, 3.6)
        .fromTo(leaf, { x: -100, y: 105, rotation: -25 }, { x: 630, y: 75, rotation: 150, duration: 2.3, ease: 'none', immediateRender: false }, 3.6)
        .to(leaf, { opacity: 0, duration: .2 }, 5.7)
        .to(motion, { scaleY: .94, duration: .12, ease: 'power2.in' }, 4.15)
        .call(() => pose('duck'), [], 4.27)
        .to(motion, { scaleY: 1, rotation: -2, duration: .24, ease: 'power2.out' }, 4.27)
        .call(() => pose('balance'), [], 5.35)
        .to(motion, { yPercent: -6, rotation: 4, duration: .22, ease: 'power2.out' }, 5.35)
        .to(shadow, { scaleX: .7, opacity: .22, duration: .22 }, 5.35)
        .to(motion, { yPercent: 0, rotation: -3, duration: .34, ease: 'bounce.out' }, 5.57)
        .to(shadow, { scaleX: 1, opacity: .38, duration: .34 }, 5.57)
        .to(motion, { rotation: 3, duration: .15, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 5.95)
        .call(() => pose('shrug'), [], 6.65)
        .to(motion, { rotation: 0, yPercent: 0, duration: .3 }, 6.65)
        .call(() => pose('grimace'), [], 7.35)
        .fromTo(motion, { rotation: -2 }, { rotation: 2, duration: .07, repeat: 5, yoyo: true, ease: 'sine.inOut', immediateRender: false }, 7.35)
        .call(() => pose('wave'), [], 8.1)
        .to(motion, { rotation: 0, duration: .3 }, 8.1)
        .call(() => pose('shush'), [], 9.15)
        .to(motion, { rotation: 1.7, duration: .3 }, 9.15)
        .call(() => pose('sneeze'), [], 11)
        .to(motion, { yPercent: 1.4, rotation: -3, duration: .12, ease: 'power2.in' }, 11)
        .to(motion, { yPercent: 0, rotation: 0, duration: .35, ease: 'back.out(1.8)' }, 11.12)
        .call(() => pose('shrug'), [], 12.5)
        .call(() => pose('dance'), [], 14.2)
        .fromTo(motion, { rotation: -3, xPercent: -1.5 }, { rotation: 3, xPercent: 1.5, duration: .22, yoyo: true, repeat: 9, ease: 'sine.inOut', immediateRender: false }, 14.2)
        .fromTo(motion, { yPercent: 0 }, { yPercent: -1.8, duration: .22, yoyo: true, repeat: 9, ease: 'sine.inOut', immediateRender: false }, 14.2)
        .call(() => pose('shrug'), [], 16.6)
        .to(motion, { xPercent: 0, yPercent: 0, rotation: 0, duration: .35 }, 16.6)
        .call(() => pose('bow'), [], 18.5)
        .to(motion, { rotation: -2, yPercent: 1, duration: .3 }, 18.5)
        .to(motion, { rotation: 0, yPercent: 0, duration: .4 }, 19.3)
        .call(() => pose('heart'), [], 21)
        .to(motion, { yPercent: -1, duration: .5, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 21)
        .call(() => pose('wave'), [], 24)
        .fromTo(motion, { rotation: -1.6 }, { rotation: 1.6, duration: .4, repeat: 3, yoyo: true, ease: 'sine.inOut', immediateRender: false }, 24.4)
        .to(motion, { rotation: 0, duration: .3 }, 26)
        .to(motion, { yPercent: -.4, duration: 2, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 26.4);

      // Cada objeto tem uma ação com o personagem antes de ocupar seu lugar ao lado.
      // Reiniciar todas as propriedades no primeiro frame também limpa a repetição.
      symbols.forEach(element => cycle.set(element, {
        ...homes[element.dataset.symbol], xPercent: -50, yPercent: -50,
        scale: 1, rotation: 0, autoAlpha: 0,
      }, 0));

      cycle.call(() => interaction('idle'), [], 0)
        .call(() => interaction('treelab'), [], .6)
        .call(() => pose('bow'), [], .6)
        .fromTo(props.treelab, { scale: .035, autoAlpha: 1 }, {
          scale: 1, duration: 2.3, ease: 'power2.out', immediateRender: false,
        }, .8)
        .call(() => pose('wave'), [], 3.1)

        // O R sobe em arco, pousa no cabelo e provoca a careta.
        .call(() => interaction('r-balance'), [], 4.8)
        .set(props.r, { left: '30%', top: '48%', scale: .75, rotation: -18, autoAlpha: 1 }, 4.8)
        .to(props.r, { left: '44%', top: '31%', scale: .55, rotation: 12, duration: .9, ease: 'power2.out' }, 4.8)
        .to(props.r, { left: '50%', top: '29.4%', scale: .48, rotation: -5, duration: .5, ease: 'power2.in' }, 5.7)
        .to(motion, { scaleY: .965, duration: .12, yoyo: true, repeat: 1 }, 6.2)
        .to(props.r, { rotation: 9, duration: .16, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 6.2)
        .call(() => pose('grimace'), [], 6.3)
        .to(props.r, { ...homes.r, rotation: 0, scale: 1, duration: .85, ease: 'power2.inOut' }, 7.55)

        // O espirro afasta a dupla de IA, que se acomoda nas laterais.
        .call(() => interaction('ai-sneeze'), [], 9.15)
        .fromTo(props.chatgpt, { left: '20%', top: '50%', scale: .35, rotation: -25, autoAlpha: 0 }, {
          left: '41%', top: '48%', scale: .72, rotation: 0, autoAlpha: 1,
          duration: .9, ease: 'back.out(1.3)', immediateRender: false,
        }, 9.15)
        .fromTo(props.gemini, { left: '80%', top: '51%', scale: .35, rotation: 25, autoAlpha: 0 }, {
          left: '59%', top: '49%', scale: .85, rotation: 0, autoAlpha: 1,
          duration: .9, ease: 'back.out(1.3)', immediateRender: false,
        }, 9.15)
        .to(props.chatgpt, { ...homes.chatgpt, scale: 1, rotation: -360, duration: 1.3, ease: 'power3.out' }, 11.1)
        .to(props.gemini, { ...homes.gemini, scale: 1, rotation: 360, duration: 1.3, ease: 'power3.out' }, 11.1)

        // QGIS e Excel acompanham as duas mãos durante a dança.
        .call(() => interaction('qgis-excel-dance'), [], 14.2)
        .fromTo(props.excel, { left: '37%', top: '54%', scale: .1, autoAlpha: 0 }, {
          left: '43%', top: '39%', scale: .65, autoAlpha: 1,
          duration: .4, ease: 'back.out(1.7)', immediateRender: false,
        }, 14.2)
        .fromTo(props.qgis, { left: '65%', top: '60%', scale: .1, autoAlpha: 0 }, {
          left: '61%', top: '45%', scale: .75, autoAlpha: 1,
          duration: .4, ease: 'back.out(1.7)', immediateRender: false,
        }, 14.2)
        .to([props.excel, props.qgis], { rotation: 8, yPercent: -58, duration: .22, repeat: 7, yoyo: true, ease: 'sine.inOut' }, 14.6)
        .to(props.excel, { ...homes.excel, scale: 1, rotation: 0, yPercent: -50, duration: .9, ease: 'power2.inOut' }, 16.6)
        .to(props.qgis, { ...homes.qgis, scale: 1, rotation: 0, yPercent: -50, duration: .9, ease: 'power2.inOut' }, 16.6)

        // A reverência apresenta os símbolos do processamento e do projeto EBA.
        .call(() => interaction('fusion-eba'), [], 18.5)
        .fromTo(props.fusion, { left: '115%', top: '79%', rotation: -8, autoAlpha: 0 }, {
          ...homes.fusion, rotation: 0, autoAlpha: 1,
          duration: 1.1, ease: 'power3.out', immediateRender: false,
        }, 18.5)
        .fromTo(props.eba, { left: '94%', top: '65%', scale: .6, autoAlpha: 0 }, {
          left: '63%', top: '51%', scale: 1, autoAlpha: 1,
          duration: .9, ease: 'power2.out', immediateRender: false,
        }, 18.5)
        .to(props.eba, { ...homes.eba, duration: 1.2, ease: 'power2.inOut' }, 20)
        .call(() => interaction('tools'), [], 24)
        .to([props.r, props.qgis], { yPercent: -53, duration: 1.5, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 26.4);

      const clear = at => cycle.to(symbols, { autoAlpha: 0, duration: .35 }, at);
      const arrive = (name, from, at, target = {}, duration = .75) => cycle.fromTo(props[name], {
        ...from, autoAlpha: 0,
      }, {
        ...homes[name], scale: 1, rotation: 0, ...target, autoAlpha: 1,
        duration, ease: 'power2.out', immediateRender: false,
      }, at);
      const park = (name, at, duration = .8) => cycle.to(props[name], {
        ...homes[name], scale: 1, rotation: 0, yPercent: -50,
        duration, ease: 'power2.inOut',
      }, at);
      const chapter = (name, at, nextPose) => {
        clear(at - .55);
        cycle.call(() => interaction(name), [], at)
          .call(() => pose(nextPose), [], at)
          .to(motion, { xPercent: 0, yPercent: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: .2 }, at);
      };

      // Organização e escrita: desviar do Zotero e equilibrar documentos nas mãos.
      chapter('writing-tools', 31.5, 'wave');
      arrive('zotero', { left: '17%', top: '43%', scale: .75, rotation: -12 }, 31.5,
        { left: '43%', top: '31%', scale: .4, rotation: 12 }, .7);
      cycle.call(() => pose('duck'), [], 32.05)
        .to(props.zotero, { left: '57%', top: '33%', rotation: 100, duration: .55, ease: 'none' }, 32.2);
      park('zotero', 32.75);
      cycle.call(() => pose('balance'), [], 33.55);
      arrive('drive', { left: '18%', top: '65%', scale: .3 }, 33.55,
        { left: '39%', top: '48%', scale: .62 });
      arrive('docs', { left: '81%', top: '67%', scale: .3 }, 33.55,
        { left: '61%', top: '48%', scale: .6 });
      arrive('notion', { left: '99%', top: '60%', scale: .55, rotation: 25 }, 34.55);
      arrive('miro', { left: '12%', top: '81%', scale: .65 }, 35.25);
      cycle.call(() => pose('dance'), [], 35)
        .fromTo(motion, { rotation: -3 }, { rotation: 3, duration: .25, repeat: 7, yoyo: true, ease: 'sine.inOut', immediateRender: false }, 35)
        .to([props.drive, props.docs], { yPercent: -60, rotation: 7, duration: .25, repeat: 7, yoyo: true, ease: 'sine.inOut' }, 35);
      park('drive', 37.1); park('docs', 37.1);
      cycle.call(() => pose('shrug'), [], 37.1)
        .to(motion, { rotation: 0, duration: .3 }, 37.1);

      // Leitura: apresentar os periódicos e se abaixar para a passagem do pássaro.
      chapter('reading-tools', 40, 'shush');
      arrive('cafe', { left: '19%', top: '55%', scale: .45, rotation: -12 }, 40,
        { left: '37%', top: '47%', scale: .75 });
      arrive('periodicos', { left: '105%', top: '54%', scale: .8 }, 40.4,
        { left: '66%', top: '53%' });
      cycle.call(() => pose('bow'), [], 41.05);
      park('cafe', 41.6); park('periodicos', 42);
      cycle.call(() => pose('duck'), [], 42.9);
      arrive('scihub', { left: '13%', top: '40%', scale: .48, rotation: -10 }, 42.7,
        { left: '39%', top: '34%', scale: .48, rotation: 8 }, .55);
      cycle.to(props.scihub, { left: '63%', top: '34%', rotation: -8, duration: .75, ease: 'none' }, 43.25);
      park('scihub', 44);
      cycle.call(() => pose('wave'), [], 44.85);

      // Pacotes espaciais do R acompanham os gestos e entram um a um.
      chapter('r-packages', 48.5, 'dance');
      arrive('lidr', { left: '16%', top: '48%', scale: .3, rotation: -15 }, 48.5,
        { left: '42%', top: '39%', scale: .57 });
      arrive('terra', { left: '85%', top: '54%', scale: .3, rotation: 15 }, 48.5,
        { left: '62%', top: '46%', scale: .57 });
      cycle.fromTo(motion, { rotation: -3 }, { rotation: 3, duration: .28, repeat: 7, yoyo: true, ease: 'sine.inOut', immediateRender: false }, 49.2)
        .to([props.lidr, props.terra], { rotation: 8, yPercent: -58, duration: .28, repeat: 7, yoyo: true, ease: 'sine.inOut' }, 49.2);
      arrive('sf', { left: '15%', top: '85%', scale: .3, rotation: -20 }, 50.7);
      arrive('tidyverse', { left: '88%', top: '86%', scale: .3, rotation: 20 }, 51.2);
      park('lidr', 51.6); park('terra', 51.6);
      cycle.call(() => pose('shrug'), [], 51.6)
        .to(motion, { rotation: 0, duration: .3 }, 51.6)
        .call(() => pose('heart'), [], 54);

      // Uma reverência e um coração acompanham os símbolos institucionais.
      chapter('research-community', 57, 'bow');
      arrive('capes', { left: '9%', top: '57%', scale: .3 }, 57);
      arrive('fapemig', { left: '100%', top: '45%', scale: .3 }, 57.35);
      arrive('ufvjm', { left: '89%', top: '83%', scale: .3 }, 57.7);
      cycle.call(() => pose('heart'), [], 59.2)
        .to(motion, { yPercent: -1, duration: .6, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 59.2)
        .call(() => pose('wave'), [], 62.5);

      // Encerrar com o laboratório, R e as instituições, sem juntar os 23 logos.
      cycle.call(() => interaction('farewell-tools'), [], 65.5)
        .to(props.capes, { left: '12%', top: '36%', scale: .8, duration: .8, ease: 'power2.inOut' }, 65.5);
      arrive('treelab', { ...homes.treelab, scale: .04 }, 65.5, {}, 1.8);
      arrive('r', { ...homes.r, scale: .2, rotation: -15 }, 66.2);
      cycle.call(() => pose('heart'), [], 66.5)
        .call(() => pose('wave'), [], 68.2)
        .to(motion, { rotation: 1.4, duration: .5, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 68.2)
        .to(motion, { rotation: 0, duration: .3 }, 70.2)
        .to({}, { duration: 3 }, 70.5);
    };
    stop();
    return { start, stop };
  };
})();
