/* Catálogo de slides, perfis e navegação por miniaturas. */
(() => {
  const sourceTitles = [
    'Título do artigo', 'Apresentação e equipe', 'Recorte: Índice de Área Foliar',
    'Propósito e contribuições da pesquisa',
    'Índices Foliares', 'Área de solo', 'Área das folhas', 'Cálculo do LAI',
    'Interpretação do LAI', 'Volume da copa', 'Folhas em 1 m³', 'Cálculo do LAD',
    'Densidade de folhas', 'LAI e LAD em camadas', 'Soma de LAD × altura',
    'LAD médio e altura da copa', 'LAI e LAD: resumo',
    'Beer-Lambert: feixe de luz', 'Beer-Lambert: equação', 'Beer-Lambert: coeficiente k',
    'LiDAR: retornos', 'Fração de lacunas', 'Perfil vertical de folhas',
    'Soma das camadas', 'Transecto do Projeto EBA', 'Do transecto ao ponto',
    'Amostragem na Amazônia', 'Variáveis ambientais', 'Camadas preditoras',
    'Extração por transecto', 'Tabela dos 742 pontos', 'Árvores do Random Forest',
    'Média das predições', 'Importância das variáveis', 'Valores observados de LAI',
    'Desempenho do modelo', 'SHAP: teoria dos jogos', 'SHAP: contribuições',
    'SHAP: precipitação anual', 'SHAP: fAPAR, elevação e ventos',
    'SHAP: chuvas, raios e dias limpos', 'SHAP: clima e evapotranspiração',
    'SHAP: temperatura e solo', 'Extrapolação: variáveis ambientais',
    'Camadas da Amazônia', 'Predição com Random Forest', 'Mapa contínuo de LAI',
    'Mapa e legenda', 'Valores de LAI nos pontos', '', 'Ferramentas da pesquisa',
  ];
  sourceTitles[51] = 'Por que mapear a área foliar?';
  sourceTitles[52] = 'Mesmo LAI, copas diferentes';
  sourceTitles[67] = 'Obrigado! Dúvidas?';
  // A ordem original também define os nomes dos arquivos de miniatura.
  const originalOrder = [1, 2, 3, 4, 52, 5, 17,
    ...Array.from({ length: 11 }, (_, i) => i + 6),
    ...Array.from({ length: 7 }, (_, i) => i + 18),
    53, 54, ...Array.from({ length: 27 }, (_, i) => i + 25)];
  const inserts = new Map([[52, [58, 56, 64, 65]], [24, [67]], [51, [68]]]);
  const sceneOrder = originalOrder.filter(scene => ![4, 16, 50, 54].includes(scene))
    .flatMap(scene => [scene, ...(inserts.get(scene) ?? [])]);
  window.PRESENTATION_SLIDES = sceneOrder.map(scene => ({
    scene,
    title: window.RESEARCH_SLIDES.get(scene)?.title ?? sourceTitles[scene - 1],
    thumbnail: ![51, 52, 53].includes(scene) && originalOrder.includes(scene) ? originalOrder.indexOf(scene) + 1 : null,
  }));
  // IDs das cenas. A numeração exibida pode mudar quando a ordem for editada.
  const fullScenes = new Set(sceneOrder);
  const shortScenes = new Set([1, 3, 52, 17, 18, 21, 25, 27, 31, 32, 34, 36, 39, 47, 56, 58, 64, 65, 67, 68]);
  const storageKey = 'lai-slide-profiles';
  const profileVersion = 7;

  window.createSlideOverview = ({ getCurrentSlide, pause, resume, select, applySlides }) => {
    const dialog = document.querySelector('#slideOverview');
    const grid = document.querySelector('#slideThumbGrid');
    const search = document.querySelector('#slideSearch');
    const count = document.querySelector('#slideSearchCount');
    const trigger = document.querySelector('#btnSlides');
    const profile = document.querySelector('#slideProfile');
    const profileCount = document.querySelector('#slideProfileCount');
    const profileActions = document.querySelector('#slideProfileActions');
    const selectAll = document.querySelector('#selectAllSlides');
    const copyShort = document.querySelector('#copyShortProfile');
    const help = document.querySelector('#slideOverviewHelp');
    let saved;
    try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch (_) {}
    const wasSelected = scene => saved?.customScenes?.includes?.(scene);
    let customScenes = new Set(sceneOrder.filter(scene => wasSelected(scene)));
    if ((saved?.version ?? 0) < 2 && wasSelected(54)) customScenes.add(53);
    if (saved?.version === 3 && wasSelected(24)) customScenes.add(67);
    if ((saved?.version ?? 0) < 5 && wasSelected(19)) customScenes.add(20);
    if ((saved?.version ?? 0) < 6 && wasSelected(51)) customScenes.add(68);
    if ((saved?.version ?? 0) < 7 && wasSelected(50)) customScenes.add(68);
    if (!customScenes.size) customScenes = new Set(fullScenes);
    if (['full', 'short', 'custom'].includes(saved?.profile)) profile.value = saved.profile;
    let resumeOnClose = false;
    const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const cards = window.PRESENTATION_SLIDES.map(({ scene, title, thumbnail }, i) => {
      const slide = i + 1;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slideThumb';
      button.dataset.slide = slide;
      button.setAttribute('aria-label', `Slide ${slide}: ${title}`);
      const image = document.createElement(thumbnail ? 'img' : 'span');
      if (thumbnail) {
        image.alt = '';
        image.width = 480; image.height = 270;
        image.loading = 'lazy'; image.decoding = 'async';
      } else {
        image.className = 'slideTextThumbnail';
        image.textContent = title;
        image.setAttribute('aria-hidden', 'true');
      }
      const caption = document.createElement('span');
      caption.className = 'slideThumbCaption';
      const number = document.createElement('span');
      number.className = 'slideThumbNumber'; number.textContent = String(slide).padStart(2, '0');
      const text = document.createElement('span'); text.textContent = title;
      const card = document.createElement('div');
      card.className = 'slideProfileCard';
      const toggle = document.createElement('label');
      toggle.className = 'slideProfileToggle';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.setAttribute('aria-label', `Incluir slide ${slide}: ${title}`);
      const toggleText = document.createElement('span');
      toggle.append(checkbox, toggleText);
      caption.append(number, text); button.append(image, caption); card.append(button, toggle); grid.append(card);
      button.addEventListener('click', () => {
        resumeOnClose = false;
        dialog.close();
        select(slide);
      });
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) customScenes.add(scene);
        else if (customScenes.size > 1) customScenes.delete(scene);
        updateProfile();
      });
      return { card, button, image, thumbnail, slide, scene, toggle, checkbox, toggleText, searchable: normalize(`${slide} ${title}`) };
    });

    const activeSlides = () => {
      const scenes = profile.value === 'full' ? fullScenes : profile.value === 'short' ? shortScenes : customScenes;
      return cards.filter(card => scenes.has(card.scene)).map(card => card.slide);
    };
    const filter = () => {
      const query = normalize(search.value.trim());
      const active = new Set(activeSlides());
      const current = getCurrentSlide();
      const editing = profile.value === 'custom';
      let visible = 0;
      cards.forEach(({ card, button, slide, toggle, checkbox, toggleText, searchable }) => {
        const included = active.has(slide);
        card.hidden = !(editing || included) || !searchable.includes(query);
        if (!card.hidden) visible++;
        button.disabled = !included;
        button.classList.toggle('is-current', slide === current);
        if (slide === current) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
        toggle.hidden = !editing;
        checkbox.checked = included;
        checkbox.disabled = included && active.size === 1;
        toggleText.textContent = checkbox.disabled ? 'Mantenha ao menos um slide' : included ? 'Incluído' : 'Oculto';
      });
      count.textContent = `${visible} ${visible === 1 ? 'slide' : 'slides'}`;
      profileCount.textContent = `${active.size} de ${cards.length} na apresentação`;
      profileActions.hidden = !editing;
      help.textContent = editing ? 'Marque os slides que deseja apresentar. Clique na miniatura para abrir um slide incluído.' : 'Clique em uma miniatura para abrir.';
      document.querySelector('#slideSearchEmpty').hidden = visible !== 0;
    };
    const updateProfile = () => {
      if (applySlides(activeSlides())) resumeOnClose = false;
      try { localStorage.setItem(storageKey, JSON.stringify({ version: profileVersion, profile: profile.value, customScenes: [...customScenes] })); } catch (_) {}
      filter();
    };
    const open = () => {
      if (dialog.open) return;
      resumeOnClose = pause();
      search.value = ''; filter();
      const theme = document.body.classList.contains('projector') ? 'light' : 'original';
      const current = getCurrentSlide();
      cards.forEach(({ image, thumbnail }) => {
        if (thumbnail) image.src = `assets/slides/${theme}/${String(thumbnail).padStart(2, '0')}.webp?v=20261027-titulos-continuos`;
      });
      dialog.showModal();
      const active = cards.find(card => card.slide === current)?.button;
      active?.scrollIntoView({ block: 'center' });
      active?.focus({ preventScroll: true });
      trigger.setAttribute('aria-expanded', 'true');
    };
    const toggle = () => dialog.open ? dialog.close() : open();
    trigger.addEventListener('click', open);
    trigger.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'Enter') e.stopPropagation();
    });
    trigger.setAttribute('aria-expanded', 'false');
    document.querySelector('#closeSlideOverview').addEventListener('click', () => dialog.close());
    search.addEventListener('input', filter);
    profile.addEventListener('change', () => { search.value = ''; updateProfile(); });
    selectAll.addEventListener('click', () => { customScenes = new Set(sceneOrder); updateProfile(); });
    copyShort.addEventListener('click', () => { customScenes = new Set(shortScenes); updateProfile(); });
    dialog.addEventListener('close', () => {
      trigger.setAttribute('aria-expanded', 'false');
      if (resumeOnClose) resume();
      resumeOnClose = false;
      document.querySelector('#stage').focus({ preventScroll: true });
    });
    dialog.addEventListener('click', e => {
      if (e.target === dialog) dialog.close();
    });
    return { toggle, isOpen: () => dialog.open, activeSlides };
  };
})();
