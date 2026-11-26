/* Visitas ao chão e às raízes no último slide. */
(() => {
  const make = (parent, tag, attrs) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
    parent.appendChild(node);
    return node;
  };
  const path = (parent, d, fill, attrs = {}) => make(parent, 'path', { d, fill, ...attrs });
  const ellipse = (parent, cx, cy, rx, ry, fill, attrs = {}) => make(parent, 'ellipse', { cx, cy, rx, ry, fill, ...attrs });

  function createJaguar(scene, chasing = false) {
    const id = chasing ? 'farewellChasingJaguar' : 'farewellJaguar';
    const root = make(scene, 'g', { id });
    ellipse(root, -10, 2, 133, 10, '#55513c', { opacity: .13 });
    const body = make(root, 'g', {});
    const contour = { stroke: '#5c3b23', 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
    const defs = make(root, 'defs', {});
    const coat = make(defs, 'linearGradient', { id: `${id}Coat`, x2: '0', y2: '1' });
    make(coat, 'stop', { offset: '0%', 'stop-color': chasing ? '#a66536' : '#c48a42' });
    make(coat, 'stop', { offset: '67%', 'stop-color': chasing ? '#c68a43' : '#dfaa57' });
    make(coat, 'stop', { offset: '100%', 'stop-color': '#efd49d' });
    const bodyShape = 'M-111-91C-116-110-95-118-71-113C-27-106 17-112 49-117C76-121 95-103 91-83C88-65 66-54 51-62C24-68-10-65-44-68C-60-69-69-52-92-60C-109-67-115-81-111-91Z';
    const mask = make(defs, 'clipPath', { id: `${id}Spots` });
    path(mask, bodyShape, '#fff');
    const tail = make(body, 'g', { 'stroke-linecap': 'round' });
    const tailEdge = path(tail, '', 'none', { stroke: '#523520', 'stroke-width': 15 });
    const tailCoat = path(tail, '', 'none', { stroke: '#b97a39', 'stroke-width': 10 });
    const tailRings = path(tail, '', 'none', { stroke: '#5c3926', 'stroke-width': 10, 'stroke-dasharray': '4 22', opacity: .84 });

    const leg = (x, y, front, offset, far) => {
      const lines = [path(body, '', 'none', { stroke: '#60412a', 'stroke-width': front ? 17 : 20 }),
        path(body, '', 'none', { stroke: far ? '#a36c33' : '#d4a050', 'stroke-width': front ? 13 : 16 })];
      lines.forEach(node => { node.setAttribute('stroke-linecap', 'round'); node.setAttribute('stroke-linejoin', 'round'); });
      const paw = ellipse(body, x, -4, 10, 4.5, far ? '#a3713b' : '#e6bc77', { stroke: '#664527', 'stroke-width': 1.5 });
      return { lines, paw, x, y, front, offset };
    };
    const farLegs = [leg(-88, -79, false, .50, true), leg(62, -81, true, .76, true)];
    path(body, bodyShape, `url(#${id}Coat)`, contour);
    const spots = make(body, 'g', { 'clip-path': `url(#${id}Spots)` });
    [
      [-102, -97, .78], [-83, -105, .81], [-60, -99, .92], [-34, -104, .82], [-11, -101, .76], [14, -106, .78], [38, -101, .84], [60, -107, .7], [79, -100, .62],
      [-106, -78, .62], [-84, -83, 1], [-61, -80, .80], [-40, -85, .93], [-17, -78, .79], [7, -86, .95], [29, -79, .82], [53, -85, 1], [75, -80, .73],
      [-90, -64, .64], [-66, -67, .54], [-39, -68, .62], [-14, -67, .58], [21, -68, .66], [51, -67, .59],
    ].forEach(([x, y, scale], i) => {
      const rosette = make(spots, 'g', { transform: `translate(${x} ${y}) rotate(${(i * 39) % 113}) scale(${scale})` });
      path(rosette, 'M-7-2Q-7-6-2-6Q1-4 4-6Q8-5 7-1Q5 2 6 4Q3 7-1 5Q-7 7-8 2Z', '#a86e34', { stroke: '#54351f', 'stroke-width': 2.7 });
      if (i % 3) ellipse(rosette, -.3, 0, 1.6, 1.2, '#52341f');
    });
    const nearLegs = [leg(-89, -77, false, 0, false), leg(62, -80, true, .26, false)];
    const head = make(body, 'g', {});
    ellipse(head, -10, chasing ? -20 : -27, 8, chasing ? 5 : 8, '#8e582f', contour);
    path(head, 'M-21 3C-24-15-17-30-1-31C16-34 32-26 35-15L46-9L42 6C33 13 20 16 11 13C3 19-11 17-17 10Z', chasing ? '#c68a43' : '#d9a458', contour);
    const ear = make(head, 'g', chasing ? { transform: 'translate(-14 5) rotate(-36 13 -26)' } : {});
    ellipse(ear, 13, -26, 9, 8, '#bd8248', contour);
    ellipse(ear, 14, -27, 4.6, 4.2, '#865138');
    path(head, 'M22-4Q29-10 42-6L40 5Q29 11 15 8Z', '#f4dfaf');
    path(head, 'M38-10Q47-11 46-7L42-3Q39-4 38-7Z', '#4d3021');
    if (chasing) {
      path(head, 'M15 9Q29 13 43 1L45 11Q39 23 25 20Z', '#714331', contour);
      path(head, 'M20 11Q30 13 43 3L42 10Q37 17 26 16Z', '#412921');
      path(head, 'M29 11L33 16L35 9M36 8L39 12L40 6', '#fff2d1');
      path(head, 'M18-20Q29-18 34-12L25-13Z', '#593925');
      ellipse(head, 27, -14, 3, 1.5, '#f7d47c', { transform: 'rotate(20 27 -14)' });
    } else {
      path(head, 'M34 6Q39 6 41 2M22 3L26 4M20 6L25 7', 'none', { stroke: '#725038', 'stroke-width': 1.2, 'stroke-linecap': 'round' });
      ellipse(head, 27, -14, 4.2, 2.8, '#392a1c');
      ellipse(head, 28, -15, 1.15, 1, '#fce6a6');
    }
    [[-11, -12], [-5, -20], [3, -14], [9, -6], [-9, 1]].forEach(([x, y]) => ellipse(head, x, y, 2.8, 1.9, '#664127'));

    return ({ x, gait, look = 0, tail: swing = 0, reach = 0, rake = 0 }) => {
      const distance = chasing ? -x : x;
      root.setAttribute('transform', chasing ? `translate(${x} 970) scale(-1 1)` : `translate(${x} 938)`);
      const tilt = 25 * reach;
      const radians = tilt * Math.PI / 180;
      const cos = Math.cos(radians), sin = Math.sin(radians);
      const stride = chasing ? 210 : 116, stance = chasing ? .48 : .62;
      const bound = Math.sin(distance / stride * 2 * Math.PI);
      body.setAttribute('transform', chasing
        ? `translate(0 ${-7 * (1 + bound) * gait}) rotate(${bound * 4 * gait} 0 -70)`
        : `rotate(${-tilt} -89 -4)`);
      [...farLegs, ...nearLegs].forEach(({ x: hipX, y: hipY, front, offset, lines, paw }) => {
        const footOffset = chasing ? offset * .36 + (front ? .47 : 0) : offset;
        const phase = ((distance / stride + footOffset) % 1 + 1) % 1;
        const lift = Math.max(0, (phase - stance) / (1 - stance));
        const step = (phase < stance ? stance / 2 - phase : stance * (lift - .5)) * stride * gait;
        let footX = hipX + step;
        let footY = -4 - (chasing ? 40 : 21) * Math.sin(Math.PI * lift) * gait;
        if (front && reach > 0) {
          // Posição da pata no tronco, convertida para o corpo inclinado sobre as patas traseiras.
          const stroke = (1 - Math.cos(Math.PI * 2 * (rake + offset))) / 2;
          const targetX = 931 - x + 89;
          const targetY = -157 + 47 * stroke + 4;
          const localX = targetX * cos - targetY * sin - 89;
          const localY = targetX * sin + targetY * cos - 4;
          footX += (localX - footX) * reach;
          footY += (localY - footY) * reach;
        }
        const kneeX = (hipX + footX) / 2 + (front ? -13 : 19);
        const kneeY = (hipY + footY) / 2 + (front ? -7 : -1);
        const d = `M${hipX} ${hipY}Q${kneeX} ${kneeY - 8} ${kneeX} ${kneeY}L${footX} ${footY}`;
        lines.forEach(node => node.setAttribute('d', d));
        paw.setAttribute('cx', footX + 3);
        paw.setAttribute('cy', footY);
      });
      const tailY = (chasing ? -76 : -47) + Math.sin(distance / 82 + swing) * (7 + 7 * gait);
      const d = `M-106-92C-151-101-149 ${tailY - 14}-179 ${tailY}S-202 ${tailY + 3}-218 ${tailY - 14}`;
      [tailEdge, tailCoat, tailRings].forEach(node => node.setAttribute('d', d));
      head.setAttribute('transform', `translate(78 -92) rotate(${look + Math.sin(distance / 37) * 1.6 * gait})`);
    };
  }

  function createAgouti(scene) {
    const root = make(scene, 'g', { id: 'farewellAgouti' });
    ellipse(root, 0, 2, 46, 5, '#563e26', { opacity: .16 });
    const body = make(root, 'g', {});
    const legs = path(body, '', 'none', { stroke: '#795237', 'stroke-width': 5, 'stroke-linecap': 'round' });
    path(body, 'M-38-20C-43-33-35-51-20-54C-2-59 13-47 23-34L33-27Q30-15 17-13L-16-9Q-33-10-38-20Z', '#a86d42', { stroke: '#755035', 'stroke-width': 2 });
    path(body, 'M-34-27Q-29-54-11-51Q10-48 16-32Q-3-45-28-33Z', '#c18b58');
    [[-24, -35], [-15, -44], [-5, -41], [0, -34], [-11, -30]].forEach(([x, y]) => path(body, `M${x} ${y}l3 -1`, 'none', { stroke: '#e0b486', 'stroke-width': 1.5 }));
    const head = make(body, 'g', {});
    ellipse(head, 18, -42, 5, 8, '#9d6746', { stroke: '#755035', 'stroke-width': 1.4 });
    path(head, 'M12-32Q20-43 30-37L45-27Q43-19 31-19L20-23Z', '#be8d60', { stroke: '#795237', 'stroke-width': 1.7 });
    ellipse(head, 29, -32, 2.5, 2.4, '#34251f');
    ellipse(head, 44, -26, 2.7, 2.2, '#4c3426');
    return ({ x, gait, look }) => {
      const wave = Math.sin(x / 15);
      root.setAttribute('transform', `translate(${x} 950) scale(-1 1)`);
      body.setAttribute('transform', `translate(0 ${-5 * (1 + wave) * gait})`);
      legs.setAttribute('d', `M-24-20L${-25 + 9 * wave * gait}-9L-19 0M12-20L${14 - 7 * wave * gait} -8L22 0`);
      head.setAttribute('transform', `rotate(${look} 17 -29)`);
    };
  }

  function createFrog(scene) {
    const root = make(scene, 'g', { id: 'farewellFrog' });
    const shadow = ellipse(root, 0, 3, 30, 4.5, '#4e523a', { opacity: .13 });
    const body = make(root, 'g', {});
    const feet = path(body, '', 'none', { stroke: '#657343', 'stroke-width': 4.8, 'stroke-linecap': 'round' });
    path(body, 'M-25-9Q-26-27-7-29Q0-31 10-25Q17-31 25-24Q29-14 21-9L-8-7Z', '#8fa761', { stroke: '#4f6540', 'stroke-width': 1.8 });
    path(body, 'M-10-17Q4-26 19-19Q16-10 3-9Z', '#c7ce91');
    ellipse(body, -14, -12, 12, 8, '#82994e', { stroke: '#5b7041', 'stroke-width': 1.5 });
    ellipse(body, 21, -24, 5.4, 5.2, '#b8c57f');
    ellipse(body, 22.5, -24.8, 2.2, 2.2, '#39412c');
    return ({ x, lift }) => {
      root.setAttribute('transform', `translate(${x} 950)`);
      shadow.setAttribute('opacity', .16 - lift * .09);
      body.setAttribute('transform', `translate(0 ${-32 * lift}) scale(${1 + .17 * lift} ${1 - .13 * lift})`);
      feet.setAttribute('d', `M-16-12L${-22 - 11 * lift} -4L-32 0M14-14L${19 + 10 * lift} -4L29 0`);
    };
  }

  function createArmadillo(scene) {
    const soil = make(scene, 'g', { transform: 'translate(870 950)', id: 'farewellDigSite' });
    ellipse(soil, 0, 4, 25, 4, '#948167', { opacity: .52 });
    path(soil, 'M-19 3Q-12-5-6-3Q4-9 17 3Z', '#b29b7b');
    const dirt = Array.from({ length: 5 }, (_, index) => ellipse(soil, 0, 0, 2.75 - index % 2 * .65, 2, '#947455'));
    const root = make(scene, 'g', { id: 'farewellArmadillo' });
    ellipse(root, 0, 4, 70, 6, '#474532', { opacity: .14 });
    const edge = { stroke: '#5f5648', 'stroke-width': 2.2, 'stroke-linejoin': 'round' };
    path(root, 'M-47-20Q-72-22-91-8Q-101-1-112 0Q-98-11-90-16Q-75-32-57-30Z', '#8f7e68', edge);
    const far = path(root, '', 'none', { stroke: '#726455', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const near = path(root, '', 'none', { stroke: '#95806a', 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const head = make(root, 'g', {});
    path(head, 'M-24-20Q-20-37-4-35Q14-30 38-17L44-11Q37-4 22-6L-11-10Z', '#9e8d77', edge);
    path(head, 'M-5-32Q-8-47-1-49Q7-46 6-32M7-31Q9-43 15-41Q21-36 16-28', '#ac9a82', edge);
    ellipse(head, 22, -22, 2.5, 2.35, '#39332c');
    ellipse(head, 41, -12, 4, 3, '#665745');
    path(root, 'M-62-17C-65-44-46-68-12-70C25-73 49-51 48-24L32-18Q-15-8-62-17Z', '#9c8c77', edge);
    path(root, 'M-56-29Q-42-64-11-65Q18-65 36-42Q8-56-16-53Q-40-50-56-29Z', '#c1af90', { opacity: .78 });
    [-31, -21, -11, -1, 9, 19].forEach((x, i) => {
      path(root, `M${x} ${-63 - Math.min(i, 5 - i) * 2}Q${x + 14} -41 ${x + 1} -15`, 'none', { stroke: '#685e50', 'stroke-width': 2.2, opacity: .84 });
    });
    [[-49, -39], [-43, -46], [-46, -27], [-36, -25], [30, -34], [38, -29]].forEach(([x, y]) => ellipse(root, x, y, 1.8, 1.4, '#786b57'));
    return ({ x, gait, look, dig, soilOpacity }) => {
      const step = Math.sin(x / 16) * 11 * gait;
      const stroke = -Math.sin(dig * Math.PI * 2) * soilOpacity;
      root.setAttribute('transform', `translate(${x} 950)`);
      far.setAttribute('d', `M-42-21l${-step} 18l8 2M25-23l${step - stroke * 10} ${19 - Math.max(0, -stroke) * 10}l9 2`);
      near.setAttribute('d', `M-37-24l${step} 19l8 2M29-21l${-step + stroke * 17} ${18 - Math.max(0, stroke) * 17}l8 2`);
      head.setAttribute('transform', `translate(40 3) rotate(${look} -10 -18)`);
      soil.setAttribute('opacity', soilOpacity);
      dirt.forEach((particle, i) => {
        const t = Math.max(0, ((dig + i * .17) % 1 - .23) / .77);
        particle.setAttribute('cx', -t * (25 + i * 8));
        particle.setAttribute('cy', -Math.sin(Math.PI * t) * (26 + i * 6));
        particle.setAttribute('opacity', Math.sin(Math.PI * t) * .84);
      });
    };
  }

  function createAnteater(scene) {
    const root = make(scene, 'g', { id: 'farewellAnteater' });
    ellipse(root, -36, 3, 99, 7, '#4e493a', { opacity: .14 });
    const outline = { stroke: '#5b5348', 'stroke-width': 2.3, 'stroke-linejoin': 'round' };
    const tail = make(root, 'g', {});
    path(tail, 'M-43-35C-80-40-115-16-157-18L-149-25L-166-30L-151-35L-173-49Q-132-46-165-64C-133-67-128-77-92-69C-64-65-56-57-46-48Z', '#817365', outline);
    path(tail, 'M-153-41Q-120-50-76-56M-151-52Q-121-58-93-59M-136-30Q-117-43-76-46', 'none', { stroke: '#a99a84', 'stroke-width': 2.2, 'stroke-linecap': 'round' });
    const far = path(root, '', 'none', { stroke: '#655b4c', 'stroke-width': 13, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    path(root, 'M-56-25Q-69-40-57-60C-38-82-9-73 10-66C28-63 51-67 61-54Q65-37 51-24Q32-13 15-23C-5-27-20-16-42-19Z', '#a39881', outline);
    path(root, 'M-49-62Q-32-70-21-66L37-32L60-30L52-20Q36-15 21-21Z', '#eee2c5');
    path(root, 'M-43-65L-26-66L33-36L58-33L47-24L29-24Z', '#4b4240');
    const near = path(root, '', 'none', { stroke: '#877763', 'stroke-width': 14, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const head = make(root, 'g', {});
    ellipse(head, 3, -15, 5.7, 6.2, '#968770', outline);
    path(head, 'M-13-7Q-6-20 10-13Q18-9 28 0L53 19Q57 22 52 26L38 21L10 10Q-6 9-13-7Z', '#a79a7f', outline);
    path(head, 'M36 13l17 8q4 3-1 5l-13-6Z', '#625749');
    ellipse(head, 12, -5, 2.4, 2.1, '#392f29');
    return ({ x, gait, look }) => {
      const step = Math.sin(x / 25) * 14 * gait;
      root.setAttribute('transform', `translate(${x} 946) scale(-1 1)`);
      tail.setAttribute('transform', `rotate(${Math.sin(x / 43) * 4 * gait} -50 -45)`);
      far.setAttribute('d', `M-35-29l${-step} 25l9 1M39-30l${step} 26l11 1`);
      near.setAttribute('d', `M-44-28l${step} 24l9 1M34-30l${-step} 26l11 1`);
      head.setAttribute('transform', `translate(50 -48) rotate(${look})`);
    };
  }

  function createAntTrail(scene) {
    const root = make(scene, 'g', { id: 'farewellAntTrail' });
    const trail = path(root, 'M1450 974C1289 982 1102 966 1007 951C950 942 967 882 963 820', 'none');
    const length = trail.getTotalLength();
    const gap = 25;
    const ants = Array.from({ length: 9 }, (_, index) => {
      const ant = make(root, 'g', { 'data-ant': index });
      const legs = path(ant, '', 'none', { stroke: '#59442b', 'stroke-width': 1.35, 'stroke-linecap': 'round' });
      ellipse(ant, -5, 0, 4.7, 3.2, '#614a2b');
      ellipse(ant, 0, 0, 2.5, 2.3, '#765934');
      ellipse(ant, 4.1, 0, 2.7, 2.6, '#514027');
      path(ant, 'M5-1.3Q7-4 10-4M5 1.3Q7 4 10 4', 'none', { stroke: '#59442b', 'stroke-width': 1 });
      if (index % 3 !== 1) {
        path(ant, 'M2-2Q5-16 14-15Q16-6 5-3Z', '#77954f', { stroke: '#526d3a', 'stroke-width': 1 });
        path(ant, 'M4-4L12-13', 'none', { stroke: '#b0bf7f', 'stroke-width': .75 });
      }
      return { ant, legs };
    });
    return {
      distance: length + gap * (ants.length - 1),
      render(travel) {
        ants.forEach(({ ant, legs }, index) => {
          const distance = travel - gap * index;
          if (distance <= 0 || distance >= length) { ant.setAttribute('opacity', 0); return; }
          const a = trail.getPointAtLength(distance);
          const b = trail.getPointAtLength(Math.min(length, distance + 2));
          const rotate = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
          const step = Math.sin(distance * .52) * 1.3;
          ant.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${rotate})`);
          ant.setAttribute('opacity', Math.min(1, distance / 11, (length - distance) / 11));
          legs.setAttribute('d', `M-3 0l-4 ${-4 + step}M0 0l-1 ${-5 - step}M2 0l4 ${-4 + step}M-3 0l-4 ${4 + step}M0 0l-1 ${5 - step}M2 0l4 ${4 + step}`);
        });
      },
    };
  }

  function createGuest(scene, running = false) {
    const id = running ? 'farewellRunningGuest' : 'farewellWalkingGuest';
    const root = make(scene, 'g', { id });
    const size = 320, baseline = running ? 489 : 495;
    const stride = running ? 390 : 212;
    ellipse(root, 8, 4, running ? 108 : 81, 8, '#4e493a', { opacity: .14 });
    const frame = make(root, 'svg', { x: -size / 2, y: -size * baseline / 512, width: size, height: size, overflow: 'hidden' });
    const file = running ? 'gustavo-corrida.png' : 'gustavo-caminhada.png';
    make(frame, 'image', { href: `assets/characters/${file}`, width: 1536, height: 1024 });
    let lastFrame = -1;
    return ({ x, gait }) => {
      const distance = running ? 2100 - x : x + 172;
      const index = gait ? Math.floor(distance / stride * 6) % 6 : running ? 0 : 1;
      if (index !== lastFrame) {
        frame.setAttribute('viewBox', `${index % 3 * 512} ${Math.floor(index / 3) * 512} 512 512`);
        lastFrame = index;
      }
      root.setAttribute('transform', running ? `translate(${x} 983) scale(-1 1)` : `translate(${x} 947)`);
    };
  }

  function createChase(scene) {
    const jaguar = createJaguar(scene, true);
    const guest = createGuest(scene, true);
    return ({ x, jaguarX, gait }) => {
      jaguar({ x: jaguarX, gait, look: 5 });
      guest({ x, gait });
    };
  }

  window.createFarewellGroundFauna = ({ behindTree, inFront }) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visitors = new Map();
    function register(name, draw, { initial, resting, duration, move, companion, foreground = false }) {
      const layer = make(foreground ? inFront : behindTree, 'g', { visibility: 'hidden', 'aria-hidden': 'true' });
      const render = draw(layer);
      visitors.set(name, { layers: companion ? [layer, companion.layer] : [layer], state: { ...initial }, initial, resting, duration, move,
        render: companion ? state => { render(state); companion.render(state); } : render });
    }

    register('jaguar', createJaguar, {
      initial: { x: -145, gait: 1, look: 0, tail: 0, reach: 0, rake: 0 },
      resting: { x: 849, gait: 0, look: -8, reach: 1, rake: .27 },
      duration: 9.55,
      move(tl, state) {
        tl.to(state, { x: 850, duration: 3.3, ease: 'none' }, 0)
          .to(state, { gait: 0, duration: .22, ease: 'sine.out' }, 3.1)
          .to(state, { look: -11, reach: 1, duration: .48, ease: 'sine.inOut' }, 3.35)
          .to(state, { tail: 2.1, duration: 1.55, ease: 'sine.inOut' }, 3.43)
          .to(state, { rake: 2.5, duration: 1.4, ease: 'none' }, 3.83)
          .to(state, { look: 0, reach: 0, duration: .44, ease: 'sine.inOut' }, 5.2)
          .to(state, { gait: 1, duration: .25 }, 5.5)
          .to(state, { x: 2170, duration: 3.72, ease: 'none' }, 5.73);
      },
    });

    register('armadillo', createArmadillo, {
      initial: { x: -100, gait: 1, look: 0, dig: 0, soilOpacity: 0 },
      resting: { x: 812, gait: 0, look: 17, dig: .5, soilOpacity: 1 },
      duration: 7.8,
      move(tl, state) {
        tl.to(state, { x: 812, duration: 2.53, ease: 'none' }, 0)
          .to(state, { gait: 0, look: 18, duration: .26 }, 2.36)
          .to(state, { soilOpacity: 1, duration: .42 }, 2.62)
          .to(state, { dig: 4, duration: 1.63, ease: 'none' }, 2.65)
          .to(state, { look: 0, gait: 1, duration: .22 }, 4.34)
          .to(state, { soilOpacity: 0, duration: .52 }, 4.36)
          .to(state, { x: 2060, duration: 3.14, ease: 'none' }, 4.56);
      },
    });

    const antLayer = make(inFront, 'g', { visibility: 'hidden', 'aria-hidden': 'true' });
    const ants = createAntTrail(antLayer);
    const sniffAt = 1108;
    register('anteater', createAnteater, {
      initial: { x: 2035, gait: 1, look: 0, trail: 235 },
      resting: { x: sniffAt, gait: 0, look: 26, trail: ants.distance * .69 },
      duration: 8,
      companion: { layer: antLayer, render: state => ants.render(state.trail) },
      move(tl, state) {
        tl.to(state, { trail: ants.distance, duration: 7.8, ease: 'none' }, 0)
          .to(state, { x: sniffAt, duration: 2.65, ease: 'none' }, 0)
          .to(state, { gait: 0, look: 27, duration: .4 }, 2.52)
          .to(state, { look: 21, duration: .22, repeat: 4, yoyo: true, ease: 'sine.inOut' }, 2.98)
          .to(state, { gait: 1, look: 0, duration: .3 }, 4.13)
          .to(state, { x: -192, duration: 3.48, ease: 'none' }, 4.42);
      },
    });

    register('guest', createGuest, {
      initial: { x: -172, gait: 1 },
      resting: { x: 822, gait: 0 },
      duration: 9.35,
      move(tl, state) {
        tl.to(state, { x: 822, duration: 4, ease: 'none' }, 0)
          .set(state, { gait: 0 }, 4)
          .set(state, { gait: 1 }, 4.68)
          .to(state, { x: 2100, duration: 4.52, ease: 'none' }, 4.68);
      },
    });

    register('chase', createChase, {
      initial: { x: 2100, jaguarX: 2520, gait: 1 },
      resting: { x: 1140, jaguarX: 1510, gait: 0 },
      duration: 4.45,
      foreground: true,
      move(tl, state) {
        tl.to(state, { x: -260, duration: 3.88, ease: 'none' }, 0)
          .to(state, { jaguarX: -270, duration: 4.38, ease: 'none' }, 0);
      },
    });

    register('frog', createFrog, {
      initial: { x: -49, lift: 0 },
      resting: { x: 745, lift: 0 },
      duration: 6.6,
      move(tl, state) {
        [[0, 106], [.83, 259], [1.66, 407], [2.49, 548], [4.05, 689], [4.88, 817], [5.71, 950]].forEach(([at, x]) => {
          tl.to(state, { x, duration: .51, ease: 'sine.inOut' }, at)
            .to(state, { lift: 1, duration: .255, repeat: 1, yoyo: true, ease: 'sine.inOut' }, at);
        });
      },
    });

    register('agouti', createAgouti, {
      initial: { x: 1975, gait: 1, look: 0 },
      resting: { x: 1150, gait: 0, look: 17 },
      duration: 6.5,
      move(tl, state) {
        tl.to(state, { x: 1150, duration: 2.11, ease: 'none' }, 0)
          .to(state, { gait: 0, look: 26, duration: .25, ease: 'sine.inOut' }, 2.01)
          .to(state, { look: 9, duration: .21, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 2.29)
          .to(state, { gait: 1, look: 0, duration: .22 }, 3.15)
          .to(state, { x: -85, duration: 3.02, ease: 'none' }, 3.36);
      },
    });

    let session, activeLayers = [];
    function stop() {
      session?.kill();
      session = null;
      activeLayers.forEach(layer => layer.setAttribute('visibility', 'hidden'));
      activeLayers = [];
    }
    function start(name, speed) {
      stop();
      const visitor = visitors.get(name);
      const { layers, state, initial, resting, render, move } = visitor;
      activeLayers = layers;
      Object.assign(state, initial, reduced ? resting : null);
      render(state);
      layers.forEach(layer => layer.setAttribute('visibility', 'visible'));
      if (!reduced) {
        session = gsap.timeline({ onUpdate: () => render(state) }).timeScale(speed);
        move(session, state);
      }
    }

    return { start, stop, duration: name => visitors.get(name).duration };
  };
})();
