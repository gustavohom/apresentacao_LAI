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

  window.addFoliageIntro = (tl, introDuration) => {
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

    const continuity = document.createElement('div');
    continuity.id = 'foliageContinuity';
    continuity.setAttribute('aria-hidden', 'true');
    const backdrop = document.createElement('div');
    backdrop.className = 'foliageContinuityBackdrop';
    continuity.appendChild(backdrop);
    const svg = make('svg', { viewBox: '0 0 1920 1080' }, continuity);
    const artwork = make('g', {}, svg);
    document.querySelector('#stage').appendChild(continuity);

    const groundY = 805, scale = .7;
    const normalPositions = samples.map(sample => sample.top);
    const distributedPositions = samples.map(sample => sample.distributed);
    const configurations = [
      { name: 'reference', x: 260, target: normalPositions, trunkHeight: 1 },
      { name: 'redistributed', x: 890, target: distributedPositions, trunkHeight: 1 },
      { name: 'taller', x: 1520, target: distributedPositions.map(({ x, y }) => ({ x, y: y - 122 })), trunkHeight: 1.24 },
    ];

    const bins = 9, profileTop = 790, layerDepth = 72;
    const weights = positions => {
      const values = Array(bins).fill(0);
      positions.forEach(({ y }, index) => {
        const bin = Math.min(bins - 1, Math.max(0, Math.floor((profileTop + y) / layerDepth)));
        values[bin] += samples[index].size ** 2;
      });
      return values;
    };
    const normalWeights = weights(normalPositions);
    const finalWeights = configurations.map(config => weights(config.target));
    const maxWeight = Math.max(...normalWeights, ...finalWeights.flat());

    const comparisons = configurations.map((config, index) => {
      const item = tree(artwork, config.x, groundY, scale, normalPositions, config.name);
      // A comparação é renderizada pelo tempo atual, inclusive nos saltos e voltas.
      [item.position, item.wood, ...item.leaves].forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('transform');
        el.removeAttribute('data-svg-origin');
      });
      const x = config.x + 214, y = groundY - profileTop * scale;
      const step = layerDepth * scale;
      const profile = make('g', { class: 'introLadProfile', 'data-profile': config.name }, artwork);
      const label = make('text', { x: x + 52, y: y + bins * step + 52, 'text-anchor': 'middle', class: 'introProfileTitle' }, profile);
      label.textContent = 'LAD';
      make('line', { x1: x, x2: x, y1: y, y2: y + bins * step, class: 'introProfileAxis' }, profile);
      const bars = normalWeights.map((value, bin) => make('rect', {
        x, y: y + (bin + .5) * step - 12, width: value / maxWeight * 104,
        height: 24, rx: 4, class: 'introProfileBar', 'data-stratum': bin + 1,
      }, profile));
      return { ...config, ...item, profile, bars, finalWeights: finalWeights[index] };
    });

    const forestAt = introDuration + 183.6;
    const forestSeeds = [...document.querySelectorAll('#isoTrees > [data-forest-seed]')]
      .sort((a, b) => Number(a.dataset.forestSeed) - Number(b.dataset.forestSeed));
    const alpha = (el, value) => {
      el.setAttribute('opacity', value.toFixed(4));
      el.setAttribute('visibility', value > .0001 ? 'visible' : 'hidden');
    };
    const revealAt = 26.35, revealStagger = .12, revealDuration = .85;
    const changeAt = 29.35, changeDuration = 2.15;
    const motionDuration = duration => reduced ? .1 : duration;
    const progress = (time, start, duration) => {
      const p = Math.max(0, Math.min(1, (time - start) / motionDuration(duration)));
      return p * p * (3 - 2 * p);
    };
    const mix = (a, b, p) => a + (b - a) * p;
    let lastTime = -1;
    const render = time => {
      if (time === lastTime) return;
      lastTime = time;
      const isComparison = time >= 26 && time < 42.2;
      const isForest = time >= forestAt && time < forestAt + 2.8;
      continuity.style.visibility = isComparison || isForest ? 'visible' : 'hidden';
      continuity.style.opacity = isComparison || isForest ? '1' : '0';
      if (!isComparison && !isForest) return;

      const travel = progress(time, forestAt, 2.05);
      const change = progress(time, changeAt, changeDuration);
      backdrop.style.opacity = isForest ? String(1 - progress(time, forestAt, 1.7)) : '0';
      comparisons.forEach((item, index) => {
        const reveal = isForest ? 1 - progress(time, forestAt + 1.65, .6) : progress(time, revealAt + index * revealStagger, revealDuration);
        alpha(item.position, reveal);
        alpha(item.profile, isForest ? 1 - progress(time, forestAt, .4) : reveal);
        if (reveal < .0001) return;

        const seed = forestSeeds[index];
        const x = isForest ? mix(item.x, Number(seed.dataset.anchorX), travel) : item.x;
        const y = isForest ? mix(groundY, Number(seed.dataset.anchorY), travel) : groundY;
        const currentScale = isForest ? mix(scale, Number(seed.dataset.crownRadius) / 255, travel) : scale;
        const trunk = mix(1, item.trunkHeight, change);
        const forestFade = progress(time, forestAt + .5, 1.1);
        item.position.setAttribute('transform', `translate(${x} ${y}) scale(${currentScale})`);
        item.wood.setAttribute('transform', `scale(1 ${mix(trunk, .12, forestFade)})`);
        alpha(item.wood, 1 - forestFade);
        alpha(item.ground, 1 - progress(time, forestAt, .45));

        item.leaves.forEach((el, i) => {
          const sample = samples[i];
          const position = item.target[i];
          const lx = mix(sample.top.x, position.x, change);
          const crownY = mix(sample.top.y, position.y, change);
          const forestY = -140 + (sample.top.y + 505) / 112 * 220;
          const ly = mix(crownY, forestY, travel);
          el.setAttribute('transform', `translate(${lx} ${ly}) rotate(${sample.rotation}) scale(${sample.size})`);
        });
        item.bars.forEach((bar, bin) => bar.setAttribute('width',
          mix(normalWeights[bin], item.finalWeights[bin], change) / maxWeight * 104));
      });
    };
    return {
      sync: render,
      animationRanges: [
        { start: revealAt, end: revealAt + (comparisons.length - 1) * revealStagger + motionDuration(revealDuration) },
        { start: changeAt, end: changeAt + motionDuration(changeDuration) },
      ],
    };
  };
})();
