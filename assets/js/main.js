/* ============================================================
   PATAVIDA PET SHOP — JAVASCRIPT
   Scroll animations, smooth micro-interactions & fluid motion
   Compatível 100% com Desktop, Tablet e Celular
   ============================================================ */

(function () {
  'use strict';

  /* ─── Helpers ─────────────────────────────────────────────── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ─── DOM refs ────────────────────────────────────────────── */
  const navbar    = qs('#navbar');
  const hamburger = qs('#hamburger');
  const navMenu   = qs('#navMenu');

  /* ──────────────────────────────────────────────────────────
     1. NAVBAR — scroll behaviour + mobile menu
  ─────────────────────────────────────────────────────────── */
  let ticking = false;

  function updateNavbar() {
    if (window.scrollY > 35) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNavbar(); // init

  /* Nav overlay (mobile) */
  const overlay = document.createElement('div');
  overlay.classList.add('nav-overlay');
  document.body.appendChild(overlay);

  function openMenu() {
    navMenu.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  /* Close on nav link click */
  qsa('.nav-link', navMenu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ──────────────────────────────────────────────────────────
     2. HERO ENTRANCE ANIMATIONS
  ─────────────────────────────────────────────────────────── */
  function triggerHeroAnimations() {
    const heroElements = qsa('.animate-hero');
    heroElements.forEach(el => {
      el.classList.add('visible');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => {
        setTimeout(triggerHeroAnimations, 100);
      });
    });
  } else {
    requestAnimationFrame(() => {
      setTimeout(triggerHeroAnimations, 100);
    });
  }

  /* ──────────────────────────────────────────────────────────
     3. SCROLL REVEAL (IntersectionObserver unificado Desktop & Mobile)
  ─────────────────────────────────────────────────────────── */
  const revealSelectors = [
    '.reveal',
    '.reveal-left',
    '.reveal-right',
    '.reveal-card',
    '.reveal-fade',
  ];

  const revealEls = qsa(revealSelectors.join(', '));

  const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observa todos os elementos para garantir que animem ao rolar a página em qualquer resolução
  revealEls.forEach(el => {
    observer.observe(el);
  });

  /* ──────────────────────────────────────────────────────────
     4. SMOOTH SCROLL for anchor links
  ─────────────────────────────────────────────────────────── */
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;

      const target = qs(href);
      if (!target) return;

      e.preventDefault();

      const navH = navbar ? navbar.offsetHeight : 0;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ──────────────────────────────────────────────────────────
     5. HERO VIDEO AUTOPLAY & PARALLAX (Desktop & Mobile)
  ─────────────────────────────────────────────────────────── */
  const heroVideo = qs('.hero__video');

  if (heroVideo) {
    // Garantir propriedades essenciais para autoplay no mobile (iOS e Android)
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.loop = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');

    const tryPlayVideo = () => {
      heroVideo.muted = true;
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback para navegadores mobile em modo de economia de energia
          const startOnInteraction = () => {
            heroVideo.muted = true;
            heroVideo.play().catch(() => {});
            ['touchstart', 'touchend', 'scroll', 'click'].forEach(evt => {
              window.removeEventListener(evt, startOnInteraction);
            });
          };
          ['touchstart', 'touchend', 'scroll', 'click'].forEach(evt => {
            window.addEventListener(evt, startOnInteraction, { passive: true });
          });
        });
      }
    };

    // Dispara a reprodução
    tryPlayVideo();

    // Garante inicialização ao carregar dados do vídeo e na alternância de abas
    heroVideo.addEventListener('loadedmetadata', tryPlayVideo, { once: true });
    heroVideo.addEventListener('canplay', tryPlayVideo, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tryPlayVideo();
    });

    // Garante loop contínuo sem travamentos em dispositivos móveis
    heroVideo.addEventListener('ended', () => {
      heroVideo.currentTime = 0;
      tryPlayVideo();
    });

    // Parallax suave no vídeo do hero em Desktop e Mobile
    let parallaxTicking = false;

    const applyParallax = () => {
      const scrollY = window.scrollY;
      if (scrollY <= window.innerHeight) {
        const translateY = (scrollY * 0.18).toFixed(2);
        heroVideo.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }
      parallaxTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        window.requestAnimationFrame(applyParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────────
     6. ACTIVE NAV LINK on scroll
  ─────────────────────────────────────────────────────────── */
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link');

  function setActiveLink() {
    const scrollY = window.scrollY + (navbar ? navbar.offsetHeight : 70) + 90;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ──────────────────────────────────────────────────────────
     7. GALLERY — keyboard accessibility
  ─────────────────────────────────────────────────────────── */
  qsa('.gallery__item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'figure');

    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.querySelector('img')?.click();
      }
    });
  });

  /* ──────────────────────────────────────────────────────────
     8. SERVICE CARDS — Soft Fluid Tilt (Desktop Only)
  ─────────────────────────────────────────────────────────── */
  const isTouchDevice = () => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (!isTouchDevice()) {
    qsa('.service-card').forEach(card => {
      let isHovered = false;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let animFrameId = null;

      function updateTilt() {
        if (!isHovered) return;
        currentX += (targetX - currentX) * 0.14;
        currentY += (targetY - currentY) * 0.14;

        card.style.transform = `translateY(-8px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
        animFrameId = requestAnimationFrame(updateTilt);
      }

      card.addEventListener('mouseenter', () => {
        // Apenas aplica tilt se o card já concluiu sua entrada de scroll
        if (card.classList.contains('visible')) {
          isHovered = true;
          animFrameId = requestAnimationFrame(updateTilt);
        }
      });

      card.addEventListener('mousemove', e => {
        if (!isHovered) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        targetX = (y / rect.height) * 4.5;
        targetY = -(x / rect.width) * 4.5;
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        cancelAnimationFrame(animFrameId);
        card.style.transform = '';
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     9. COUNTER ANIMATION — trust bar numbers
  ─────────────────────────────────────────────────────────── */
  function animateCounter(el, from, to, duration, suffix) {
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(from + (to - from) * eased);
      el.textContent = value.toLocaleString('pt-BR') + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  const counters = [
    { selector: '.trust-item:nth-child(1) strong', from: 0, to: 5000, suffix: '+' },
    { selector: '.trust-item:nth-child(3) strong', from: 0, to: 98,   suffix: '%' },
  ];

  const trustBar = qs('.trust-bar');
  let countersRun = false;

  if (trustBar) {
    const trustObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !countersRun) {
        countersRun = true;
        counters.forEach(c => {
          const el = qs(c.selector);
          if (el) animateCounter(el, c.from, c.to, 1700, c.suffix);
        });
        trustObserver.disconnect();
      }
    }, { threshold: 0.15 });

    trustObserver.observe(trustBar);
  }

})();
