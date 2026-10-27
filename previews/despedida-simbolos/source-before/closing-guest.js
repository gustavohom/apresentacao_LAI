/* Brincadeiras de Gustavo no slide de despedida, com poses novas e já existentes. */
(() => {
  window.createClosingGuest = ({ root }) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motion = root.querySelector('.closingGuestMotion');
    const shadow = root.querySelector('.closingGuestShadow');
    const poses = [...root.querySelectorAll('.closingGuestPose')];
    const leaf = root.querySelector('#closingGuestLeaf');
    let cycle = null;
    const pose = name => {
      poses.forEach(element => gsap.set(element, { opacity: element.dataset.pose === name ? 1 : 0 }));
      root.dataset.action = name;
    };
    const stop = () => {
      cycle?.kill(); cycle = null;
      gsap.killTweensOf([root, motion, shadow, leaf, ...poses]);
      gsap.set(root, { autoAlpha: 0 });
      gsap.set(motion, { xPercent: 0, yPercent: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      gsap.set(shadow, { scaleX: 1, opacity: .38 });
      gsap.set(leaf, { x: -100, y: 105, rotation: -25, scale: .85, opacity: 0, svgOrigin: '0 0', smoothOrigin: false });
      pose('wave');
      root.dataset.action = 'idle';
    };
    const start = () => {
      stop();
      pose('wave');
      gsap.to(root, { autoAlpha: 1, duration: reduced ? .1 : .65 });
      if (reduced) return;
      cycle = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      cycle.call(() => pose('wave'), [], 0)
        .set(motion, { xPercent: 0, yPercent: 0, rotation: 0, scaleX: 1, scaleY: 1 }, 0)
        .set(leaf, { x: -100, y: 105, rotation: -25, opacity: 0 }, 0)
        .to(motion, { rotation: 1.3, yPercent: -.5, duration: 1.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, .5)
        .set(leaf, { opacity: 1 }, 3.6)
        .fromTo(leaf, { x: -100, y: 105, rotation: -25 }, { x: 630, y: 75, rotation: 150, duration: 2.3, ease: 'none', immediateRender: false }, 3.6)
        .to(leaf, { opacity: 0, duration: .2 }, 5.7)
        .to(motion, { scaleY: .94, duration: .12, ease: 'power2.in' }, 4.15)
        .call(() => pose('duck'), [], 4.27)
        .to(motion, { scaleY: 1, rotation: -2, duration: .24, ease: 'power2.out' }, 4.27)
        .call(() => pose('balance'), [], 5.35)
        .to(motion, { yPercent: -6, rotation: 4, duration: .22, ease: 'power2.out' }, 5.35)
        .to(shadow, { scaleX: .7, opacity: .22, duration: .22 }, 5.35)
        .to(motion, { yPercent: 0, rotation: -3, duration: .34, ease: 'bounce.out' }, 5.57)
        .to(shadow, { scaleX: 1, opacity: .38, duration: .34 }, 5.57)
        .to(motion, { rotation: 3, duration: .15, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 5.95)
        .call(() => pose('shrug'), [], 6.65)
        .to(motion, { rotation: 0, yPercent: 0, duration: .3 }, 6.65)
        .call(() => pose('grimace'), [], 7.35)
        .fromTo(motion, { rotation: -2 }, { rotation: 2, duration: .07, repeat: 5, yoyo: true, ease: 'sine.inOut', immediateRender: false }, 7.35)
        .call(() => pose('wave'), [], 8.1)
        .to(motion, { rotation: 0, duration: .3 }, 8.1)
        .call(() => pose('shush'), [], 9.15)
        .to(motion, { rotation: 1.7, duration: .3 }, 9.15)
        .call(() => pose('sneeze'), [], 11)
        .to(motion, { yPercent: 1.4, rotation: -3, duration: .12, ease: 'power2.in' }, 11)
        .to(motion, { yPercent: 0, rotation: 0, duration: .35, ease: 'back.out(1.8)' }, 11.12)
        .call(() => pose('shrug'), [], 12.5)
        .call(() => pose('dance'), [], 14.2)
        .fromTo(motion, { rotation: -3, xPercent: -1.5 }, { rotation: 3, xPercent: 1.5, duration: .22, yoyo: true, repeat: 9, ease: 'sine.inOut', immediateRender: false }, 14.2)
        .fromTo(motion, { yPercent: 0 }, { yPercent: -1.8, duration: .22, yoyo: true, repeat: 9, ease: 'sine.inOut', immediateRender: false }, 14.2)
        .call(() => pose('shrug'), [], 16.6)
        .to(motion, { xPercent: 0, yPercent: 0, rotation: 0, duration: .35 }, 16.6)
        .call(() => pose('bow'), [], 18.5)
        .to(motion, { rotation: -2, yPercent: 1, duration: .3 }, 18.5)
        .to(motion, { rotation: 0, yPercent: 0, duration: .4 }, 19.3)
        .call(() => pose('heart'), [], 21)
        .to(motion, { yPercent: -1, duration: .5, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 21)
        .call(() => pose('wave'), [], 24)
        .fromTo(motion, { rotation: -1.6 }, { rotation: 1.6, duration: .4, repeat: 3, yoyo: true, ease: 'sine.inOut', immediateRender: false }, 24.4)
        .to(motion, { rotation: 0, duration: .3 }, 26)
        .to(motion, { yPercent: -.4, duration: 2, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 26.4)
        .to({}, { duration: 1.6 }, 34.4);
    };
    stop();
    return { start, stop };
  };
})();
