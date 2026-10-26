/* Diagramas de introdução. Reutiliza a arte vetorial da árvore existente. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    parent.appendChild(el);
    return el;
  };
  const cleanClone = source => {
    const clone = source.cloneNode(true);
    [clone, ...clone.querySelectorAll('*')].forEach(el => {
      el.removeAttribute('id'); el.removeAttribute('style');
      el.removeAttribute('transform'); el.removeAttribute('data-svg-origin');
      el.removeAttribute('data-light-palette');
    });
    return clone;
  };
  const noise = n => { const v = Math.sin(n * 127.1 + 39.4) * 43758.5453; return v - Math.floor(v); };

  window.addFoliageIntro = tl => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sources = [...document.querySelectorAll('#leavesBack > g, #leaves > g')];
    const count = 320;
    const samples = Array.from({ length: count }, (_, i) => {
      const source = sources[i % sources.length];
      const size = source._d.s;
      const angle = noise(i + 1) * Math.PI * 2;
      const radius = Math.sqrt(noise(i + 1000));
      const top = { x: Math.cos(angle) * radius * 255, y: -505 + Math.sin(angle) * radius * 112 };
      const layer = i % 5;
      const distributed = {
        x: (noise(i + 2000) * 2 - 1) * (layer === 0 || layer === 4 ? 200 : 255),
        y: -605 + layer * 77 + noise(i + 3000) * 66,
      };
      return { source, size, rotation: source._d.rot, top, distributed };
    });
    const leaf = (parent, sample, position) => {
      const el = cleanClone(sample.source);
      el.setAttribute('class', 'introDiagramLeaf');
      el.dataset.areaWeight = (sample.size ** 2).toFixed(8);
      parent.appendChild(el);
      gsap.set(el, { x: position.x, y: position.y, rotation: sample.rotation, scale: sample.size, svgOrigin: '0 0', smoothOrigin: false });
      return el;
    };
    const tree = (parent, x, y, scale, positions, name) => {
      const position = make('g', { transform: `translate(${x} ${y}) scale(${scale})` }, parent);
      const root = make('g', { 'data-tree': name }, position);
      const ground = cleanClone(document.querySelector('#shadowLine'));
      ground.setAttribute('class', 'introTreeGround');
      ground.setAttribute('ry', '28'); root.appendChild(ground);
      const wood = cleanClone(document.querySelector('#wood'));
      wood.setAttribute('class', 'introTreeWood');
      root.appendChild(wood);
      const crown = make('g', { class: 'introTreeCrown' }, root);
      const leaves = samples.map((sample, i) => leaf(crown, sample, positions[i]));
      return { root, ground, wood, crown, leaves };
    };
    const enter = (target, at, from = {}, duration = .65, stagger = 0) => {
      tl.fromTo(target, { autoAlpha: 0, y: 16, ...from }, {
        autoAlpha: 1, y: 0, x: 0, duration: reduced ? .1 : duration,
        stagger: reduced ? 0 : stagger, ease: 'power3.out',
      }, at);
    };

    const importance = tree(document.querySelector('#importanceTreeArtwork'), 440, 826, .84,
      samples.map(sample => ({ x: sample.source._d.x, y: sample.source._d.y })), 'importance');
    enter('#foliageImportanceSlide', 17.2, { y: 0 });
    enter('#foliageImportanceSlide .foliageHeader', 17.4);
    tl.fromTo(importance.wood, { scaleY: .2, transformOrigin: '50% 100%', opacity: 0 },
      { scaleY: 1, opacity: 1, duration: reduced ? .1 : .85, ease: 'power3.out' }, 17.65);
    tl.fromTo(importance.leaves, { opacity: 0 }, { opacity: 1, duration: reduced ? .1 : .55, stagger: reduced ? 0 : .002 }, 17.9);
    const reasonTimes = [18.6, 20.3, 21.6, 22.9, 24.2];
    reasonTimes.forEach((at, i) => enter(`.foliageReason[data-reason="${i}"]`, at, { y: 0, x: 28 }, .6));
    tl.to('#foliageImportanceSlide', { autoAlpha: 0, duration: .65 }, 26);

    const artwork = document.querySelector('#arrangementArtwork');
    const left = tree(artwork, 470, 785, .72, samples.map(s => s.top), 'top');
    const right = tree(artwork, 1310, 785, .72, samples.map(s => s.top), 'distributed');
    const profiles = [];
    // Perfis esquemáticos: barras calculadas a partir da área de folhas em cinco estratos.
    const weights = key => {
      const result = Array(5).fill(0);
      samples.forEach(sample => {
        const i = Math.min(4, Math.max(0, Math.floor((sample[key].y + 620) / 82)));
        result[i] += sample.size ** 2;
      });
      return result;
    };
    const topWeights = weights('top'), distributedWeights = weights('distributed');
    const maxWeight = Math.max(...topWeights, ...distributedWeights);
    [left, right].forEach((item, treeIndex) => {
      const x = treeIndex ? 1590 : 750;
      const group = make('g', { class: 'introLadProfile' }, artwork);
      const label = make('text', { x: x + 58, y: 310, 'text-anchor': 'middle', class: 'introProfileTitle' }, group);
      label.textContent = 'LAD';
      make('line', { x1: x, x2: x, y1: 335, y2: 645, class: 'introProfileAxis' }, group);
      const bars = topWeights.map((value, i) => make('rect', {
        x, y: 345 + i * 59, width: value / maxWeight * 118, height: 25, rx: 4,
        class: 'introProfileBar', 'data-stratum': i + 1,
      }, group));
      profiles.push({ group, bars });
      if (treeIndex) bars.forEach((bar, i) => tl.to(bar, { attr: { width: distributedWeights[i] / maxWeight * 118 }, duration: reduced ? .1 : 1.8, ease: 'power2.inOut' }, 29.35));
    });
    enter('#foliageArrangementSlide', 26, { y: 0 });
    enter('#foliageArrangementSlide .foliageHeader', 26.2);
    enter([left.root, right.root], 26.7, { y: 22 }, .9, .12);
    enter('.introLadProfile', 27.5);
    enter('.arrangementLeft', 27.5);
    right.leaves.forEach((el, i) => {
      tl.to(el, { x: samples[i].distributed.x, y: samples[i].distributed.y,
        duration: reduced ? .1 : 1.8, ease: 'power2.inOut',
      }, 29.35 + (reduced ? 0 : i % 7 * .025));
    });
    enter('.arrangementRight', 31.3);
    enter('.arrangementTakeaway', 31.9);
    tl.to('#foliageArrangementSlide', { autoAlpha: 0, duration: .7 }, 34.2);

    // A largura da copa, o tamanho das folhas e a referência de solo são fixos.
    // A animação altera somente as posições verticais das folhas e a altura da madeira.
    const sizePositions = (center, height) => samples.map(sample => ({
      x: sample.top.x,
      y: center + (sample.top.y + 505) / 112 * height,
    }));
    const mediumPositions = sizePositions(-420, 160);
    const sizeConfigurations = [
      { name: 'short', x: 330, positions: sizePositions(-340, 88), woodY: .72 },
      { name: 'medium', x: 960, positions: mediumPositions, woodY: 1 },
      { name: 'tall', x: 1590, positions: sizePositions(-515, 225), woodY: 1.25 },
    ];
    const sizeTrees = sizeConfigurations.map(config => {
      const item = tree(document.querySelector('#sizeArtwork'), config.x, 810, .7, mediumPositions, config.name);
      gsap.set(item.wood, { scaleX: .95, scaleY: 1, svgOrigin: '0 0', smoothOrigin: false });
      if (config.name !== 'medium') {
        item.leaves.forEach((el, i) => tl.to(el, {
          y: config.positions[i].y,
          duration: reduced ? .1 : 2.1, ease: 'power2.inOut',
        }, 37.1 + (reduced ? 0 : i % 7 * .025)));
        tl.to(item.wood, { scaleY: config.woodY,
          duration: reduced ? .1 : 2.1, ease: 'power2.inOut',
        }, 37.1);
      }
      return item;
    });
    enter('#foliageSizeSlide', 34.2, { y: 0 });
    enter('#foliageSizeSlide .foliageHeader', 34.4);
    enter(sizeTrees.map(item => item.root), 34.85, { y: 20 }, .85, .13);
    enter('.sizeLabel', 39.5, { y: 12 }, .6, .08);
    enter('.sizeTakeaway', 40.0);
    tl.to('#foliageSizeSlide', { autoAlpha: 0, duration: .7 }, 42.2);

    return {
      sync(time) {
        const topic = Math.max(0, reasonTimes.filter(at => time >= at).length - 1);
        document.querySelector('#foliageImportanceSlide').dataset.topic = topic;
        document.querySelector('#foliageArrangementSlide').dataset.arrangement = time < 29.35 ? 'equal' : time < 31.4 ? 'redistributing' : 'distributed';
        document.querySelector('#foliageSizeSlide').dataset.sizePhase = time < 37.1 ? 'equal' : time < 39.4 ? 'reshaping' : 'different';
      },
    };
  };
})();
