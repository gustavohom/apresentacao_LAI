/* Navegação direta pelos slides, sem avançar a apresentação ao abrir o painel. */
(() => {
  const titles = [
    'Título do artigo', 'Apresentação e equipe', 'Recorte: Índice de Área Foliar',
    'Propósito e contribuições da pesquisa',
    'Índices Foliares', 'Área de solo', 'Área das folhas', 'Cálculo do LAI',
    'Interpretação do LAI', 'Volume da copa', 'Folhas em 1 m³', 'Cálculo do LAD',
    'Densidade de folhas', 'LAI e LAD em camadas', 'Soma de LAD × altura',
    'LAD médio e altura da copa', 'LAI e LAD: resumo',
    'Beer-Lambert: feixe de luz', 'Beer-Lambert: equação', 'Coeficiente k e sensores',
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
    'Mapa e legenda', 'Valores de LAI nos pontos', 'Obrigado! Dúvidas?', 'Até a próxima!',
  ];
  // O resumo de LAI e LAD antecede a explicação detalhada dos dois índices.
  titles.splice(5, 0, titles.splice(16, 1)[0]);
  titles.splice(3, 0, 'Por que estudar o LAI?', 'Mesmo LAI, diferentes distribuições de LAD');
  titles.splice(5, 0, 'Mesmo LAI, diferentes alturas');

  window.createSlideOverview = ({ totalSlides, getCurrentSlide, pause, resume, select }) => {
    const dialog = document.querySelector('#slideOverview');
    const grid = document.querySelector('#slideThumbGrid');
    const search = document.querySelector('#slideSearch');
    const count = document.querySelector('#slideSearchCount');
    const trigger = document.querySelector('#btnSlides');
    let resumeOnClose = false;
    const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const cards = Array.from({ length: totalSlides }, (_, i) => {
      const slide = i + 1;
      const title = titles[i] || `Slide ${slide}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slideThumb';
      button.dataset.slide = slide;
      button.setAttribute('aria-label', `Slide ${slide}: ${title}`);
      const image = document.createElement('img');
      image.alt = '';
      image.width = 480; image.height = 270;
      image.loading = 'lazy'; image.decoding = 'async';
      const caption = document.createElement('span');
      caption.className = 'slideThumbCaption';
      const number = document.createElement('span');
      number.className = 'slideThumbNumber'; number.textContent = String(slide).padStart(2, '0');
      const text = document.createElement('span'); text.textContent = title;
      caption.append(number, text); button.append(image, caption); grid.appendChild(button);
      button.addEventListener('click', () => {
        resumeOnClose = false;
        dialog.close();
        select(slide);
      });
      return { button, image, slide, searchable: normalize(`${slide} ${title}`) };
    });

    const filter = () => {
      const query = normalize(search.value.trim());
      let visible = 0;
      cards.forEach(card => {
        card.button.hidden = !card.searchable.includes(query);
        if (!card.button.hidden) visible++;
      });
      count.textContent = `${visible} ${visible === 1 ? 'slide' : 'slides'}`;
      document.querySelector('#slideSearchEmpty').hidden = visible !== 0;
    };
    const open = () => {
      if (dialog.open) return;
      resumeOnClose = pause();
      search.value = ''; filter();
      const theme = document.body.classList.contains('projector') ? 'light' : 'original';
      const current = getCurrentSlide();
      cards.forEach(card => {
        card.image.src = `assets/slides/${theme}/${String(card.slide).padStart(2, '0')}.webp?v=20261026-auditorio-final`;
        card.button.classList.toggle('is-current', card.slide === current);
        if (card.slide === current) card.button.setAttribute('aria-current', 'page');
        else card.button.removeAttribute('aria-current');
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
    dialog.addEventListener('close', () => {
      trigger.setAttribute('aria-expanded', 'false');
      if (resumeOnClose) resume();
      resumeOnClose = false;
      document.querySelector('#stage').focus({ preventScroll: true });
    });
    dialog.addEventListener('click', e => {
      if (e.target === dialog) dialog.close();
    });
    return { toggle, isOpen: () => dialog.open };
  };
})();
