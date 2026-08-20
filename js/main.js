document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sticky header state ---- */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  /* ---- Hero pinned scroll zoom (photo only — text stays static and clickable) ---- */
  const heroWrapper = document.querySelector('.hero-pin-wrapper');
  const heroMedia = document.querySelector('.hero-media');
  if (heroWrapper && heroMedia && !prefersReducedMotion) {
    let ticking = false;
    const updateHeroZoom = () => {
      const rect = heroWrapper.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
      const zoomProgress = Math.min(progress / 0.6, 1);
      const scale = 1 + zoomProgress * 0.35;
      const tilt = zoomProgress * -5;
      heroMedia.style.transform = `scale(${scale}) rotateX(${tilt}deg)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeroZoom);
        ticking = true;
      }
    }, { passive: true });
    updateHeroZoom();
  }
    /* ---- Subtle parallax on section background photos ---- */
  const parallaxEls = document.querySelectorAll('.has-bg-image, .has-photo, .testimonial-section');
  if (parallaxEls.length && !prefersReducedMotion) {
    let parallaxTicking = false;
    const updateParallax = () => {
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const centerOffset = (rect.top + rect.height / 2) - window.innerHeight / 2;
          const shift = centerOffset * -0.3;
          el.style.backgroundPosition = `center calc(50% + ${shift}px)`;
        }
      });
      parallaxTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
    updateParallax();
  }
  /* ---- Mobile full-screen nav panel ---- */
  const navToggle = document.getElementById('nav-toggle');
  const mobilePanel = document.getElementById('mobile-panel');
  if (navToggle && mobilePanel) {
    const closePanel = () => {
      mobilePanel.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    const openPanel = () => {
      mobilePanel.classList.add('open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    navToggle.addEventListener('click', () => {
      mobilePanel.classList.contains('open') ? closePanel() : openPanel();
    });
    mobilePanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closePanel);
    });
  }

  /* ---- Reveal-on-scroll ----
     Disabled by default: content is always visible without JS (see the CSS
     comment on html.reveal-armed .reveal). Flip ENABLE_SCROLL_REVEAL on only
     after confirming it can't strand below-the-fold content as permanently
     invisible for any visitor. */
  const ENABLE_SCROLL_REVEAL = true;
  if (ENABLE_SCROLL_REVEAL && !prefersReducedMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('reveal-armed');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  }

    /* ---- Animated stat counters (count up once when scrolled into view) ---- */
  const statNumbers = document.querySelectorAll('.stat-number');
  
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const countUp = (el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach((el) => statObserver.observe(el));
  } else {
    statNumbers.forEach((el) => { el.textContent = el.dataset.target + (el.dataset.suffix || ''); });
  }

  /* ---- Before / After slider ---- */
  const baSlider = document.getElementById('ba-slider');
  if (baSlider) {
    const baBefore = document.getElementById('ba-before');
    const baHandle = document.getElementById('ba-handle');
    const baRange = document.getElementById('ba-range');

    const setSplit = (pct) => {
      const clamped = Math.min(100, Math.max(0, pct));
      baBefore.style.width = clamped + '%';
      baHandle.style.left = clamped + '%';
      baRange.value = clamped;
    };

    baRange.addEventListener('input', (e) => setSplit(Number(e.target.value)));

    let dragging = false;
    const pctFromEvent = (clientX) => {
      const rect = baSlider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };
    baSlider.addEventListener('pointerdown', (e) => {
      dragging = true;
      setSplit(pctFromEvent(e.clientX));
    });
    window.addEventListener('pointermove', (e) => {
      if (dragging) setSplit(pctFromEvent(e.clientX));
    });
    window.addEventListener('pointerup', () => { dragging = false; });

    const presets = [50, 25, 75, 50];
    let presetIndex = 0;
    const nextBtn = document.getElementById('ba-next');
    const prevBtn = document.getElementById('ba-prev');
    if (nextBtn) nextBtn.addEventListener('click', () => {
      presetIndex = (presetIndex + 1) % presets.length;
      setSplit(presets[presetIndex]);
    });
    if (prevBtn) prevBtn.addEventListener('click', () => {
      presetIndex = (presetIndex - 1 + presets.length) % presets.length;
      setSplit(presets[presetIndex]);
    });
  }

  /* ---- Testimonial dots (visual only) ---- */
  document.querySelectorAll('.testimonial-dots .dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      dot.parentElement.querySelectorAll('.dot').forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  /* ---- Generic filter bar (Projects / Insights) ---- */
  const setupFilter = (barId, gridSelector) => {
    const bar = document.getElementById(barId);
    if (!bar) return;
    const items = document.querySelectorAll(gridSelector);
    bar.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        items.forEach((item) => {
          const cats = item.dataset.category || '';
          const show = filter === 'all' || cats.split(' ').includes(filter);
          item.style.display = show ? '' : 'none';
        });
      });
    });
  };
  setupFilter('project-filters', '#project-grid > *');
  setupFilter('insight-filters', '#insight-grid > *');

  /* ---- Contact / inquiry form (submits to Netlify Forms) ---- */
  const form = document.getElementById('contact-form');
  if (form) {
    const note = document.getElementById('form-note');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      })
        .then(() => {
          note.textContent = "Thanks — your project inquiry was received. We'll be in touch within one business day.";
          form.reset();
        })
        .catch(() => {
          note.textContent = "Something went wrong sending your message. Please email us directly or try again.";
        });
    });
  }

  /* ---- Footer year ---- */
  document.querySelectorAll('.js-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
