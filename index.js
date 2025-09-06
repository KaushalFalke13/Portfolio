
function LocomotiveScroll() { gsap.registerPlugin(ScrollTrigger);

const locoScroll = new LocomotiveScroll({
  el: document.querySelector(".smooth-scroll"),
  smooth: true,
  lerp: 0.03
});
// each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
locoScroll.on("scroll", ScrollTrigger.update);

// tell ScrollTrigger to use these proxy methods for the ".smooth-scroll" element since Locomotive Scroll is hijacking things
ScrollTrigger.scrollerProxy(".smooth-scroll", {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  }, // we don't have to define a scrollLeft because we're only scrolling vertically.
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
  },
  // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
  pinType: document.querySelector(".smooth-scroll").style.transform ? "transform" : "fixed"
});



// each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
ScrollTrigger.refresh();
}













function initAll() {
  initLoader();
  initNavbarScroll();
  initAboutAnimation();
  initCurveAnimation("curvePath", ".curveContainer");
}
function initLoader() {
  const greeting = document.querySelector('.greeting');
  const loader = document.querySelector('.loader');
  const mainContent = document.querySelector('.hero');
  const greetingsList = ['नमस्ते', 'Hola', 'Bonjour', 'Ciao'];

  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  let index = 0;

  // Display greetings one by one
  const showNextGreeting = () => {
    if (index < greetingsList.length) {
      greeting.innerText = greetingsList[index];
      index++;
      setTimeout(showNextGreeting, 200);
    } else {
      completeLoading();
    }
  };

  // Fade out loader and reveal main content
  const completeLoading = () => {
    mainContent.classList.add('show');
    loader.classList.add('fade-out');

    setTimeout(() => {
      loader.style.display = 'none';
      initNameScroll();
      ScrollTrigger.refresh();  // ✅ recalc positions
    }, 800);
  };

  showNextGreeting();
}
function initNavbarScroll() {
  const navItem = document.querySelector(".nav-item");
  const menuButton = document.querySelector(".navbarButton");

  if (!navItem || !menuButton) return;

  const handleScroll = () => {
    if (window.scrollY > 100) {
      menuButton.classList.add("show");
      navItem.classList.add("shrink");
    } else {
      menuButton.classList.remove("show");
      navItem.classList.remove("shrink");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => window.removeEventListener("scroll", handleScroll);
}
function initAboutAnimation() {
  const tl = gsap.timeline({
    defaults: { ease: "power1.inOut" },
    scrollTrigger: {
      trigger: ".about-wrapper",
      start: "top top",
      end: "+=150%",
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
    },
    onComplete: () => {
      console.log("About animation completed");
      ScrollTrigger.refresh();
      // footerAnimation();
    }
  });

  tl.to('.about-section', {
    scale: 8,
    transformOrigin: "50% 50%",
    duration: 1
  })
    .to('.about-section', {
      autoAlpha: 0,
      opacity: 0,
      duration: 0.6
    }, "-=0.25")
    .to('.projects', {
      autoAlpha: 1,
      opacity: 1,
      duration: 0.8,
      pointerEvents: 'auto'
    }, "<0.15");

}
function initCurveAnimation(pathId, triggerSelector, minWidth = 0, maxWidth = 180) {
  const path = document.getElementById(pathId);
  if (!path) {
    console.warn(`Path with id "${pathId}" not found`);
    return;
  }

  let curve = { width: maxWidth };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerSelector,
      start: "top 90%",
      end: "top 10%",
      scrub: 0.8
    }
  });

  tl.to(curve, {
    width: minWidth,
    onUpdate: () => {
      const d = `M0,0 C480,${curve.width} 960,${curve.width} 1440,0 L1440,0 L480,0 Z`;
      path.setAttribute("d", d);
    }
  });
  // tl.to(".FooterSection", {
  // y: () => {
  //   const el = document.querySelector(".FooterSection");
  //   return -(el.offsetHeight * 0.5);
  // },
  // ease: "none",
  // onStart: () => console.log("Footer animation triggered"),
  // scrollTrigger: {
  //   trigger: ".footer-wrapper",
  // start: "top bottom", 
  //   toggleActions: "play none none reverse",
  //   markers: true
  // }
  // });
}
function startAdvancedSeamlessScroll(el1, el2, baseSpeedPxPerSec, initialDirection = 'left') {

  el1.style.transform = '';
  el2.style.transform = '';

  el1.offsetHeight;
  el2.offsetHeight;

  let w1 = el1.offsetWidth;
  let w2 = el2.offsetWidth;
  let x1, x2;
  let direction = initialDirection === 'left' ? -1 : 1;

  let currentSpeed = baseSpeedPxPerSec;
  let targetSpeed = baseSpeedPxPerSec;
  let isScrolling = false;
  let animationId;
  let isInitialized = false;

  const setInitialPositions = () => {
    w1 = el1.offsetWidth;
    w2 = el2.offsetWidth;

    if (direction === -1) { // left
      x1 = 0;
      x2 = w1;
    } else { // right  
      x1 = -w1;
      x2 = 0;
    }

    el1.style.transform = `translate3d(${x1}px, -50%, 0)`;
    el2.style.transform = `translate3d(${x2}px, -50%, 0)`;

    isInitialized = true;
    return true;
  };

  const waitForElements = () => {
    return new Promise((resolve) => {
      const check = () => {
        if (el1.offsetWidth > 0 && el2.offsetWidth > 0) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  };

  waitForElements().then(() => {
    setInitialPositions();
    if (!animationId) {
      animationId = requestAnimationFrame(frame);
    }
  });

  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (isInitialized) {
        setInitialPositions();
      }
    }, 100);
  };
  window.addEventListener('resize', handleResize);

  let last = performance.now();
  let lastScrollY = window.scrollY;

  function frame(now) {
    if (!isInitialized) {
      animationId = requestAnimationFrame(frame);
      return;
    }

    const dt = (now - last) / 1000;
    last = now;

    // Smooth speed interpolation for natural feeling transitions
    targetSpeed = isScrolling ? baseSpeedPxPerSec * 2 : baseSpeedPxPerSec;

    const easing = 0.15;
    currentSpeed += (targetSpeed - currentSpeed) * easing;

    const velocity = currentSpeed * direction;

    x1 += velocity * dt;
    x2 += velocity * dt;

    // Handle wrapping for seamless loop
    if (direction === -1) { // moving left
      if (x1 + w1 <= 0) x1 = x2 + w2;
      if (x2 + w2 <= 0) x2 = x1 + w1;
    } else { // moving right
      if (x1 >= window.innerWidth) x1 = x2 - w1;
      if (x2 >= window.innerWidth) x2 = x1 - w2;
    }

    el1.style.transform = `translate3d(${x1}px, -50%, 0)`;
    el2.style.transform = `translate3d(${x2}px, -50%, 0)`;

    animationId = requestAnimationFrame(frame);
  }

  // Scroll handler with debouncing
  let scrollTimeout;
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        isScrolling = true;

        if (currentScrollY > lastScrollY) {
          direction = -1; // Scrolling DOWN → Move text LEFT
        } else if (currentScrollY < lastScrollY) {
          direction = 1; // Scrolling UP → Move text RIGHT  
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 300);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return {
    setDirection: (newDirection) => {
      direction = newDirection === 'left' ? -1 : 1;
    },
    destroy: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      clearTimeout(resizeTimeout);
    }
  };
}
function initNameScroll() {
  const name1 = document.querySelector('.name1');
  const name2 = document.querySelector('.name2');

  if (window.nameScrollController && window.nameScrollController.destroy) {
    window.nameScrollController.destroy();
    window.nameScrollController = null;
  }

  if (name1 && name2) {
    setTimeout(() => {
      window.nameScrollController = startAdvancedSeamlessScroll(name1, name2, 80, 'left');
    }, 50);

  } else {
    console.warn('Name elements not found, retrying in 500ms');
    setTimeout(initNameScroll, 500);
  }
}

