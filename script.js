
(() => {
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.fps(60);

  /* ================= NAVIGATION ================= */
  function initNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    const navbar = document.querySelector(".navbar");

    const toggleMenu = (forceClose = false) => {
      const isOpening = forceClose
        ? false
        : !mobileMenu?.classList.contains("active");

      menuToggle?.classList.toggle("active", isOpening);
      mobileMenu?.classList.toggle("active", isOpening);
      document.body.style.overflow = isOpening ? "hidden" : "";
    };

    menuToggle?.addEventListener("click", () => toggleMenu());
    mobileLinks.forEach(link =>
      link.addEventListener("click", () => toggleMenu(true))
    );

    window.addEventListener("scroll", () => {
      navbar?.classList.toggle("scrolled", window.scrollY > 50);
    });
  }

  /* ================= LAZY LOAD ================= */
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll(".lazy");
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          obs.unobserve(img);
        }
      });
    });
    lazyImages.forEach(img => observer.observe(img));
  }

  /* ================= GALLERY ================= */
  function initGallery() {
    const gallery = document.querySelector(".gallery-wrapper");
    const images = document.querySelectorAll(".gallery-item img");

    gsap.utils.toArray(".gallery-item").forEach(item => {
      gsap.from(item, {
        y: 120,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: { trigger: item, start: "top 90%" }
      });
    });

    images.forEach((img, i) => {
      img.style.willChange = "transform";
      gsap.to(img, {
        y: "+=10",
        duration: 3 + i * 0.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

    document.querySelectorAll(".gallery-item").forEach(item => {
      const img = item.querySelector("img");
      item.addEventListener("mouseenter", () =>
        gsap.to(img, { scale: 1.03, duration: 0.6 })
      );
      item.addEventListener("mouseleave", () =>
        gsap.to(img, { scale: 1, duration: 0.8 })
      );
    });

    let lastMove = 0;
    gallery?.addEventListener("mousemove", e => {
      const now = performance.now();
      if (now - lastMove < 50) return;
      lastMove = now;

      const centerX = window.innerWidth / 2;
      const offsetX = (e.clientX - centerX) / centerX;

      images.forEach((img, i) => {
        const depth = (i + 1) * 10;
        gsap.to(img, { x: offsetX * depth, duration: 1 });
      });
    });

    gallery?.addEventListener("mouseleave", () => {
      images.forEach(img => gsap.to(img, { x: 0, duration: 1.6 }));
    });
  }

  /* ================= THEME ================= */
  function initTheme() {
    const toggle = document.getElementById("themeToggle");
    const label = document.getElementById("themeLabel");

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light-mode");
    }

    function updateLabel() {
      if (!label) return;
      label.textContent = document.body.classList.contains("light-mode")
        ? "Light Mode"
        : "Dark Mode";
    }

    updateLabel();

    toggle?.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      localStorage.setItem(
        "theme",
        document.body.classList.contains("light-mode") ? "light" : "dark"
      );
      updateLabel();
    });
  }

  /* ================= MUSIC ================= */
  function initMusic() {
    const music = document.getElementById("bgMusic");
    const musicToggleBtn = document.getElementById("musicToggle");

    musicToggleBtn?.addEventListener("click", () => {
      if (!music) return;
      if (music.paused) {
        music.volume = 0.3;
        music.play();
        musicToggleBtn.textContent = "❚❚";
      } else {
        music.pause();
        musicToggleBtn.textContent = "♪";
      }
    });
  }

 
  /* ================= IFTAR TIMER ================= */
 function initIftarTimer() {
  const countdownEl = document.getElementById("iftarCountdown");
  if (!countdownEl) return;

  // Bengaluru Iftar time
  const IFTAR_HOUR = 18;  // 6 PM
  const IFTAR_MINUTE = 30; // 6:30 PM

  function updateTimer() {
    const now = new Date();
    const iftarTime = new Date();
    iftarTime.setHours(IFTAR_HOUR, IFTAR_MINUTE, 0, 0);

    // If time passed, move to next day
    if (now > iftarTime) {
      iftarTime.setDate(iftarTime.getDate() + 1);
    }

    const diff = iftarTime - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    // Update countdown text
    countdownEl.textContent =
      diff <= 0
        ? "✨ Iftar Time — Join Us 🌙"
        : `${h}h ${m}m ${s}s remaining`;

    // Add glow effect when Iftar is near (<1h)
    if (diff <= 3600000 && diff > 0) {
      countdownEl.classList.add("glow");
    } else {
      countdownEl.classList.remove("glow");
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", initIftarTimer);

  /* ================= AUTOPLAY ALL VIDEOS ================= */
  function initAutoPlayVideos() {
    const videos = document.querySelectorAll("video");
    videos.forEach(video => {
      video.loop = true;
      video.autoplay = true;
      video.muted = true;
      video.play().catch(() => {});
    });
  }

  /* ================= INIT ALL ================= */
  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initLazyLoading();
    initGallery();
    initTheme();
    initMusic();
    initRamzanPopup();
    initIftarTimer();
    initAutoPlayVideos();
  });
})();
// ================= RAMZAN OFFER POPUP =================
function initRamzanOfferPopup() {
  const popup = document.getElementById("RamzanOfferPopup");
  if (!popup) return;

  const closeBtn = popup.querySelector(".ramzan-close");

  // Open popup
  function openPopup() {
    popup.classList.add("active");
    document.body.style.overflow = "hidden"; // prevent background scroll

    // Auto-close after 3 seconds
    setTimeout(() => closePopup(), 3000);
  }

  // Close popup
  function closePopup() {
    popup.classList.remove("active");
    document.body.style.overflow = ""; // restore scroll
  }

  // Close button click
  closeBtn?.addEventListener("click", closePopup);

  // Close when clicking outside content
  popup.addEventListener("click", e => {
    if (e.target === popup) closePopup();
  });

  // Auto-open after 1 second
  window.addEventListener("load", () => {
    setTimeout(openPopup, 1000);
  });
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initRamzanOfferPopup();
});