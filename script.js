/* ─── HAMBURGER MENU — runs always, no GSAP needed ─── */
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('#menuToggle');
  const mobileMenu = document.querySelector('#mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuToggle && mobileMenu) {
    const toggleMenu = (forceClose = false) => {
      const isOpening = forceClose ? false : !mobileMenu.classList.contains('active');
      menuToggle.classList.toggle('active', isOpening);
      mobileMenu.classList.toggle('active', isOpening);
      document.body.style.overflow = isOpening ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', () => toggleMenu());

    mobileLinks.forEach(link => link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) toggleMenu(true);
    }));

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) toggleMenu(true);
    });
  }

  // Navbar scroll style
  const navbar = document.querySelector('.navbar');
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      navbar?.classList.toggle('scrolled', window.scrollY > 50);
      scrollTicking = false;
    });
  }, { passive: true });

  /* ─── VIDEO AUTOPLAY (MOBILE COMPATIBILITY) ─── */
  const initAutoPlayVideos = () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      // Ensure basic attributes are set
      video.muted = true;
      video.autoplay = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      
      // Try play immediately
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocked it, try again on first user interaction
          const playOnUserAction = () => {
            video.play();
            document.removeEventListener('touchstart', playOnUserAction);
          };
          document.addEventListener('touchstart', playOnUserAction);
        });
      }
    });
  };

  initAutoPlayVideos();

  /* ─── INSTAGRAM REELS FIX ─── */
  // Sometimes mobile browsers need an extra nudge to load IG embeds
  // This polling mechanism is highly effective for phone browsers (Safari/Chrome/iOS/Android)
  const pollForInsta = () => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts++;
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
        // Once found, we don't necessarily stop as more elements might be rendering
      }
      if (attempts >= maxAttempts) clearInterval(interval);
    }, 1000);
  };

  if (document.readyState === 'complete') {
    pollForInsta();
  } else {
    window.addEventListener('load', pollForInsta);
  }
});

/* ─── GSAP ANIMATIONS — optional, only run if GSAP is available ─── */
(() => {
  if (typeof gsap === 'undefined') {
    console.warn('[Lokum] GSAP not found – animations skipped.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.fps(60);

  /* ─────────────────────────────────────────
     HELPER: safe querySelector
  ───────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ================= LAZY LOAD ================= */
  function initLazyLoading() {
    const lazyImages = $$('.lazy');
    if (!lazyImages.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
        }
        obs.unobserve(img);
      });
    });

    lazyImages.forEach(img => observer.observe(img));
  }

  /* ================= GALLERY ================= */
  function initGallery() {
    const galleryItems = $$('.gallery-item');
    if (!galleryItems.length) return;

    galleryItems.forEach(item => {
      gsap.from(item, {
        y: 100,
        opacity: 0,
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 92%',
          once: true,
        },
      });
    });

    const galleryImgs = $$('.gallery-item img');
    galleryImgs.forEach((img, i) => {
      gsap.to(img, {
        y: '+=8',
        duration: 2.8 + i * 0.15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.1,
      });
    });

    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      if (!img) return;
      item.addEventListener('mouseenter', () =>
        gsap.to(img, { scale: 1.04, duration: 0.5, overwrite: 'auto' })
      );
      item.addEventListener('mouseleave', () =>
        gsap.to(img, { scale: 1, duration: 0.7, overwrite: 'auto' })
      );
    });

    const gallery = $('.gallery-wrapper');
    if (!gallery) return;

    let lastMove = 0;
    gallery.addEventListener('mousemove', e => {
      const now = performance.now();
      if (now - lastMove < 33) return;
      lastMove = now;
      const offsetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      galleryImgs.forEach((img, i) => {
        gsap.to(img, {
          x: offsetX * ((i + 1) * 8),
          duration: 0.9,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    }, { passive: true });

    gallery.addEventListener('mouseleave', () => {
      galleryImgs.forEach(img =>
        gsap.to(img, { x: 0, duration: 1.4, ease: 'power3.out', overwrite: 'auto' })
      );
    });
  }

  /* ================= THEME ================= */
  function initTheme() {
    const toggle = $('#themeToggle');
    const label = $('#themeLabel');

    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-mode');
    }

    const updateLabel = () => {
      if (!label) return;
      const isLight = document.body.classList.contains('light-mode');
      label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
    };

    updateLabel();

    toggle?.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      localStorage.setItem(
        'theme',
        document.body.classList.contains('light-mode') ? 'light' : 'dark'
      );
      updateLabel();
    });
  }


  /* ================= SEASONAL / EVENTS EFFECTS ================= */
  function initSeasonalEffects() {
    const eidSection = $('.eid-section');
    if (eidSection) {
      const eidHeading = $('.eid-section .eid-main-title') || $('.eid-section .section-heading-light');
      if (eidHeading) {
        gsap.from(eidHeading, {
          scrollTrigger: { trigger: eidSection, start: 'top 85%', once: true },
          y: 50, opacity: 0, duration: 1.4, ease: 'power3.out',
        });
      }
      const eidPlatter = $('.eid-platter');
      if (eidPlatter) {
        gsap.from(eidPlatter, {
          scrollTrigger: { trigger: eidPlatter, start: 'top 85%', once: true },
          y: 30, opacity: 0, duration: 1.2, ease: 'power3.out',
        });
      }
    }

    const eventCards = $$('.event-card');
    if (eventCards.length) {
      gsap.from(eventCards, {
        scrollTrigger: { trigger: '.events-section', start: 'top 80%', once: true },
        y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15,
      });
    }
  }

  /* ================= AUTOPLAY VIDEOS ================= */
  // Now handled at the top for reliability


  /* ================= STORY PARALLAX ================= */
  function initStoryParallax() {
    const section = $('.story-section');
    if (!section) return;

    gsap.to('.img-main', {
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      },
      y: -50,
      ease: 'none'
    });

    gsap.to('.img-offset-wrap', {
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      },
      y: -120,
      ease: 'none'
    });
  }

  /* ================= CONTACT ================= */
  function initContactAnimations() {
    const cards = $$('.luxury-contact-card');
    if (!cards.length) return;

    // Staggered reveal
    gsap.from(cards, {
      scrollTrigger: {
        trigger: '.premium-contact-suite',
        start: 'top 80%',
        once: true
      },
      x: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Mouse follow glow
    cards.forEach(card => {
      const glow = card.querySelector('.card-glow');
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gsap.to(glow, {
          opacity: 1,
          duration: 0.4,
          '--x': `${x}px`,
          '--y': `${y}px`,
          background: `radial-gradient(circle at ${x}px ${y}px, rgba(197, 160, 89, 0.15), transparent 70%)`
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(glow, { opacity: 0, duration: 0.6 });
      });
    });
  }

  /* ================= INIT ALL ================= */
  // script.js is already at end of <body> so DOM is ready — no DOMContentLoaded needed
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 50,
      easing: 'ease-out-cubic'
    });
  }

  ScrollTrigger.refresh();
  initLazyLoading();
  initGallery();
  initTheme();
  initSeasonalEffects();
  // initAutoPlayVideos(); // Moved to top
  initContactAnimations();
  initStoryParallax();
})();
