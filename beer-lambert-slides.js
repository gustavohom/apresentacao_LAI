/* Demonstrações automáticas da transmissão e da estimativa de LAI com LiDAR. */
(() => {
  const decimal = (value, digits = 2) => value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
  const estimate = (gap, k) => -Math.log(gap) / k;
  const limitsK = .5;
  const referenceGap = .05;

  window.createBeerLambertFrames = ({ make, draw, group, line, text, box, path, dot }) => {
    const reveal = (el, delay) => {
      el.classList.add('vizReveal');
      el.style.setProperty('--delay', delay + 'ms');
      return el;
    };
    const diagram = (frame, width, height, description) => {
      const figure = make(frame, 'figure', 'beerFigure');
      return draw(figure, 'svg', { viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': description });
    };
    const table = (parent, labels) => {
      const table = make(parent, 'table', 'beerTable');
      const head = make(make(table, 'thead', ''), 'tr', '');
      labels.forEach(label => make(head, 'th', '', label).scope = 'col');
      return make(table, 'tbody', '');
    };
    const cells = (row, values) => values.forEach(value => make(row, 'td', '', value));

    function lidarLayers(frame, _beat, selectBeat) {
      const cut = 2, depth = 1, k = 1;
      const counts = [100, 78, 52, 25, 12];
      const highest = cut + counts.length - 1;
      const layers = counts.slice(0, -1).map((incoming, i) => {
        const outgoing = counts[i + 1];
        const gap = outgoing / incoming;
        const upper = highest - i;
        return { label: (upper - depth) + '–' + upper + ' m', incoming, outgoing, gap, lad: estimate(gap, k) / depth };
      });
      const whole = { incoming: counts[0], outgoing: counts.at(-1) };
      const totalLai = layers.reduce((total, layer) => total + layer.lad * depth, 0);

      const root = diagram(frame, 700, 448, 'Amostra de trajetos LiDAR pelos estratos de um metro. A mesma varredura aparece na visão geral e no detalhe de cada camada.');
      const x0 = 64, x1 = 680, top = 29, bandHeight = 65;
      const width = x1 - x0;
      const yAt = index => top + index * bandHeight;
      const cutY = yAt(layers.length), groundY = cutY + cut * bandHeight;

      box(root, x0, cutY, x1 - x0, groundY - cutY, 'lidarExcluded');
      const highlight = draw(root, 'rect', {
        x: x0, y: top, width: x1 - x0, height: cutY - top, rx: 8, class: 'lidarActiveBand',
      });
      layers.forEach((_, i) => {
        const y = yAt(i);
        line(root, x0, y, x1, y, 'lidarBandRule');
        text(root, x0 - 13, y + 6, (highest - i) + ' m', 'beerSmall', 'end');
      });
      line(root, x0, cutY, x1, cutY, 'lidarCutLine');
      text(root, x0 - 13, cutY + 6, '2 m', 'beerSmall lidarCutLabel', 'end');
      line(root, x0, groundY, x1, groundY, 'beerAxis');
      text(root, x0 - 13, groundY + 6, '0 m', 'beerSmall', 'end');
      text(root, (x0 + x1) / 2, cutY + 76, '0–2 m · fora do cálculo', 'beerSmall');

      const rayCount = 16;
      const columns = Array.from({ length: rayCount }, (_, i) => i);
      const columnX = i => x0 + 138 + i * (width - 163) / (rayCount - 1);
      const foliage = draw(root, 'g', { class: 'lidarFoliage' });
      const reached = new Set(columns);
      const firstImpacts = new Map();
      const foliageGroups = layers.map((layer, index) => {
        const group = draw(foliage, 'g', { class: 'lidarFoliageLayer' });
        const order = columns.map(i => (i * 5 + index * 3) % rayCount);
        const afterLayer = Math.round(rayCount * layer.outgoing / whole.incoming);
        const stoppedHere = order.filter(i => reached.has(i)).slice(0, reached.size - afterLayer);
        const retainedInLayer = rayCount - Math.round(rayCount * layer.gap);
        // Complete a densidade local com posições que já foram sombreadas nos estratos acima.
        const extraLeaves = order.filter(i => !reached.has(i)).slice(0, Math.max(0, retainedInLayer - stoppedHere.length));
        [...stoppedHere, ...extraLeaves].forEach(i => {
          const x = columnX(i);
          const y = yAt(index) + bandHeight * (.31 + (i + index) % 4 * .13);
          const angle = ((i + 2 * index) % 5 - 2) * 17;
          const leaf = draw(group, 'g', { transform: 'translate(' + x + ' ' + y + ') rotate(' + angle + ')' });
          path(leaf, 'M -13 5 Q -7 -10 16 -5 Q 7 10 -13 5 Z', 'lidarLeaf');
          path(leaf, 'M -12 5 L 12 -4', 'lidarLeafVein');
          if (reached.delete(i)) firstImpacts.set(i, { index, y });
        });
        return group;
      });

      const pulseGroup = draw(root, 'g', {});
      const pulses = columns.map(i => {
        const x = columnX(i);
        const hit = firstImpacts.get(i);
        const end = hit?.y ?? cutY;
        const group = draw(pulseGroup, 'g', {});
        const ray = line(group, x, top, x, end, 'lidarPulseTrail');
        const impact = hit && dot(group, x, end, 4.1, 'lidarPulseImpact');
        const head = dot(group, x, top, 3.4, 'lidarPulseHead');
        return { group, ray, impact, head, hit, end };
      });
      const enterLabel = text(root, x0 + 13, top + 24, '', 'lidarBoundaryLabel', 'start');
      const exitLabel = text(root, x0 + 13, cutY - 11, '', 'lidarBoundaryLabel lidarExitLabel', 'start');

      const panel = make(frame, 'div', 'lidarReadout');
      const summary = make(panel, 'div', 'lidarOverview');
      make(summary, 'h3', '', 'Visão geral');
      const metrics = make(summary, 'dl', 'lidarOverviewCounts');
      [['Entram no topo', whole.incoming], ['Chegam a 2 m', whole.outgoing]].forEach(([label, number]) => {
        const metric = make(metrics, 'div', '');
        make(metric, 'dt', '', label);
        make(metric, 'dd', '', number.toString());
      });
      make(summary, 'p', '', 'Contagens ilustrativas');

      const details = make(panel, 'div', 'lidarDetails');
      const stageHeading = make(details, 'div', 'lidarStage');
      const activeLabel = make(stageHeading, 'h3', 'lidarStageHeading');
      const gapText = make(stageHeading, 'p', 'lidarGap');

      make(details, 'p', 'lidarProfileTitle', 'Perfil de LAD · m²/m³');
      const profile = make(details, 'ol', 'lidarProfile');
      profile.setAttribute('aria-label', 'Perfil vertical de LAD em metros quadrados por metro cúbico');
      const maxLad = Math.max(...layers.map(layer => layer.lad));
      const bars = layers.map(layer => {
        const row = make(profile, 'li', '');
        make(row, 'span', '', layer.label);
        const track = make(row, 'div', 'lidarProfileTrack');
        const fill = make(track, 'span', 'lidarProfileFill');
        fill.style.setProperty('--lad-width', (layer.lad / maxLad * 100) + '%');
        make(row, 'span', 'lidarProfileValue', decimal(layer.lad));
        return row;
      });
      const total = make(details, 'p', 'lidarTotal');
      make(total, 'span', '', 'LAI acima de 2 m');
      make(total, 'strong', '', decimal(totalLai) + ' m²/m²');

      const controls = make(frame, 'div', 'lidarDemoControls');
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', 'Visão geral e seleção de estratos');
      const totalButton = make(controls, 'button', '', 'Visão geral');
      make(controls, 'span', 'lidarControlLabel', 'Estratos de 1 m');
      const layerButtons = layers.map(layer => make(controls, 'button', '', layer.label));
      [totalButton, ...layerButtons].forEach(button => { button.type = 'button'; });
      controls.addEventListener('click', event => event.stopPropagation());
      controls.addEventListener('keydown', event => {
        if (event.code === 'Space' || event.code === 'Enter') event.stopPropagation();
      });

      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
      const presentation = frame.closest('#presentationCard');
      const overview = document.getElementById('slideOverview');
      let animation = 0, previousTime = null, pulseTime = 0;
      const scanStart = top - 5;
      let active = null, visibleStart = scanStart, visibleEnd = cutY;

      function setBeat(beat) {
        const index = beat - 1;
        if (index === active) return;
        active = index;
        const isWhole = index === -1;
        foliage.classList.toggle('is-overview', isWhole);
        foliageGroups.forEach((group, i) => group.classList.toggle('is-active', i === index));
        summary.hidden = !isWhole;
        details.hidden = isWhole;
        total.hidden = index !== layers.length - 1;
        totalButton.setAttribute('aria-pressed', String(isWhole));
        layerButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
        bars.forEach((bar, i) => {
          bar.classList.toggle('is-active', i === index);
          bar.classList.toggle('is-revealed', i <= index);
        });
        const layer = isWhole ? whole : layers[index];
        const entry = isWhole ? top : yAt(index);
        const exit = isWhole ? cutY : yAt(index + 1);
        highlight.setAttribute('y', entry);
        highlight.setAttribute('height', exit - entry);
        visibleStart = isWhole ? scanStart : entry;
        visibleEnd = exit;

        enterLabel.textContent = '↓ Entram ' + layer.incoming;
        enterLabel.setAttribute('y', entry + 20);
        exitLabel.textContent = '↓ Saem ' + layer.outgoing;
        exitLabel.setAttribute('y', exit - 9);
        enterLabel.setAttribute('visibility', isWhole ? 'hidden' : 'visible');
        exitLabel.setAttribute('visibility', isWhole ? 'hidden' : 'visible');

        pulses.forEach(pulse => {
          const reachesLayer = !pulse.hit || pulse.hit.index >= index;
          const stopsHere = Boolean(pulse.hit && (isWhole || pulse.hit.index === index));
          pulse.group.setAttribute('display', reachesLayer ? 'inline' : 'none');
          pulse.ray.setAttribute('y1', entry);
          pulse.ray.setAttribute('y2', stopsHere ? pulse.end : exit);
          pulse.impact?.setAttribute('visibility', stopsHere ? 'visible' : 'hidden');
          [pulse.ray, pulse.head].forEach(el => el.classList.toggle('is-intercepted', stopsHere));
        });
        if (!isWhole) {
          activeLabel.textContent = 'Estrato ' + layer.label;
          gapText.textContent = decimal(layer.gap * 100, 0) + '% passam · ' + decimal((1 - layer.gap) * 100, 0) + '% ficam retidos';
        }
        drawPulses(pulseTime);
      }

      function drawPulses(time) {
        pulses.forEach((pulse, i) => {
          const phase = (time * .0007 + i * .17) % 1;
          const y = scanStart + (pulse.end - scanStart) * phase;
          pulse.head.setAttribute('cy', y);
          pulse.head.setAttribute('visibility', y >= visibleStart && y <= visibleEnd ? 'visible' : 'hidden');
        });
      }

      function tick(now) {
        if (previousTime !== null && !presentation.classList.contains('is-flipped') && !overview.open) {
          pulseTime += Math.min(now - previousTime, 50);
          drawPulses(pulseTime);
        }
        previousTime = now;
        animation = requestAnimationFrame(tick);
      }

      function stop() {
        cancelAnimationFrame(animation);
        animation = 0;
        previousTime = null;
      }

      function start(beat) {
        stop();
        pulseTime = 450;
        active = null;
        setBeat(beat);
        if (!reducedMotion.matches) animation = requestAnimationFrame(tick);
      }

      totalButton.addEventListener('click', () => selectBeat(0));
      layerButtons.forEach((button, i) => button.addEventListener('click', () => selectBeat(i + 1)));
      return { start, stop, setBeat };
    }

    function extinction(frame) {
      const root = diagram(frame, 620, 440, 'Curvas para k igual a 0,35, 0,50 e 1,00. Quando a abertura é 5%, as estimativas de LAI são 8,56, 5,99 e 3,00.');
      const x = lai => 73 + lai * 55;
      const y = gap => 344 - gap * 237;
      text(root, 76, 58, 'Abertura (%)', 'beerVizTitle', 'start');
      line(root, x(0), y(0), x(9) + 15, y(0), 'beerAxis');
      line(root, x(0), y(0), x(0), y(1) - 12, 'beerAxis');
      [0, .5, 1].forEach(gap => {
        line(root, x(0), y(gap), x(9), y(gap), 'beerGrid');
        text(root, 63, y(gap) + 7, String(gap * 100), 'beerSmall', 'end');
      });
      [0, 3, 6, 9].forEach(lai => text(root, x(lai), 379, String(lai), 'beerSmall'));
      text(root, 313, 418, 'LAI estimado', 'vizLabel');
      line(root, x(0), y(referenceGap), x(9), y(referenceGap), 'beerGuide');
      text(root, x(9) - 5, y(referenceGap) - 14, '5%', 'beerSmall', 'end');

      const explanation = make(frame, 'div', 'beerCalculation beerSupplementCopy');
      make(explanation, 'h3', '', 'Mesma abertura de 5%');
      const rows = table(explanation, ['Coeficiente k', 'LAI estimado']);
      [.35, limitsK, 1].forEach((k, i) => {
        const delay = 160 * i;
        const plotted = group(root, delay);
        const coords = Array.from({ length: 61 }, (_, n) => {
          const lai = n * 9 / 60;
          return x(lai) + ' ' + y(Math.exp(-k * lai));
        });
        const lai = estimate(referenceGap, k);
        path(plotted, 'M' + coords.join(' L'), 'beerCurve beerSeries' + i);
        dot(plotted, x(lai), y(referenceGap), 6, 'beerPoint beerSeries' + i);
        const row = reveal(make(rows, 'tr', 'beerSeries' + i), delay);
        cells(row, [decimal(k), decimal(lai)]);
      });
      make(explanation, 'p', '', 'O valor de k depende da geometria de observação e da orientação das folhas. O estudo adotou k = 1.');
    }

    function beerLimits(frame) {
      const calculation = make(frame, 'div', 'beerCalculation beerSupplementCopy');
      make(calculation, 'h3', '', 'Por que o simulador chega a 5,99?');
      make(calculation, 'p', '', 'No simulador, 5% é a menor abertura disponível. Com k = 0,50, isso dá LAI ≈ 5,99.');
      const rows = table(calculation, ['Abertura', 'LAI com k = 0,50']);
      [.10, referenceGap, .02, 0].forEach((gap, i) => {
        const row = reveal(make(rows, 'tr', gap === referenceGap ? 'beerReference' : ''), i * 165);
        cells(row, [decimal(gap * 100, 0) + '%', gap > 0 ? decimal(estimate(gap, limitsK)) : 'Sem estimativa finita']);
      });
      const limitations = make(frame, 'div', 'beerLimitCards');
      [
        ['Poucos pulsos', 'Nas copas densas, poucos pulsos chegam aos estratos inferiores. A estimativa fica sensível à contagem e à escala de amostragem.'],
        ['Abertura zero', 'Quando nenhum pulso atravessa a camada, ln(0) fica indefinido. A observação indica pouca penetração.'],
        ['Estrutura do dossel', 'Folhas agrupadas, ramos e ângulo de varredura alteram a relação entre a abertura observada e a área de folhas.'],
      ].forEach(([heading, copy], i) => {
        const card = reveal(make(limitations, 'article', 'beerLimitCard'), 180 + i * 150);
        make(card, 'h3', '', heading);
        make(card, 'p', '', copy);
      });
    }

    return { lidarLayers, extinction, beerLimits };
  };
})();
