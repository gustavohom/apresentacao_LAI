/* Roteiro visual do workshop. Cada quadro é uma etapa na navegação do slide. */
(() => {
  const slides = [
    [64, 'A lacuna científica', '', [
      ['question', 'Como o LAI varia ao longo dos gradientes ambientais da Amazônia brasileira?', '', 'A área de folhas muda de uma região para outra. O que a chuva, o relevo e o solo têm a ver com isso?'],
    ]],
    [56, 'O alcance dos sobrevoos', 'Problema de pesquisa', [
      ['gaps', 'O LAI é estimado nas faixas LiDAR', 'O Projeto EBA fornece perfis da vegetação nas faixas sobrevoadas. A cobertura entre elas depende da modelagem.', 'O avião passa por estas faixas e registra a floresta abaixo dele. E o espaço entre uma faixa e outra?'],
    ]],
    [58, 'O que já foi estudado?', '', [
      ['precedents', '', '', 'Os estudos com <b>LiDAR</b> olham para dentro da copa. O estudo com <b>MODIS</b> relaciona o LAI estimado por satélite ao clima.'],
    ]],
    [65, 'O diferencial deste trabalho', '', [
      ['contribution', '', 'O estudo combina o LAI estimado por LiDAR com dados ambientais para investigar quais condições se associam à variação do LAI.', 'O ponto de partida é o LAI das faixas. Os dados ambientais ligam essas amostras aos lugares entre os sobrevoos.'],
    ]],
    [67, 'Do LiDAR ao LAI', 'Parte 05 · Medindo na prática', [
      'Imagine <b>100 pulsos</b> no topo. Só <b>12</b> chegam à linha dos 2 metros.',
      'Na primeira camada, passam <b>78 de 100</b>. Essa fração estima a abertura.',
      'Os <b>78</b> que passaram entram na camada seguinte. Desses, saem <b>52</b>.',
      'Agora passam só <b>25 de 52</b>. Uma abertura menor indica LAD maior.',
      'Dos 25, só 12 chegam ao corte. A soma das quatro camadas dá <b>2,12</b>.',
    ].map(caption => ['lidarLayers', '', '', caption])],
    [66, 'Limites de Beer–Lambert no LiDAR', '', [
      ['beerLimits', '', '', 'Quando passam poucos pulsos, a diferença de um pulso já pesa na conta. E se nenhum passar?'],
    ]],
  ].map(([scene, title, topic, beats]) => ({
    scene, title, topic, beats: beats.map(([figure, headline, copy, caption]) => ({ figure, headline, copy, caption })),
  }));

  window.RESEARCH_SLIDES = new Map(slides.map(slide => [slide.scene, slide]));

  function make(parent, tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    parent.append(el);
    return el;
  }

  const ns = 'http://www.w3.org/2000/svg';
  function draw(parent, tag, attrs, text) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text) el.textContent = text;
    parent.append(el);
    return el;
  }

  const line = (root, x1, y1, x2, y2, cls) => draw(root, 'line', { x1, y1, x2, y2, class: cls });
  const text = (root, x, y, value, cls = 'vizLabel', anchor = 'middle') =>
    draw(root, 'text', { x, y, class: cls, 'text-anchor': anchor }, value);
  const box = (root, x, y, width, height, cls) => draw(root, 'rect', { x, y, width, height, rx: 16, class: cls });
  const path = (root, d, cls) => draw(root, 'path', { d, class: cls });
  const dot = (root, cx, cy, r, cls) => draw(root, 'circle', { cx, cy, r, class: cls });
  function group(root, delay = 0, extra = '') {
    return draw(root, 'g', { class: 'vizReveal ' + extra, style: '--delay:' + delay + 'ms' });
  }

  function geography(root) {
    const map = draw(root, 'svg', { x: 0, y: 0, width: 760, height: 403, viewBox: '64 135 895 620' });
    draw(map, 'path', { d: window.AMZ_PATH, class: 'vizMapOutline' });
    const samples = group(map, 320, 'vizSamples');
    window.AMZ_PTS.forEach(([x, y]) => dot(samples, x, y, 3.6, 'vizSample'));
    return map;
  }

  const figures = {
    gaps(root) {
      geography(root);
      const highlight = group(root, 650);
      dot(highlight, 529, 185, 30, 'vizRing');
      line(highlight, 552, 165, 595, 110, 'vizAxis');
      box(highlight, 515, 59, 215, 53, 'vizBox');
      text(highlight, 623, 93, 'Fora das faixas');
      dot(root, 247, 420, 7, 'vizSample');
      text(root, 270, 428, 'Faixas sobrevoadas', 'vizLabel', 'start');
    },
    question(root) {
      const map = draw(group(root, 160), 'svg', { x: 0, y: 0, width: 760, height: 445, viewBox: '64 135 895 620' });
      path(map, window.AMZ_PATH, 'vizMapOutline');
    },
  };

  function renderPrecedents(frame) {
    const records = [
      ['Qu et al. (2018)', 'LAI por LiDAR', 'Estimaram a área foliar na Amazônia oriental e compararam os valores com MODIS.'],
      ['Longo et al. (2025)', 'LAI para um modelo de ecossistema', 'Geraram estimativas de LAI potencial com dados do Projeto EBA.'],
      ['Valle et al. (2026)', 'Estrutura vertical do dossel', 'Mapearam tipos de estrutura florestal com perfis LiDAR do EBA.'],
      ['Saimun e Karim (2025)', 'LAI e clima', 'Analisaram como o LAI do MODIS varia com o clima na bacia amazônica.'],
    ];
    records.forEach(([authors, title, summary], index) => {
      const paper = make(frame, 'article', 'researchPaper');
      paper.style.setProperty('--delay', (index * 95) + 'ms');
      make(paper, 'p', 'paperAuthors', authors);
      make(paper, 'h3', '', title);
      make(paper, 'p', 'paperSummary', summary);
    });
  }

  function renderContribution(frame, beat) {
    const flow = make(frame, 'div', 'contributionFlow');
    const metrics = make(flow, 'dl', 'contributionMetrics vizReveal');
    [['742', 'Faixas LiDAR do EBA'], ['16', 'Variáveis ambientais']].forEach(([value, description]) => {
      const metric = make(metrics, 'div', '');
      make(metric, 'dt', '', description);
      make(metric, 'dd', '', value);
    });
    const connector = make(flow, 'span', 'contributionConnector vizReveal');
    connector.setAttribute('aria-hidden', 'true');
    connector.style.setProperty('--delay', '140ms');
    const model = make(flow, 'p', 'contributionModel vizReveal', 'Modelo regional de LAI');
    model.style.setProperty('--delay', '230ms');

    make(frame, 'p', 'contributionStatement vizReveal', beat.copy);
  }

  const customFrames = {
    precedents: renderPrecedents, contribution: renderContribution,
    ...window.createBeerLambertFrames({ make, draw, group, line, text, box, path, dot }),
  };

  window.createResearchPanels = (root, selectBeat) => {
    const panels = new Map(slides.map(slide => {
      const section = make(root, 'section', 'researchPanel');
      section.hidden = true;
      const isLidarDemo = slide.beats[0].figure === 'lidarLayers';
      const title = isLidarDemo ? make(section, 'header', 'heading') : section;
      if (slide.topic) make(title, isLidarDemo ? 'span' : 'p', isLidarDemo ? 'num' : 'researchTopic', slide.topic);
      const heading = make(title, 'h2', isLidarDemo ? 'ht' : '', isLidarDemo ? 'Do LiDAR ao ' : slide.title);
      if (isLidarDemo) make(heading, 'em', 'abbr', 'LAI');
      heading.id = 'researchTitle' + slide.scene;
      section.setAttribute('aria-labelledby', heading.id);
      let interactiveFrame;
      const frames = slide.beats.map(beat => {
        if (interactiveFrame) return interactiveFrame;
        const frame = make(section, 'div', 'researchFrame');
        frame.dataset.figure = beat.figure;
        frame.hidden = true;
        const renderCustom = customFrames[beat.figure];
        if (renderCustom) {
          const rendered = { element: frame, animation: renderCustom(frame, beat, index => selectBeat(slide.scene, index)) };
          if (rendered.animation?.setBeat) interactiveFrame = rendered;
          return rendered;
        }
        const fig = make(frame, 'figure', 'researchFigure');
        const svg = draw(fig, 'svg', { viewBox: '0 0 760 445', 'aria-hidden': 'true' });
        figures[beat.figure](svg);
        if (beat.headline) {
          const copy = make(frame, 'div', 'researchText');
          make(copy, 'h3', '', beat.headline);
          if (beat.copy) make(copy, 'p', '', beat.copy);
        }
        return { element: frame };
      });
      return [slide.scene, { section, frames }];
    }));
    let activePanel;
    let activeFrame;
    return (scene, beat) => {
      const panel = panels.get(scene);
      const frame = panel?.frames[beat];
      if (panel === activePanel && frame === activeFrame) {
        frame?.animation?.setBeat?.(beat);
        return;
      }
      if (activeFrame) {
        activeFrame.animation?.stop();
        activeFrame.element.hidden = true;
      }
      if (activePanel && activePanel !== panel) activePanel.section.hidden = true;
      activePanel = panel;
      activeFrame = frame;
      if (panel) panel.section.hidden = false;
      root.hidden = !panel;
      if (frame) {
        frame.element.hidden = false;
        frame.animation?.start(beat);
      }
    };
  };
})();