// function skillsCardScroll() {

//   const tl = gsap.timeline({
//     defaults: { ease: "power1.inOut" },
//     scrollTrigger: {
//       trigger: ".skills",
//       start: "top top",
//       end: "+=200%",
//       scrub: true,
//       markers: true,
//     }
//   });

//   tl.to(".skillsCardsContainer1", {
//     x: 400,
//     ease: "none"
//   }, 0);

//   tl.to(".skillsCardsContainer2", {
//     x: -400 ,
//     ease: "none"
//   }, 0);
// }
// skillsCardScroll();




// function footerAnimation() {
//   const tl = gsap.timeline({
//     scrollTrigger: {
//       trigger: ".footer-wrapper",
//       start: "top bottom",
//       end: "bottom top",
//       scrub: 2,
//       markers: true,
//     }
//   });

//   tl.fromTo(
//     ".FooterSection",
//     { y: "20vh" },
//     { y: "-20vh", ease: "none" }
//   );

//   // Circle button moves in at the same time
//   tl.fromTo(
//     ".circle-btn",
//     { x: "-60px" },
//     { x: "0px", ease: "none" },
//     "<" // "<" = start at the same time as previous animation
//   );
// }

// const scroll = new LocomotiveScroll({
//   el: document.querySelector("[data-scroll-container]"),
//   smooth: true
// });



(function () {
  const btn = document.querySelector('.circle-btn');
  if (!btn) return;

  const inner = btn.querySelector('.circle-inner');
  const text = btn.querySelector('.circle-text');

  let rect = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId = null;
  const maxOffset = 18; 

  function updateRect() {
    rect = btn.getBoundingClientRect();
  }

  function onMove(e) {
    if (!rect) updateRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const px = Math.max(-1, Math.min(1, x / (rect.width / 2)));
    const py = Math.max(-1, Math.min(1, y / (rect.height / 2)));

    targetX = px * maxOffset;
    targetY = py * maxOffset;

    btn.classList.add('hover');

    if (!rafId) rafId = requestAnimationFrame(render);
  }

  function render() {
    // smoothing
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    // set CSS variables consumed by .circle-inner transform
    inner.style.setProperty('--tx', currentX + 'px');
    inner.style.setProperty('--ty', currentY + 'px');

    // small parallax on text (half the movement)
    text.style.transform = `translate(${currentX * 0.45}px, ${currentY * 0.45}px)`;

    // keep rAF loop while not settled
    if (Math.abs(currentX - targetX) > 0.1 || Math.abs(currentY - targetY) > 0.1) {
      rafId = requestAnimationFrame(render);
    } else {
      // settled; stop loop
      rafId = null;
    }
  }

  function onLeave() {
    // return to center
    targetX = 0; targetY = 0;
    btn.classList.remove('hover');
    if (!rafId) rafId = requestAnimationFrame(render);
  }

  // update rect on resize
  window.addEventListener('resize', () => {
    updateRect();
  }, { passive: true });

  btn.addEventListener('pointerenter', (e) => {
    updateRect();
  });
  btn.addEventListener('pointermove', onMove);
  btn.addEventListener('pointerleave', onLeave);
  btn.addEventListener('pointercancel', onLeave);

}());

window.addEventListener('load', initAll);