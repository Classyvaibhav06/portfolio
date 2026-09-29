'use strict';

/* ============================================================
   Minecraft portfolio — main.js
   Vanilla JS, no dependencies, no network. Works over file://
   and HTTP. Loaded with defer; DOM is ready, but we guard anyway.
   ============================================================ */

(function () {
  function init() {
    /* ---------- shared helpers ---------- */
    const motionMQ = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const prefersReduced = () => !!(motionMQ && motionMQ.matches);

    const topbar = document.querySelector('.topbar');
    const hotbarSlots = Array.from(document.querySelectorAll('.hotbar-slot'));

    // Scroll to an element, clearing the fixed topbar.
    function scrollToEl(el) {
      if (!el) return;
      const offset = topbar ? topbar.getBoundingClientRect().height : 0;
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset - 8;
      window.scrollTo({
        top: Math.max(0, Math.round(y)),
        behavior: prefersReduced() ? 'auto' : 'smooth'
      });
    }

    /* ---------- 1. Scrollspy: most visible section -> .is-active ---------- */
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    let activeId = null;

    function setActive(id) {
      if (!id || id === activeId) return;
      activeId = id;
      hotbarSlots.forEach((slot) => {
        const on = slot.dataset && slot.dataset.target === id;
        slot.classList.toggle('is-active', on);
        if (on) slot.setAttribute('aria-current', 'true');
        else slot.removeAttribute('aria-current');
      });
    }

    // Deterministic pick: the section covering the most viewport pixels wins.
    function pickActive() {
      const viewportH = window.innerHeight || 0;
      let best = null;
      let bestVisible = 0;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const visible = Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0);
        if (visible > bestVisible) {
          bestVisible = visible;
          best = section;
        }
      });
      if (best) setActive(best.id);
    }

    if (sections.length && hotbarSlots.length) {
      pickActive(); // correct highlight before any scrolling happens
      let spyTicking = false;
      const onViewportChange = () => {
        if (spyTicking) return;
        spyTicking = true;
        window.requestAnimationFrame(() => {
          pickActive();
          spyTicking = false;
        });
      };
      window.addEventListener('scroll', onViewportChange, { passive: true });
      window.addEventListener('resize', onViewportChange, { passive: true });
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(() => pickActive(), {
          threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1]
        });
        sections.forEach((section) => observer.observe(section));
      }
    }

    /* ---------- 2. Keyboard shortcuts 1..6 + Escape ---------- */
    const itemSlots = Array.from(document.querySelectorAll('.slot')).filter(
      (slot) => slot.querySelector('.tooltip')
    );

    function closeTooltips(except) {
      itemSlots.forEach((slot) => {
        if (slot !== except) slot.classList.remove('is-open');
      });
    }

    function toggleTooltip(slot) {
      const willOpen = !slot.classList.contains('is-open');
      closeTooltips(slot);
      slot.classList.toggle('is-open', willOpen);
    }

    function isTyping(el) {
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = (el.tagName || '').toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select';
    }

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === 'Escape') {
        closeTooltips(null);
        return;
      }

      if (isTyping(event.target)) return;

      const index = '1234567'.indexOf(event.key);
      if (index === -1) return;
      const slot = hotbarSlots[index];
      if (!slot) return;
      if (slot.getAttribute('href') && slot.getAttribute('href').endsWith('.html')) {
        window.location.href = slot.getAttribute('href');
        return;
      }
      const id = slot.dataset && slot.dataset.target;
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      scrollToEl(target);
    });

    /* ---------- 3. Touch / click tooltips on inventory slots ---------- */
    itemSlots.forEach((slot) => {
      slot.addEventListener('click', (event) => {
        // Let links inside the tooltip keep their default behaviour.
        if (event.target && event.target.closest && event.target.closest('a')) return;
        toggleTooltip(slot);
      });
      // Slots are tabindex=0 <article>s, so Enter/Space need wiring by hand.
      slot.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
        event.preventDefault();
        toggleTooltip(slot);
      });
    });

    document.addEventListener('click', (event) => {
      if (event.target && event.target.closest && event.target.closest('.slot')) return;
      closeTooltips(null);
    });

    /* 3b. Flip: open downward only when there is not enough room above, and
       reserve the hotbar band so the tip never lands underneath the HUD. */
    const hotbarEl = document.querySelector('.hotbar');
    function positionTip(slot) {
      const tip = slot.querySelector('.tooltip');
      if (!tip) return;
      slot.classList.remove('flip-below');
      if (window.innerWidth <= 640) return; // mobile uses the in-flow variant
      const rect = slot.getBoundingClientRect();
      const tipRect = tip.getBoundingClientRect();
      const h = tipRect.height || 240;
      const roomAbove = rect.top;
      const roomBelow = window.innerHeight - rect.bottom - ((hotbarEl ? hotbarEl.offsetHeight : 82) + 24);
      if (roomAbove < h + 16) slot.classList.add('flip-below');
      else if (roomBelow < h + 16 && roomBelow < roomAbove) slot.classList.add('flip-below');
    }

    itemSlots.forEach((slot) => {
      slot.addEventListener('mouseenter', () => positionTip(slot));
      slot.addEventListener('focus', () => positionTip(slot));
      slot.addEventListener('click', () => {
        if (slot.classList.contains('is-open')) positionTip(slot);
      });
    });
    window.addEventListener('resize', () => {
      itemSlots.forEach((slot) => slot.classList.remove('flip-below'));
    }, { passive: true });

    /* ---------- 4. Deterministic starfield ---------- */
    function mulberry32(seed) {
      let a = seed >>> 0;
      return function () {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const starsEl = document.getElementById('stars');
    if (starsEl) {
      const rand = mulberry32(20260929);
      const animate = !prefersReduced();
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 70; i += 1) {
        const star = document.createElement('span');
        star.className = animate ? 'star twinkle' : 'star';
        const size = 2 + Math.floor(rand() * 3); // 2–4px
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.top = (rand() * 100).toFixed(2) + '%';
        star.style.left = (rand() * 100).toFixed(2) + '%';
        if (animate) star.style.animationDelay = (rand() * 6).toFixed(2) + 's';
        frag.appendChild(star);
      }
      starsEl.appendChild(frag);
    }

    /* ---------- 5. Parallax (transform only, rAF-throttled) ---------- */
    if (starsEl && !prefersReduced()) {
      let parallaxTicking = false;
      window.addEventListener('scroll', () => {
        if (parallaxTicking) return;
        parallaxTicking = true;
        window.requestAnimationFrame(() => {
          starsEl.style.transform =
            'translate3d(0,' + (window.pageYOffset * 0.06).toFixed(1) + 'px,0)';
          parallaxTicking = false;
        });
      }, { passive: true });
    }

    /* ---------- 6. Achievement toast, once per visitor ---------- */
    const achievement = document.getElementById('achievement');
    if (achievement) {
      let seen = null;
      try {
        seen = window.localStorage.getItem('mc-portfolio-seen');
      } catch (err) {
        seen = null; // storage unavailable (e.g. some file:// browsers)
      }
      if (!seen) {
        achievement.hidden = false;
        achievement.classList.add('is-visible');
        window.setTimeout(() => {
          achievement.classList.remove('is-visible');
          window.setTimeout(() => {
            achievement.hidden = true;
          }, 400);
          try {
            window.localStorage.setItem('mc-portfolio-seen', '1');
          } catch (err) {
            /* ignore */
          }
        }, 4000);
      }
    }

    /* ---------- 7. Smooth anchor scrolling (hotbar + brand) ---------- */
    function bindAnchor(link) {
      const href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      link.addEventListener('click', (event) => {
        const id = href.slice(1);
        const target = id ? document.getElementById(id) : null;
        if (!target) return; // let the browser do its normal thing
        event.preventDefault();
        scrollToEl(target);
      });
    }
    hotbarSlots.forEach(bindAnchor);
    const brand = document.querySelector('.brand');
    if (brand) bindAnchor(brand);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
