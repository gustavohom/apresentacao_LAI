/* Tema claro opcional. As cores originais e a timeline não são modificadas. */
(() => {
  let paletteReady = false;
  const declarations = new Map();
  const paint = (el, property, value) => {
    if (!declarations.has(el)) declarations.set(el, {});
    declarations.get(el)[property] = value;
  };
  const parse = (value) => {
    if (!value) return null;
    const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      const h = hex[1].length === 3 ? [...hex[1]].map(c => c + c).join('') : hex[1];
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
    }
    const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
    if (!rgb) return null;
    const parts = rgb[1].split(',').map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  };
  const lum = (c) => [c.r, c.g, c.b].map(v => {
    v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  }).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
  const rgb = c => `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
  const ink = (c) => {
    if (Math.min(c.r, c.g, c.b) > 220) return '#233c2c';
    const next = { ...c };
    while ((1.05 / (lum(next) + .05)) < 4.8) {
      next.r *= .92; next.g *= .92; next.b *= .92;
    }
    return rgb(next);
  };
  const prepareLightPalette = () => {
    if (paletteReady) return;
    const svg = document.querySelector('#scene');
    const gradients = {
      sky: ['#d9effb', '#e9f6fc', '#f5fbfd', '#ffffff'],
      hillBack: ['#e2cdb6', '#ceb79b'],
      hillFront: ['#d0b595', '#bda181'],
      groundGrad: ['#77a950', '#a8c97c', '#cadfa9'],
    };
    Object.entries(gradients).forEach(([id, palette]) => {
      svg.querySelectorAll(`#${id} stop`).forEach((stop, i) => paint(stop, 'stop-color', palette[i] || palette.at(-1)));
    });
    svg.querySelectorAll('#rayGrad stop').forEach(stop => paint(stop, 'stop-color', '#c6932b'));

    // Os gráficos SHAP já possuem eixos e cores próprios sobre fundo branco.
    const fixedPlots = '#shapSingleScene, #shapGridScene';
    svg.querySelectorAll('text, tspan').forEach(el => {
      if (el.closest(fixedPlots) || el.classList.contains('rasterLabel')) return;
      const color = parse(el.getAttribute('fill'));
      if (color) paint(el, 'fill', ink(color));
    });
    svg.querySelectorAll('[stroke]').forEach(el => {
      if (el.closest(fixedPlots) || el.closest('#wood, #beamLightRays')) return;
      const color = parse(el.getAttribute('stroke'));
      if (!color) return;
      const stroke = Math.min(color.r, color.g, color.b) > 220 ? '#718a77' : ink(color);
      if (Math.min(color.r, color.g, color.b) > 220 || lum(color) > .35) {
        const c = parse(stroke);
        paint(el, 'stroke', `rgba(${c.r},${c.g},${c.b},${color.a})`);
      }
    });
    // Clareia somente fundos de painéis. Transparências de dados e feixes são preservadas.
    svg.querySelectorAll('rect').forEach(el => {
      if (el.closest(fixedPlots) || el.closest('#tree, #isoTrees, #grass, #clouds, #sun, #lidarPts, #drone, #airplane')) return;
      const color = parse(el.getAttribute('fill'));
      if (!color || color.a === 0) return;
      if (lum(color) < .11 && Math.max(color.r, color.g, color.b) < 145 && el.id !== 'night') {
        paint(el, 'fill', '#ffffff');
      }
    });
    const sheet = document.createElement('style');
    sheet.id = 'lightPalette';
    sheet.textContent = [...declarations].map(([el, properties], index) => {
      el.setAttribute('data-light-palette', index);
      const rules = Object.entries(properties).map(([key, value]) => `${key}:${value}!important`).join(';');
      return `body.projector:not(.beam-focus) #scene [data-light-palette="${index}"]{${rules}}`;
    }).join('\n');
    document.head.appendChild(sheet);
    declarations.clear();
    paletteReady = true;
  };

  window.initPresentationTheme = () => {
    const button = document.querySelector('#btnTheme');
    const sun = '<svg viewBox="0 0 24 24" data-theme-icon="sun" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4L19 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    const moon = '<svg viewBox="0 0 24 24" data-theme-icon="moon" aria-hidden="true"><path d="M20.8 14.4A8.6 8.6 0 0 1 9.6 3.2a8.6 8.6 0 1 0 11.2 11.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const storageKey = 'lai-presentation-theme';
    const setTheme = (light) => {
      if (light) prepareLightPalette();
      document.body.classList.toggle('projector', light);
      button.setAttribute('aria-pressed', String(light));
      const next = light ? 'tema escuro' : 'tema claro';
      button.setAttribute('aria-label', `Mudar para ${next}`);
      button.title = `Mudar para ${next}`;
      button.innerHTML = light ? moon : sun;
    };
    let saved = 'original';
    try { saved = localStorage.getItem(storageKey) || 'original'; } catch (_) {}
    setTheme(saved === 'light');
    button.addEventListener('keydown', (event) => {
      if (event.code === 'Space' || event.code === 'Enter') event.stopPropagation();
    });
    button.addEventListener('click', () => {
      const light = !document.body.classList.contains('projector');
      setTheme(light);
      try { localStorage.setItem(storageKey, light ? 'light' : 'original'); } catch (_) {}
    });
  };
})();
