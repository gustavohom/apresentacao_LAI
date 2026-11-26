/* Cronômetro de apresentação, independente da animação e da navegação. */
(() => {
  const form = document.querySelector('#talkClockForm');
  const duration = document.querySelector('#talkDuration');
  const blue = document.querySelector('#talkBlue');
  const orange = document.querySelector('#talkOrange');
  const red = document.querySelector('#talkRed');
  const pause = document.querySelector('#pauseTalkClock');
  const reset = document.querySelector('#resetTalkClock');
  const status = document.querySelector('#talkStatus');
  const error = document.querySelector('#talkClockError');
  const savedMessage = document.querySelector('#talkClockSaved');
  const clock = document.querySelector('#talkClock');
  const progress = document.querySelector('#talkProgress');
  const fill = progress.firstElementChild;
  const key = 'lai-talk-clock';
  const defaults = { total: 720, blue: 120, orange: 60, red: 30 };
  const valid = data => data && [data.total, data.blue, data.orange, data.red].every(Number.isInteger)
    && data.red > 0 && data.red < data.orange && data.orange < data.blue && data.blue < data.total && data.total <= 59999;

  let config = defaults;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (valid(saved)) config = saved;
  } catch (_) {}
  const format = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  duration.value = format(config.total);
  blue.value = config.blue;
  orange.value = config.orange;
  red.value = config.red;

  let shown = false;
  let elapsed = 0;
  let startedAt = null;
  let interval;
  let lastSlide;
  const stopInterval = () => {
    clearInterval(interval);
    interval = undefined;
  };
  const render = () => {
    const totalMs = config.total * 1000;
    const now = Math.min(totalMs, elapsed + (startedAt === null ? 0 : performance.now() - startedAt));
    const remaining = (totalMs - now) / 1000;
    const done = remaining <= 0;
    if (done) {
      elapsed = totalMs;
      startedAt = null;
      stopInterval();
    }
    clock.dataset.phase = remaining <= config.red ? 'red' : remaining <= config.orange ? 'orange' : remaining <= config.blue ? 'blue' : 'green';
    clock.dataset.paused = String(startedAt === null && !done);
    clock.toggleAttribute('data-expired', done);
    fill.style.width = `${now / totalMs * 100}%`;
    const time = format(Math.ceil(remaining));
    const display = done ? 'Tempo esgotado' : `${time} restantes`;
    progress.setAttribute('aria-valuemax', config.total);
    progress.setAttribute('aria-valuenow', Math.floor(now / 1000));
    progress.setAttribute('aria-valuetext', display);
    pause.disabled = !shown || done;
    pause.textContent = startedAt === null && !done ? 'Retomar' : 'Pausar';
    reset.disabled = !shown;
    const statusText = shown ? `${display}${startedAt === null && !done ? ' · pausado' : ''}` : `${format(config.total)} · inicia no slide 2`;
    if (status.textContent !== statusText) status.textContent = statusText;
  };
  const run = () => {
    stopInterval();
    startedAt = performance.now();
    shown = true;
    render();
    if (startedAt !== null) interval = setInterval(render, 100);
  };
  const resetClock = () => {
    stopInterval();
    startedAt = null;
    elapsed = 0;
    shown = false;
    render();
  };
  window.syncTalkClock = slide => {
    if (slide === lastSlide) return;
    lastSlide = slide;
    if (slide === 1 && shown) resetClock();
    if (slide === 2 && !shown) run();
  };
  form.addEventListener('input', () => { error.hidden = true; savedMessage.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const [minutes, seconds] = duration.value.split(':').map(Number);
    const next = { total: minutes * 60 + seconds, blue: blue.valueAsNumber, orange: orange.valueAsNumber, red: red.valueAsNumber };
    if (!valid(next)) {
      error.textContent = 'Os avisos devem ter valores decrescentes: azul, laranja e vermelho. Todos precisam ser menores que a duração.';
      error.hidden = false;
      return;
    }
    config = next;
    try { localStorage.setItem(key, JSON.stringify(config)); } catch (_) {}
    savedMessage.hidden = false;
    render();
  });
  pause.addEventListener('click', () => {
    if (startedAt === null) { run(); return; }
    elapsed += performance.now() - startedAt;
    startedAt = null;
    stopInterval();
    render();
  });
  window.resetTalkClock = resetClock;
  reset.addEventListener('click', resetClock);
  render();
})();
