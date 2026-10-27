/* Brincadeira opcional do slide 2: um clique, lançamento em arco e careta. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, parent) => {
    const element = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value));
    parent.appendChild(element); return element;
  };
  window.createPeopleClock = ({ scene }) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gustavo = document.querySelector('#personGustavo .avatarActing');
    const josi = document.querySelector('#personJosi .avatarActing');
    const normal = gustavo.querySelector('.avatarNormal');
    const grimace = gustavo.querySelector('.avatarGrimace');
    const trail = make('path', { id: 'peopleClockArc', fill: 'none', stroke: '#b99244', 'stroke-width': 2.5, 'stroke-linecap': 'round', pathLength: 1, opacity: 0 }, scene);
    const clock = make('g', { id: 'peopleThrownClock', opacity: 0 }, scene);
    make('path', { d: 'M-20 25L-25 39M20 25L25 39', fill: 'none', stroke: '#816432', 'stroke-width': 6, 'stroke-linecap': 'round' }, clock);
    make('ellipse', { cx: -24, cy: -28, rx: 17, ry: 10, fill: '#d7a63b', stroke: '#8b662b', 'stroke-width': 2.5, transform: 'rotate(-28 -24 -28)' }, clock);
    make('ellipse', { cx: 24, cy: -28, rx: 17, ry: 10, fill: '#d7a63b', stroke: '#8b662b', 'stroke-width': 2.5, transform: 'rotate(28 24 -28)' }, clock);
    make('path', { d: 'M0-33V-42M-6-42H6', fill: 'none', stroke: '#8b662b', 'stroke-width': 4, 'stroke-linecap': 'round' }, clock);
    make('circle', { r: 34, fill: '#edc86b', stroke: '#8b662b', 'stroke-width': 3 }, clock);
    make('circle', { r: 28, fill: '#fffcf2', stroke: '#b9944c', 'stroke-width': 1.5 }, clock);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      make('path', { d: `M${Math.sin(a) * 22} ${-Math.cos(a) * 22}L${Math.sin(a) * 25} ${-Math.cos(a) * 25}`, stroke: '#6d5833', 'stroke-width': i % 3 ? 1.6 : 2.5, 'stroke-linecap': 'round' }, clock);
    }
    make('path', { d: 'M-11-12L0 0L16-8', fill: 'none', stroke: '#344a3b', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, clock);
    make('circle', { r: 3.5, fill: '#b77825' }, clock);
    const impact = make('g', { id: 'peopleClockImpact', opacity: 0 }, scene);
    [[-51,-15,9],[47,-22,8],[-32,-47,7],[29,-52,6]].forEach(([x,y,r]) => {
      make('path', { d: `M${x} ${y-r}L${x+r*.28} ${y-r*.28}L${x+r} ${y}L${x+r*.28} ${y+r*.28}L${x} ${y+r}L${x-r*.28} ${y+r*.28}L${x-r} ${y}L${x-r*.28} ${y-r*.28}Z`, fill: '#dba82d' }, impact);
    });
    let ready = false, played = false, busy = false, animation, runId = 0;
    const phase = value => { scene.dataset.clockState = value; };
    const reset = () => {
      runId++;
      animation?.kill(); animation = null; played = false; busy = false;
      gsap.killTweensOf([gustavo, josi, normal, grimace, clock, impact, trail]);
      gsap.set([gustavo, josi], { clearProps: 'transform' });
      gsap.set([gustavo, josi], { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      gsap.set(normal, { opacity: 1 }); gsap.set(grimace, { opacity: 0 });
      gsap.set([clock, impact], { clearProps: 'transform' });
      gsap.set([clock, impact], { x: 0, y: 0, rotation: 0, scale: 1, svgOrigin: '0 0', smoothOrigin: false, opacity: 0 });
      gsap.set(trail, { opacity: 0, strokeDasharray: 1, strokeDashoffset: 1 });
      phase('idle');
    };
    const trigger = () => {
      if (!ready || played) return false;
      if (busy) return true;
      // Toda execução começa com as mesmas poses e transformações, mesmo após interrupção.
      reset();
      const thisRun = runId;
      busy = true; phase('windup');
      const box = document.querySelector('#peopleSlide').getBoundingClientRect();
      const rect = selector => {
        const b = document.querySelector(selector).getBoundingClientRect();
        return { x: (b.x-box.x)*1920/box.width, y: (b.y-box.y)*1080/box.height, w: b.width*1920/box.width, h: b.height*1080/box.height };
      };
      const from = rect('#personJosi img'), to = rect('#personGustavo .avatarNormal'), eric = rect('#personEric img');
      const sx = from.x + from.w*.24, sy = from.y + from.h*.23;
      const tx = to.x + to.w*.55, ty = to.y + to.h*.025 - 37;
      const crossing = (sx-(eric.x+eric.w*.53))/(sx-tx);
      // O relógio inteiro cruza acima do cabelo do Eric, com margem de segurança.
      const safeY = eric.y - 75;
      const lift = Math.max(65, (sy+(ty-sy)*crossing-safeY)/(4*crossing*(1-crossing)));
      trail.setAttribute('d', `M${sx} ${sy}Q${(sx+tx)/2} ${(sy+ty)/2-2*lift} ${tx} ${ty}`);
      scene.dataset.ericClearance = String(Math.round(eric.y - (sy+(ty-sy)*crossing-4*lift*crossing*(1-crossing)+43)));
      const flight = { p: 0 };
      const turnBase = reduced ? 0 : -720;
      const renderFlight = () => {
        if (thisRun !== runId) return;
        const p = flight.p;
        gsap.set(clock, { x: sx+(tx-sx)*p, y: sy+(ty-sy)*p-4*lift*p*(1-p), rotation: reduced ? 0 : 12+turnBase*p });
      };
      gsap.set(clock, { x: sx, y: sy, rotation: 12, scale: .9 });
      gsap.set(impact, { x: tx, y: ty, scale: .7 });
      gsap.set(trail, { strokeDasharray: 1, strokeDashoffset: 1 });
      animation = gsap.timeline({ onComplete: () => {
        if (thisRun !== runId) return;
        busy = false; played = true; phase('landed');
        window.dispatchEvent(new CustomEvent('people-clock-complete'));
      } });
      animation.to(josi, { rotation: 3.5, duration: .22, ease: 'power2.inOut' }, 0)
        .to(josi, { rotation: -5, x: -4, duration: .22, ease: 'power2.out' }, .22)
        .to(josi, { rotation: 0, x: 0, duration: .65, ease: 'back.out(1.5)' }, .44)
        .to(clock, { opacity: 1, scale: 1, duration: .12 }, .22)
        .call(() => phase('flying'), [], .3)
        .to(trail, { opacity: .28, strokeDashoffset: 0, duration: 1.5, ease: 'none' }, .3)
        .to(flight, { p: 1, duration: 1.5, ease: 'none', onUpdate: renderFlight }, .3)
        .call(() => phase('impact'), [], 1.8)
        .to(normal, { opacity: 0, duration: .08 }, 1.8)
        .to(grimace, { opacity: 1, duration: .08 }, 1.8)
        .to(gustavo, { rotation: -5, y: 4, scaleY: .97, duration: .13, ease: 'power2.out' }, 1.8)
        .to(gustavo, { rotation: 0, y: 0, scaleY: 1, duration: .65, ease: 'elastic.out(1,.45)' }, 1.93)
        .to(impact, { opacity: 1, scale: 1.2, duration: .14 }, 1.8)
        .to(impact, { opacity: 0, scale: 1.45, duration: .65 }, 1.94)
        .fromTo(clock, { y: ty, rotation: reduced ? 0 : turnBase+12 }, { y: ty-42, rotation: turnBase-16, duration: .22, ease: 'power2.out', immediateRender: false }, 1.8)
        .fromTo(clock, { y: ty-42, rotation: turnBase-16 }, { y: ty, rotation: turnBase+9, duration: .3, ease: 'bounce.out', immediateRender: false }, 2.02)
        .fromTo(clock, { rotation: turnBase+9 }, { rotation: turnBase-8, duration: .12, yoyo: true, repeat: 3, ease: 'sine.inOut', immediateRender: false }, 2.32)
        .to(clock, { rotation: turnBase, duration: .2 }, 2.8)
        .to(trail, { opacity: 0, duration: .5 }, 1.8)
        .to({}, { duration: .2 }, 3);
      return true;
    };
    reset();
    return { trigger, reset, sync(value) {
      ready = value;
      if (!ready && (played || busy)) reset();
    } };
  };
})();
