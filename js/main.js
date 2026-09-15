(() => {
  'use strict';

  const root = document.documentElement;
  const forceMotion = new URLSearchParams(location.search).has('motion');
  if (forceMotion) root.classList.add('m-force');
  const reduceMotion = !forceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year -------------------------------------------- */
  const initYear = () => {
    const nodes = document.querySelectorAll('#year');
    nodes.forEach(n => { n.textContent = new Date().getFullYear(); });
  };

  /* ---------- Burger ------------------------------------------- */
  const initBurger = () => {
    const btn = document.querySelector('.burger');
    const nav = document.getElementById('siteNav');
    if (!btn || !nav) return;
    const close = () => {
      root.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    };
    btn.addEventListener('click', () => {
      const open = root.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
    document.addEventListener('click', (e) => {
      if (root.classList.contains('nav-open') && !e.target.closest('.site-header')) close();
    });
    window.matchMedia('(min-width: 921px)').addEventListener('change', close);
  };

  /* ---------- Smooth scroll to top (rAF easing) ------------------- */
  const initToTop = () => {
    let rafId = null;
    const stopAnim = () => {
      cancelAnimationFrame(rafId);
      root.style.scrollBehavior = '';
    };
    document.querySelectorAll('[data-to-top]').forEach(btn => {
      btn.addEventListener('click', () => {
        const startY = window.scrollY;
        if (startY < 2) return;
        stopAnim();
        window.removeEventListener('wheel', stopAnim);
        window.addEventListener('wheel', stopAnim, { passive: true, once: true });
        const duration = Math.min(1300, Math.max(500, startY * 0.4));
        const t0 = performance.now();
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
        root.style.scrollBehavior = 'auto';
        const step = now => {
          const p = Math.min(1, (now - t0) / duration);
          window.scrollTo(0, Math.round(startY * (1 - easeOutQuart(p))));
          if (p < 1) rafId = requestAnimationFrame(step);
          else stopAnim();
        };
        rafId = requestAnimationFrame(step);
      });
    });
  };

  /* ---------- Scroll + page-load reveal --------------------------- */
  const initReveal = () => {
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0 });

    // Above-the-fold items play a deterministic keyframe sequence
    // (CSS animation, immune to class/scheduling timing); the rest
    // reveal on scroll and keep the class-based transition.
    items.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96 && r.bottom > 0) {
        el.setAttribute('data-reveal-now', el.getAttribute('data-reveal'));
      } else {
        io.observe(el);
      }
    });
  };

  const kick = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  kick(() => {
    initYear();
    initBurger();
    initToTop();
    initReveal();
  });
})();
