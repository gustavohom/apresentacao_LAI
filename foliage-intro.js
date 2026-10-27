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
    enter('#foliageImportanceSlide .foliageReasons', 18.6, { y: 0, x: 28 }, .6);
    tl.to('#foliageImportanceSlide', { autoAlpha: 0, duration: .65 }, 26);

    // A geometria compartilhada é calculada pelo tempo atual, sem estados herdados de seeks.
    const continuity = document.createElement('div');
    continuity.id = 'foliageContinuity'; continuity.setAttribute('aria-hidden', 'true');
    const backdrop = document.createElement('div'); backdrop.className = 'foliageContinuityBackdrop';
    continuity.appendChild(backdrop);
    const svg = make('svg', { viewBox: '0 0 1920 1080' }, continuity);
    const artwork = make('g', { id: 'continuityArtwork' }, svg);
    document.querySelector('#stage').appendChild(continuity);
    const left = tree(artwork, 470, 785, .72, samples.map(s => s.top), 'top');
    const right = tree(artwork, 1310, 785, .72, samples.map(s => s.top), 'distributed');
    const third = tree(artwork, 1310, 785, .72, samples.map(s => s.distributed), 'additional');
    const sizeTrees = [left, right, third];
    // Estes grupos têm um único renderizador. A timeline não altera sua visibilidade.
    sizeTrees.forEach(item => [item.position, item.root, item.wood, ...item.leaves].forEach(el => {
      el.removeAttribute('style'); el.removeAttribute('transform'); el.removeAttribute('data-svg-origin');
    }));
    const alpha = (el, value) => {
      el.setAttribute('opacity', value.toFixed(4));
      el.setAttribute('visibility', value > .0001 ? 'visible' : 'hidden');
    };
    const progress = (time, start, duration) => {
      const p = Math.max(0, Math.min(1, (time - start) / (reduced ? .1 : duration)));
      return p * p * (3 - 2 * p);
    };
    const mix = (a, b, p) => a + (b - a) * p;
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
    });
    enter('#foliageArrangementSlide', 26, { y: 0 });
    enter('#foliageArrangementSlide .foliageHeader', 26.2);
    enter('.arrangementLeft', 27.5);
    enter('.arrangementRight', 31.3);
    tl.to('#foliageArrangementSlide', { autoAlpha: 0, duration: .7 }, 34.2);

    const sizePositions = (center, height) => samples.map(sample => ({
      x: sample.top.x, y: center + (sample.top.y + 505) / 112 * height,
    }));
    const mediumPositions = sizePositions(-420, 160);
    const sizeConfigurations = [
      { name: 'short', x: 260, positions: sizePositions(-340, 88), woodY: .72 },
      { name: 'medium', x: 890, positions: mediumPositions, woodY: 1 },
      { name: 'tall', x: 1520, positions: sizePositions(-515, 225), woodY: 1.25 },
    ];
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
    const sizeProfiles = sizeConfigurations.map((config, index) => {
      sizeTrees[index].root.dataset.heightRole = config.name;
      const x = config.x + 225, y = 810 - sizeProfileTop * .7;
      const step = sizeProfileThickness * .7;
      const group = make('g', { class: 'sizeLadProfile', 'data-profile': config.name }, artwork);
      const label = make('text', { x: x + 52, y: y - 30, 'text-anchor': 'middle', class: 'introProfileTitle' }, group);
      label.textContent = 'LAD';
      make('line', { x1: x, x2: x, y1: y, y2: y + sizeProfileBins * step, class: 'introProfileAxis' }, group);
      const bars = initialSizeWeights.map((value, bin) => make('rect', {
        x, y: y + (bin + .5) * step - 12, width: value / sizeProfileMax * 104,
        height: 24, rx: 4, class: 'introProfileBar', 'data-stratum': bin + 1,
      }, group));
      return { group, bars };
    });
    enter('#foliageSizeSlide', 34.2, { y: 0 });
    enter('#foliageSizeSlide .foliageHeader', 34.4);
    enter('.sizeLabel', 39.5, { y: 12 }, .6, .08);
    tl.to('#foliageSizeSlide', { autoAlpha: 0, duration: .7 }, 42.2);
    const forestAt = 46 + 183.6;
    const forestSeeds = [...document.querySelectorAll('#isoTrees > [data-forest-seed]')]
      .sort((a, b) => Number(a.dataset.forestSeed) - Number(b.dataset.forestSeed));
    let lastTime = -1;
    const render = time => {
      if (time === lastTime) return;
      lastTime = time;
      const phase = time >= 26 && time < 34.2 ? 'comparison' : time >= 34.2 && time < 42.2 ? 'heights'
        : time >= forestAt && time < forestAt + 2.8 ? 'forest' : 'off';
      continuity.dataset.phase = phase;
      continuity.style.opacity = phase === 'off' ? '0' : '1';
      continuity.style.visibility = phase === 'off' ? 'hidden' : 'visible';
      if (phase === 'off') return;
      const isComparison = phase === 'comparison', isForest = phase === 'forest';
      const layout = progress(time, 34.2, 1.35);
      const redistribution = progress(time, 29.35, 1.8);
      const heightChange = progress(time, 37.1, 2.1);
      const travel = progress(time, forestAt, 2.05);
      backdrop.style.opacity = isForest ? String(1 - progress(time, forestAt, 1.7)) : '0';
      sizeTrees.forEach((item, index) => {
        const config = sizeConfigurations[index];
        let x = index === 0 ? 470 : 1310, y = 785, scale = .72;
        let opacity = index === 2 ? 0 : progress(time, 26.7 + index * .12, .9);
        let woodX = 1, woodY = 1, woodOpacity = 1, groundOpacity = 1;
        if (phase === 'heights') {
          const p = progress(time, 34.2 + (index === 2 ? .15 : 0), 1.35);
          x = mix(x, config.x, p); y = mix(y, 810, p); scale = mix(.72, .7, p);
          opacity = index === 2 ? p : 1;
          woodX = mix(1, .95, layout); woodY = mix(1, config.woodY, heightChange);
        } else if (isForest) {
          const seed = forestSeeds[index];
          x = mix(config.x, Number(seed.dataset.anchorX), travel);
          y = mix(810, Number(seed.dataset.anchorY), travel);
          scale = mix(.7, Number(seed.dataset.crownRadius) / 255, travel);
          opacity = 1 - progress(time, forestAt + 1.65, .6);
          woodX = .95; woodY = mix(config.woodY, .12, progress(time, forestAt + .5, 1.1));
          woodOpacity = 1 - progress(time, forestAt + .5, 1.1);
          groundOpacity = 1 - progress(time, forestAt, .45);
        }
        item.position.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
        alpha(item.position, opacity); alpha(item.root, 1);
        item.wood.setAttribute('transform', `scale(${woodX} ${woodY})`);
        alpha(item.wood, woodOpacity); alpha(item.ground, groundOpacity);
        if (opacity < .0001) return;
        item.leaves.forEach((el, i) => {
          const sample = samples[i];
          let lx = sample.top.x, ly = sample.top.y;
          if (isComparison && index === 1) {
            const p = progress(time, 29.35 + (reduced ? 0 : i % 7 * .025), 1.8);
            lx = mix(lx, sample.distributed.x, p); ly = mix(ly, sample.distributed.y, p);
          } else if (phase === 'heights') {
            const from = index === 0 ? sample.top : sample.distributed;
            const p0 = progress(time, 34.2 + (reduced ? 0 : i % 7 * .02), 1.35);
            const p1 = progress(time, 37.1 + (reduced ? 0 : i % 7 * .025), 2.1);
            lx = mix(from.x, mediumPositions[i].x, p0);
            ly = mix(from.y, mediumPositions[i].y, p0) + (config.positions[i].y - mediumPositions[i].y) * p1;
          } else if (isForest) {
            const p = progress(time, forestAt, 1.9);
            lx = config.positions[i].x;
            ly = mix(config.positions[i].y, -140 + (sample.top.y + 505) / 112 * 220, p);
          }
          el.setAttribute('transform', `translate(${lx} ${ly}) rotate(${sample.rotation}) scale(${sample.size})`);
        });
      });
      profiles.forEach((item, index) => {
        alpha(item.group, isComparison ? progress(time, 27.5, .65) : phase === 'heights' ? 1 - progress(time, 34.2, .45) : 0);
        item.bars.forEach((bar, bin) => bar.setAttribute('width',
          mix(topWeights[bin], index ? distributedWeights[bin] : topWeights[bin], redistribution) / maxWeight * 118));
      });
      sizeProfiles.forEach((item, index) => {
        alpha(item.group, isComparison ? 0 : isForest ? 1 - progress(time, forestAt, .45) : progress(time, 35.4 + index * .1, .6));
        item.bars.forEach((bar, bin) => bar.setAttribute('width',
          mix(initialSizeWeights[bin], finalSizeWeights[index][bin], heightChange) / sizeProfileMax * 104));
      });
    };
    return {
      sync(time) {
        document.querySelector('#foliageArrangementSlide').dataset.arrangement = time < 29.35 ? 'equal' : time < 31.4 ? 'redistributing' : 'distributed';
        document.querySelector('#foliageSizeSlide').dataset.sizePhase = time < 37.1 ? 'equal' : time < 39.4 ? 'reshaping' : 'different';
        render(time);
      },
    };
  };
})();
