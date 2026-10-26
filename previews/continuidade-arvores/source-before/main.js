/* Índices Foliares — apresentação animada sobre LAI, LAD, Beer-Lambert, LiDAR e Projeto EBA.
   Toda a animação é uma única timeline GSAP (tl) com pontos de parada (STOPS):
   a apresentação pausa neles e continua com clique / espaço / → / PageDown. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  let presentationReady = false;
  const mk = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const environmentVariableLabels = [];
  function makeEnvironmentalVariable(parent, variable, index) {
    const column = index < 8 ? 0 : 1;
    const row = index % 8;
    const x0 = column === 0 ? 700 : 1310;
    const y0 = 264 + row * 86;
    const group = mk('g', { class: 'environmentVariable' }, parent);
    const marker = mk('rect', { x: x0, y: y0 - 28, width: 8, height: 36, rx: 4, fill: variable.col }, group);
    const label = mk('text', {
      x: x0 + 24, y: y0, fill: '#fdf8ec', class: 'environmentVariableLabel',
      'font-family': 'Outfit, sans-serif', 'font-size': 36, 'font-weight': 600,
      'aria-label': variable.name,
    }, group);
    label.textContent = variable.name;
    environmentVariableLabels.push({ label, marker, text: variable.name, x: x0 + 24, y: y0, width: column === 0 ? 548 : 526 });
    group._x0 = x0 + 150;
    group._y0 = y0 - 8;
    gsap.set(group, { autoAlpha: 0 });
    return group;
  }
  function wrapEnvironmentalVariables() {
    environmentVariableLabels.forEach(({ label, marker, text, x, y, width }) => {
      const lines = [];
      let line = '';
      text.split(' ').forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        label.textContent = candidate;
        if (line && label.getComputedTextLength() > width) {
          lines.push(line); line = word;
        } else line = candidate;
      });
      lines.push(line);
      label.textContent = '';
      lines.forEach((value, index) => {
        const span = mk('tspan', { x, y: y + (index - (lines.length - 1) / 2) * 39 }, label);
        span.textContent = value + (index < lines.length - 1 ? ' ' : '');
      });
      const bounds = label.getBBox();
      marker.setAttribute('y', bounds.y + 3);
      marker.setAttribute('height', Math.max(34, bounds.height - 6));
      label.dataset.lines = lines.length;
    });
  }
  // gerador pseudoaleatório com semente
  let seed = 11;
  const R = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rr = (a, b) => a + R() * (b - a);
  const pick = (arr) => arr[(R() * arr.length) | 0];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ================= CENÁRIO ================= */

  const stars = $('#stars');
  for (let i = 0; i < 80; i++) {
    const s = mk('circle', { cx: rr(0, 1920), cy: rr(0, 560), r: rr(0.6, 1.9), fill: '#fff' }, stars);
    gsap.fromTo(s, { opacity: rr(0.2, 0.9) }, { opacity: rr(0.05, 0.3), duration: rr(1, 3), repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  const clouds = $('#clouds');
  [{ y: 170, s: 1.1, o: 0.5 }, { y: 270, s: 0.8, o: 0.35 }, { y: 110, s: 0.7, o: 0.3 }, { y: 360, s: 1.3, o: 0.25 }].forEach((c) => {
    const g = mk('g', { opacity: c.o }, clouds);
    const inner = mk('g', {}, g);
    [[0, 0, 42], [40, -18, 52], [90, -6, 44], [130, 4, 34], [60, 10, 40]].forEach(([x, y, r]) =>
      mk('circle', { cx: x, cy: y, r, fill: '#f4efe6' }, inner));
    gsap.set(inner, { y: c.y, scale: c.s });
    gsap.fromTo(inner, { x: -300 }, { x: 2200, duration: rr(110, 170), ease: 'none', repeat: -1 }).progress(R());
  });

  const grass = $('#grass');
  const gcols = ['#6a9a3c', '#7fb04a', '#55832f', '#8dbf55'];
  for (let x = 0; x < 1920; x += 8) {
    const h = rr(9, 26), dx = rr(-7, 7), y = rr(874, 892);
    mk('path', {
      d: `M${x},${y} Q${x + dx * 0.3},${y - h * 0.6} ${x + dx},${y - h}`,
      stroke: pick(gcols), 'stroke-width': rr(1.4, 2.6), fill: 'none', 'stroke-linecap': 'round',
    }, grass);
  }
  for (let i = 0; i < 26; i++) {
    const x = rr(20, 1900), y = rr(884, 1000);
    const g = mk('g', { transform: `translate(${x},${y}) scale(${rr(0.6, 1.1)})` }, grass);
    const col = pick(['#fff3d6', '#ffd76e', '#f7b5c8']);
    for (let p = 0; p < 5; p++) mk('ellipse', { cx: 0, cy: -4, rx: 2.4, ry: 4, fill: col, transform: `rotate(${p * 72})` }, g);
    mk('circle', { r: 2, fill: '#e09a3a' }, g);
  }

  const pollen = $('#pollen');
  for (let i = 0; i < 28; i++) {
    const c = mk('circle', { cx: rr(150, 1800), cy: rr(220, 860), r: rr(1.2, 3.2), fill: '#fff3c4', opacity: rr(0.3, 0.8) }, pollen);
    gsap.to(c, { x: 'random(-70,70)', y: 'random(-60,30)', duration: rr(4, 9), repeat: -1, yoyo: true, repeatRefresh: true, ease: 'sine.inOut' });
  }

  /* ================= ÁRVORE ================= */
  const clumpsBack = [[0, -500, 80], [-170, -460, 80], [170, -470, 78], [-240, -370, 50], [245, -380, 45], [-90, -290, 70], [95, -295, 70]];
  const clumpsFront = [[0, -430, 105], [-130, -405, 92], [135, -415, 90], [-60, -500, 75], [70, -505, 72], [-210, -330, 68], [212, -335, 66], [0, -310, 82], [-232, -430, 55], [236, -440, 52]];
  const allClumps = [...clumpsBack, ...clumpsFront];

  const blobEls = [
    ...clumpsBack.map(([cx, cy, r]) => mk('circle', { cx, cy, r, fill: 'url(#blobBack)' }, $('#blobsBack'))),
    ...clumpsFront.map(([cx, cy, r]) => mk('circle', { cx, cy, r, fill: 'url(#blobGrad)' }, $('#blobs'))),
  ];

  const leafD = 'M-16,0 C-11,-8 5,-10 16,0 C5,10 -11,8 -16,0Z';
  const leafHalf = 'M-16,0 C-11,-8 5,-10 16,0Z';
  const leafColor = (s) => `hsl(${lerp(132, 84, s).toFixed(0)},${lerp(44, 64, s).toFixed(0)}%,${lerp(17, 62, s).toFixed(0)}%)`;

  function makeLeaf(parent, x, y, rot, s, col, hidden = true) {
    const g = mk('g', {}, parent);
    mk('path', { d: leafD, fill: col }, g);
    mk('path', { d: leafHalf, fill: 'rgba(255,255,255,.13)' }, g);
    mk('path', { d: 'M-14,0 L14,0', stroke: 'rgba(0,0,0,.2)', 'stroke-width': 1 }, g);
    g._d = { x, y, rot, s };
    gsap.set(g, { x, y, rotation: rot, scale: hidden ? 0 : s, transformOrigin: '50% 50%' });
    return g;
  }

  const leafEls = [];
  function fillClump([cx, cy, r], parent, back) {
    const n = Math.round(r * 0.36);
    const arr = [];
    for (let i = 0; i < n; i++) {
      const rim = R() < 0.68;
      const a = R() * Math.PI * 2;
      const rho = rim ? rr(0.74, 1.04) : Math.sqrt(R()) * 0.72;
      const x = cx + Math.cos(a) * rho * r;
      const y = cy + Math.sin(a) * rho * r;
      const light = -(Math.cos(a) * 0.55 + Math.sin(a) * 0.83) * rho;
      const h = clamp((-y - 220) / 360, 0, 1);
      const shade = clamp(0.44 + 0.34 * light + 0.18 * h - (back ? 0.3 : 0) + rr(-0.08, 0.08), 0, 1);
      arr.push({ x, y, rot: rim ? (a * 180) / Math.PI + rr(-40, 40) : rr(-180, 180), s: rr(0.75, 1.15), c: leafColor(shade), sh: shade });
    }
    arr.sort((p, q) => p.sh - q.sh);
    arr.forEach((p) => leafEls.push(makeLeaf(parent, p.x, p.y, p.rot, p.s, p.c)));
  }
  clumpsBack.forEach((c) => fillClump(c, $('#leavesBack'), true));
  clumpsFront.forEach((c) => fillClump(c, $('#leaves'), false));
  const N = leafEls.length;
  const popOrder = [...leafEls].sort((a, b) => Math.hypot(a._d.x, a._d.y + 400) - Math.hypot(b._d.x, b._d.y + 400));
  const CROWN = ['#leaves', '#leavesBack', '#blobs', '#blobsBack'];

  // camadas (discos) de folhas no chão para o LAI
  const discCols = [['#2f6b3a', '#1d4626'], ['#3b7d43', '#245530'], ['#4a914d', '#2d6337'], ['#5aa457', '#36723e'], ['#6eb862', '#408147']];
  const discLblEls = [];
  const discEls = discCols.map(([top, side], k) => {
    const yk = -k * 16 - 6;
    const g = mk('g', {}, $('#discs'));
    mk('path', { d: `M-290,${yk} A290,38 0 0 0 290,${yk} L290,${yk + 13} A290,38 0 0 1 -290,${yk + 13} Z`, fill: side }, g);
    mk('ellipse', { cx: 0, cy: yk, rx: 290, ry: 38, fill: top, stroke: 'rgba(220,255,180,.55)', 'stroke-width': 1.5 }, g);
    const t = mk('text', { x: 314, y: yk + 12, class: 'svgBig gold' }, g);
    t.textContent = `${k + 1}ª`;
    discLblEls.push(t);
    gsap.set(g, { opacity: 0, scaleX: 0.4, transformOrigin: '50% 50%' });
    return g;
  });

  // raios de sol verticais
  const rayEls = [];
  for (let i = 0; i < 9; i++) {
    const x = -260 + i * 65;
    rayEls.push(mk('line', { x1: x, y1: -760, x2: x, y2: -14, stroke: 'url(#rayGrad)', 'stroke-width': 3, pathLength: 1, 'stroke-linecap': 'round' }, $('#rays')));
  }

  // estratos da copa (LAD por camada e multiplicação por 0,5 m na Parte 5)
  const LAD = [1.2, 2.4, 3.0, 2.2, 1.2];
  const bandEls = [], labelEls = [], sliceEls = [], lidarCalcEls = [];
  LAD.forEach((v, i) => {
    const y = -580 + i * 72;
    bandEls.push(mk('rect', { x: -290, y, width: 580, height: 72, fill: '#d9ff9e', 'fill-opacity': 0.06 + (v / 3) * 0.42 }, $('#bands')));
    const t = mk('text', { x: 308, y: y + 48, class: 'svgBig' }, $('#bandLabels'));
    t.innerHTML = `${v.toFixed(1).replace('.', ',')}<tspan class="svgUnit" dx="6">m²/m³</tspan>`;
    labelEls.push(t);

    const laiSlice = (v * 0.5).toFixed(1).replace('.', ',');
    const c = mk('text', { x: 308, y: y + 48, class: 'svgMid' }, $('#lidarBandCalc'));
    c.innerHTML = `<tspan fill="#fdf8ec">${v.toFixed(1).replace('.', ',')}</tspan><tspan fill="#ffd76e"> × 0,5 m = </tspan><tspan class="svgBig green">${laiSlice}</tspan>`;
    lidarCalcEls.push(c);

    if (i > 0) sliceEls.push(mk('ellipse', { cx: 0, cy: y, rx: 290, ry: 40, fill: 'none', stroke: '#eaf7d4', 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0.85 }, $('#sliceLines')));
  });

  // O estrato central mantém um contorno próprio, visível mesmo com a timeline pausada.
  const layerFocus = mk('g', { id: 'layerFocus' }, $('#tree'));
  mk('rect', { x: -290, y: -436, width: 580, height: 72, fill: '#ffd76e', 'fill-opacity': .22, class: 'layerFocusSurface' }, layerFocus);
  [-436, -364].forEach(y => {
    mk('ellipse', { cx: 0, cy: y, rx: 290, ry: 40, fill: 'none', stroke: '#fff', 'stroke-width': 7, class: 'layerFocusHalo' }, layerFocus);
    mk('ellipse', { cx: 0, cy: y, rx: 290, ry: 40, fill: 'none', stroke: '#ffd76e', 'stroke-width': 4, class: 'layerFocusEdge' }, layerFocus);
  });
  [-290, 290].forEach(x => {
    mk('line', { x1: x, x2: x, y1: -436, y2: -364, stroke: '#fff', 'stroke-width': 7, class: 'layerFocusHalo' }, layerFocus);
    mk('line', { x1: x, x2: x, y1: -436, y2: -364, stroke: '#ffd76e', 'stroke-width': 4, class: 'layerFocusEdge' }, layerFocus);
  });
  gsap.set(layerFocus, { autoAlpha: 0 });

  // feixe de luz (Beer-Lambert)
  const K = 0.5;
  let cum = 0;
  const T = LAD.map((v) => { cum += v * 0.5; return Math.exp(-K * cum); });
  const beamOp = (t) => 0.1 + 0.75 * t;
  const beamSegs = [mk('rect', { x: -70, y: -760, width: 140, height: 180, fill: '#ffe7a3', opacity: beamOp(1) }, $('#beam'))];
  T.forEach((t, i) => beamSegs.push(mk('rect', { x: -70, y: -580 + i * 72, width: 140, height: 72, fill: '#ffe7a3', opacity: beamOp(t) }, $('#beam'))));
  beamSegs.push(mk('rect', { x: -70, y: -220, width: 140, height: 214, fill: '#ffe7a3', opacity: beamOp(T[4]) }, $('#beam')));
  const beamSpot = mk('ellipse', { cx: 0, cy: -2, rx: 80, ry: 14, fill: '#ffe7a3', opacity: 0.35 }, $('#beam'));
  const pct = (t) => `${Math.round(t * 100)}%`;
  const beamLbls = [];
  const bl0 = mk('text', { x: 308, y: -602, class: 'svgBig gold' }, $('#beamLabels'));
  bl0.innerHTML = 'I₀ = 100%<tspan class="svgUnit" dx="8">luz no topo</tspan>';
  beamLbls.push(bl0);
  T.forEach((t, i) => {
    const e = mk('text', { x: 308, y: -580 + i * 72 + 48, class: 'svgBig' }, $('#beamLabels'));
    e.textContent = pct(t);
    beamLbls.push(e);
  });
  const blG = mk('text', { x: 308, y: -22, class: 'svgBig gold' }, $('#beamLabels'));
  blG.innerHTML = `I = ${pct(T[4])}<tspan class="svgUnit" dx="8">luz no chão</tspan>`;
  beamLbls.push(blG);

  // cubos isométricos
  function cube(parent, cx, cy, s, sw) {
    const h = s * 0.866;
    const g = mk('g', { stroke: '#ffd76e', 'stroke-width': sw, 'stroke-linejoin': 'round' }, parent);
    mk('polygon', { points: `${cx - h},${cy - s / 2} ${cx},${cy} ${cx},${cy + s} ${cx - h},${cy + s / 2}`, fill: 'rgba(255,215,110,.16)' }, g);
    mk('polygon', { points: `${cx},${cy} ${cx + h},${cy - s / 2} ${cx + h},${cy + s / 2} ${cx},${cy + s}`, fill: 'rgba(255,215,110,.24)' }, g);
    mk('polygon', { points: `${cx},${cy - s} ${cx + h},${cy - s / 2} ${cx},${cy} ${cx - h},${cy - s / 2}`, fill: 'rgba(255,215,110,.34)' }, g);
    return g;
  }
  cube($('#miniCube'), 70, -430, 34, 2.5);
  $('#miniCube').setAttribute('filter', 'url(#glow)');
  cube($('#bigCube'), 1330, 470, 130, 2.5);

  const bigLeaf = [];
  for (let i = 0; i < 6; i++) {
    const g = makeLeaf($('#bigLeaves'), 1330 + rr(-60, 60), 470 + rr(-70, 70), rr(-180, 180), 1.9, leafColor(rr(0.4, 0.8)));
    bigLeaf.push(g);
  }

  /* ---------- LiDAR na árvore: pulsos e nuvem de pontos ---------- */
  const RETURN_COUNT = 100;
  const groundIdx = new Set([6, 17, 29, 41, 52, 66, 78, 91]);
  const insideCrown = (x, y) => allClumps.some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) < r * 0.95);
  const ladTotal = LAD.reduce((a, b) => a + b, 0);
  const sampleBand = () => {
    let u = R() * ladTotal;
    for (let i = 0; i < LAD.length; i++) { if ((u -= LAD[i]) <= 0) return i; }
    return 2;
  };
  const DRONE_Y = 150, SWEEP_X0 = 200, SWEEP_X1 = 760, TREE_X = 480, GROUND_Y = 880;
  const returnSamples = [];
  const groundCum = [0];
  for (let i = 0; i < RETURN_COUNT; i++) {
    const dx = SWEEP_X0 + ((SWEEP_X1 - SWEEP_X0) * i) / RETURN_COUNT;
    let lx = clamp(dx - TREE_X + rr(-18, 18), -275, 275);
    let ly;
    const ground = groundIdx.has(i);
    if (ground) ly = rr(-6, 2);
    else {
      let ok = false;
      for (let tries = 0; tries < 40 && !ok; tries++) {
        const b = sampleBand();
        ly = -580 + b * 72 + rr(4, 68);
        ok = insideCrown(lx, ly);
      }
      if (!ok) {
        const c = allClumps.reduce((best, cl) => (Math.abs(cl[0] - lx) < Math.abs(best[0] - lx) ? cl : best));
        ly = c[1] + rr(-0.6, 0.6) * c[2];
      }
    }
    const line = mk('line', { x1: dx, y1: DRONE_Y + 16, x2: TREE_X + lx, y2: GROUND_Y + ly, stroke: '#ff5a7a', 'stroke-width': 1.6, opacity: 0 }, $('#lasers'));
    const dot = mk('circle', { cx: lx, cy: ly, r: ground ? 6 : 4.5, fill: ground ? '#ffb347' : '#9dff7a' }, $('#lidarPts'));
    gsap.set(dot, { scale: 0, transformOrigin: '50% 50%' });
    returnSamples.push({ line, dot, ground });
    groundCum.push(groundCum[i] + (ground ? 1 : 0));
  }
  const groundDots = returnSamples.filter((p) => p.ground).map((p) => p.dot);

  /* ================= PARTE 06: TRANSECTO 3D ISOMÉTRICO (12 km x 300 m) ================= */
  // Coordenadas na laje isométrica: u em [0,1] (comprimento 12 km), v em [0,1] (largura 300 m)
  const isoPos = (u, v) => ({
    x: 150 + u * 750 + v * 170,
    y: 625 + u * 200 - v * 130,
  });
  const isoTreesG = $('#isoTrees');
  const treeList = [];
  for (let i = 0; i < 165; i++) {
    const u = rr(0.03, 0.97), v = rr(0.04, 0.96);
    const p = isoPos(u, v);
    const inStrip = v > 0.25 && v < 0.78 && u > 0.06 && u < 0.95;
    treeList.push({ x: p.x, y: p.y, r: rr(14, 28), inStrip });
  }
  treeList.sort((a, b) => a.y - b.y);
  const isoTreeEls = treeList.map((t) => {
    const g = mk('g', {}, isoTreesG);
    const c1 = pick(['#1e5229', '#286633', '#347a3b', '#22592c']);
    const c2 = pick(['#4ca14e', '#65b858', '#3e8c43', '#78c966']);
    mk('ellipse', { cx: t.x, cy: t.y + 3, rx: t.r * 0.9, ry: t.r * 0.45, fill: 'rgba(0,0,0,.35)' }, g);
    mk('circle', { cx: t.x, cy: t.y - t.r * 0.55, r: t.r, fill: c1 }, g);
    mk('circle', { cx: t.x - t.r * 0.22, cy: t.y - t.r * 0.78, r: t.r * 0.72, fill: c2 }, g);
    return g;
  });

  // Pontos LiDAR que surgem dentro do retângulo do transecto conforme o avião passa
  const transectPtsG = $('#transectPts');
  const tPts = [];
  for (let i = 0; i < 120; i++) {
    const u = rr(0.07, 0.94), v = rr(0.3, 0.74);
    const p = isoPos(u, v);
    const h = rr(8, 52);
    const col = h > 36 ? '#9dff7a' : h > 18 ? '#ffd76e' : '#ff9f43';
    const c = mk('circle', { cx: p.x, cy: p.y - h, r: rr(2.5, 4.2), fill: col }, transectPtsG);
    gsap.set(c, { scale: 0, transformOrigin: '50% 50%' });
    tPts.push({ el: c, u, x: p.x, y: p.y - h });
  }
  tPts.sort((a, b) => a.u - b.u);
  const tPtEls = tPts.map((p) => p.el);

  /* ================= PARTE 07: BIOMA AMAZÔNIA, 16 ESTRATOS E TABELAS ABSTRATAS ================= */
  const amzShape = $('#amzShape');
  if (window.AMZ_PATH && amzShape) {
    amzShape.setAttribute('d', window.AMZ_PATH);
  }
  const amzDotsG = $('#amzDots742');
  const amzPts = window.AMZ_PTS || [];
  const amzDotEls = amzPts.map(([cx, cy]) => {
    const c = mk('circle', {
      cx, cy, r: 3.2,
      fill: '#ffd76e',
      stroke: '#0b2416',
      'stroke-width': 0.8,
      opacity: 0.92,
    }, amzDotsG);
    gsap.set(c, { scale: 0, transformOrigin: '50% 50%' });
    return c;
  });

  // As 16 variáveis ambientais (sem emojis e sem fundo escuro)
  const VARS_16 = [
    { name: 'Sazonalidade da Precipitação', col: '#5ec8f8' },
    { name: 'Fração de Radiação Absorvida (fAPAR)', col: '#9dff7a' },
    { name: 'Elevação', col: '#a8d672' },
    { name: 'Evapotranspiração Potencial', col: '#68d8d6' },
    { name: 'Velocidade do Vento Meridional', col: '#84b6f4' },
    { name: 'Sazonalidade da Temperatura', col: '#ffb347' },
    { name: 'Dias com Precipitação > 20 mm', col: '#4ea8de' },
    { name: 'Número de Dias Limpos', col: '#ffe066' },
    { name: 'Precipitação Anual', col: '#3a86ff' },
    { name: 'Velocidade do Vento Zonal', col: '#90dbf4' },
    { name: 'Frequência de Raios', col: '#ffd166' },
    { name: 'Temperatura Média Anual', col: '#f79d65' },
    { name: 'Temperatura Máxima Anual', col: '#f4845f' },
    { name: 'Teor de Água no Solo', col: '#74c69d' },
    { name: 'Teor de Argila no Solo', col: '#d4a373' },
    { name: 'Precipitação do Mês Mais Úmido', col: '#48cae4' },
  ];

  const envSlicesG = $('#envSlicesG');
  const varItemsG = $('#varItemsG');
  const hitsCenterG = $('#hitsCenterG');
  const FIRST_SLICE_Y = 235;
  const SLICE_STEP = 36; // 16 estratos: y = 235 até y = 775 (todos abaixo do Transecto em y=145..193)

  const envSliceEls = new Array(16);
  const hitCenterEls = new Array(16);
  // Criamos os 16 estratos de baixo para cima (15 -> 0) para sobreposição 3D perfeita
  for (let i = 15; i >= 0; i--) {
    const cy = FIRST_SLICE_Y + i * SLICE_STEP;
    const col = VARS_16[i].col;
    const g = mk('g', {}, envSlicesG);
    mk('polygon', {
      points: `120,${cy} 410,${cy + 48} 660,${cy} 370,${cy - 48}`,
      fill: col,
      'fill-opacity': 0.27,
      stroke: col,
      'stroke-width': 2.2,
    }, g);
    gsap.set(g, { autoAlpha: 0 });
    envSliceEls[i] = g;
  }
  for (let i = 0; i < 16; i++) {
    const cy = FIRST_SLICE_Y + i * SLICE_STEP;
    const h = mk('circle', {
      cx: 390, cy, r: 6,
      fill: VARS_16[i].col, stroke: '#ffffff', 'stroke-width': 1.8,
    }, hitsCenterG);
    gsap.set(h, { scale: 0, transformOrigin: '50% 50%' });
    hitCenterEls[i] = h;
  }

  // Lista ampla das 16 variáveis para auditório (Slide 24: 2 colunas x 8 linhas, fonte grande e legível)
  const varItemEls = VARS_16.map((v, i) => makeEnvironmentalVariable(varItemsG, v, i));

  // Tabelinha abstrata de 1 único ponto (Slide 26 - posicionada abaixo do texto sem qualquer sobreposição)
  const tableSingleG = $('#tableSingleG');
  const singleColWidths = [96, 78, ...Array(16).fill(48)]; // total = 942 px (de x=810 a x=1752)
  const singleHeaders = ['ID', 'LAI', ...VARS_16.map((_, i) => `V${i + 1}`)];
  const singleCells = [];
  {
    const tx0 = 810, ty0 = 515, rowH = 58;
    // Linha conectora sutil do stack até a tabelinha
    mk('path', {
      d: `M 390,520 L 750,520 L 795,${ty0 + 36 + rowH / 2}`,
      fill: 'none', stroke: '#ffd76e', 'stroke-width': 2.2, 'stroke-dasharray': '7 6', opacity: 0.75,
    }, tableSingleG);
    mk('line', { x1: tx0, y1: ty0 + 36, x2: tx0 + 942, y2: ty0 + 36, stroke: 'rgba(255,255,255,.38)', 'stroke-width': 2 }, tableSingleG);
    mk('line', { x1: tx0, y1: ty0 + 36 + rowH, x2: tx0 + 942, y2: ty0 + 36 + rowH, stroke: 'rgba(255,255,255,.24)', 'stroke-width': 1.5 }, tableSingleG);
    let cx = tx0;
    singleHeaders.forEach((h, idx) => {
      const w = singleColWidths[idx];
      const th = mk('text', {
        x: cx + w / 2, y: ty0 + 24,
        'text-anchor': 'middle',
        fill: idx < 2 ? '#ffd76e' : 'rgba(253,248,236,.82)',
        'font-family': 'Outfit, sans-serif',
        'font-size': idx < 2 ? 22 : 18,
        'font-weight': 600,
      }, tableSingleG);
      th.textContent = h;

      const cellG = mk('g', {}, tableSingleG);
      const cy = ty0 + 36 + rowH / 2;
      if (idx === 0) {
        mk('circle', { cx: cx + 24, cy, r: 7, fill: '#9dff7a', stroke: '#fff', 'stroke-width': 1.5 }, cellG);
        mk('rect', { x: cx + 38, y: cy - 6.5, width: 42, height: 13, rx: 6.5, fill: 'rgba(253,248,236,.78)' }, cellG);
      } else if (idx === 1) {
        mk('rect', { x: cx + 12, y: cy - 8, width: w - 24, height: 16, rx: 8, fill: '#9dff7a' }, cellG);
      } else {
        const col = VARS_16[idx - 2].col;
        mk('rect', { x: cx + 7, y: cy - 7, width: w - 14, height: 14, rx: 5, fill: col, opacity: 0.92 }, cellG);
      }
      gsap.set(cellG, { scale: 0, transformOrigin: '50% 50%' });
      singleCells.push(cellG);
      cx += w;
    });
  }

  // Slide 27: Múltiplos mini-transectos separados no topo (1 ponto por transecto!) atravessando as 16 camadas
  const multiTransectosG = $('#multiTransectosG');
  const multiRaysG = $('#multiRaysG');
  const multiHeaderLbl = mk('text', {
    x: 390, y: 76, 'text-anchor': 'middle', class: 'svgMid gold',
  }, multiTransectosG);
  multiHeaderLbl.textContent = '742 Transectos (1 ponto cada)';
  gsap.set(multiHeaderLbl, { autoAlpha: 0 });

  // 6 mini-transectos distintos distribuídos no plano superior (cada um com seu próprio retângulo e 1 único ponto central)
  const miniTransectCenters = [
    [225, 145], [335, 122], [445, 122],
    [290, 168], [410, 168], [545, 145],
  ];
  const miniTransectEls = [];
  const multiRayEls = [];
  miniTransectCenters.forEach(([px, py]) => {
    const rLine = mk('line', {
      x1: px, y1: py, x2: px, y2: 775,
      stroke: '#ffd76e', 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: 0.65,
    }, multiRaysG);
    gsap.set(rLine, { scaleY: 0, transformOrigin: '50% 0%' });
    multiRayEls.push(rLine);

    // Mini-retângulo isométrico representando 1 transecto individual + 1 ponto no seu centro
    const tg = mk('g', {}, multiTransectosG);
    mk('polygon', {
      points: `${px - 44},${py} ${px + 4},${py + 14} ${px + 44},${py} ${px - 4},${py - 14}`,
      fill: 'rgba(26, 82, 46, 0.92)', stroke: '#9dff7a', 'stroke-width': 2.2,
    }, tg);
    mk('circle', {
      cx: px, cy: py, r: 6.5, fill: '#9dff7a', stroke: '#ffffff', 'stroke-width': 1.8,
    }, tg);
    gsap.set(tg, { scale: 0, transformOrigin: `${px}px ${py}px` });
    miniTransectEls.push(tg);
  });

  // Tabela abstrata completa (Slide 27: posicionada em ty0=495, bem abaixo do texto sem sobrepor)
  const tableFullG = $('#tableFullG');
  const fullRowEls = [];
  {
    const tx0 = 810, ty0 = 495, rowH = 40, nRows = 8;
    mk('line', { x1: tx0, y1: ty0 + 34, x2: tx0 + 942, y2: ty0 + 34, stroke: 'rgba(255,255,255,.4)', 'stroke-width': 2 }, tableFullG);
    let cx = tx0;
    singleHeaders.forEach((h, idx) => {
      const w = singleColWidths[idx];
      const th = mk('text', {
        x: cx + w / 2, y: ty0 + 22,
        'text-anchor': 'middle',
        fill: idx < 2 ? '#ffd76e' : 'rgba(253,248,236,.82)',
        'font-family': 'Outfit, sans-serif',
        'font-size': idx < 2 ? 21 : 17,
        'font-weight': 600,
      }, tableFullG);
      th.textContent = h;
      cx += w;
    });

    for (let r = 0; r < nRows; r++) {
      const ry = ty0 + 34 + r * rowH;
      const rowG = mk('g', {}, tableFullG);
      mk('line', {
        x1: tx0, y1: ry + rowH, x2: tx0 + 942, y2: ry + rowH,
        stroke: 'rgba(255,255,255,.14)', 'stroke-width': 1,
      }, rowG);

      const cy = ry + rowH / 2;
      if (r === nRows - 2) {
        const dots = mk('text', {
          x: tx0 + 471, y: cy + 7,
          'text-anchor': 'middle', fill: 'rgba(253,248,236,.6)',
          'font-family': 'Outfit, sans-serif', 'font-size': 24, 'letter-spacing': '0.4em',
        }, rowG);
        dots.textContent = '• • •';
      } else {
        let rcx = tx0;
        singleHeaders.forEach((_, idx) => {
          const w = singleColWidths[idx];
          if (idx === 0) {
            mk('circle', { cx: rcx + 22, cy, r: 5.5, fill: '#9dff7a', stroke: '#fff', 'stroke-width': 1.2 }, rowG);
            mk('rect', { x: rcx + 36, y: cy - 5, width: 44, height: 10, rx: 5, fill: 'rgba(253,248,236,.74)' }, rowG);
          } else if (idx === 1) {
            const bw = (w - 22) * (0.55 + ((r * 37) % 45) / 100);
            mk('rect', { x: rcx + 11, y: cy - 6, width: bw, height: 12, rx: 6, fill: '#9dff7a' }, rowG);
          } else {
            const col = VARS_16[idx - 2].col;
            const bw = (w - 12) * (0.45 + (((r + 3) * (idx + 5) * 19) % 55) / 100);
            mk('rect', {
              x: rcx + 6, y: cy - 5.5, width: bw, height: 11, rx: 4,
              fill: col, opacity: 0.68 + (((r + idx) % 4) * 0.08),
            }, rowG);
          }
          rcx += w;
        });
      }
      gsap.set(rowG, { autoAlpha: 0, y: -10 });
      fullRowEls.push(rowG);
    }
  }

  /* ================= PARTE 08: ANIMAÇÃO DIDÁTICA E CLARA DO RANDOM FOREST (SLIDE 28 + 29) ================= */
  const rfAnimScene = $('#rfAnimScene');
  const rfTreesWrapG = mk('g', {}, rfAnimScene);
  const rfTopBadgeG = mk('g', { class: 'rfInputTable' }, rfTreesWrapG);
  const rfInCurves = [];
  const rfTreeCards = [];
  const rfTreeHeaders = [];
  const rfLvl1Branches = [];
  const rfLvl2Branches = [];
  const rfRootNodes = [];
  const rfLvl1Nodes = [];
  const rfLeafNodes = [];
  const rfActiveSeg1 = [];
  const rfActiveSeg2 = [];
  const rfOrbs = [];
  const rfActiveLeaves = [];
  const rfPredBadges = [];
  const rfOutCurves = [];
  const rfFinalNodeG = mk('g', { class: 'rfResultPanel' }, rfAnimScene);

  {
    // 1. Tabelinha abstrata no topo central (x: 760..1160, y: 74..218 — longe do título #h8 à esquerda!)
    const tx = 760, ty = 74, tw = 400, th = 144;
    mk('rect', {
      x: tx, y: ty, width: tw, height: th, rx: 14,
      fill: 'rgba(11, 33, 24, .88)', stroke: 'rgba(154, 209, 106, .65)', 'stroke-width': 2.2,
    }, rfTopBadgeG);
    mk('line', { x1: tx + 16, y1: ty + 32, x2: tx + tw - 16, y2: ty + 32, stroke: 'rgba(255,255,255,.25)', 'stroke-width': 1.5 }, rfTopBadgeG);
    const thTxt = mk('text', {
      x: tx + tw / 2, y: ty + 22, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Outfit, sans-serif', 'font-size': 16, 'font-weight': 600,
    }, rfTopBadgeG);
    thTxt.textContent = 'TABELA:  ID  ·  LAI  ·  V1 … V16  (742 × 16)';

    for (let r = 0; r < 4; r++) {
      const ry = ty + 50 + r * 24;
      mk('circle', { cx: tx + 26, cy: ry, r: 4.5, fill: '#9dff7a' }, rfTopBadgeG);
      mk('rect', { x: tx + 38, y: ry - 4.5, width: 24, height: 9, rx: 4.5, fill: 'rgba(253,248,236,.72)' }, rfTopBadgeG);
      mk('rect', { x: tx + 72, y: ry - 4.5, width: 32, height: 9, rx: 4.5, fill: '#9dff7a', opacity: 0.9 }, rfTopBadgeG);
      for (let c = 0; c < 8; c++) {
        const col = VARS_16[(r * 3 + c) % 16].col;
        mk('rect', { x: tx + 116 + c * 33, y: ry - 4.5, width: 24, height: 9, rx: 3.5, fill: col, opacity: 0.88 }, rfTopBadgeG);
      }
    }
    gsap.set(rfTopBadgeG, { autoAlpha: 0, y: -14 });

    // 2. Três Árvores de Decisão bem espaçosas (ocupando confortavelmente a tela até y = 850)
    const treeSpecs = [
      {
        cx: 340, title: 'Árvore 1', sub: 'Amostra 1 de dados e variáveis',
        rootVar: 'Precipitação > 2.100?', l1LeftVar: 'fAPAR > 0,7?', l1RightVar: 'Elevação > 200?',
        dir1: -1, leafIdx: 1,
        leafVals: ['3,8', '4,7', '4,2', '5,0'],
        pred: 'LAI₁ = 4,7', valStr: '4,7',
      },
      {
        cx: 960, title: 'Árvore 2', sub: 'Amostra 2 de dados e variáveis',
        rootVar: 'Evapotransp. > 1.300?', l1LeftVar: 'Temp. > 26°C?', l1RightVar: 'Água Solo > 30%?',
        dir1: 1, leafIdx: 2,
        leafVals: ['3,9', '4,4', '5,1', '4,5'],
        pred: 'LAI₂ = 5,1', valStr: '5,1',
      },
      {
        cx: 1580, title: 'Árvore N', sub: 'Amostra N de dados e variáveis',
        rootVar: 'Elevação < 250 m?', l1LeftVar: 'Vento < 2 m/s?', l1RightVar: 'Sazonal. < 55?',
        dir1: -1, leafIdx: 0,
        leafVals: ['4,6', '3,7', '4,1', '4,9'],
        pred: 'LAIₙ = 4,6', valStr: '4,6',
      },
    ];

    const rootY = 425, lvl1Y = 560, lvl2Y = 695, predY = 805;
    const sCurve = (x1, y1, x2, y2) => {
      const my = (y1 + y2) / 2;
      return `M ${x1},${y1} C ${x1},${my} ${x2},${my} ${x2},${y2}`;
    };

    // Reticências elegantes entre Árvore 2 e Árvore N
    const ellip = mk('text', {
      x: 1270, y: 565, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Outfit, sans-serif', 'font-size': 44, 'font-weight': 700, 'letter-spacing': '0.16em',
    }, rfTreesWrapG);
    ellip.textContent = '•••';
    gsap.set(ellip, { autoAlpha: 0 });
    rfTreeHeaders.push(ellip);

    treeSpecs.forEach((sp, idx) => {
      // Card de fundo discreto para organizar visualmente cada Árvore e sua predição individual
      const card = mk('rect', {
        x: sp.cx - 245, y: 280, width: 490, height: 575, rx: 24,
        fill: 'rgba(12, 32, 46, .52)', stroke: 'rgba(154, 209, 106, .26)', 'stroke-width': 2,
      }, rfTreesWrapG);
      gsap.set(card, { autoAlpha: 0 });
      rfTreeCards.push(card);

      // Curva limpa descendo da base da tabelinha (y=218) até o topo do card de cada árvore (y=280)
      const startX = 960 + (idx - 1) * 125;
      const inCurve = mk('path', {
        d: sCurve(startX, 218, sp.cx, 280),
        fill: 'none', stroke: '#9ad16a', 'stroke-width': 2.8, 'stroke-dasharray': '8 6', opacity: 0.78, pathLength: 1,
      }, rfTreesWrapG);
      gsap.set(inCurve, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
      rfInCurves.push(inCurve);

      // Cabeçalho de cada Árvore
      const hg = mk('g', {}, rfTreesWrapG);
      const tLbl = mk('text', {
        x: sp.cx, y: 332, 'text-anchor': 'middle',
        fill: '#ffd76e', 'font-family': 'Fraunces, serif', 'font-size': 33, 'font-weight': 600,
      }, hg);
      tLbl.textContent = sp.title;
      const sLbl = mk('text', {
        x: sp.cx, y: 364, 'text-anchor': 'middle',
        fill: 'rgba(253,248,236,.72)', 'font-family': 'Outfit, sans-serif', 'font-size': 18,
      }, hg);
      sLbl.textContent = sp.sub;
      gsap.set(hg, { autoAlpha: 0, y: -8 });
      rfTreeHeaders.push(hg);

      const l1LeftX = sp.cx - 118, l1RightX = sp.cx + 118;
      const leafXs = [sp.cx - 178, sp.cx - 60, sp.cx + 60, sp.cx + 178];

      // Galhos curvos de Nível 1 (Raiz -> Nível 1)
      [l1LeftX, l1RightX].forEach((lx) => {
        const p = mk('path', {
          d: sCurve(sp.cx, rootY, lx, lvl1Y),
          fill: 'none', stroke: 'rgba(154, 209, 106, .35)', 'stroke-width': 3.8, pathLength: 1, class: 'rfBranch',
        }, rfTreesWrapG);
        gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 });
        rfLvl1Branches.push(p);
      });

      // Galhos curvos de Nível 2 (Nível 1 -> 4 Folhas)
      [
        [l1LeftX, leafXs[0]], [l1LeftX, leafXs[1]],
        [l1RightX, leafXs[2]], [l1RightX, leafXs[3]],
      ].forEach(([x1, x2]) => {
        const p = mk('path', {
          d: sCurve(x1, lvl1Y, x2, lvl2Y),
          fill: 'none', stroke: 'rgba(154, 209, 106, .32)', 'stroke-width': 3.5, pathLength: 1, class: 'rfBranch',
        }, rfTreesWrapG);
        gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 });
        rfLvl2Branches.push(p);
      });

      // Caminhos de decisão ativos (em 2 segmentos curvos para iluminar passo a passo!)
      const chosenL1X = sp.dir1 < 0 ? l1LeftX : l1RightX;
      const chosenLeafX = leafXs[sp.leafIdx];
      const seg1 = mk('path', {
        d: sCurve(sp.cx, rootY, chosenL1X, lvl1Y), class: 'rfDecisionPath',
        fill: 'none', stroke: '#ffd76e', 'stroke-width': 6.5, 'stroke-linecap': 'round',
        filter: 'url(#glowSm)', pathLength: 1,
      }, rfTreesWrapG);
      const seg2 = mk('path', {
        d: sCurve(chosenL1X, lvl1Y, chosenLeafX, lvl2Y), class: 'rfDecisionPath',
        fill: 'none', stroke: '#ffd76e', 'stroke-width': 6.5, 'stroke-linecap': 'round',
        filter: 'url(#glowSm)', pathLength: 1,
      }, rfTreesWrapG);
      gsap.set([seg1, seg2], { strokeDasharray: 1, strokeDashoffset: 1 });
      rfActiveSeg1.push(seg1);
      rfActiveSeg2.push(seg2);

      // Nó Raiz (com pergunta de divisão — esmaece suavemente)
      const rNode = mk('g', { class: 'rfQuestion rfQuestionActive' }, rfTreesWrapG);
      mk('rect', {
        x: sp.cx - 114, y: rootY - 23, width: 228, height: 46, rx: 23,
        fill: '#133824', stroke: '#ffd76e', 'stroke-width': 2.8,
      }, rNode);
      const rTxt = mk('text', {
        x: sp.cx, y: rootY + 7, 'text-anchor': 'middle',
        fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 19, 'font-weight': 600,
      }, rNode);
      rTxt.textContent = sp.rootVar;
      gsap.set(rNode, { autoAlpha: 0, y: 6 });
      rfRootNodes.push(rNode);

      // Nós de Nível 1 (com pergunta de divisão — esmaecem suavemente)
      [
        { x: l1LeftX, lbl: sp.l1LeftVar, active: sp.dir1 < 0 },
        { x: l1RightX, lbl: sp.l1RightVar, active: sp.dir1 > 0 },
      ].forEach((nd) => {
        const ng = mk('g', { class: `rfQuestion${nd.active ? ' rfQuestionActive' : ''}` }, rfTreesWrapG);
        mk('rect', {
          x: nd.x - 88, y: lvl1Y - 21, width: 176, height: 42, rx: 21,
          fill: nd.active ? '#1d4d30' : '#0f281b',
          stroke: nd.active ? '#ffd76e' : 'rgba(154,209,106,.45)',
          'stroke-width': nd.active ? 2.6 : 1.8,
        }, ng);
        const nt = mk('text', {
          x: nd.x, y: lvl1Y + 6, 'text-anchor': 'middle',
          fill: nd.active ? '#ffd76e' : 'rgba(253,248,236,.72)',
          'font-family': 'Outfit, sans-serif', 'font-size': 17.5, 'font-weight': 600,
        }, ng);
        nt.textContent = nd.lbl;
        gsap.set(ng, { autoAlpha: 0, y: 6 });
        rfLvl1Nodes.push(ng);
      });

      // 4 Nós Folha (Nível 2 — cada folha mostra um valor possível de LAI!)
      leafXs.forEach((lx, lIdx) => {
        const lg = mk('g', { class: 'rfLeafNode' }, rfTreesWrapG);
        mk('rect', {
          x: lx - 46, y: lvl2Y - 20, width: 92, height: 40, rx: 20,
          fill: '#102b1d', stroke: 'rgba(154,209,106,.55)', 'stroke-width': 2,
        }, lg);
        const lt = mk('text', {
          x: lx, y: lvl2Y + 7, 'text-anchor': 'middle',
          fill: 'rgba(253,248,236,.75)', 'font-family': 'Outfit, sans-serif', 'font-size': 19, 'font-weight': 600,
        }, lg);
        lt.textContent = sp.leafVals[lIdx];
        gsap.set(lg, { autoAlpha: 0 });
        rfLeafNodes.push(lg);
      });

      // Folha escolhida iluminada em destaque verde-esmeralda com seu valor de LAI
      const actLeafG = mk('g', { class: 'rfChosenLeaf' }, rfTreesWrapG);
      mk('rect', {
        x: chosenLeafX - 50, y: lvl2Y - 23, width: 100, height: 46, rx: 23,
        fill: '#9dff7a', stroke: '#ffffff', 'stroke-width': 3, filter: 'url(#glowSm)',
      }, actLeafG);
      const actTxt = mk('text', {
        x: chosenLeafX, y: lvl2Y + 8, 'text-anchor': 'middle',
        fill: '#082213', 'font-family': 'Outfit, sans-serif', 'font-size': 22, 'font-weight': 800,
      }, actLeafG);
      actTxt.textContent = sp.valStr;
      gsap.set(actLeafG, { autoAlpha: 0 });
      rfActiveLeaves.push(actLeafG);

      // Orbe luminoso que viaja pela árvore tomando as decisões
      const orb = mk('circle', {
        cx: sp.cx, cy: rootY, r: 12, fill: '#ffd76e', stroke: '#fff', 'stroke-width': 2.5, filter: 'url(#glow)',
      }, rfTreesWrapG);
      gsap.set(orb, { autoAlpha: 0 });
      orb._x0 = sp.cx; orb._y0 = rootY;
      orb._x1 = chosenL1X; orb._y1 = lvl1Y;
      orb._x2 = chosenLeafX; orb._y2 = lvl2Y;
      rfOrbs.push(orb);

      // Resultado individual centralizado na base do card de cada árvore (LAI₁ = 4,7 | LAI₂ = 5,1 | LAIₙ = 4,6)
      // Fica em rfAnimScene para permanecer visível quando as árvores recuam no clique seguinte!
      const pBadge = mk('g', { class: 'rfPredictionBadge' }, rfAnimScene);
      const pStem = mk('path', {
        d: sCurve(chosenLeafX, lvl2Y + 23, sp.cx, predY - 26),
        fill: 'none', stroke: '#9dff7a', 'stroke-width': 3, 'stroke-dasharray': '6 4',
      }, pBadge);
      const pPillG = mk('g', { class: 'rfPredictionPill' }, pBadge);
      mk('rect', {
        x: sp.cx - 115, y: predY - 25, width: 230, height: 50, rx: 25,
        fill: 'rgba(18, 58, 34, .96)', stroke: '#9dff7a', 'stroke-width': 2.8, filter: 'url(#glowSm)',
      }, pPillG);
      const pTxt = mk('text', {
        x: sp.cx, y: predY + 8, 'text-anchor': 'middle',
        fill: '#9dff7a', 'font-family': 'Outfit, sans-serif', 'font-size': 25, 'font-weight': 700,
      }, pPillG);
      pTxt.textContent = sp.pred;
      gsap.set(pBadge, { autoAlpha: 0, y: 6 });
      pBadge._stem = pStem;
      pBadge._pill = pPillG;
      rfPredBadges.push(pBadge);

      // Curva no próximo clique conectando cada predição elevada (y=265) ao grande Painel Central de Resultado (y=415)
      const endX = 960 + (idx - 1) * 320;
      const outCurve = mk('path', {
        d: sCurve(sp.cx, 265, endX, 415),
        fill: 'none', stroke: '#9dff7a', 'stroke-width': 4, 'stroke-dasharray': '10 7', pathLength: 1,
      }, rfAnimScene);
      gsap.set(outCurve, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
      rfOutCurves.push(outCurve);
    });

    // 3. NOVO CLIQUE: Painel Grande e Expandido mais abaixo (x: 160..1760, y: 415..985) aproveitando o tamanho total
    mk('rect', {
      x: 160, y: 415, width: 1600, height: 570, rx: 34,
      fill: 'rgba(10, 32, 24, .95)', stroke: '#ffd76e', 'stroke-width': 4, filter: 'url(#glowSm)',
    }, rfFinalNodeG);

    const fHeader = mk('text', {
      x: 960, y: 495, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Fraunces, serif', 'font-size': 38, 'font-weight': 600,
    }, rfFinalNodeG);
    fHeader.textContent = 'Resultado do Random Forest: Média de Todas as Árvores';

    const fSub = mk('text', {
      x: 960, y: 545, 'text-anchor': 'middle',
      fill: 'rgba(253,248,236,.86)', 'font-family': 'Outfit, sans-serif', 'font-size': 26,
    }, rfFinalNodeG);
    fSub.textContent = 'As predições individuais de centenas de árvores são combinadas em uma única estimativa final:';

    // Equação ampla e super legível no centro do card (y = 735)
    const eqY = 735;
    const pillData = [
      { x: 350, txt: '4,7', sub: 'Árvore 1' },
      { x: 560, txt: '5,1', sub: 'Árvore 2' },
      { x: 870, txt: '4,6', sub: 'Árvore N' },
    ];
    pillData.forEach((pd) => {
      mk('rect', {
        x: pd.x - 74, y: eqY - 76, width: 148, height: 70, rx: 35,
        fill: 'rgba(157, 255, 122, .16)', stroke: '#9dff7a', 'stroke-width': 3.2,
      }, rfFinalNodeG);
      const pt = mk('text', {
        x: pd.x, y: eqY - 28, 'text-anchor': 'middle',
        fill: '#9dff7a', 'font-family': 'Outfit, sans-serif', 'font-size': 38, 'font-weight': 700,
      }, rfFinalNodeG);
      pt.textContent = pd.txt;
      const st = mk('text', {
        x: pd.x, y: eqY - 94, 'text-anchor': 'middle',
        fill: 'rgba(253,248,236,.72)', 'font-family': 'Outfit, sans-serif', 'font-size': 20, 'font-weight': 600,
      }, rfFinalNodeG);
      st.textContent = pd.sub;
    });

    const plus1 = mk('text', { x: 455, y: eqY - 26, 'text-anchor': 'middle', fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 40, 'font-weight': 700 }, rfFinalNodeG);
    plus1.textContent = '+';
    const plus2 = mk('text', { x: 715, y: eqY - 26, 'text-anchor': 'middle', fill: '#ffd76e', 'font-family': 'Outfit, sans-serif', 'font-size': 36, 'font-weight': 700 }, rfFinalNodeG);
    plus2.textContent = '+   •••   +';

    // Barra de fração ampla
    mk('line', { x1: 260, y1: eqY + 22, x2: 960, y2: eqY + 22, stroke: 'rgba(253,248,236,.88)', 'stroke-width': 4.5 }, rfFinalNodeG);
    const denom = mk('text', {
      x: 610, y: eqY + 76, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Outfit, sans-serif', 'font-size': 33, 'font-weight': 700,
    }, rfFinalNodeG);
    denom.textContent = 'N árvores da floresta';

    // Sinal de Igualdade Grande
    const eqSign = mk('text', {
      x: 1035, y: eqY + 30, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Fraunces, serif', 'font-size': 62, 'font-weight': 700,
    }, rfFinalNodeG);
    eqSign.textContent = '=';

    // Card Destaque Final à Direita: LAI Estimado = 4,8
    mk('rect', {
      x: 1105, y: eqY - 96, width: 575, height: 215, rx: 32,
      fill: 'rgba(157, 255, 122, .18)', stroke: '#9dff7a', 'stroke-width': 4, filter: 'url(#glowSm)',
    }, rfFinalNodeG);
    const resLbl = mk('text', {
      x: 1392, y: eqY - 32, 'text-anchor': 'middle',
      fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 26, 'font-weight': 700, 'letter-spacing': '0.08em',
    }, rfFinalNodeG);
    resLbl.textContent = 'VALOR FINAL PREDITO';
    const resVal = mk('text', {
      x: 1392, y: eqY + 44, 'text-anchor': 'middle',
      fill: '#9dff7a', 'font-family': 'Fraunces, serif', 'font-size': 62, 'font-weight': 700,
    }, rfFinalNodeG);
    resVal.textContent = 'LAI = 4,8';
    const resUnit = mk('text', {
      x: 1392, y: eqY + 88, 'text-anchor': 'middle',
      fill: 'rgba(253,248,236,.85)', 'font-family': 'Outfit, sans-serif', 'font-size': 24,
    }, rfFinalNodeG);
    resUnit.textContent = 'm² de folha / m² de solo';

    gsap.set(rfFinalNodeG, { autoAlpha: 0, scale: 0.9, transformOrigin: '960px 700px' });
  }

  /* ================= PARTE 09: IMPORTÂNCIA DAS VARIÁVEIS, LAI OBSERVADO E DESEMPENHO (SLIDES 30, 31 E 32) ================= */
  const rfImpScene = $('#rfImpScene');
  const TOP5_VARS = [
    { rank: '1º', name: 'Precipitação Anual', cat: 'Clima · Água', val: 37.81, col: '#9dff7a' },
    { rank: '2º', name: 'Evapotranspiração Potencial', cat: 'Clima · Energia', val: 37.53, col: '#38d9a9' },
    { rank: '3º', name: 'Elevação', cat: 'Topografia · Relevo', val: 30.65, col: '#ffd76e' },
    { rank: '4º', name: 'Velocidade do Vento Zonal Absoluta', cat: 'Circulação Atmosférica', val: 29.76, col: '#5ec8f8' },
    { rank: '5º', name: 'Sazonalidade da Precipitação', cat: 'Regime Hídrico', val: 27.86, col: '#f79d65' },
  ];
  const impPanelG = mk('g', {}, rfImpScene);
  const impRowGroups = [];
  const impBarEls = [];
  const impValTxts = [];
  {
    const barX0 = 830, maxBarW = 760, maxVal = 40;
    TOP5_VARS.forEach((it, i) => {
      const ry = 315 + i * 145;
      const rg = mk('g', {}, rfImpScene);
      const isTop2 = i < 2;

      // Rank badge sem fundo preto
      mk('rect', {
        x: 115, y: ry - 32, width: 74, height: 60, rx: 16,
        fill: 'rgba(255, 255, 255, .10)', stroke: it.col, 'stroke-width': 3,
      }, rg);
      const rTxt = mk('text', {
        x: 152, y: ry + 9, 'text-anchor': 'middle',
        fill: it.col, 'font-family': 'Fraunces, serif', 'font-size': 30, 'font-weight': 700,
      }, rg);
      rTxt.textContent = it.rank;

      // Nome da variável e categoria ecológica
      const nTxt = mk('text', {
        x: 215, y: ry - 2,
        fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 35, 'font-weight': 700,
      }, rg);
      nTxt.textContent = it.name;

      const cTxt = mk('text', {
        x: 215, y: ry + 30,
        fill: it.col, 'font-family': 'Outfit, sans-serif', 'font-size': 21, 'font-weight': 600,
      }, rg);
      cTxt.textContent = it.cat;

      // Trilha clara sutil da barra (sem fundo preto e sem tracejados verticais)
      mk('rect', {
        x: barX0, y: ry - 24, width: maxBarW, height: 48, rx: 24,
        fill: 'rgba(255, 255, 255, .12)', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 1.5,
      }, rg);

      // Barra animada de importância
      const bw = (it.val / maxVal) * maxBarW;
      const bar = mk('rect', {
        x: barX0, y: ry - 24, width: bw, height: 48, rx: 24,
        fill: it.col, filter: isTop2 ? 'url(#glowSm)' : '',
      }, rg);
      gsap.set(bar, { scaleX: 0, transformOrigin: '0% 50%' });
      impBarEls.push(bar);

      // Valor numérico grande direto à direita da barra
      const vTxt = mk('text', {
        x: barX0 + bw + 32, y: ry + 13,
        fill: it.col, 'font-family': 'Fraunces, serif', 'font-size': 42, 'font-weight': 700,
      }, rg);
      vTxt.textContent = '0,00';
      impValTxts.push({ el: vTxt, target: it.val });

      gsap.set(rg, { autoAlpha: 0, y: 12 });
      impRowGroups.push(rg);
    });
  }

  // Slide 31 (DEDICADO): Valores Observados de LAI (0,39 a 4,61; maior concentração entre 3,0 e 3,75) — SEM TEXTO EXTRA E VISUAL REFINADO!
  const rfObsScene = $('#rfObsScene');
  const obsDistG = mk('g', { class: 'obsDistribution' }, rfObsScene);
  const obsBars = [];
  const obsCurvePath = [];
  const obsConcG = mk('g', { class: 'obsHighlight' }, rfObsScene);
  {
    // Três badges de destaque no topo (Mínimo: 0,39 | Maior Concentração: 3,00 – 3,75 | Máximo: 4,61)
    const topBadges = [
      { cx: 410, lbl: 'VALOR MÍNIMO', val: '0,39 m²/m²', col: '#ffd76e' },
      { cx: 960, lbl: 'MAIOR CONCENTRAÇÃO', val: '3,00 a 3,75 m²/m²', col: '#9dff7a', big: true },
      { cx: 1510, lbl: 'VALOR MÁXIMO', val: '4,61 m²/m²', col: '#ffd76e' },
    ];
    topBadges.forEach((b) => {
      const w = b.big ? 520 : 380;
      mk('rect', {
        x: b.cx - w / 2, y: 215, width: w, height: 112, rx: 24,
        fill: 'rgba(255, 255, 255, .09)', stroke: b.col, 'stroke-width': b.big ? 3.5 : 2.5,
      }, obsDistG);
      const lt = mk('text', {
        x: b.cx, y: 256, 'text-anchor': 'middle',
        fill: 'rgba(253,248,236,.85)', 'font-family': 'Outfit, sans-serif', 'font-size': 20, 'font-weight': 700, 'letter-spacing': '0.08em',
      }, obsDistG);
      lt.textContent = b.lbl;
      const vt = mk('text', {
        x: b.cx, y: 304, 'text-anchor': 'middle',
        fill: b.col, 'font-family': 'Fraunces, serif', 'font-size': b.big ? 38 : 34, 'font-weight': 700,
      }, obsDistG);
      vt.textContent = b.val;
    });

    // Eixo horizontal amplo aproveitando toda a tela (x: 180 a 1740, base y = 855)
    const ax0 = 180, ax1 = 1740, ay = 855;
    const laiToX = (v) => ax0 + ((v - 0.39) / (4.61 - 0.39)) * (ax1 - ax0);
    const x300 = laiToX(3.0), x375 = laiToX(3.75);

    // Barras de histograma estilizadas sob a curva para deixar o gráfico rico e científico
    const binValues = [
      { v: 0.55, h: 18 }, { v: 0.80, h: 28 }, { v: 1.05, h: 42 }, { v: 1.30, h: 58 },
      { v: 1.55, h: 76 }, { v: 1.80, h: 98 }, { v: 2.05, h: 125 }, { v: 2.30, h: 158 },
      { v: 2.55, h: 198 }, { v: 2.80, h: 248 },
      { v: 3.05, h: 335, hi: true }, { v: 3.28, h: 392, hi: true },
      { v: 3.50, h: 410, hi: true }, { v: 3.72, h: 348, hi: true },
      { v: 3.95, h: 215 }, { v: 4.20, h: 112 }, { v: 4.45, h: 46 },
    ];
    binValues.forEach((bn) => {
      const bx = laiToX(bn.v) - 34;
      const br = mk('rect', {
        x: bx, y: ay - bn.h, width: 68, height: bn.h, rx: 10,
        fill: bn.hi ? 'rgba(157, 255, 122, .38)' : 'rgba(94, 200, 248, .22)',
        stroke: bn.hi ? '#9dff7a' : 'rgba(94, 200, 248, .55)',
        'stroke-width': bn.hi ? 2.5 : 1.5, class: `obsBar${bn.hi ? ' obsBarFocus' : ''}`,
      }, obsDistG);
      gsap.set(br, { scaleY: 0, transformOrigin: '50% 100%' });
      obsBars.push(br);
    });

    // Moldura destacada da maior concentração (3,0 a 3,75)
    mk('rect', {
      x: x300 - 12, y: 410, width: (x375 - x300) + 24, height: ay - 410, rx: 18,
      fill: 'rgba(157, 255, 122, .10)', stroke: '#9dff7a', 'stroke-width': 3.5, 'stroke-dasharray': '10 7',
    }, obsConcG);
    const concLbl = mk('text', {
      x: (x300 + x375) / 2, y: 386, 'text-anchor': 'middle',
      fill: '#9dff7a', 'font-family': 'Outfit, sans-serif', 'font-size': 28, 'font-weight': 700,
    }, obsConcG);
    concLbl.textContent = 'Faixa de Maior Concentração (3,00 – 3,75)';
    gsap.set(obsConcG, { autoAlpha: 0 });

    // Curva de densidade suave e elegante passando pelo topo do histograma
    const dCurve = `M ${ax0},${ay} C 520,${ay - 22} 850,${ay - 95} ${x300},${ay - 310} C ${(x300 + x375) / 2},${ay - 465} ${x375 - 25},${ay - 445} ${x375},${ay - 315} C 1510,${ay - 110} 1640,${ay - 30} ${ax1},${ay}`;
    const cFill = mk('path', {
      d: `${dCurve} L ${ax1},${ay} L ${ax0},${ay} Z`,
      fill: 'rgba(94, 200, 248, .16)', class: 'obsDensityFill',
    }, obsDistG);
    const cStroke = mk('path', {
      d: dCurve, fill: 'none', stroke: '#ffd76e', class: 'obsDensityCurve', 'stroke-width': 6.5, filter: 'url(#glowSm)', pathLength: 1,
    }, obsDistG);
    gsap.set(cStroke, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(cFill, { autoAlpha: 0 });
    obsCurvePath.push(cStroke, cFill);

    // Linha de base e marcações grandes para auditório
    mk('line', { x1: ax0, y1: ay, x2: ax1, y2: ay, stroke: '#fdf8ec', 'stroke-width': 4 }, obsDistG);
    [
      { v: 0.39, lbl: '0,39 (Mín)', col: '#ffd76e' },
      { v: 1.5,  lbl: '1,50', col: 'rgba(253,248,236,.9)' },
      { v: 2.3,  lbl: '2,30', col: 'rgba(253,248,236,.9)' },
      { v: 3.0,  lbl: '3,00', col: '#9dff7a' },
      { v: 3.75, lbl: '3,75', col: '#9dff7a' },
      { v: 4.61, lbl: '4,61 (Máx)', col: '#ffd76e' },
    ].forEach((tk) => {
      const tx = laiToX(tk.v);
      mk('line', { x1: tx, y1: ay - 12, x2: tx, y2: ay + 14, stroke: tk.col, 'stroke-width': 3.5 }, obsDistG);
      const tt = mk('text', {
        x: tx, y: ay + 52, 'text-anchor': 'middle',
        fill: tk.col, 'font-family': 'Outfit, sans-serif', 'font-size': 28, 'font-weight': 700,
      }, obsDistG);
      tt.textContent = tk.lbl;
    });

    const xUnit = mk('text', {
      x: (ax0 + ax1) / 2, y: ay + 112, 'text-anchor': 'middle',
      fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 25, 'font-weight': 700, 'letter-spacing': '0.07em',
    }, obsDistG);
    xUnit.textContent = 'ÍNDICE DE ÁREA FOLIAR OBSERVADO — LAI (m²/m²)';

    gsap.set(obsDistG, { autoAlpha: 0, y: 12 });
  }

  // Slide 32 (DEDICADO): Desempenho do Modelo Random Forest (R² = 0,60 | RMSE = 0,44 | MAE = 0,32) — SEM TEXTO EXTRA NO TOPO!
  const rfPerfScene = $('#rfPerfScene');
  const perfCards = [];
  {
    const metrics = [
      { sym: 'R² = 0,60', name: 'Coeficiente de Determinação', desc: '60% da variação do LAI explicada', col: '#9dff7a', cx: 365 },
      { sym: 'RMSE = 0,44', name: 'Erro Quadrático Médio', desc: 'Desvio médio de 0,44 m²/m²', col: '#ffd76e', cx: 960 },
      { sym: 'MAE = 0,32', name: 'Erro Absoluto Médio', desc: 'Erro médio absoluto de 0,32 m²/m²', col: '#5ec8f8', cx: 1555 },
    ];
    metrics.forEach((m) => {
      const cg = mk('g', {}, rfPerfScene);
      // Cards grandes e centralizados verticalmente na tela (sem texto extra no topo e sem fundo preto)
      mk('rect', {
        x: m.cx - 280, y: 310, width: 560, height: 500, rx: 34,
        fill: 'rgba(255, 255, 255, .09)', stroke: m.col, 'stroke-width': 4,
      }, cg);
      mk('line', {
        x1: m.cx - 190, y1: 555, x2: m.cx + 190, y2: 555,
        stroke: 'rgba(255,255,255,.25)', 'stroke-width': 2,
      }, cg);
      const st = mk('text', {
        x: m.cx, y: 475, 'text-anchor': 'middle',
        fill: m.col, 'font-family': 'Fraunces, serif', 'font-size': 86, 'font-weight': 700,
      }, cg);
      st.textContent = m.sym;
      const nt = mk('text', {
        x: m.cx, y: 645, 'text-anchor': 'middle',
        fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 33, 'font-weight': 700,
      }, cg);
      nt.textContent = m.name;
      const dt = mk('text', {
        x: m.cx, y: 715, 'text-anchor': 'middle',
        fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 26, opacity: 0.92,
      }, cg);
      dt.textContent = m.desc;
      gsap.set(cg, { autoAlpha: 0, y: 18 });
      perfCards.push(cg);
    });
  }

  /* ================= PARTE 10: SHAP — TEORIA DOS JOGOS COOPERATIVOS (2 SLIDES DE AUDITÓRIO), PRECIPITAÇÃO ANUAL E GRID DAS 16 VARIÁVEIS ================= */
  // SLIDE 33 (PARTE 1): O que é o SHAP? Jogadores Cooperativos (16 Variáveis) -> Coalizão no Modelo -> Valor de Shapley (φᵢ)
  const shapTheoryScene = $('#shapTheoryScene');
  const shapTheoryHeaders = [];
  const shapPlayerNodes = [];
  const shapPlayerLines = [];
  const shapCoalitionBox = mk('g', {}, shapTheoryScene);
  {
    const col1Title = mk('text', {
      x: 445, y: 235, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Fraunces, serif', 'font-size': 40, 'font-weight': 700,
    }, shapTheoryScene);
    col1Title.textContent = '1. Jogadores (16 Variáveis)';

    const col2Title = mk('text', {
      x: 1415, y: 235, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Fraunces, serif', 'font-size': 40, 'font-weight': 700,
    }, shapTheoryScene);
    col2Title.textContent = '2. Jogo Cooperativo (SHAP)';
    gsap.set([col1Title, col2Title], { autoAlpha: 0, y: 12 });
    shapTheoryHeaders.push(col1Title, col2Title);

    const players = [
      { y: 360, name: 'Precipitação Anual', role: 'JOGADOR 1', col: '#38d9a9' },
      { y: 530, name: 'Evapotranspiração', role: 'JOGADOR 2', col: '#5ec8f8' },
      { y: 700, name: 'Elevação', role: 'JOGADOR 3', col: '#ff5c6c' },
      { y: 870, name: 'Vento', role: 'JOGADOR N', col: '#ffd76e' },
    ];

    const sCurveH = (x1, y1, x2, y2) => {
      const mx = (x1 + x2) / 2;
      return `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    };

    players.forEach((pl) => {
      // Linha curva grossa conectando cada Jogador ao Jogo Cooperativo à direita
      const ln = mk('path', {
        d: sCurveH(795, pl.y, 1025, 615),
        fill: 'none', stroke: pl.col, 'stroke-width': 5.5, 'stroke-dasharray': '12 9', pathLength: 1,
      }, shapTheoryScene);
      gsap.set(ln, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
      shapPlayerLines.push(ln);

      const pg = mk('g', {}, shapTheoryScene);
      mk('rect', {
        x: 95, y: pl.y - 64, width: 700, height: 128, rx: 30,
        fill: 'rgba(255, 255, 255, .10)', stroke: pl.col, 'stroke-width': 3.8,
      }, pg);
      mk('circle', { cx: 165, cy: pl.y, r: 32, fill: pl.col, opacity: 0.25 }, pg);
      mk('circle', { cx: 165, cy: pl.y, r: 15, fill: pl.col }, pg);

      const rt = mk('text', {
        x: 225, y: pl.y - 14,
        fill: pl.col, 'font-family': 'Outfit, sans-serif', 'font-size': 25, 'font-weight': 700, 'letter-spacing': '0.08em',
      }, pg);
      rt.textContent = pl.role;

      const nt = mk('text', {
        x: 225, y: pl.y + 30,
        fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 38, 'font-weight': 700,
      }, pg);
      nt.textContent = pl.name;

      gsap.set(pg, { autoAlpha: 0, x: -28 });
      shapPlayerNodes.push(pg);
    });

    // Grande Card da Coalizão (Jogo Cooperativo) à direita
    mk('rect', {
      x: 1025, y: 295, width: 780, height: 640, rx: 38,
      fill: 'rgba(255, 255, 255, .10)', stroke: '#ffd76e', 'stroke-width': 4.5,
    }, shapCoalitionBox);

    const cMain = mk('text', {
      x: 1415, y: 390, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Fraunces, serif', 'font-size': 48, 'font-weight': 700,
    }, shapCoalitionBox);
    cMain.textContent = 'Coalizão de Variáveis';

    const cDesc1 = mk('text', {
      x: 1415, y: 465, 'text-anchor': 'middle',
      fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 35, 'font-weight': 400,
    }, shapCoalitionBox);
    cDesc1.textContent = 'As variáveis cooperam no modelo';
    const cDesc2 = mk('text', {
      x: 1415, y: 515, 'text-anchor': 'middle',
      fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 35, 'font-weight': 400,
    }, shapCoalitionBox);
    cDesc2.textContent = 'para formar a predição do LAI';

    // Destaque central: Valor de Shapley (φᵢ)
    mk('rect', {
      x: 1090, y: 565, width: 650, height: 155, rx: 28,
      fill: 'rgba(157, 255, 122, .12)', stroke: '#9dff7a', 'stroke-width': 3.5,
    }, shapCoalitionBox);
    const phiTitle = mk('text', {
      x: 1415, y: 630, 'text-anchor': 'middle',
      fill: '#9dff7a', 'font-family': 'Fraunces, serif', 'font-size': 42, 'font-weight': 700,
    }, shapCoalitionBox);
    phiTitle.textContent = 'Valor de Shapley (φᵢ)';
    const phiSub = mk('text', {
      x: 1415, y: 685, 'text-anchor': 'middle',
      fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 31, 'font-weight': 600,
    }, shapCoalitionBox);
    phiSub.textContent = 'Mede o impacto justo de cada jogador';

    // Resultado da Coalizão na base
    mk('rect', {
      x: 1140, y: 760, width: 550, height: 120, rx: 28,
      fill: 'rgba(255, 215, 110, .16)', stroke: '#ffd76e', 'stroke-width': 3.5,
    }, shapCoalitionBox);
    const outTxt = mk('text', {
      x: 1415, y: 835, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Fraunces, serif', 'font-size': 44, 'font-weight': 700,
    }, shapCoalitionBox);
    outTxt.textContent = 'Predição Final: LAI = 4,8';

    gsap.set(shapCoalitionBox, { autoAlpha: 0, scale: 0.92, transformOrigin: '1415px 615px' });
  }

  // SLIDE 34 (PARTE 2): Contribuição de Cada Variável no LAI (Efeito Positivo vs. Negativo em Tamanho Auditório)
  const shapPayoutScene = $('#shapPayoutScene');
  const shapPayoutTopG = mk('g', {}, shapPayoutScene);
  const shapPayoutPanelG = mk('g', {}, shapPayoutScene);
  const shapPayoutBars = [];
  const shapPayoutCards = [];
  {
    // Banner superior: Média Base -> Soma SHAP -> Predição Final
    mk('rect', {
      x: 180, y: 195, width: 1560, height: 96, rx: 28,
      fill: 'rgba(255, 255, 255, .10)', stroke: 'rgba(255, 255, 255, .34)', 'stroke-width': 3,
    }, shapPayoutTopG);
    const eqTxt = mk('text', {
      x: 960, y: 256, 'text-anchor': 'middle',
      fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 38, 'font-weight': 600,
    }, shapPayoutTopG);
    eqTxt.innerHTML = 'Média Base (<tspan fill="#ffd76e" font-weight="700">LAI = 3,7</tspan>)   +   Σ Contribuições SHAP   ➔   Predição Final (<tspan fill="#9dff7a" font-weight="700">LAI = 4,8</tspan>)';
    gsap.set(shapPayoutTopG, { autoAlpha: 0, y: -16 });

    // Painel central amplo de barras divergentes
    mk('rect', {
      x: 115, y: 320, width: 1690, height: 435, rx: 32,
      fill: 'rgba(255, 255, 255, .09)', stroke: 'rgba(255, 255, 255, .28)', 'stroke-width': 3,
    }, shapPayoutPanelG);

    const zeroX = 960;
    const zLbl = mk('text', {
      x: zeroX, y: 368, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Outfit, sans-serif', 'font-size': 28, 'font-weight': 700,
    }, shapPayoutPanelG);
    zLbl.textContent = 'Efeito Neutro (SHAP = 0)';
    mk('line', {
      x1: zeroX, y1: 382, x2: zeroX, y2: 730,
      stroke: '#ffd76e', 'stroke-width': 4, 'stroke-dasharray': '10 8',
    }, shapPayoutPanelG);

    const contribs = [
      { y: 425, name: 'Precipitação Anual', val: '+0,65', w: 420, pos: true },
      { y: 512, name: 'Evapotranspiração', val: '+0,42', w: 280, pos: true },
      { y: 599, name: 'Elevação', val: '−0,28', w: 200, pos: false },
      { y: 686, name: 'Vento', val: '+0,31', w: 215, pos: true },
    ];
    contribs.forEach((cb) => {
      const col = cb.pos ? '#38d9a9' : '#ff5c6c';
      const bx = cb.pos ? zeroX : zeroX - cb.w;
      const bar = mk('rect', {
        x: bx, y: cb.y - 28, width: cb.w, height: 56, rx: 14,
        fill: col,
      }, shapPayoutPanelG);
      gsap.set(bar, { scaleX: 0, transformOrigin: cb.pos ? '0% 50%' : '100% 50%' });
      shapPayoutBars.push(bar);

      const nLbl = mk('text', {
        x: cb.pos ? zeroX - 24 : zeroX + 24, y: cb.y + 12,
        'text-anchor': cb.pos ? 'end' : 'start',
        fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 34, 'font-weight': 700,
      }, shapPayoutPanelG);
      nLbl.textContent = cb.name;

      const vLbl = mk('text', {
        x: cb.pos ? zeroX + cb.w + 20 : zeroX - cb.w - 20, y: cb.y + 13,
        'text-anchor': cb.pos ? 'start' : 'end',
        fill: col, 'font-family': 'Fraunces, serif', 'font-size': 38, 'font-weight': 700,
      }, shapPayoutPanelG);
      vLbl.textContent = cb.val;
    });
    gsap.set(shapPayoutPanelG, { autoAlpha: 0, y: 18 });

    // Dois cards gigantes na base explicando Efeito Positivo vs. Efeito Negativo para o auditório
    const posCardG = mk('g', {}, shapPayoutScene);
    mk('rect', {
      x: 115, y: 785, width: 820, height: 175, rx: 28,
      fill: 'rgba(56, 217, 169, .14)', stroke: '#38d9a9', 'stroke-width': 3.8,
    }, posCardG);
    const pTitle = mk('text', {
      x: 525, y: 855, 'text-anchor': 'middle',
      fill: '#38d9a9', 'font-family': 'Outfit, sans-serif', 'font-size': 38, 'font-weight': 700,
    }, posCardG);
    pTitle.textContent = '▲ SHAP > 0  (Efeito Positivo)';
    const pSub = mk('text', {
      x: 525, y: 915, 'text-anchor': 'middle',
      fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 32, 'font-weight': 500,
    }, posCardG);
    pSub.textContent = 'Aumenta o valor de LAI estimado';

    const negCardG = mk('g', {}, shapPayoutScene);
    mk('rect', {
      x: 985, y: 785, width: 820, height: 175, rx: 28,
      fill: 'rgba(255, 92, 108, .14)', stroke: '#ff5c6c', 'stroke-width': 3.8,
    }, negCardG);
    const nTitle = mk('text', {
      x: 1395, y: 855, 'text-anchor': 'middle',
      fill: '#ff5c6c', 'font-family': 'Outfit, sans-serif', 'font-size': 38, 'font-weight': 700,
    }, negCardG);
    nTitle.textContent = '▼ SHAP < 0  (Efeito Negativo)';
    const nSub = mk('text', {
      x: 1395, y: 915, 'text-anchor': 'middle',
      fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 32, 'font-weight': 500,
    }, negCardG);
    nSub.textContent = 'Reduz o valor de LAI estimado';

    gsap.set([posCardG, negCardG], { autoAlpha: 0, y: 20 });
    shapPayoutCards.push(posCardG, negCardG);
  }

  /* ================= PARTE 10: GRÁFICO REAL DA PRECIPITAÇÃO ANUAL E GRID DAS 16 VARIÁVEIS ================= */
  const shapCurves = window.SHAP_CURVES || [];
  const svgDefs = $('#scene defs');

  // Converte lista de pontos [[x,y], ...] em caminho SVG suavizado (Catmull-Rom -> Cubic Bezier)
  function smoothSvgPath(pts) {
    if (!pts || !pts.length) return '';
    if (pts.length < 3) {
      return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    }
    let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }

  // Escalas exatas (X e Y) extraídas dos gráficos R originais para cada uma das 16 variáveis
  const EXACT_SHAP_AXES = {
    fapar: {
      xt: [{ l: '55', x: 0.096 }, { l: '65', x: 0.372 }, { l: '75', x: 0.650 }, { l: '85', x: 0.928 }],
      yt: [{ l: '0,0', y: 0.2061, z: true }, { l: '-0,1', y: 0.447 }, { l: '-0,2', y: 0.680 }, { l: '-0,3', y: 0.913 }],
    },
    elevation: {
      xt: [{ l: '0', x: 0.045 }, { l: '200', x: 0.340 }, { l: '400', x: 0.635 }, { l: '600', x: 0.930 }],
      yt: [{ l: '0,0', y: 0.1320, z: true }, { l: '-0,1', y: 0.310 }, { l: '-0,3', y: 0.610 }, { l: '-0,5', y: 0.910 }],
    },
    uspeed: {
      xt: [{ l: '1', x: 0.033 }, { l: '2', x: 0.196 }, { l: '3', x: 0.359 }, { l: '4', x: 0.520 }, { l: '5', x: 0.683 }, { l: '6', x: 0.846 }],
      yt: [{ l: '0,05', y: 0.104 }, { l: '0,00', y: 0.2351, z: true }, { l: '-0,10', y: 0.516 }, { l: '-0,25', y: 0.929 }],
    },
    vspeed: {
      xt: [{ l: '1', x: 0.046 }, { l: '2', x: 0.242 }, { l: '3', x: 0.438 }, { l: '4', x: 0.636 }, { l: '5', x: 0.832 }],
      yt: [{ l: '0,02', y: 0.194 }, { l: '0,00', y: 0.3870, z: true }, { l: '-0,02', y: 0.585 }, { l: '-0,06', y: 0.973 }],
    },
    clearDays: {
      xt: [{ l: '40', x: 0.115 }, { l: '80', x: 0.372 }, { l: '120', x: 0.628 }, { l: '160', x: 0.885 }],
      yt: [{ l: '0,00', y: 0.2369, z: true }, { l: '-0,04', y: 0.597 }, { l: '-0,08', y: 0.951 }],
    },
    days20: {
      xt: [{ l: '10', x: 0.055 }, { l: '30', x: 0.350 }, { l: '50', x: 0.645 }, { l: '70', x: 0.940 }],
      yt: [{ l: '0,05', y: 0.080 }, { l: '0,00', y: 0.2712, z: true }, { l: '-0,05', y: 0.490 }, { l: '-0,15', y: 0.910 }],
    },
    lightning: {
      xt: [{ l: '0', x: 0.027 }, { l: '10', x: 0.264 }, { l: '20', x: 0.501 }, { l: '30', x: 0.738 }, { l: '40', x: 0.974 }],
      yt: [{ l: '0,02', y: 0.050 }, { l: '0,00', y: 0.4684, z: true }, { l: '-0,02', y: 0.922 }],
    },
    pannual: {
      xt: [{ l: '1000', x: 0.0275 }, { l: '1500', x: 0.2027 }, { l: '2000', x: 0.3763 }, { l: '2500', x: 0.5515 }, { l: '3000', x: 0.7251 }, { l: '3500', x: 0.9003 }],
      yt: [{ l: '0,1', y: 0.0830 }, { l: '0,0', y: 0.2061, z: true }, { l: '-0,1', y: 0.3463 }, { l: '-0,2', y: 0.4788 }, { l: '-0,3', y: 0.6095 }, { l: '-0,4', y: 0.7420 }, { l: '-0,5', y: 0.8728 }],
    },
    pet: {
      xt: [{ l: '1000', x: 0.017 }, { l: '1200', x: 0.473 }, { l: '1400', x: 0.930 }],
      yt: [{ l: '0,1', y: 0.168 }, { l: '0,0', y: 0.2996, z: true }, { l: '-0,1', y: 0.441 }, { l: '-0,3', y: 0.713 }, { l: '-0,5', y: 0.986 }],
    },
    pseason: {
      xt: [{ l: '20', x: 0.180 }, { l: '40', x: 0.415 }, { l: '60', x: 0.655 }, { l: '80', x: 0.892 }],
      yt: [{ l: '0,10', y: 0.280 }, { l: '0,00', y: 0.5776, z: true }, { l: '-0,10', y: 0.875 }],
    },
    pwettest: {
      xt: [{ l: '250', x: 0.274 }, { l: '350', x: 0.571 }, { l: '450', x: 0.868 }],
      yt: [{ l: '0,00', y: 0.0794, z: true }, { l: '-0,10', y: 0.499 }, { l: '-0,20', y: 0.907 }],
    },
    tannual: {
      xt: [{ l: '23', x: 0.148 }, { l: '25', x: 0.517 }, { l: '27', x: 0.885 }],
      yt: [{ l: '0,00', y: 0.1986, z: true }, { l: '-0,10', y: 0.751 }],
    },
    tseason: {
      xt: [{ l: '4', x: 0.202 }, { l: '6', x: 0.417 }, { l: '8', x: 0.631 }, { l: '10', x: 0.844 }],
      yt: [{ l: '0,00', y: 0.2690, z: true }, { l: '-0,02', y: 0.596 }, { l: '-0,04', y: 0.919 }],
    },
    tmax: {
      xt: [{ l: '31', x: 0.192 }, { l: '33', x: 0.495 }, { l: '35', x: 0.798 }],
      yt: [{ l: '0,00', y: 0.1480, z: true }, { l: '-0,02', y: 0.480 }, { l: '-0,06', y: 0.950 }],
    },
    clayContent: {
      xt: [{ l: '10', x: 0.115 }, { l: '20', x: 0.324 }, { l: '30', x: 0.532 }, { l: '40', x: 0.741 }, { l: '50', x: 0.949 }],
      yt: [{ l: '0,02', y: 0.030 }, { l: '0,00', y: 0.1625, z: true }, { l: '-0,04', y: 0.453 }, { l: '-0,10', y: 0.875 }],
    },
    waterContent: {
      xt: [{ l: '10', x: 0.122 }, { l: '20', x: 0.349 }, { l: '30', x: 0.576 }, { l: '40', x: 0.802 }],
      yt: [{ l: '0,00', y: 0.1227, z: true }, { l: '-0,04', y: 0.563 }, { l: '-0,08', y: 0.991 }],
    },
  };

  // Função auxiliar que constrói um gráfico GAM-SHAP vetorial em fundo branco (tanto em tela cheia quanto no grid 2x2)
  function buildShapPlot(parent, cfg, box) {
    const { x, y, w, h, idPrefix, isLarge } = box;
    const g = mk('g', {}, parent);
    const yZeroPx = y + cfg.y0 * h;
    const y0Pct = clamp(cfg.y0 * 100, 1, 99).toFixed(2) + '%';

    const posCol = '#0ca678';
    const negCol = '#e11d48';

    // Gradiente da linha (Verde/Azul Positivo acima de y=0 | Vermelho Negativo abaixo de y=0)
    const lineGradId = `shapLineGrad_${idPrefix}`;
    const lg = mk('linearGradient', { id: lineGradId, gradientUnits: 'userSpaceOnUse', x1: 0, y1: y, x2: 0, y2: y + h }, svgDefs);
    mk('stop', { offset: '0%', 'stop-color': posCol }, lg);
    mk('stop', { offset: y0Pct, 'stop-color': posCol }, lg);
    mk('stop', { offset: y0Pct, 'stop-color': negCol }, lg);
    mk('stop', { offset: '100%', 'stop-color': negCol }, lg);

    // Gradiente de área sombreada até y=0
    const areaGradId = `shapAreaGrad_${idPrefix}`;
    const ag = mk('linearGradient', { id: areaGradId, gradientUnits: 'userSpaceOnUse', x1: 0, y1: y, x2: 0, y2: y + h }, svgDefs);
    mk('stop', { offset: '0%', 'stop-color': posCol, 'stop-opacity': 0.24 }, ag);
    mk('stop', { offset: y0Pct, 'stop-color': posCol, 'stop-opacity': 0.03 }, ag);
    mk('stop', { offset: y0Pct, 'stop-color': negCol, 'stop-opacity': 0.03 }, ag);
    mk('stop', { offset: '100%', 'stop-color': negCol, 'stop-opacity': 0.24 }, ag);

    if (isLarge) {
      // Fundo branco amplo preenchendo a tela para o Slide 35
      mk('rect', {
        x: 65, y: 158, width: 1790, height: 878, rx: 28,
        fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 3,
      }, g);
    }

    // Moldura interna do gráfico em fundo branco
    mk('rect', {
      x, y, width: w, height: h, rx: isLarge ? 10 : 8,
      fill: '#ffffff',
      stroke: '#1e293b',
      'stroke-width': isLarge ? 3.2 : 2.6,
    }, g);

    const ax = EXACT_SHAP_AXES[cfg.key] || EXACT_SHAP_AXES.pannual;

    // Ticks e linhas horizontais do eixo Y
    ax.yt.forEach((yt) => {
      const ty = y + yt.y * h;
      if (!yt.z) {
        mk('line', {
          x1: x, y1: ty, x2: x + w, y2: ty,
          stroke: '#e2e8f0', 'stroke-width': isLarge ? 1.8 : 1.4,
        }, g);
      }
      mk('line', {
        x1: x - (isLarge ? 14 : 10), y1: ty, x2: x, y2: ty,
        stroke: '#1e293b', 'stroke-width': isLarge ? 2.8 : 2.2,
      }, g);
      const lbl = mk('text', {
        x: x - (isLarge ? 22 : 15), y: ty + (isLarge ? 10 : 7), 'text-anchor': 'end',
        fill: yt.z ? '#0f172a' : '#334155',
        'font-family': 'Outfit, sans-serif',
        'font-size': isLarge ? (yt.z ? 31 : 28) : (yt.z ? 22 : 20),
        'font-weight': yt.z ? 700 : 600,
      }, g);
      lbl.textContent = yt.l;
    });

    // Ticks do eixo X
    ax.xt.forEach((xt) => {
      const tx = x + xt.x * w;
      mk('line', {
        x1: tx, y1: y + h, x2: tx, y2: y + h + (isLarge ? 15 : 10),
        stroke: '#1e293b', 'stroke-width': isLarge ? 2.8 : 2.2,
      }, g);
      const lbl = mk('text', {
        x: tx, y: y + h + (isLarge ? 50 : 34), 'text-anchor': 'middle',
        fill: '#1e293b', 'font-family': 'Outfit, sans-serif',
        'font-size': isLarge ? 30 : 21, 'font-weight': 700,
      }, g);
      lbl.textContent = xt.l;
    });

    if (isLarge) {
      const yTitle = mk('text', {
        x: 112, y: y + h / 2, 'text-anchor': 'middle', transform: `rotate(-90 112 ${y + h / 2})`,
        fill: '#0f172a', 'font-family': 'Outfit, sans-serif', 'font-size': 36, 'font-weight': 700,
      }, g);
      yTitle.textContent = 'Valor SHAP (LAI)';
    }

    const xTitle = mk('text', {
      x: x + w / 2, y: y + h + (isLarge ? 112 : 74), 'text-anchor': 'middle',
      fill: '#0f172a', 'font-family': 'Outfit, sans-serif',
      'font-size': isLarge ? 38 : 26, 'font-weight': 700,
    }, g);
    xTitle.textContent = isLarge ? 'Precipitação Anual (mm)' : cfg.label;

    // Linha horizontal tracejada y = 0,0 (efeito neutro / transição)
    mk('line', {
      x1: x, y1: yZeroPx, x2: x + w, y2: yZeroPx,
      stroke: '#475569',
      'stroke-width': isLarge ? 3.5 : 2.6,
      'stroke-dasharray': isLarge ? '12 9' : '9 7',
    }, g);

    // Pontos reais da planilha e caminho SVG suavizado da curva GAM-SHAP
    const screenPts = cfg.pts.map(([nx, ny]) => [x + nx * w, y + ny * h]);
    const dPath = smoothSvgPath(screenPts);
    const dArea = `${dPath} L ${screenPts[screenPts.length - 1][0].toFixed(1)},${yZeroPx.toFixed(1)} L ${screenPts[0][0].toFixed(1)},${yZeroPx.toFixed(1)} Z`;

    const areaEl = mk('path', { d: dArea, fill: `url(#${areaGradId})` }, g);
    gsap.set(areaEl, { autoAlpha: 0 });

    const curveEl = mk('path', {
      d: dPath, fill: 'none', stroke: `url(#${lineGradId})`,
      'stroke-width': isLarge ? 9 : 6.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }, g);
    const totalLen = curveEl.getTotalLength ? curveEl.getTotalLength() : 2000;
    gsap.set(curveEl, { strokeDasharray: totalLen, strokeDashoffset: totalLen, autoAlpha: 0 });

    // Ponto guia (cursor animado) que percorre a curva enquanto ela é desenhada
    const tracerDot = mk('circle', {
      cx: screenPts[0][0],
      cy: screenPts[0][1],
      r: isLarge ? 11 : 8,
      fill: '#0f172a', stroke: '#ffd76e', 'stroke-width': isLarge ? 4 : 3,
    }, g);
    gsap.set(tracerDot, { autoAlpha: 0 });

    return { group: g, curveEl, areaEl, tracerDot, screenPts, yZeroPx };
  }

  // SLIDE 35: Gráfico Real em Tela Cheia da Precipitação Anual (Fundo Branco + 2 Pontos de Transição)
  const shapSingleScene = $('#shapSingleScene');
  let shapMainPlot = null;
  const shapTransitionEls = [];
  let shapTracerDot = null;
  {
    const pannualCfg = shapCurves.find((c) => c.key === 'pannual') || shapCurves[7];
    if (pannualCfg) {
      const plotBox = {
        x: 240, y: 195, w: 1565, h: 675, idPrefix: 'main_pannual', isLarge: true,
      };
      shapMainPlot = buildShapPlot(shapSingleScene, pannualCfg, plotBox);

      // Cálculo exato dos 2 pontos onde a curva cruza SHAP = 0 (yZeroPx)
      const crossings = [
        { nx: 0.4047, mmLbl: '≈ 2.080 mm', col: '#0ca678', tagOffsetY: -64, tagOffsetX: -95 },
        { nx: 0.8865, mmLbl: '≈ 3.460 mm', col: '#e11d48', tagOffsetY: -64, tagOffsetX: -95 },
      ];

      crossings.forEach((cr) => {
        const cx = plotBox.x + cr.nx * plotBox.w;
        const cy = shapMainPlot.yZeroPx;
        const cg = mk('g', {}, shapMainPlot.group);

        // Linha tracejada vertical do ponto de transição até o eixo X
        const dropLine = mk('line', {
          x1: cx, y1: cy, x2: cx, y2: plotBox.y + plotBox.h,
          stroke: cr.col, 'stroke-width': 3.2, 'stroke-dasharray': '8 7',
        }, cg);
        gsap.set(dropLine, { scaleY: 0, transformOrigin: '50% 0%' });

        // Halo + ponto marcador exatamente sobre o cruzamento na linha 0,0
        const halo = mk('circle', {
          cx, cy, r: 22,
          fill: cr.col, opacity: 0.22,
        }, cg);
        const dot = mk('circle', {
          cx, cy, r: 10,
          fill: '#ffffff', stroke: cr.col, 'stroke-width': 5,
        }, cg);

        // Etiqueta destacando o valor de transição em milímetros
        const badgeG = mk('g', {}, cg);
        const bx = cx + cr.tagOffsetX;
        const by = cy + cr.tagOffsetY;
        mk('rect', {
          x: bx, y: by, width: 190, height: 50, rx: 14,
          fill: '#0f172a', stroke: cr.col, 'stroke-width': 3,
        }, badgeG);
        const bt = mk('text', {
          x: bx + 95, y: by + 33, 'text-anchor': 'middle',
          fill: '#ffffff', 'font-family': 'Outfit, sans-serif', 'font-size': 26, 'font-weight': 700,
        }, badgeG);
        bt.textContent = cr.mmLbl;

        gsap.set([halo, dot], { scale: 0, transformOrigin: `${cx}px ${cy}px` });
        gsap.set(badgeG, { autoAlpha: 0, y: 10 });
        shapTransitionEls.push({ dropLine, halo, dot, badgeG });
      });

      // Ponto guia retornado pelo buildShapPlot
      shapTracerDot = shapMainPlot.tracerDot;
    }
  }

  // Slides 36 a 39: As 16 curvas SHAP divididas em 4 slides amplos (grid 2x2 por slide em fundo branco de auditório, sem pontos de transição)
  const shapGridScene = $('#shapGridScene');
  const shapGridPages = [];
  {
    // Card branco amplo exatamente no mesmo padrão do Slide 35
    mk('rect', {
      x: 65, y: 158, width: 1790, height: 878, rx: 28,
      fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 3,
    }, shapGridScene);

    const gyAxisLbl = mk('text', {
      x: 108, y: 595, 'text-anchor': 'middle', transform: 'rotate(-90 108 595)',
      fill: '#0f172a', 'font-family': 'Outfit, sans-serif', 'font-size': 36, 'font-weight': 700,
    }, shapGridScene);
    gyAxisLbl.textContent = 'Valor SHAP (LAI)';

    const gx0 = 235, gy0 = 190, gw = 715, gh = 315, gapX = 135, gapY = 108;
    for (let p = 0; p < 4; p++) {
      const pageG = mk('g', {}, shapGridScene);
      const plots = [];
      for (let k = 0; k < 4; k++) {
        const idx = p * 4 + k;
        const cfg = shapCurves[idx];
        if (!cfg) continue;
        const r = Math.floor(k / 2), c = k % 2;
        const px = gx0 + c * (gw + gapX);
        const py = gy0 + r * (gh + gapY);
        const sp = buildShapPlot(pageG, cfg, {
          x: px, y: py, w: gw, h: gh, idPrefix: `grid_${idx}`, isLarge: false,
        });
        plots.push(sp);
      }
      gsap.set(pageG, { autoAlpha: 0 });
      shapGridPages.push({ pageG, plots });
    }
  }

  /* ================= PARTE 11: EXTRAPOLAÇÃO ESPACIAL — NOMES VIRANDO CAMADAS DA AMAZÔNIA + PROCESSAMENTO + MAPA FINAL DE LAI ================= */
  const amzPredScene = $('#amzPredScene');
  let amzTopSliceG = null;
  const amzLayerEls = new Array(16);
  const amzVarItemEls = [];
  const amzPredLines = [];
  const amzPredHubG = mk('g', {}, amzPredScene);
  let amzRingOuter = null;
  let amzRingInner = null;
  let amzCorePulse = null;
  let amzPredBarFill = null;
  let amzPredPctTxt = null;
  let amzPredDoneBadge = null;
  const FIRST_AMZ_Y = 430;
  const AMZ_STEP = 18; // 16 camadas bem próximas mostrando apenas uma borda nítida entre elas (y = 372 até y = 582)
  {
    // Define o path oficial da Amazônia em <defs> para reutilizar na pilha de camadas
    if (window.AMZ_PATH) {
      mk('path', { id: 'amzLayerPathDef', d: window.AMZ_PATH }, svgDefs);
    }

    const stackWrapG = mk('g', {}, amzPredScene);

    // Filtro que transforma o raster em silhueta escura (espessura/sombra de cada l?mina)
    const slabF = mk('filter', { id: 'slabShadow', x: '-5%', y: '-5%', width: '110%', height: '110%' }, svgDefs);
    mk('feColorMatrix', { type: 'matrix', values: '0 0 0 0 0.02  0 0 0 0 0.07  0 0 0 0 0.10  0 0 0 1 0' }, slabF);

    // Proje??o isom?trica de cada l?mina (rota??o 30? + achatamento vertical 50%)
    const ISO_S = 0.58, ISO_TH = 0;
    const isoM = [ISO_S * Math.cos(ISO_TH), ISO_S * Math.sin(ISO_TH) * 0.5, -ISO_S * Math.sin(ISO_TH), ISO_S * Math.cos(ISO_TH) * 0.82]
      .map((v) => v.toFixed(4)).join(',');
    const mkSlab = (parent, cy, file) => {
      const g = mk('g', {}, parent);
      mk('g', { transform: 'translate(0, 7)' }, g).appendChild((() => {
        const im = mk('image', {
          href: file, x: 0, y: 0, width: 700, height: 502, filter: 'url(#slabShadow)',
          transform: `translate(380, ${cy}) matrix(${isoM},0,0) translate(-350,-251)`,
        });
        return im;
      })());
      mk('image', {
        href: file, x: 0, y: 0, width: 700, height: 502,
        transform: `translate(380, ${cy}) matrix(${isoM},0,0) translate(-350,-251)`,
      }, g);
      return g;
    };

    // 16 camadas de dados (rasters) empilhadas em perspectiva isom?trica, bem separadas
    for (let i = 15; i >= 0; i--) {
      const lg = mkSlab(stackWrapG, FIRST_AMZ_Y + i * AMZ_STEP, `layers/layer_${i}.png`);
      gsap.set(lg, { autoAlpha: 0 });
      amzLayerEls[i] = lg;
    }

    // Camada de refer?ncia do Bioma Amaz?nia no topo da pilha
    amzTopSliceG = mk('g', {}, stackWrapG);
    mkSlab(amzTopSliceG, 372, 'layers/layer_16.png');
    const topLbl = mk('text', {
      x: 380, y: 382, 'text-anchor': 'middle',
      fill: '#ffffff', 'font-family': 'Outfit, sans-serif', 'font-size': 28, 'font-weight': 700, class: 'rasterLabel',
    }, amzTopSliceG);
    topLbl.textContent = 'Bioma Amaz\u00f4nia';
    gsap.set(amzTopSliceG, { autoAlpha: 0, y: -24 });

    // Lista ampla dos 16 nomes de variáveis à direita (que serão sugados para virar as 16 camadas da Amazônia!)
    const varWrapG = mk('g', {}, amzPredScene);
    VARS_16.forEach((v, i) => {
      amzVarItemEls.push(makeEnvironmentalVariable(varWrapG, v, i));
    });

    // Linhas curvas de fluxo conectando a pilha de camadas da Amazônia ao motor de processamento à direita
    const sCurveH = (x1, y1, x2, y2) => {
      const mx = (x1 + x2) / 2;
      return `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    };
    for (let i = 0; i < 8; i++) {
      const idx = i * 2;
      const sy = FIRST_AMZ_Y + idx * AMZ_STEP;
      const col = VARS_16[idx].col;
      const ln = mk('path', {
        d: sCurveH(690, sy, 935, 540),
        fill: 'none', stroke: col, 'stroke-width': 3.5, 'stroke-dasharray': '10 8', pathLength: 1,
      }, amzPredScene);
      gsap.set(ln, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
      amzPredLines.push(ln);
    }

    // Painel do Motor de Processamento Random Forest à direita
    mk('rect', {
      x: 935, y: 235, width: 845, height: 690, rx: 38,
      fill: 'rgba(255, 255, 255, .09)', stroke: '#ffd76e', 'stroke-width': 4.2,
    }, amzPredHubG);

    const hubTitle = mk('text', {
      x: 1357, y: 315, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Fraunces, serif', 'font-size': 42, 'font-weight': 700,
    }, amzPredHubG);
    hubTitle.textContent = 'Random Forest Treinado';

    const hubSub = mk('text', {
      x: 1357, y: 364, 'text-anchor': 'middle',
      fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 28,
    }, amzPredHubG);
    hubSub.textContent = 'Aplicado às 16 camadas em toda a Amazônia';

    // Símbolo central de Processamento (anéis concêntricos giratórios + núcleo de IA/Árvore)
    const cx = 1357, cy = 535;
    amzCorePulse = mk('circle', {
      cx, cy, r: 132,
      fill: 'rgba(56, 217, 169, .10)',
    }, amzPredHubG);

    amzRingOuter = mk('circle', {
      cx, cy, r: 120,
      fill: 'none', stroke: '#ffd76e', 'stroke-width': 6,
      'stroke-dasharray': '28 16', 'stroke-linecap': 'round',
    }, amzPredHubG);

    amzRingInner = mk('circle', {
      cx, cy, r: 92,
      fill: 'none', stroke: '#38d9a9', 'stroke-width': 5.5,
      'stroke-dasharray': '36 18', 'stroke-linecap': 'round',
    }, amzPredHubG);

    mk('circle', {
      cx, cy, r: 64,
      fill: 'rgba(11, 36, 24, .92)', stroke: '#9dff7a', 'stroke-width': 4,
    }, amzPredHubG);

    // Ícone de árvore/rede dentro do núcleo de processamento
    mk('line', { x1: cx, y1: cy - 26, x2: cx - 22, y2: cy + 12, stroke: '#ffd76e', 'stroke-width': 3.5 }, amzPredHubG);
    mk('line', { x1: cx, y1: cy - 26, x2: cx + 22, y2: cy + 12, stroke: '#ffd76e', 'stroke-width': 3.5 }, amzPredHubG);
    mk('circle', { cx, cy: cy - 26, r: 10, fill: '#ffd76e' }, amzPredHubG);
    mk('circle', { cx: cx - 22, cy: cy + 14, r: 9, fill: '#38d9a9' }, amzPredHubG);
    mk('circle', { cx: cx + 22, cy: cy + 14, r: 9, fill: '#9dff7a' }, amzPredHubG);

    // Barra de Progresso de Processamento
    mk('rect', {
      x: 1027, y: 705, width: 660, height: 64, rx: 20,
      fill: 'rgba(8, 22, 18, .78)', stroke: 'rgba(157, 255, 122, .55)', 'stroke-width': 2.8,
    }, amzPredHubG);

    amzPredBarFill = mk('rect', {
      x: 1033, y: 711, width: 648, height: 52, rx: 15,
      fill: '#20c997', opacity: 0.85,
    }, amzPredHubG);
    gsap.set(amzPredBarFill, { scaleX: 0, transformOrigin: '0% 50%' });

    amzPredPctTxt = mk('text', {
      x: 1357, y: 747, 'text-anchor': 'middle',
      fill: '#ffffff', 'font-family': 'Outfit, sans-serif', 'font-size': 28, 'font-weight': 700,
    }, amzPredHubG);
    amzPredPctTxt.textContent = 'Processando predição espacial… 0%';

    // Selo final de conclusão na base do card
    amzPredDoneBadge = mk('g', {}, amzPredHubG);
    mk('rect', {
      x: 1057, y: 798, width: 600, height: 84, rx: 24,
      fill: 'rgba(157, 255, 122, .16)', stroke: '#9dff7a', 'stroke-width': 3.5,
    }, amzPredDoneBadge);
    const doneTxt = mk('text', {
      x: 1357, y: 851, 'text-anchor': 'middle',
      fill: '#9dff7a', 'font-family': 'Fraunces, serif', 'font-size': 33, 'font-weight': 700,
    }, amzPredDoneBadge);
    doneTxt.textContent = '✓ Predição de LAI Concluída!';
    gsap.set(amzPredDoneBadge, { autoAlpha: 0, scale: 0.9, transformOrigin: '1357px 840px' });

    gsap.set(amzPredHubG, { autoAlpha: 0, scale: 0.92, transformOrigin: '1357px 580px' });
  }

  /* ================= MAPA FINAL DE LAI EM TELA QUASE CHEIA + LEGENDA COMPACTA + 10 PONTOS AMOSTRADOS ================= */
  const amzFinalMapCard = $('#amzFinalMapCard');
  const amzFinalPtsEls = [];
  let amzLegendG = null;
  const amzMapNoteG = mk('g', {}, amzFinalMapCard);
  {
    gsap.set(amzMapNoteG, { autoAlpha: 0, y: 14 });
  }
  {
    const MAP_X = 55;
    const MAP_Y = 24;
    const MAP_W = 1440;
    const MAP_H = 1032.6; // proporção exata de amazon_lai_clean.png (2400 x 1721)

    // Imagem gerada diretamente de data/lai.tif (já com rios internos preenchidos e contorno exato embutido)
    mk('image', {
      href: 'amazon_lai_clean.png',
      x: MAP_X, y: MAP_Y, width: MAP_W, height: MAP_H,
      preserveAspectRatio: 'none',
    }, amzFinalMapCard);

    // Legenda compacta no canto inferior direito
    const legG = mk('g', { class: 'mapLegend' }, amzFinalMapCard.parentNode);
    amzLegendG = legG;
    gsap.set(legG, { autoAlpha: 0 });
    mk('rect', {
      x: 1525, y: 560, width: 330, height: 470, rx: 22,
      fill: 'rgba(11, 36, 24, .88)', stroke: 'rgba(255, 255, 255, .28)', 'stroke-width': 2.5,
    }, legG);

    const legTitle = mk('text', {
      x: 1690, y: 604, 'text-anchor': 'middle',
      fill: '#ffd76e', 'font-family': 'Fraunces, serif', 'font-size': 26, 'font-weight': 700,
    }, legG);
    legTitle.textContent = 'LAI (m²/m²)';

    const laiClasses = [
      { col: '#2b83ba', lbl: '≤ 2,2' },
      { col: '#3b8fb7', lbl: '2,2 – 2,4' },
      { col: '#82c0ab', lbl: '2,4 – 2,6' },
      { col: '#bfe5aa', lbl: '2,6 – 2,8' },
      { col: '#edf8b9', lbl: '2,8 – 3,0' },
      { col: '#fee39f', lbl: '3,0 – 3,2' },
      { col: '#fdb66b', lbl: '3,2 – 3,4' },
      { col: '#ec6b42', lbl: '3,4 – 3,6' },
      { col: '#d7191c', lbl: '> 3,6' },
    ];

    laiClasses.forEach((c, idx) => {
      const ry = 624 + idx * 38;
      mk('rect', {
        x: 1558, y: ry, width: 44, height: 26, rx: 6,
        fill: c.col, stroke: '#0f172a', 'stroke-width': 1.6,
      }, legG);
      const lt = mk('text', {
        x: 1620, y: ry + 20,
        fill: '#fdf8ec', 'font-family': 'Outfit, sans-serif', 'font-size': 21, 'font-weight': 600,
      }, legG);
      lt.textContent = c.lbl;
    });

    // Item Limite Amazônia na base da legenda compacta
    const by = 624 + 9 * 38 + 8;
    mk('rect', {
      x: 1558, y: by, width: 44, height: 26, rx: 6,
      fill: '#ffffff', stroke: '#0f172a', 'stroke-width': 3,
    }, legG);
    const bt = mk('text', {
      x: 1620, y: by + 20,
      fill: '#ffd76e', 'font-family': 'Outfit, sans-serif', 'font-size': 20, 'font-weight': 700,
    }, legG);
    bt.textContent = 'Bioma Amazônia';

    // 10 pontos distribuídos na Amazônia com seus valores reais de LAI extraídos de data/lai.tif
    const SAMPLE_PTS_10 = [
      { nx: 0.1958, ny: 0.2233, lai: '2,96', dy: -36 }, // São Gabriel da Cachoeira
      { nx: 0.22, ny: 0.58, lai: '3,77', dy: -36 }, // Sudoeste (Acre / Sul AM)
      { nx: 0.32, ny: 0.32, lai: '3,57', dy: -36 }, // Noroeste (Alto Rio Negro)
      { nx: 0.41, ny: 0.16, lai: '2,18', dy: -36 }, // Extremo Norte (Roraima)
      { nx: 0.46, ny: 0.48, lai: '3,46', dy: -36 }, // Amazônia Central
      { nx: 0.38, ny: 0.72, lai: '3,38', dy:  40 }, // Sul (Rondônia)
      { nx: 0.55, ny: 0.30, lai: '3,41', dy: -36 }, // Norte do Pará / Tumucumaque
      { nx: 0.60, ny: 0.56, lai: '3,35', dy: -36 }, // Tapajós / Pará Central
      { nx: 0.52, ny: 0.80, lai: '2,77', dy:  40 }, // Norte de Mato Grosso
      { nx: 0.72, ny: 0.24, lai: '3,68', dy: -36 }, // Amapá / Foz do Amazonas
      { nx: 0.80, ny: 0.52, lai: '1,77', dy: -36 }, // Leste do Pará / Maranhão
    ];

    const ptsLayerG = mk('g', {}, amzFinalMapCard);
    SAMPLE_PTS_10.forEach((pt) => {
      const px = Math.round(MAP_X + pt.nx * MAP_W);
      const py = Math.round(MAP_Y + pt.ny * MAP_H);
      const pg = mk('g', { class: 'mapSamplePoint' }, ptsLayerG);

      // Halo + Ponto central
      mk('circle', {
        cx: px, cy: py, r: 16,
        fill: 'rgba(15, 23, 42, 0.35)',
      }, pg);
      mk('circle', {
        cx: px, cy: py, r: 9.5,
        fill: '#0f172a', stroke: '#ffffff', 'stroke-width': 3.2,
      }, pg);
      mk('circle', {
        cx: px, cy: py, r: 4,
        fill: '#ffd76e',
      }, pg);

      // Etiqueta com o valor de LAI do ponto
      const pillY = py + pt.dy - 20;
      mk('rect', {
        x: px - 68, y: pillY, width: 136, height: 36, rx: 11,
        fill: 'rgba(15, 23, 42, 0.92)', stroke: '#ffd76e', 'stroke-width': 2.2,
      }, pg);
      const txt = mk('text', {
        x: px, y: pillY + 25, 'text-anchor': 'middle',
        fill: '#ffd76e', 'font-family': 'Outfit, sans-serif', 'font-size': 20, 'font-weight': 700,
      }, pg);
      txt.textContent = `LAI = ${pt.lai}`;

      gsap.set(pg, { autoAlpha: 0, scale: 0, transformOrigin: `${px}px ${py}px` });
      amzFinalPtsEls.push(pg);
    });
  }

  /* ================= ESTADOS INICIAIS ================= */
  const branches = $$('.br');
  branches.forEach((b) => b.setAttribute('pathLength', 1));
  gsap.set('#tree', { x: 960, y: 880 });
  gsap.set('#sun', { x: TREE_X, y: 1180, autoAlpha: 0 });
  gsap.set('#trunk', { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(branches, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
  gsap.set(blobEls, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set('#shadow', { opacity: 0 });
  gsap.set([
    '#shadowLine', '#areaLabel', '#envelope', '#volLabel', '#heightDim',
    '#miniCube', '#bigCube', '#cubeLabels', '#sqA', '#sqB', '#sqSum',
    '#ebaScene', '#transectBox', '#transectDims', '#singlePoint', '#singlePointTag',
    '#amzScene', '#amzVectorGroup', '#envStack', '#sliceTransecto',
    '#singleDrillG', '#ptCenter', '#tableSingleG', '#tableFullG',
    '#rfAnimScene', '#rfImpScene', '#rfObsScene', '#rfPerfScene', '#shapTheoryScene', '#shapPayoutScene', '#shapSingleScene', '#shapGridScene', '#amzPredScene', '#amzFinalMapCard',
  ], { autoAlpha: 0 });
  gsap.set('#amzBorder', { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set('#amzFill', { opacity: 0 });
  gsap.set(rayEls, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
  gsap.set(bandEls, { scaleX: 0, transformOrigin: '50% 50%' });
  gsap.set(sliceEls, { autoAlpha: 0, scaleX: 0.5, transformOrigin: '50% 50%' });
  gsap.set(labelEls, { autoAlpha: 0 });
  gsap.set(lidarCalcEls, { autoAlpha: 0 });
  gsap.set(beamSegs, { scaleY: 0, transformOrigin: '50% 0%' });
  gsap.set(beamSpot, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(beamLbls, { autoAlpha: 0 });
  $$('.zl').forEach((l) => l.setAttribute('pathLength', 1));
  gsap.set('.zl', { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set('#drone', { x: 2150, y: DRONE_Y });
  gsap.set('#airplane', { x: -120, y: 260, autoAlpha: 0 });

  // animações ambientes (fora da timeline)
  gsap.fromTo('#sway', { rotation: -0.7 }, { rotation: 0.7, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '50% 100%' });
  gsap.to('#shadowLine', { strokeDashoffset: -210, duration: 6, repeat: -1, ease: 'none' });
  gsap.to('.rotor', { scaleX: 0.15, duration: 0.05, repeat: -1, yoyo: true, ease: 'none', transformOrigin: '50% 50%' });
  gsap.to('#droneBody', { y: -6, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('#droneLed', { opacity: 0.15, duration: 0.4, repeat: -1, yoyo: true, ease: 'steps(1)' });
  if (amzRingOuter) gsap.to(amzRingOuter, { rotation: 360, duration: 9, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
  if (amzRingInner) gsap.to(amzRingInner, { rotation: -360, duration: 6, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
  if (amzCorePulse) gsap.to(amzCorePulse, { scale: 1.14, opacity: 0.22, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '50% 50%' });

  /* ================= TIMELINE ================= */
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });

  const neutral = (k) => (k.startsWith('scale') ? 1 : 0);
  function inOut(target, a, b, from = { y: 24 }, dIn = 0.7, dOut = 0.45) {
    const to = { autoAlpha: 1, duration: dIn, ease: 'power3.out' };
    for (const k in from) to[k] = neutral(k);
    tl.fromTo(target, { autoAlpha: 0, ...from }, to, a);
    if (b != null) tl.to(target, { autoAlpha: 0, y: -14, duration: dOut, ease: 'power2.in' }, b - dOut);
  }
  function block(sel, a, b) {
    const el = $(sel);
    inOut(el, a, b, { y: 20 });
    const inner = el.querySelector('.callout') ? el.querySelector('.callout').children : el.children;
    tl.fromTo(inner, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.35, ease: 'power3.out' }, a + 0.1);
  }
  // Uma única legenda é atualizada pela cena atual, inclusive após saltos na ordem.
  const scientificCaptions = [];
  function caption(html, a, b) {
    scientificCaptions.push({ html, start: a, end: b ?? Infinity });
  }
  const home = (key) => (i, el) => el._d[key];

  /* ---- CENA 1 · a árvore cresce (0–9 s) ---- */
  inOut('#title', 0.3, 6.9, { y: 30 }, 1.1);
  tl.to('#trunk', { scaleY: 1, duration: 1.6, ease: 'power2.out' }, 0.8)
    .to(branches, { strokeDashoffset: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power1.out' }, 1.8)
    .to('#shadow', { opacity: 0.22, duration: 2 }, 3)
    .to(blobEls, { scale: 1, duration: 0.9, stagger: 0.06, ease: 'back.out(1.6)' }, 3)
    .to(popOrder, { scale: home('s'), duration: 0.5, stagger: { amount: 2.4 }, ease: 'back.out(2.2)' }, 3.3);
  caption('Uma árvore pode ter milhares de folhas.<br>Como dizer <b>quanta folha</b> ela tem?', 1.2, 6.8);

  // O resumo continua a árvore já adulta e centralizada, antes do nascer do sol.
  inOut('#sumL', 6.9, 8.8, { x: -40 }, .65);
  inOut('#sumR', 7.15, 8.8, { x: 40 }, .65);
  caption('Duas medidas, uma mesma árvore. Mas… como se mede isso <b>sem arrancar as folhas</b>?', 7.1, 8.8);

  /* ---- CENA 2 · Índice de Área Foliar - LAI (9–42 s) ---- */
  tl.to('#tree', { x: TREE_X, duration: 1.6, ease: 'power3.inOut' }, 9)
    .to('#night', { opacity: 0, duration: 2.6 }, 9.3)
    .to('#stars', { opacity: 0, duration: 2 }, 9.3)
    .to('#sun', { y: 130, autoAlpha: 1, duration: 2.8, ease: 'power2.out' }, 9.3);
  inOut('#h1', 9.8, 42, { x: -30 });

  caption('Com o sol a pino, a copa projeta sua <b>sombra</b> no chão.', 10.2, 13.4);
  tl.to(rayEls, { strokeDashoffset: 0, opacity: 1, duration: 1.2, stagger: 0.07, ease: 'power1.in' }, 10.8)
    .to('#shadow', { opacity: 0.55, duration: 1 }, 11.9)
    .fromTo('#shadowLine', { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, 12.4);
  inOut('#areaLabel', 13.2, 42.4, { y: 16 });
  caption('Essa sombra marca a <b>área de solo</b> coberta pela copa: <b>20 m²</b>.', 13.4, 17.2);
  tl.to(rayEls, { opacity: 0, duration: 0.8 }, 16.4);

  caption('Agora imagine arrancar <b>todas</b> as folhas e deitá-las no chão, sob a copa…', 17.2, 21.6);
  tl.to(blobEls, { scale: 0.6, opacity: 0, duration: 1.2, stagger: 0.04 }, 18.2);

  const order = gsap.utils.shuffle([...Array(N).keys()]);
  const chunks = [0, 1, 2, 3, 4].map((k) => order.filter((_, j) => j % 5 === k).map((i) => leafEls[i]));
  const nums = $$('.countNum .n');
  chunks.forEach((chunk, k) => {
    const t0 = 18.2 + k * 1.55;
    const yk = -k * 16 - 6;
    tl.to(chunk, {
      x: () => { const a = Math.random() * 6.283; return Math.cos(a) * Math.sqrt(Math.random()) * 260; },
      y: () => yk + (Math.random() * 2 - 1) * 28,
      rotation: () => Math.random() * 360 - 180,
      scale: 1.5, duration: 1, stagger: { amount: 0.5 }, ease: 'power2.inOut',
    }, t0)
      .fromTo(discEls[k], { opacity: 0, scaleX: 0.4 }, { opacity: 1, scaleX: 1, duration: 0.5, ease: 'back.out(1.4)' }, t0 + 1.1)
      .to(chunk, { opacity: 0, duration: 0.3 }, t0 + 1.25);
    if (k > 0) tl.to(discLblEls[k - 1], { opacity: 0, duration: 0.25 }, t0 + 1.05);
    inOut(nums[k], t0 + 1.1, k < 4 ? t0 + 2.65 : 29.6, { scale: 0.5 }, 0.5, 0.3);
  });
  inOut('#countLbl', 19.4, 29.6);
  caption('Camada sobre camada, as folhas vão cobrindo o chão…', 21.6, 25.8);
  inOut('#countSum', 26, 29.6);
  caption('Elas cobrem a área <b>5 vezes</b>: são <b>100 m²</b> de folhas!', 25.8, 29.8);

  block('#fIAF1', 29.9, 36.2);
  caption('<b>LAI = 5</b>: em média, cada ponto do chão fica sob <b>5 camadas</b> de folhas.', 30.2, 36.2);

  block('#fIAF2', 36.4, 42);

  /* ---- transição · as folhas voltam (42–45 s) ---- */
  tl.to(discEls, { opacity: 0, scaleX: 0.5, duration: 0.5, stagger: { each: 0.08, from: 'end' } }, 42.2)
    .to('#shadowLine', { autoAlpha: 0, duration: 0.5 }, 42.2)
    .to('#shadow', { opacity: 0.25, duration: 1 }, 42.2)
    .to(leafEls, { x: home('x'), y: home('y'), rotation: home('rot'), scale: home('s'), opacity: 1, duration: 1.2, stagger: { amount: 1.3 }, ease: 'power3.out' }, 42.4)
    .to(blobEls, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'back.out(1.4)' }, 42.7);
  caption('As folhas voltam para a copa. Agora, outro jeito de olhar…', 42.5, 45.4);

  /* ---- CENA 3 · Índice de Densidade Foliar - LAD (45–73 s) ---- */
  inOut('#h2', 45.2, 73, { x: -30 });
  tl.fromTo('#envelope', { autoAlpha: 0, scaleY: 0.3, transformOrigin: '50% 50%' }, { autoAlpha: 1, scaleY: 1, duration: 1.1, ease: 'power3.out' }, 45.8);
  inOut('#volLabel', 46.8, 72.8, { x: -16 });
  caption('Em vez do chão, olhamos para o <b>volume ocupado pela copa</b>: 50 m³.', 45.6, 50);

  tl.to(['#leaves', '#leavesBack'], { opacity: 0.3, duration: 0.8 }, 50)
    .to(['#blobs', '#blobsBack'], { opacity: 0.45, duration: 0.8 }, 50)
    .fromTo('#miniCube', { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 50.2)
    .to('#volLabel', { autoAlpha: 0.2, duration: 0.5 }, 50.5);
  caption('Separe um pedacinho da copa: um cubo de <b>1 m³</b>…', 50, 54.2);
  tl.to('.zl', { strokeDashoffset: 0, duration: 0.7, stagger: 0.1 }, 51)
    .fromTo('#bigCube', { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' }, 51.5);
  inOut('#cubeLabels', 52.2, 58.6, { y: 8 });
  tl.to(bigLeaf, { scale: 1.9, duration: 0.5, stagger: 0.12, ease: 'back.out(2)' }, 52.4);

  caption('…e abra as folhas que estão dentro dele: <b>2 m²</b> de folhas.', 54.2, 58.6);
  tl.to(bigLeaf, { x: 1615, y: (i) => (i < 3 ? 400 : 545), rotation: 0, scale: 3.4, duration: 1, stagger: 0.1, ease: 'power3.inOut' }, 54.7)
    .fromTo(['#sqA', '#sqB'], { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.8)' }, 55.6)
    .to(bigLeaf, { opacity: 0, duration: 0.3 }, 55.9);
  inOut('#sqSum', 56.4, 58.6, { y: 10 });
  tl.to(['#bigCube', '#sqA', '#sqB'], { autoAlpha: 0, duration: 0.45 }, 58.15)
    .to('.zl', { strokeDashoffset: -1, duration: 0.5 }, 58.1)
    .to('#volLabel', { autoAlpha: 0, duration: 0.4 }, 58.2);

  block('#fIDF1', 58.8, 65.8);
  caption('<b>LAD = 2 m²/m³</b>: cada metro cúbico de copa guarda, em média, <b>2 m²</b> de folhas.', 59, 65.8);

  block('#fIDF2', 66, 73);
  caption('Quanto maior o <b>LAD</b>, mais <b>densa e fechada</b> é a copa naquele ponto.', 66.2, 73);
  tl.to('#miniCube', { autoAlpha: 0, scale: 0, duration: 0.5 }, 72.5)
    .to(CROWN, { opacity: 1, duration: 0.8 }, 72.5);

  /* ---- CENA 4 · conexão LAD e LAI (73–99 s) ---- */
  inOut('#h3', 73.2, 99, { x: -30 });
  tl.to(sliceEls, { autoAlpha: 0.85, scaleX: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out' }, 73.6)
    .to(bandEls, { scaleX: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, 74);
  inOut('#heightDim', 74.4, 99, { x: 16 });
  caption('Dividindo a copa em estratos de <b>0,5 m</b>, cada estrato tem seu próprio <b>LAD</b>.', 73.6, 78.4);
  tl.fromTo(labelEls, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.3, ease: 'power3.out' }, 75.2);

  caption('No miolo da copa as folhas se concentram; no topo e na base, são mais esparsas.', 78.4, 83);
  tl.to(labelEls[2], { scale: 1.2, duration: 0.4, repeat: 3, yoyo: true, transformOrigin: '0% 50%', ease: 'sine.inOut' }, 79.2)
    .to(bandEls[2], { attr: { 'fill-opacity': 0.75 }, duration: 0.4, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 79.2);
  tl.to(layerFocus, { autoAlpha: 1, duration: .4 }, 78.7)
    .to(layerFocus, { autoAlpha: 0, duration: .3 }, 83);

  tl.to(labelEls, { autoAlpha: 0.15, duration: 0.4 }, 83);
  block('#fLink1', 83.2, 91.2);
  caption('Multiplicando o <b>LAD</b> pela espessura <b>0,5 m</b> de cada estrato e somando, voltamos ao <b>LAI = 5</b>!', 83.4, 91.2);

  block('#fLink2', 91.4, 99);
  caption('Ou de forma direta: <b>LAD médio × altura da copa</b> = 2 × 2,5 m = <b>5</b>.', 91.6, 99);

  /* ---- Saída das relações entre LAI e LAD ---- */
  tl.to(['#envelope', '#bands', '#sliceLines', '#bandLabels'], { autoAlpha: 0, duration: 0.6 }, 99)
    .to(labelEls, { autoAlpha: 0, duration: 0.4 }, 99);

  /* ---- CENA 6 · Lei de Beer-Lambert (107.5–134 s) ---- */
  tl.to('#tree', { x: TREE_X, duration: 1.6, ease: 'power3.inOut' }, 107.5)
    .to('#sun', { x: TREE_X, y: 130, duration: 1.8, ease: 'power2.inOut' }, 107.5);
  inOut('#h4', 108, 134, { x: -30 });
  caption('A luz do sol nos ajuda: medimos quanta luz <b>atravessa</b> a copa.', 108.4, 112.4);
  tl.to(['#envelope', '#sliceLines'], { autoAlpha: 0.55, duration: 0.8 }, 109.4);

  caption('Cada camada de folhas absorve parte da luz: ela diminui de forma <b>exponencial</b>.', 112.4, 117.8);
  tl.to(beamSegs[0], { scaleY: 1, duration: 0.6, ease: 'power1.in' }, 112.8)
    .to(beamLbls[0], { autoAlpha: 1, duration: 0.5 }, 112.9);
  for (let i = 1; i <= 5; i++) {
    tl.to(beamSegs[i], { scaleY: 1, duration: 0.5, ease: 'none' }, 113.3 + (i - 1) * 0.7)
      .fromTo(beamLbls[i], { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power3.out' }, 113.5 + (i - 1) * 0.7);
  }
  tl.to(beamSegs[6], { scaleY: 1, duration: 0.6, ease: 'power1.out' }, 116.8)
    .to(beamSpot, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 117.3)
    .fromTo(beamLbls[6], { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 117.4);
  caption('No chão chega só <b>8%</b> da luz que bateu no topo da copa.', 117.8, 120.6);

  tl.to(beamLbls.slice(1, 6), { autoAlpha: 0.15, duration: 0.5 }, 120.6);

  block('#fBL1', 120.6, 127.4);
  caption('Pela <b>Lei de Beer-Lambert</b>, invertemos a equação para achar <b>LAI ≈ 5</b>.', 120.8, 127.4);

  block('#fBL2', 127.6, 134);
  caption('Sensores como o <b>LAI-2200</b> e fotos hemisféricas usam esse princípio óptico.', 127.8, 134);

  /* ---- CENA 7 · LiDAR na árvore (134–183 s) ---- */
  tl.to([...beamSegs, beamSpot], { scaleY: 0, duration: 0.6, transformOrigin: '50% 100%', ease: 'power2.in' }, 133.6)
    .to(beamLbls, { autoAlpha: 0, duration: 0.4 }, 133.6)
    .to(['#envelope', '#sliceLines'], { autoAlpha: 0, duration: 0.5 }, 133.6)
    .to('#sun', { x: 130, y: 160, duration: 1.8 }, 134);
  inOut('#h5', 134.2, 183, { x: -30 });
  caption('O <b>LiDAR</b> segue a mesma ideia, mas troca a luz do sol por <b>pulsos de laser</b>.', 134.6, 138.6);
  tl.to('#drone', { x: SWEEP_X0, duration: 2.6, ease: 'power2.out' }, 135.2);
  inOut('#lidarCount', 137.6, 148.2, { y: 20 });

  caption('Nesta varredura, contamos <b>100 retornos</b>: <b>92 na copa</b> e <b>8 do solo</b>.', 138.6, 144);
  const SWEEP_T0 = 138.8, SWEEP_DUR = 5;
  tl.to('#drone', { x: SWEEP_X1, duration: SWEEP_DUR, ease: 'none' }, SWEEP_T0);
  returnSamples.forEach((p, i) => {
    const t = SWEEP_T0 + (i * SWEEP_DUR) / RETURN_COUNT;
    tl.fromTo(p.line, { opacity: 0 }, { opacity: 0.9, duration: 0.04, ease: 'none' }, t)
      .to(p.dot, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, t + 0.05)
      .to(p.line, { opacity: 0, duration: 0.3, ease: 'power1.out' }, t + 0.1);
  });
  const counter = { n: 0 };
  const lcT = $('#lcTotal'), lcC = $('#lcCanopy'), lcG = $('#lcGround');
  tl.fromTo(counter, { n: 0 }, {
    n: RETURN_COUNT, duration: SWEEP_DUR, ease: 'none',
    onUpdate: () => {
      const k = Math.min(RETURN_COUNT, Math.floor(counter.n + 0.0001));
      lcT.textContent = k; lcG.textContent = groundCum[k]; lcC.textContent = k - groundCum[k];
    },
  }, SWEEP_T0);

  caption('Cada retorno vira um ponto: surge a <b>nuvem de pontos</b> da árvore.', 144, 148);
  tl.to([...CROWN, '#wood'], { opacity: 0.12, duration: 1.2 }, 144.3)
    .to('#drone', { x: 2150, y: 90, duration: 2, ease: 'power2.in' }, 145);

  block('#fLidar1', 148.4, 158.6);
  caption('Neste exemplo, a razão entre <b>retornos do solo</b> e <b>total de retornos</b> é <b>0,08</b> — resultando em <b>LAI ≈ 5</b>.', 148.4, 158.6);
  tl.to(groundDots, { scale: 1.8, duration: 0.35, repeat: 3, yoyo: true, stagger: 0.05, ease: 'sine.inOut' }, 148.8);

  tl.to(['#envelope', '#sliceLines'], { autoAlpha: 1, duration: 0.8 }, 159);
  inOut('#heightDim', 159.2, 183, { x: 16 });
  tl.fromTo(lidarCalcEls, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.28, ease: 'power3.out' }, 159.6);
  caption('Em cada estrato de <b>0,5 m</b>, multiplicamos o <b>LAD por 0,5 m</b> para obter o <b>LAI da camada</b>.', 159.4, 170.5);
  tl.to(lidarCalcEls, { scale: 1.08, duration: 0.35, repeat: 1, yoyo: true, stagger: 0.15, transformOrigin: '0% 50%' }, 161.5);

  tl.to(lidarCalcEls, { autoAlpha: 0.18, duration: 0.5 }, 170.8);
  block('#fLidar2', 171, 183);
  caption('Somando todas as camadas, temos <b>LAI = 5,0</b> — base de métodos como <b>MacArthur-Horn</b> e <b>voxels</b>.', 171.2, 183);

  /* ================= CENA 8 · PROJETO EBA: TRANSECTO 3D 12 KM × 300 M (183–207 s) ================= */
  // Transição da árvore única para a floresta amazônica em 3D
  tl.to(['#envelope', '#sliceLines', '#lidarPts', '#tree', '#grass', '#groundPath', '#hb', '#hf', '#sun'], { autoAlpha: 0, duration: 0.8 }, 183)
    .to(lidarCalcEls, { autoAlpha: 0, duration: 0.5 }, 183)
    .to('#night', { opacity: 0.45, duration: 1 }, 183);

  inOut('#h6', 183.6, 207, { x: -30 });
  tl.fromTo('#ebaScene', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 183.6)
    .fromTo('#forestSlab', { scale: 0.7, y: 80, transformOrigin: '50% 65%' }, { scale: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 183.6)
    .fromTo(isoTreeEls, { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.6, stagger: { amount: 0.9 }, ease: 'back.out(1.7)' }, 183.9);

  // Avião sobrevoa coletando o transecto LiDAR de 12 km x 300 m (compensando o x -80 da laje)
  tl.fromTo('#transectBox', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 185)
    .fromTo('#airplane', { autoAlpha: 0, x: 100, y: 340 }, { autoAlpha: 1, x: 880, y: 545, duration: 4.4, ease: 'none' }, 185.2)
    .to(tPtEls, { scale: 1, duration: 0.25, stagger: { amount: 4.0 }, ease: 'back.out(2.5)' }, 185.4)
    .to('#airplane', { autoAlpha: 0, x: 1100, y: 600, duration: 0.8, ease: 'power1.in' }, 189.6);

  // Texto e cotas entram ~1.2 s mais tarde, quando o avião já está coletando os dados
  inOut('#transectDims', 187.4, 196.5, { y: 14 });
  block('#fEBA1', 187.6, 196.5);
  caption('Agora veja isso aplicado a um <b>transecto inteiro do Projeto EBA</b>: <b>12 km × 300 m</b> de floresta amazônica varridos por avião!', 184.2, 196.5);

  // Slide 22: O transecto inteiro se contrai em um único ponto resumido com um LAI
  tl.to(tPtEls, { attr: { cx: 610, cy: 615 }, duration: 1.2, stagger: { amount: 0.35 }, ease: 'power3.inOut' }, 197)
    .to(['#transectBox', '#isoTrees'], { opacity: 0.18, duration: 1 }, 197.2)
    .fromTo('#singlePoint', { autoAlpha: 0, scale: 0, transformOrigin: '530px 615px' }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(2)' }, 198.1)
    .fromTo('#singlePointTag', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 198.5);

  block('#fEBA2', 198.4, 207);
  caption('Todo o transecto de <b>12 km × 300 m</b> vira <b>um único ponto</b> no mapa, resumido por seu valor de <b>LAI</b>.', 197.2, 207);

  /* ================= CENA 9 · 742 TRANSECTOS, 16 VARIÁVEIS, PILHA E TABELAS ABSTRATAS ================= */
  // Transição bonita do Slide 22 para o 23:
  // O ponto único do transecto permanece visível, viaja lentamente até o mapa da Amazônia para ser o 1º ponto colocado lá, e depois surgem todos os outros!
  const firstPt = amzPts[0] || [620.4, 384.7];
  // Convertendo a posição do 1º ponto de #amzVectorGroup (translate(20,35) scale(1.03)) para o sistema de #ebaScene (translate(-80,0))
  const targetEbaX = 20 + firstPt[0] * 1.03 + 80;
  const targetEbaY = 35 + firstPt[1] * 1.03;

  tl.to(['#forestSlab', '#singlePointTag', '#pollen', '#stars'], { autoAlpha: 0, duration: 0.65, ease: 'power2.inOut' }, 207)
    .set('#amzScene', { autoAlpha: 1 }, 207.1)
    .set('#amzVectorGroup', { autoAlpha: 1 }, 207.1);
  inOut('#h7', 207.3, 219.5, { x: -30 });

  // Desenha o contorno oficial do Bioma Amazônia enquanto o ponto do transecto viaja lentamente para virar o 1º ponto do mapa
  tl.to('#amzBorder', { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 207.3)
    .to('#amzFill', { opacity: 1, duration: 1.1, ease: 'power2.out' }, 207.8)
    .to(['#spDot', '#spHalo'], {
      attr: { cx: targetEbaX, cy: targetEbaY },
      duration: 1.85,
      ease: 'power2.inOut',
    }, 207.5)
    .to('#spDot', { attr: { r: 6 }, fill: '#ffd76e', duration: 1.85, ease: 'power2.inOut' }, 207.5)
    .to('#spHalo', { attr: { r: 18 }, duration: 1.85, ease: 'power2.inOut' }, 207.5)
    // Assim que o 1º ponto pousa no mapa (t = 209.35), ele se fixa como amzDotEls[0] e após uma breve pausa surgem todos os outros!
    .to(amzDotEls[0], { scale: 1.5, duration: 0.25, ease: 'back.out(2)' }, 209.3)
    .to(amzDotEls[0], { scale: 1, duration: 0.3 }, 209.6)
    .to('#ebaScene', { autoAlpha: 0, duration: 0.35 }, 209.35)
    .to(amzDotEls.slice(1), { scale: 1, duration: 0.28, stagger: { amount: 2.0 }, ease: 'back.out(2)' }, 209.85);

  const c742 = { v: 1 };
  const el742 = $('#cnt742');
  tl.set(c742, { v: 1, onUpdate: () => { el742.textContent = '1'; } }, 207.5)
    .fromTo(c742, { v: 1 }, {
      v: 742, duration: 2.0, ease: 'power2.out',
      onUpdate: () => { el742.textContent = Math.round(c742.v); },
    }, 209.85);

  block('#fAmz742', 209.0, 219.5);
  caption('O ponto do transecto é posicionado no <b>Bioma Amazônia</b> — seguido pelos demais, totalizando <b>742 pontos amostrais</b>.', 207.6, 219.5);

  // Slide 24: Apresenta o 1º estrato (Transecto) e a lista ampla das 16 variáveis ambientais
  tl.to('#amzVectorGroup', { autoAlpha: 0, duration: 0.6 }, 219.6)
    .set('#envStack', { autoAlpha: 1 }, 220);
  inOut('#h7b', 220.1, 255, { x: -30 });

  tl.fromTo('#sliceTransecto', { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' }, 220.2)
    .fromTo(varItemEls, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.06, ease: 'power3.out' }, 220.4);
  caption('Para modelar o LAI na Amazônia, utilizamos <b>16 variáveis ambientais</b>.', 220.2, 224.8);

  // Slide 25: Cada nome de variável é sugado para a pilha e se torna uma variável preditora sob o Transecto
  varItemEls.forEach((el, i) => {
    const t0 = 225.2 + i * 0.14;
    const targetY = FIRST_SLICE_Y + i * SLICE_STEP;
    const dx = 380 - el._x0;
    const dy = targetY - el._y0;
    tl.to(el, {
      x: dx, y: dy, scaleX: 0.25, scaleY: 0.12, autoAlpha: 0,
      duration: 0.52, ease: 'back.in(1.2)',
    }, t0)
      .fromTo(envSliceEls[i], {
        autoAlpha: 0, y: -22, scale: 0.65, transformOrigin: '380px ' + targetY + 'px',
      }, {
        autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: 'back.out(1.8)',
      }, t0 + 0.36);
  });
  block('#fStackDone', 228.0, 233.5);
  caption('As <b>16 variáveis ambientais</b> se tornam <b>variáveis preditoras</b> empilhadas sob o <b>Transecto</b>.', 225.2, 233.5);

  // Slide 26: Um ponto surge no centro do Transecto, atravessa todas as 16 camadas (acendendo os 16 pontos!) e gera a tabelinha abstrata
  tl.fromTo('#ptCenter', { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.5)' }, 233.8)
    .set('#singleDrillG', { autoAlpha: 1 }, 234.2)
    .fromTo('#rayCenter', { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 1.4, ease: 'power1.inOut' }, 234.3)
    .fromTo('#pulseCenter', { attr: { cy: 145 }, autoAlpha: 1 }, { attr: { cy: 775 }, duration: 1.4, ease: 'power1.inOut' }, 234.3)
    .to(hitCenterEls, { scale: 1, duration: 0.22, stagger: 0.08, ease: 'back.out(2.5)' }, 234.35)
    .to('#pulseCenter', { autoAlpha: 0, duration: 0.3 }, 235.75)
    .fromTo('#tableSingleG', { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 235.6)
    .to(singleCells, { scale: 1, duration: 0.28, stagger: 0.04, ease: 'back.out(2)' }, 235.8);

  block('#fDrill1', 235.6, 243.0);
  caption('O <b>ponto central do transecto</b> atravessa todas as <b>16 variáveis preditoras</b> e gera uma linha da tabela.', 233.8, 243.0);

  // Slide 27: O topo mostra vários mini-transectos separados (1 ponto por transecto!) atravessando as 16 camadas e gerando a tabela completa
  tl.to(['#tableSingleG', '#singleDrillG', '#ptCenter', '#sliceTransecto'], { autoAlpha: 0, duration: 0.45 }, 243.1)
    .to(multiHeaderLbl, { autoAlpha: 1, duration: 0.4 }, 243.4)
    .to(miniTransectEls, { scale: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(2.2)' }, 243.45)
    .to(multiRayEls, { scaleY: 1, duration: 0.85, stagger: 0.06, ease: 'power2.inOut' }, 243.8)
    .fromTo('#tableFullG', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 244.5)
    .to(fullRowEls, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, 244.6);

  block('#fDrillAll', 244.6, 255.0);
  caption('Repetindo para os <b>742 transectos (1 ponto por transecto)</b>, geramos a tabela com o <b>ID do transecto</b> e os valores capturados.', 243.4, 255.0);

  /* ================= CENA 10 · RANDOM FOREST, RESULTADOS, SHAP E MAPA FINAL DE LAI ================= */
  tl.to('#envStack', { autoAlpha: 0, duration: 0.55 }, 255)
    .set('#rfAnimScene', { autoAlpha: 1 }, 255.2);
  inOut('#h8', 255.2, 269.5, { x: -30 });

  // Slide 28: Animação do Random Forest (Tabela -> 3 Árvores de Decisão -> Predições Individuais nas Folhas)
  tl.to(rfTopBadgeG, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'sine.out' }, 255.3)
    .to(rfTreeCards, { autoAlpha: 1, duration: 0.75, stagger: 0.12, ease: 'sine.out' }, 255.6)
    .to(rfInCurves, { strokeDashoffset: 0, opacity: 0.8, duration: 0.75, stagger: 0.12, ease: 'sine.inOut' }, 255.7)
    .to(rfTreeHeaders, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.12, ease: 'sine.out' }, 256.0)
    // Crescimento suave da Raiz -> Nível 1 -> Nível 2 (Folhas) por esmaecimento
    .to(rfRootNodes, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.14, ease: 'sine.out' }, 256.3)
    .to(rfLvl1Branches, { strokeDashoffset: 0, duration: 0.75, stagger: 0.06, ease: 'sine.inOut' }, 256.8)
    .to(rfLvl1Nodes, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.08, ease: 'sine.out' }, 257.2)
    .to(rfLvl2Branches, { strokeDashoffset: 0, duration: 0.75, stagger: 0.04, ease: 'sine.inOut' }, 257.6)
    .to(rfLeafNodes, { autoAlpha: 1, duration: 0.65, stagger: 0.04, ease: 'sine.out' }, 258.0);

  // Orbes dourados viajam lentamente pelos galhos curvos e os balões de predição individual esmaecem suavemente
  rfOrbs.forEach((orb, idx) => {
    const t0 = 258.6 + idx * 0.22;
    tl.fromTo(orb, { attr: { cx: orb._x0, cy: orb._y0 }, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'sine.out' }, t0)
      .to(rfActiveSeg1[idx], { strokeDashoffset: 0, duration: 0.75, ease: 'sine.inOut' }, t0 + 0.2)
      .to(orb, { attr: { cx: orb._x1, cy: orb._y1 }, duration: 0.75, ease: 'sine.inOut' }, t0 + 0.2)
      .to(rfActiveSeg2[idx], { strokeDashoffset: 0, duration: 0.75, ease: 'sine.inOut' }, t0 + 1.0)
      .to(orb, { attr: { cx: orb._x2, cy: orb._y2 }, duration: 0.75, ease: 'sine.inOut' }, t0 + 1.0)
      .to(rfActiveLeaves[idx], { autoAlpha: 1, duration: 0.6, ease: 'sine.out' }, t0 + 1.65)
      .to(orb, { autoAlpha: 0, duration: 0.4, ease: 'sine.in' }, t0 + 1.7)
      .to(rfPredBadges[idx], { autoAlpha: 1, y: 0, duration: 0.75, ease: 'sine.out' }, t0 + 1.8);
  });

  caption('O <b>Random Forest</b> cria centenas de <b>árvores de decisão</b> independentes, cada uma gerando uma estimativa de <b>LAI</b>.', 255.4, 262.1);

  // Slide 29 (NOVO CLIQUE): As árvores recuam, as 3 predições sobem e o Resultado Final aparece expandido no centro da tela!
  const rfStems = rfPredBadges.map((b) => b._stem);
  const rfPills = rfPredBadges.map((b) => b._pill);
  tl.to(rfTreesWrapG, { autoAlpha: 0, y: -25, duration: 0.65, ease: 'sine.inOut' }, 262.4)
    .to(rfStems, { autoAlpha: 0, duration: 0.4, ease: 'sine.out' }, 262.4)
    .to(rfPills, { y: -565, scale: 1.15, transformOrigin: '50% 50%', duration: 0.85, stagger: 0.08, ease: 'power3.inOut' }, 262.5)
    .to(rfOutCurves, { strokeDashoffset: 0, opacity: 0.9, duration: 0.7, stagger: 0.1, ease: 'sine.inOut' }, 263.1)
    .to(rfFinalNodeG, { autoAlpha: 1, scale: 1, duration: 0.85, ease: 'back.out(1.3)' }, 263.3);

  caption('Combinando a <b>média de todas as árvores</b> da floresta, obtemos o <b>valor final predito de LAI</b>!', 262.5, 269.5);

  // ================= SLIDE 30: AS 5 VARIÁVEIS MAIS IMPORTANTES DO RANDOM FOREST (269.6–281 s) =================
  tl.to('#rfAnimScene', { autoAlpha: 0, duration: 0.6, ease: 'sine.inOut' }, 269.6)
    .set('#rfImpScene', { autoAlpha: 1 }, 270.0);
  inOut('#h9Imp', 270.0, 281.0, { x: -30 });

  tl.to(impPanelG, { autoAlpha: 1, duration: 0.6, ease: 'sine.out' }, 270.1)
    .to(impRowGroups, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.16, ease: 'sine.out' }, 270.2)
    .to(impBarEls, { scaleX: 1, duration: 1.1, stagger: 0.16, ease: 'power3.out' }, 270.4);

  impValTxts.forEach((item, i) => {
    const obj = { v: 0 };
    tl.to(obj, {
      v: item.target, duration: 1.1, ease: 'power3.out',
      onUpdate: () => { item.el.textContent = obj.v.toFixed(2).replace('.', ','); },
    }, 270.4 + i * 0.16);
  });
  caption('<b>Precipitação Anual (37,81)</b> e <b>Evapotranspiração Potencial (37,53)</b> lideram a importância no Random Forest.', 270.2, 281.0);

  // ================= SLIDE 31: VALORES OBSERVADOS DE LAI (281–291 s) =================
  tl.to('#rfImpScene', { autoAlpha: 0, duration: 0.6, ease: 'sine.inOut' }, 281.1)
    .set('#rfObsScene', { autoAlpha: 1 }, 281.5);
  inOut('#h9Obs', 281.5, 291.0, { x: -30 });

  tl.to(obsDistG, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'sine.out' }, 281.7)
    .to(obsBars, { scaleY: 1, duration: 0.55, stagger: 0.04, ease: 'back.out(1.4)' }, 281.85)
    .to(obsCurvePath[0], { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 282.1)
    .to(obsCurvePath[1], { autoAlpha: 1, duration: 0.8, ease: 'sine.out' }, 282.4)
    .to(obsConcG, { autoAlpha: 1, duration: 0.75, ease: 'sine.out' }, 282.7);

  caption('Os valores observados de <b>LAI</b> variaram de <b>0,39 a 4,61</b>, com maior concentração entre <b>3,0 e 3,75</b>.', 281.7, 291.0);

  // ================= SLIDE 32: DESEMPENHO DO MODELO RANDOM FOREST (291–301 s) =================
  tl.to('#rfObsScene', { autoAlpha: 0, duration: 0.6, ease: 'sine.inOut' }, 291.1)
    .set('#rfPerfScene', { autoAlpha: 1 }, 291.5);
  inOut('#h9Perf', 291.5, 301.0, { x: -30 });

  tl.to(perfCards, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.18, ease: 'sine.out' }, 291.8);

  caption('O modelo <b>Random Forest</b> apresentou desempenho moderado na predição do LAI: <b>R² = 0,60</b>, <b>RMSE = 0,44</b> e <b>MAE = 0,32</b>.', 291.7, 301.0);

  // ================= SLIDE 33: SHAP PARTE 1 — TEORIA DOS JOGOS COOPERATIVOS (301–311 s) =================
  tl.to('#rfPerfScene', { autoAlpha: 0, duration: 0.6, ease: 'sine.inOut' }, 301.1)
    .set('#shapTheoryScene', { autoAlpha: 1 }, 301.5);
  inOut('#h10Theory', 301.5, 311.0, { x: -30 });

  tl.to(shapTheoryHeaders, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'sine.out' }, 301.7)
    .to(shapPlayerNodes, { autoAlpha: 1, x: 0, duration: 0.65, stagger: 0.14, ease: 'sine.out' }, 301.9)
    .to(shapPlayerLines, { strokeDashoffset: 0, opacity: 0.9, duration: 0.7, stagger: 0.1, ease: 'sine.inOut' }, 302.4)
    .to(shapCoalitionBox, { autoAlpha: 1, scale: 1, duration: 0.75, ease: 'back.out(1.4)' }, 302.8);

  caption('O <b>SHAP</b> usa a <b>Teoria dos Jogos Cooperativos</b>: as 16 variáveis são <b>jogadores</b> que se unem para predizer o LAI.', 301.7, 311.0);

  // ================= SLIDE 34: SHAP PARTE 2 — CONTRIBUIÇÃO DE CADA VARIÁVEL NO LAI (311–321 s) =================
  tl.to('#shapTheoryScene', { autoAlpha: 0, duration: 0.6, ease: 'sine.inOut' }, 311.1)
    .set('#shapPayoutScene', { autoAlpha: 1 }, 311.5);
  inOut('#h10Payout', 311.5, 321.0, { x: -30 });

  tl.to(shapPayoutTopG, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'sine.out' }, 311.7)
    .to(shapPayoutPanelG, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'sine.out' }, 312.0)
    .to(shapPayoutBars, { scaleX: 1, duration: 0.75, stagger: 0.14, ease: 'power3.out' }, 312.3)
    .to(shapPayoutCards, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.15, ease: 'sine.out' }, 312.9);

  caption('Cada variável empurra a predição para cima (<b style="color:#38d9a9">SHAP &gt; 0</b>) ou para baixo (<b style="color:#ff5c6c">SHAP &lt; 0</b>).', 311.7, 321.0);

  // ================= SLIDE 35: EXEMPLO REAL EM TELA CHEIA — PRECIPITAÇÃO ANUAL (321–334 s) =================
  tl.to('#shapPayoutScene', { autoAlpha: 0, duration: 0.6, ease: 'sine.inOut' }, 321.1)
    .set('#shapSingleScene', { autoAlpha: 1 }, 321.5);
  inOut('#h10Shap', 321.5, 334.0, { x: -30 });

  if (shapMainPlot) {
    const prog = { p: 0 };
    tl.fromTo(shapMainPlot.group, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'sine.out' }, 321.7)
      .to([shapTracerDot, shapMainPlot.curveEl], { autoAlpha: 1, duration: 0.15 }, 322.0)
      .fromTo(prog, { p: 0 }, {
        p: 1,
        duration: 2.2,
        ease: 'sine.inOut',
        onUpdate: () => {
          const len = shapMainPlot.curveEl.getTotalLength();
          const cur = len * prog.p;
          shapMainPlot.curveEl.style.strokeDasharray = `${len}px`;
          shapMainPlot.curveEl.style.strokeDashoffset = `${len - cur}px`;
          const pt = shapMainPlot.curveEl.getPointAtLength(cur);
          shapTracerDot.setAttribute('cx', pt.x.toFixed(1));
          shapTracerDot.setAttribute('cy', pt.y.toFixed(1));
        },
      }, 322.0)
      // Termina o desenho da linha em t = 324.2 -> preenche a área e esconde o ponto guia
      .to(shapTracerDot, { autoAlpha: 0, duration: 0.3 }, 324.2)
      .to(shapMainPlot.areaEl, { autoAlpha: 1, duration: 0.7, ease: 'sine.out' }, 324.2)
      // Atraso de 1 segundo após a linha se desenhar (t = 325.2) -> surgem com calma os 2 pontos de transição
      .to([shapTransitionEls[0].halo, shapTransitionEls[0].dot], { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 325.2)
      .to(shapTransitionEls[0].dropLine, { scaleY: 1, duration: 0.6, ease: 'power2.out' }, 325.3)
      .to(shapTransitionEls[0].badgeG, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' }, 325.4)
      .to([shapTransitionEls[1].halo, shapTransitionEls[1].dot], { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 325.85)
      .to(shapTransitionEls[1].dropLine, { scaleY: 1, duration: 0.6, ease: 'power2.out' }, 325.95)
      .to(shapTransitionEls[1].badgeG, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' }, 326.05);
  }
  caption('Na <b>Precipitação Anual</b>, os dois pontos de transição (<b>≈ 2.080 mm</b> e <b>≈ 3.460 mm</b>) marcam a passagem entre efeito negativo e positivo.', 321.7, 334.0);

  // ================= SLIDES 36 A 39: AS 16 VARIÁVEIS EM 4 SLIDES AMPLOS (2x2 EM FUNDO BRANCO) =================
  tl.to('#shapSingleScene', { autoAlpha: 0, duration: 0.55, ease: 'sine.inOut' }, 334.1)
    .set('#shapGridScene', { autoAlpha: 1 }, 334.5);
  inOut('#h10Grid', 334.5, 378.5, { x: -30 });

  const pageCaptions = [
    'Curvas de dependência <b>SHAP</b> (1/4): <b>FAPAR</b>, <b>Elevação</b>, <b>Vento Zonal</b> e <b>Vento Meridional</b>.',
    'Curvas de dependência <b>SHAP</b> (2/4): <b>Dias Limpos</b>, <b>Dias &gt; 20 mm</b>, <b>Raios</b> e <b>Precipitação Anual</b>.',
    'Curvas de dependência <b>SHAP</b> (3/4): <b>Evap. Potencial</b>, <b>Sazonalidade da Prec.</b>, <b>Prec. Mês Máximo</b> e <b>Temp. Média</b>.',
    'Curvas de dependência <b>SHAP</b> (4/4): <b>Sazonalidade Temp.</b>, <b>Temp. Máxima</b>, <b>Teor de Argila</b> e <b>Teor de Água</b>.',
  ];

  shapGridPages.forEach((pg, pIdx) => {
    const tStart = 334.6 + pIdx * 11.0;
    if (pIdx > 0) {
      tl.to(shapGridPages[pIdx - 1].pageG, { autoAlpha: 0, duration: 0.45, ease: 'sine.inOut' }, tStart - 0.5);
    }
    tl.fromTo(pg.pageG, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'sine.out' }, tStart);

    pg.plots.forEach((sp, k) => {
      const t0 = tStart + 0.25 + k * 0.15;
      const prog = { p: 0 };
      tl.to([sp.tracerDot, sp.curveEl], { autoAlpha: 1, duration: 0.12 }, t0)
        .fromTo(prog, { p: 0 }, {
          p: 1,
          duration: 1.45,
          ease: 'sine.inOut',
          onUpdate: () => {
            const len = sp.curveEl.getTotalLength();
            const cur = len * prog.p;
            sp.curveEl.style.strokeDasharray = `${len}px`;
            sp.curveEl.style.strokeDashoffset = `${len - cur}px`;
            const pt = sp.curveEl.getPointAtLength(cur);
            sp.tracerDot.setAttribute('cx', pt.x.toFixed(1));
            sp.tracerDot.setAttribute('cy', pt.y.toFixed(1));
          },
        }, t0)
        .to(sp.tracerDot, { autoAlpha: 0, duration: 0.25 }, t0 + 1.45)
        .to(sp.areaEl, { autoAlpha: 1, duration: 0.55, ease: 'sine.out' }, t0 + 1.45);
    });

    caption(pageCaptions[pIdx], tStart, tStart + 10.4);
  });

  // ================= SLIDE 40: LISTA DAS 16 VARIÁVEIS PARA EXTRAPOLAR NA AMAZÔNIA (378.5–383.5 s) =================
  tl.to('#shapGridScene', { autoAlpha: 0, duration: 0.6, ease: 'sine.inOut' }, 378.6)
    .set('#amzPredScene', { autoAlpha: 1 }, 379.0);
  inOut('#h11Pred', 379.0, 403.0, { x: -30 });

  tl.fromTo(amzTopSliceG, { autoAlpha: 0, y: -26 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' }, 379.2)
    .fromTo(amzVarItemEls, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.06, ease: 'power3.out' }, 379.4);
  caption('Para extrapolar o modelo para toda a <b>Amazônia</b>, reunimos novamente as <b>16 variáveis ambientais</b>.', 379.2, 383.5);

  // ================= SLIDE 41: CADA VARIÁVEL É SUGADA E VIRA UMA CAMADA COM O FORMATO DA AMAZÔNIA (384–392 s) =================
  amzVarItemEls.forEach((el, i) => {
    const t0 = 384.0 + i * 0.14;
    const targetY = FIRST_AMZ_Y + i * AMZ_STEP;
    const dx = 380 - el._x0;
    const dy = targetY - el._y0;
    tl.to(el, {
      x: dx, y: dy, scaleX: 0.25, scaleY: 0.12, autoAlpha: 0,
      duration: 0.52, ease: 'back.in(1.2)',
    }, t0)
      .fromTo(amzLayerEls[i], {
        autoAlpha: 0, y: -22, scale: 0.65, transformOrigin: '380px ' + targetY + 'px',
      }, {
        autoAlpha: 1, y: 0, scale: 1, duration: 0.44, ease: 'back.out(1.8)',
      }, t0 + 0.36);
  });
  caption('As <b>16 variáveis ambientais</b> se transformam em <b>camadas contínuas no formato do Bioma Amazônia</b>.', 384.0, 392.0);

  // ================= SLIDE 42: PROCESSAMENTO DO MODELO RANDOM FOREST TREINADO (392.5–403 s) =================
  const predProg = { pct: 0 };
  tl.to(amzPredHubG, { autoAlpha: 1, scale: 1, duration: 0.75, ease: 'back.out(1.4)' }, 392.6)
    .to(amzPredLines, { strokeDashoffset: 0, opacity: 0.85, duration: 0.7, stagger: 0.06, ease: 'sine.inOut' }, 392.9)
    .to(amzPredBarFill, { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 393.2)
    .fromTo(predProg, { pct: 0 }, {
      pct: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        amzPredPctTxt.textContent = `Processando predição espacial… ${Math.round(predProg.pct)}%`;
      },
    }, 393.2)
    .to(amzPredDoneBadge, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, 395.1);

  caption('O modelo <b>Random Forest</b> treinado processa as <b>16 camadas da Amazônia</b> para estimar o LAI em toda a região.', 392.6, 403.0);

  // ================= SLIDE 43: MAPA CONTÍNUO DE LAI DA AMAZÔNIA GERADO DO LAI.TIF (403.5–416 s) =================
  tl.to('#amzPredScene', { autoAlpha: 0, duration: 0.65, ease: 'sine.inOut' }, 403.1);
  inOut('#h8Map', 403.4, 408.7, { x: -30 });
  block('#fMapFinal', 404.4, 408.7);
  tl.fromTo('#amzFinalMapCard', { autoAlpha: 0, x: 3.7, y: 204, scale: 0.60, transformOrigin: '0px 0px' }, { autoAlpha: 1, x: 3.7, y: 204, scale: 0.66, duration: 1.0, ease: 'power2.out' }, 403.6)
    .fromTo(amzLegendG, { autoAlpha: 0, x: -507, y: -20 }, { autoAlpha: 1, x: -507, y: -20, duration: 0.8, ease: 'power2.out' }, 404.0)
    .to(amzMapNoteG, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 404.4);

  caption('O resultado final \u00e9 o <b>Mapa cont\u00ednuo de LAI de toda a Amaz\u00f4nia</b>!', 403.5, 408.5);

  // SLIDE 44: titulo e texto somem - apenas mapa + legenda
  tl.to(amzMapNoteG, { autoAlpha: 0, duration: 0.4 }, 408.8)
    .to('#amzFinalMapCard', { x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power2.inOut' }, 408.9)
    .to(amzLegendG, { x: 0, y: 0, duration: 0.9, ease: 'power2.inOut' }, 408.9);

  // SLIDE 45: 10 pontos com seus valores de LAI
  tl.to(amzFinalPtsEls, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.28, ease: 'back.out(1.8)' }, 412.0);
  // Capa de espera, participantes e recorte precedem a sequência científica.
  const INTRO_DURATION = 46;
  tl.shiftChildren(INTRO_DURATION, true, 0);
  window.addPresentationBookends(tl, INTRO_DURATION);

  /* ================= MODO APRESENTAÇÃO (PAUSA IMEDIATA AO FIM DE CADA ANIMAÇÃO) ================= */
  // Cada slide pausa exatamente quando sua animação termina (t), e ao clicar avança direto para a saída (resume)
  const SCENE_STOPS = [
    { t: 2.5, resume: 3.2, slide: 1 }, // Capa de espera
    { t: 4.2, resume: 4.35, slide: 2 }, // Título, antes dos personagens
    { t: 5.4, resume: 5.65, slide: 2 }, // Clique: Gustavo
    { t: 6.7, resume: 6.95, slide: 2 }, // Clique: Eric
    { t: 8.0, resume: 10.2, slide: 2 }, // Clique: Josiane
    { t: 16.2, resume: 17.2, slide: 3 }, // Recorte da apresentação: LAI
    { t: 19.9, resume: 20.2, slide: 52 }, // Importância: fotossíntese e carbono
    { t: 21.2, resume: 21.5, slide: 52 }, // Importância: produtividade florestal
    { t: 22.5, resume: 22.8, slide: 52 }, // Importância: regulação hídrica
    { t: 23.8, resume: 24.1, slide: 52 }, // Importância: microclima
    { t: 25.1, resume: 26.0, slide: 52 }, // Importância: respostas ao clima
    { t: 28.9, resume: 29.2, slide: 53, phase: 'ready' }, // Mesma área foliar, antes da redistribuição
    { t: 33.4, resume: 34.2, slide: 53 }, // Mesma área foliar, diferentes perfis de LAD
    { t: 36.6, resume: 36.9, slide: 54, phase: 'ready' }, // Mesmo LAI: três copas antes da mudança de porte
    { t: 41.3, resume: 42.2, slide: 54 }, // Mesmo LAI: copas baixas, altas e intermediárias
    { t: 44.0, resume: 45.2, slide: 4 }, // Propósito e três itens já visíveis
    ...[
    { t: 6.3,   resume: 6.35  }, // 1. Árvore cresceu
    { t: 14.2,  resume: 16.3  }, // 2. Sombra de 20 m²
    { t: 26.9,  resume: 29.1  }, // 3. 5 camadas = 100 m²
    { t: 31.2,  resume: 35.7  }, // 4. Fórmula LAI = 5
    { t: 37.7,  resume: 41.5  }, // 5. Interpretação do LAI
    { t: 47.7,  resume: 49.5  }, // 6. Volume da copa ≈ 50 m³
    { t: 57.3,  resume: 58.0  }, // 7. Cubo 1 m³ -> 2 m² de folhas
    { t: 60.1,  resume: 65.3  }, // 8. Fórmula LAD = 2 m²/m³
    { t: 67.3,  resume: 72.4  }, // 9. Nota sobre LAD
    { t: 80.9,  resume: 82.5  }, // 10. Copa dividida em estratos de 0,5 m
    { t: 84.8,  resume: 90.7  }, // 11. Soma LAD × 0,5 m = LAI
    { t: 93.0,  resume: 107.6 }, // 12. Regra prática; próximo clique segue para Beer-Lambert
    { t: 8.0,   resume: 8.85  }, // 13. Resumo LAI vs LAD, após a árvore inicial
    { t: 118.2, resume: 120.1 }, // 14. Feixe de luz (100% -> 8%)
    { t: 121.9, resume: 126.9 }, // 15. Equação de Beer-Lambert
    { t: 129.2, resume: 133.4 }, // 16. Nota sobre k = 0,5 e sensores
    { t: 147.1, resume: 147.7 }, // 17. Varredura LiDAR (100 retornos)
    { t: 150.7, resume: 158.1 }, // 18. P_lacunas = 0,08 -> LAI ≈ 5
    { t: 163.1, resume: 170.3 }, // 19. Perfil vertical: LAD × 0,5 m ao lado de cada estrato
    { t: 172.6, resume: 182.5 }, // 20. Soma dos estratos = 5,0
    { t: 190.5, resume: 196.0 }, // 21. Transecto 3D (12 km x 300 m) no Projeto EBA
    { t: 199.8, resume: 206.5 }, // 22. Transecto inteiro virando um único ponto resumido com um LAI
    { t: 212.3, resume: 219.0 }, // 23. Ponto do transecto vira o 1º ponto na Amazônia + surgem os demais (742)
    { t: 222.0, resume: 224.7 }, // 24. Apresentação das 16 variáveis ambientais + 1º estrato Transecto
    { t: 229.4, resume: 233.0 }, // 25. Nomes sugados virando os 16 estratos encaixados sob o Transecto
    { t: 237.0, resume: 242.5 }, // 26. Ponto central atravessa a pilha e gera tabelinha abstrata (1 ponto)
    { t: 246.0, resume: 254.5 }, // 27. Todos os pontos atravessam a pilha e geram a tabela abstrata completa
    { t: 261.8, resume: 262.3 }, // 28. Random Forest Parte 1: Tabela -> Árvores de decisão -> Predições individuais (LAI₁, LAI₂, LAIₙ)
    { t: 264.3, resume: 269.0 }, // 29. Random Forest Parte 2 (novo clique): Resultado expandido no centro da tela (Média = LAI 4,8)
    { t: 272.3, resume: 280.5 }, // 30. Resultados RF: Top 5 Variáveis Mais Importantes
    { t: 283.5, resume: 290.5 }, // 31. Resultados RF: Valores Observados de LAI (0,39 a 4,61; concentração 3,0-3,75)
    { t: 293.0, resume: 300.5 }, // 32. Resultados RF: Desempenho do Modelo (R²=0,60, RMSE=0,44, MAE=0,32)
    { t: 303.7, resume: 310.5 }, // 33. SHAP Parte 1: Teoria dos Jogos Cooperativos (Jogadores = Variáveis -> Valor de Shapley)
    { t: 313.8, resume: 320.5 }, // 34. SHAP Parte 2: Contribuição de Cada Variável (SHAP > 0 Positivo vs SHAP < 0 Negativo)
    { t: 326.8, resume: 333.5 }, // 35. SHAP Exemplo em Tela Cheia: Curva Real da Precipitação Anual (Fundo Branco + 2 Transições)
    { t: 337.4, resume: 345.0 }, // 36. SHAP Grid (1/4): FAPAR, Elevação, Vento Zonal, Vento Meridional
    { t: 348.4, resume: 356.0 }, // 37. SHAP Grid (2/4): Dias Limpos, Dias > 20 mm, Raios, Precipitação Anual
    { t: 359.4, resume: 367.0 }, // 38. SHAP Grid (3/4): Evap. Potencial, Sazonalidade Prec., Prec. Mês Máx., Temp. Média
    { t: 370.4, resume: 378.0 }, // 39. SHAP Grid (4/4): Sazonalidade Temp., Temp. Máx., Teor de Argila, Teor de Água
    { t: 381.0, resume: 383.8 }, // 40. Extrapolação (Parte 1): Lista das 16 variáveis ambientais + Bioma Amazônia no topo
    { t: 388.2, resume: 392.3 }, // 41. Extrapolação (Parte 2): Os 16 nomes são sugados e viram as 16 camadas no formato da Amazônia
    { t: 395.9, resume: 402.8 }, // 42. Extrapolação (Parte 3): Motor Random Forest processa as 16 camadas (0% -> 100%)
    { t: 406.5, resume: 408.7 }, // 43. Titulo + mapa de LAI (sem pontos) + texto breve
    { t: 410.0, resume: 411.8 }, // 44. Titulo some: apenas mapa + legenda
    { t: 415.8, resume: 417.0 }, // 45. 10 pontos com seus valores de LAI
    ].map((stop, index) => ({ t: stop.t + INTRO_DURATION, resume: stop.resume + INTRO_DURATION, slide: index + 5 }))
      .flatMap(stop => {
        // As fontes ficam prontas e aguardam um clique antes de emitir luz.
        if (stop.slide === 11) return [{ t: INTRO_DURATION + 53.8, resume: INTRO_DURATION + 54.2, slide: 11, phase: 'ready' }, stop];
        if (stop.slide === 18) return [{ t: INTRO_DURATION + 112.6, resume: INTRO_DURATION + 112.8, slide: 18, phase: 'ready' }, stop];
        if (stop.slide === 21) return [{ t: INTRO_DURATION + 138.5, resume: INTRO_DURATION + 138.8, slide: 21, phase: 'ready' }, stop];
        return [stop];
      }),
    { t: INTRO_DURATION + 421.6, resume: INTRO_DURATION + 422.0, slide: 50 }, // Obrigado / Dúvidas aguarda o clique para a despedida
  ].sort((a, b) => a.t - b.t);
  // A ordem de apresentação é independente do tempo usado para montar cada cena.
  const SLIDE_ORDER = window.PRESENTATION_SLIDES.map(item => item.scene);
  const SCENE_STARTS = new Map([[1, 0], [2, 3.2], [3, 10.2], [4, 42.2], [52, 17.2], [53, 26], [54, 34.2], [5, INTRO_DURATION], [25, INTRO_DURATION + 183.6], [50, INTRO_DURATION + 417]]);
  const SLIDE_STOPS = SLIDE_ORDER.flatMap((scene, index) => SCENE_STOPS.flatMap((stop, sourceIndex) => {
    if (stop.slide !== scene) return [];
    const naturalEntry = sourceIndex ? SCENE_STOPS[sourceIndex - 1].resume + .11 : 0;
    // Um salto nunca começa na saída de outra cena independente.
    const entry = Math.max(naturalEntry, (SCENE_STARTS.get(scene) ?? 0) + .11);
    return [{ ...stop, scene, slide: index + 1, sourceIndex, entry }];
  }));
  const orderedStopIndex = (time) => {
    const sourceIndex = SCENE_STOPS.findIndex(stop => time <= stop.resume + .1);
    return sourceIndex < 0 ? -1 : SLIDE_STOPS.findIndex(stop => stop.sourceIndex === sourceIndex);
  };

  // Os dados interpolados já estão na posição correta após um seek silencioso.
  // Atualiza seus rótulos e curvas sem executar pausas de cenas intermediárias.
  const dynamicRenders = tl.getChildren(true, true, false)
    .filter(child => typeof child.vars.onUpdate === 'function');
  function seekTimeline(time) {
    tl.pause(time, true);
    dynamicRenders.forEach(child => child.vars.onUpdate.call(child));
  }

  const hint = $('#hint');
  const slideNum = $('#slideNum');
  const totalSlides = Math.max(...SLIDE_STOPS.map((stop) => stop.slide)) + 1;

  function updateSlideNum() {
    const t = tl.time();
    const idx = orderedStopIndex(t);
    const stop = SLIDE_STOPS[idx];
    const current = stop ? stop.slide : totalSlides;
    slideNum.textContent = `${current} / ${totalSlides}`;
    $('#stage').dataset.slide = current;
    $('#stage').dataset.sceneSlide = stop ? stop.scene : totalSlides;
    $('#stage').dataset.scenery = t >= INTRO_DURATION + 9.3 && t < INTRO_DURATION + 183 ? 'day' : 'plain';
    // A demonstração óptica usa a iluminação original para revelar a atenuação do feixe.
    document.body.classList.toggle('beam-focus', t >= INTRO_DURATION + 107.5 && t < INTRO_DURATION + 134.4);
    const stepProgress = stop ? clamp((t - stop.entry) / Math.max(.01, stop.t - stop.entry), 0, 1) : 1;
    $('#fill').style.width = (stop ? Math.max(0, idx - 1 + stepProgress) / (SLIDE_STOPS.length - 1) : 1) * 100 + '%';
    window.syncPresentationBookends(t);
    if ($('#stage').dataset.scene === 'science') {
      const item = scientificCaptions.find(item => t >= item.start + INTRO_DURATION && t < item.end + INTRO_DURATION);
      const el = $('#presentationCaption');
      const html = item?.html || '';
      if (el.innerHTML !== html) el.innerHTML = html;
      el.hidden = !html;
    }
  }

  const showHint = () => { hint.innerHTML = '<span>▶</span>'; hint.classList.add('on'); updateSlideNum(); };
  const hideHint = () => { hint.classList.remove('on'); updateSlideNum(); };
  SCENE_STOPS.forEach((s) => tl.addPause(s.t, () => { showHint(); setIcon(); }));

  const btnPlay = $('#btnPlay'), bar = $('#bar'), fill = $('#fill'), ui = $('#ui'), btnCC = $('#btnCC');
  const ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const ICON_NEXT = '<svg viewBox="0 0 24 24"><path d="M4 5v14l11-7zM16 5h2v14h-2z" fill="currentColor"/></svg>';
  const atEnd = () => tl.progress() >= 1;
  function setIcon() {
    const paused = tl.paused() || atEnd();
    btnPlay.innerHTML = paused ? ICON_PLAY : ICON_NEXT;
    $('#stage').dataset.playback = paused ? 'paused' : 'playing';
  }

  function next() {
    if (!presentationReady || atEnd()) return;
    // Após a entrada dos três participantes, um clique apresenta a brincadeira.
    if (tl.paused() && window.playPeopleClock?.()) {
      hideHint(); setIcon(); return;
    }
    if (tl.paused()) {
      const cur = SLIDE_STOPS.find((s) => Math.abs(tl.time() - s.t) < 0.25);
      const following = cur && SLIDE_STOPS[SLIDE_STOPS.indexOf(cur) + 1];
      const advance = () => {
        // O seek prepara a cena sem disparar callbacks das cenas atravessadas.
        const entry = following && following.sourceIndex !== cur.sourceIndex + 1
          ? following.entry : cur?.resume;
        if (entry != null && entry > 0) seekTimeline(entry);
        hideHint();
        tl.play();
        setIcon();
      };
      advance();
    } else {
      const nxt = SCENE_STOPS.find((s) => s.t > tl.time() + 0.05);
      if (nxt != null) { seekTimeline(nxt.t); showHint(); }
      else { seekTimeline(tl.duration()); hideHint(); }
    }
    setIcon();
  }
  function prev() {
    if (!presentationReady) return;
    window.resetPeopleClock?.();
    const currentIndex = orderedStopIndex(tl.time());
    const prevStop = SLIDE_STOPS[(currentIndex < 0 ? SLIDE_STOPS.length : currentIndex) - 1];
    const move = () => {
      seekTimeline(prevStop ? prevStop.t : 0); showHint(); setIcon();
    };
    move();
  }
  function restart() {
    if (!presentationReady) return;
    window.resetPeopleClock?.();
    seekTimeline(0); hideHint(); tl.play(); setIcon();
  }

  function toggleCaptions() {
    const off = document.body.classList.toggle('no-captions');
    btnCC.classList.toggle('active', !off);
    btnCC.setAttribute('aria-pressed', String(!off));
  }

  SLIDE_STOPS.forEach(({ t, slide, phase }, index) => {
    const d = document.createElement('div');
    d.className = 'tick';
    d.dataset.stop = t;
    d.dataset.slide = slide;
    d.dataset.phase = phase || 'complete';
    d.style.left = (index / (SLIDE_STOPS.length - 1)) * 100 + '%';
    bar.appendChild(d);
  });
  tl.eventCallback('onUpdate', () => {
    updateSlideNum();
  });
  tl.eventCallback('onComplete', () => { hideHint(); setIcon(); updateSlideNum(); });

  const overview = window.createSlideOverview({
    totalSlides,
    getCurrentSlide: () => Number($('#stage').dataset.slide),
    pause: () => { const playing = !tl.paused(); tl.pause(); setIcon(); return playing; },
    resume: () => { tl.play(); setIcon(); },
    select: (slide) => {
      window.resetPeopleClock?.();
      const stop = SLIDE_STOPS.find(s => s.slide === slide);
      seekTimeline(stop ? stop.t : tl.duration());
      if (stop) showHint(); else hideHint();
      setIcon();
      $('#stage').focus({ preventScroll: true });
    },
  });

  $('#stage').addEventListener('click', (e) => {
    // O botão pode trocar seu SVG durante o clique. O caminho original do evento
    // continua identificando o painel e evita um segundo avanço da apresentação.
    if (e.composedPath().includes(ui)) return;
    next();
  });
  btnPlay.addEventListener('click', next);
  window.addEventListener('people-clock-complete', () => {
    if ($('#stage').dataset.slide === '2') { showHint(); setIcon(); }
  });
  $('#btnPrev').addEventListener('click', prev);
  $('#btnRestart').addEventListener('click', restart);
  btnCC.addEventListener('click', toggleCaptions);
  bar.addEventListener('click', (e) => {
    if (!presentationReady) return;
    window.resetPeopleClock?.();
    const r = bar.getBoundingClientRect();
    const stop = e.target.closest('.tick')?.dataset.stop;
    const nearest = Math.round(clamp((e.clientX - r.left) / r.width, 0, 1) * (SLIDE_STOPS.length - 1));
    const time = stop == null ? SLIDE_STOPS[nearest].t : Number(stop);
    seekTimeline(time);
    showHint(); setIcon();
  });
  const toggleFs = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  $('#btnFs').addEventListener('click', toggleFs);
  window.addEventListener('keydown', (e) => {
    if (!presentationReady) return;
    const typing = e.target.matches('input, textarea, [contenteditable="true"]');
    if (e.code === 'KeyG' && !typing) { e.preventDefault(); overview.toggle(); return; }
    if (overview.isOpen()) return;
    if (['Space', 'ArrowRight', 'PageDown', 'Enter', 'ArrowDown'].includes(e.code)) { e.preventDefault(); next(); }
    if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.code)) { e.preventDefault(); prev(); }
    if (e.code === 'KeyF') toggleFs();
    if (e.code === 'KeyC') toggleCaptions();
    if (e.code === 'Home') { e.preventDefault(); restart(); }
    if (e.code === 'End') {
      e.preventDefault(); window.resetPeopleClock?.(); seekTimeline(tl.duration()); hideHint(); setIcon();
    }
  });
  let hideT;
  window.addEventListener('mousemove', () => {
    ui.classList.add('show');
    clearTimeout(hideT);
    hideT = setTimeout(() => ui.classList.remove('show'), 2200);
  });

  window.initPresentationTheme?.();
  // Libera a tela apenas depois de aplicar o estado inicial e carregar as fontes.
  const ready = () => {
    if (presentationReady) return;
    wrapEnvironmentalVariables();
    seekTimeline(0);
    hideHint();
    updateSlideNum();
    presentationReady = true;
    tl.play(0, true);
    setIcon();
    $('#wrap').removeAttribute('inert');
    $('#wrap').setAttribute('aria-busy', 'false');
    document.documentElement.classList.add('presentation-ready');
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready);
  else window.addEventListener('load', ready);
})();


