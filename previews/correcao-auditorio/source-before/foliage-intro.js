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
      const position = make('g', {}, parent);
      gsap.set(position, { x, y, scale, svgOrigin: '0 0', smoothOrigin: false });
      const root = make('g', { 'data-tree': name }, position);
      const ground = cleanClone(document.querySelector('#shadowLine'));
      ground.setAttribute('class', 'introTreeGround');
      ground.setAttribute('ry', '28'); root.appendChild(ground);
      const wood = cleanClone(document.querySelector('#wood'));
      wood.setAttribute('class', 'introTreeWood');
      root.appendChild(wood);
      const crown = make('g', { class: 'introTreeCrown' }, root);
      const leaves = samples.map((sample, i) => leaf(crown, sample, positions[i]));
      return { position, root, ground, wood, crown, leaves };
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

    // Uma única camada conserva as duas árvores e acrescenta a terceira.
    const continuity = document.createElement('div');
    continuity.id = 'foliageContinuity'; continuity.setAttribute('aria-hidden', 'true');
    const backdrop = document.createElement('div'); backdrop.className = 'foliageContinuityBackdrop';
    continuity.appendChild(backdrop);
    const svg = make('svg', { viewBox: '0 0 1920 1080' }, continuity);
    const artwork = make('g', { id: 'continuityArtwork' }, svg);
    document.querySelector('#stage').appendChild(continuity);
    const left = tree(artwork, 470, 785, .72, samples.map(s => s.top), 'top');
    const right = tree(artwork, 1310, 785, .72, samples.map(s => s.top), 'distributed');
    const profiles = [];
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
      if (treeIndex) bars.forEach((bar, i) => tl.to(bar, {
        attr: { width: distributedWeights[i] / maxWeight * 118 },
        duration: reduced ? .1 : 1.8, ease: 'power2.inOut',
      }, 29.35));
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
    tl.to('#foliageArrangementSlide', { autoAlpha: 0, duration: .7 }, 34.2);

    // Mesma largura, mesma área de solo e mesmas 320 folhas nas três árvores.
    const sizePositions = (center, height) => samples.map(sample => ({
      x: sample.top.x, y: center + (sample.top.y + 505) / 112 * height,
    }));
    const mediumPositions = sizePositions(-420, 160);
    const third = tree(artwork, 1310, 785, .72, samples.map(s => s.distributed), 'additional');
    gsap.set(third.position, { autoAlpha: 0 });
    tl.set(third.position, { autoAlpha: 0 }, 26);
    const sizeTrees = [left, right, third];
    const sizeConfigurations = [
      { name: 'short', x: 260, positions: sizePositions(-340, 88), woodY: .72 },
      { name: 'medium', x: 890, positions: mediumPositions, woodY: 1 },
      { name: 'tall', x: 1520, positions: sizePositions(-515, 225), woodY: 1.25 },
    ];
    const transitionDuration = reduced ? .1 : 1.35;
    sizeTrees.forEach((item, index) => {
      item.root.dataset.heightRole = sizeConfigurations[index].name;
      tl.fromTo(item.position,
        { x: index === 0 ? 470 : 1310, y: 785, scale: .72, autoAlpha: index === 2 ? 0 : 1 },
        { x: sizeConfigurations[index].x, y: 810, scale: .7, autoAlpha: 1,
          duration: transitionDuration, ease: 'power2.inOut', immediateRender: false }, 34.2 + (index === 2 ? .15 : 0));
      tl.to(item.wood, { scaleX: .95, scaleY: 1, svgOrigin: '0 0', smoothOrigin: false,
        duration: transitionDuration, ease: 'power2.inOut' }, 34.2);
      item.leaves.forEach((el, i) => {
        const from = index === 0 ? samples[i].top : samples[i].distributed;
        tl.fromTo(el, { x: from.x, y: from.y }, {
          x: mediumPositions[i].x, y: mediumPositions[i].y,
          duration: transitionDuration, ease: 'power2.inOut', immediateRender: false,
        }, 34.2 + (reduced ? 0 : i % 7 * .02));
      });
    });
    tl.to(profiles.map(item => item.group), { autoAlpha: 0, duration: reduced ? .1 : .45 }, 34.2);

    // Os perfis usam estratos de espessura igual e uma escala comum de LAD.
    const sizeProfileBins = 8, sizeProfileTop = 760, sizeProfileThickness = 70;
    const sizeProfileWeights = positions => {
      const values = Array(sizeProfileBins).fill(0);
      positions.forEach((position, i) => {
        const bin = Math.min(sizeProfileBins - 1, Math.max(0, Math.floor((sizeProfileTop + position.y) / sizeProfileThickness)));
        values[bin] += samples[i].size ** 2;
      });
      return values;
    };
    const initialSizeWeights = sizeProfileWeights(mediumPositions);
    const finalSizeWeights = sizeConfigurations.map(config => sizeProfileWeights(config.positions));
    const sizeProfileMax = Math.max(...initialSizeWeights, ...finalSizeWeights.flat());
    const sizeProfileGroups = [];
    sizeConfigurations.forEach((config, index) => {
      const x = config.x + 225, y = 810 - sizeProfileTop * .7;
      const step = sizeProfileThickness * .7;
      const profile = make('g', { class: 'sizeLadProfile', 'data-profile': config.name }, artwork);
      const label = make('text', { x: x + 52, y: y - 30, 'text-anchor': 'middle', class: 'introProfileTitle' }, profile);
      label.textContent = 'LAD';
      make('line', { x1: x, x2: x, y1: y, y2: y + sizeProfileBins * step, class: 'introProfileAxis' }, profile);
      initialSizeWeights.forEach((value, bin) => {
        const bar = make('rect', {
          x, y: y + (bin + .5) * step - 12, width: value / sizeProfileMax * 104,
          height: 24, rx: 4, class: 'introProfileBar', 'data-stratum': bin + 1,
        }, profile);
        if (config.name !== 'medium') tl.to(bar, {
          attr: { width: finalSizeWeights[index][bin] / sizeProfileMax * 104 },
          duration: reduced ? .1 : 2.1, ease: 'power2.inOut',
        }, 37.1);
      });
      sizeProfileGroups.push(profile);
      const item = sizeTrees[index];
      if (config.name !== 'medium') {
        item.leaves.forEach((el, i) => tl.fromTo(el, { y: mediumPositions[i].y }, {
          y: config.positions[i].y, duration: reduced ? .1 : 2.1,
          ease: 'power2.inOut', immediateRender: false,
        }, 37.1 + (reduced ? 0 : i % 7 * .025)));
        tl.fromTo(item.wood, { scaleY: 1 }, { scaleY: config.woodY,
          duration: reduced ? .1 : 2.1, ease: 'power2.inOut', immediateRender: false }, 37.1);
      }
    });
    enter('#foliageSizeSlide', 34.2, { y: 0 });
    enter('#foliageSizeSlide .foliageHeader', 34.4);
    enter(sizeProfileGroups, 35.4, { y: 0 }, .6, .1);
    enter('.sizeLabel', 39.5, { y: 12 }, .6, .08);
    tl.to('#foliageSizeSlide', { autoAlpha: 0, duration: .7 }, 42.2);

    // As três árvores se tornam três copas reais da laje do transecto.
    const forestAt = 46 + 183.6;
    const forestSeeds = [...document.querySelectorAll('#isoTrees > [data-forest-seed]')]
      .sort((a, b) => Number(a.dataset.forestSeed) - Number(b.dataset.forestSeed));
    tl.fromTo(backdrop, { opacity: 1 }, { opacity: 0, duration: reduced ? .1 : 1.7,
      ease: 'sine.inOut', immediateRender: false }, forestAt);
    tl.to([...sizeProfileGroups, ...sizeTrees.map(item => item.ground)], {
      autoAlpha: 0, duration: reduced ? .1 : .45,
    }, forestAt);
    sizeTrees.forEach((item, index) => {
      const seed = forestSeeds[index];
      const radius = Number(seed.dataset.crownRadius);
      tl.fromTo(item.position, { x: sizeConfigurations[index].x, y: 810, scale: .7, autoAlpha: 1 }, {
        x: Number(seed.dataset.anchorX), y: Number(seed.dataset.anchorY), scale: radius / 255,
        duration: reduced ? .1 : 2.05, ease: 'power2.inOut', immediateRender: false,
      }, forestAt);
      tl.fromTo(item.wood, { scaleY: sizeConfigurations[index].woodY, opacity: 1 }, {
        scaleY: .12, opacity: 0, duration: reduced ? .1 : 1.1, ease: 'sine.inOut', immediateRender: false,
      }, forestAt + .5);
      item.leaves.forEach((el, i) => tl.fromTo(el, {
        x: sizeConfigurations[index].positions[i].x, y: sizeConfigurations[index].positions[i].y,
      }, {
        x: samples[i].top.x, y: -140 + (samples[i].top.y + 505) / 112 * 220,
        duration: reduced ? .1 : 1.9, ease: 'power2.inOut', immediateRender: false,
      }, forestAt));
      tl.fromTo(item.root, { autoAlpha: 1 }, { autoAlpha: 0, duration: reduced ? .1 : .6,
        ease: 'sine.inOut', immediateRender: false }, forestAt + 1.65);
    });
    let currentPhase = '';
    return {
      sync(time) {
        const topic = Math.max(0, reasonTimes.filter(at => time >= at).length - 1);
        document.querySelector('#foliageImportanceSlide').dataset.topic = topic;
        document.querySelector('#foliageArrangementSlide').dataset.arrangement = time < 29.35 ? 'equal' : time < 31.4 ? 'redistributing' : 'distributed';
        document.querySelector('#foliageSizeSlide').dataset.sizePhase = time < 37.1 ? 'equal' : time < 39.4 ? 'reshaping' : 'different';
        const phase = time >= 26 && time < 34.2 ? 'comparison' : time >= 34.2 && time < 42.2 ? 'heights' : time >= forestAt && time < forestAt + 2.8 ? 'forest' : 'off';
        if (phase !== currentPhase) {
          continuity.dataset.phase = phase;
          continuity.style.opacity = phase === 'off' ? '0' : '1';
          continuity.style.visibility = phase === 'off' ? 'hidden' : 'visible';
          if (phase !== 'forest') backdrop.style.opacity = '0';
          currentPhase = phase;
        }
      },
    };
  };
})();
