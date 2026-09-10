// Flag that JS is running (CSS uses .no-js as a reveal fallback)
document.documentElement.classList.remove('no-js');

// ---------------------------------------------------------------------------
// Reveal-on-scroll
// ---------------------------------------------------------------------------
const revealEls = document.querySelectorAll('.reveal');
const show = (el) => el.classList.add('is-visible');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => io.observe(el));

  // Safety net: anything already in view on load reveals immediately, and
  // nothing stays hidden for longer than a moment even if the observer stalls.
  const sweep = () => {
    revealEls.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) show(el);
    });
  };
  requestAnimationFrame(sweep);
  window.addEventListener('load', sweep);
  setTimeout(() => revealEls.forEach(show), 2500);
} else {
  revealEls.forEach(show);
}

// ---------------------------------------------------------------------------
// Title block "rev." date — last updated stamp
// ---------------------------------------------------------------------------
const revDate = document.getElementById('rev-date');
if (revDate) {
  const d = new Date();
  const opts = { year: 'numeric', month: 'short', day: '2-digit' };
  revDate.textContent = d.toLocaleDateString('en-US', opts);
}

// ---------------------------------------------------------------------------
// Sticky header — solidifies on scroll (after the hero, where there is one)
// ---------------------------------------------------------------------------
const stickyHeader = document.querySelector('.titleblock, .article-header');
const heroEl = document.querySelector('.hero');
if (stickyHeader) {
  const trigger = () => (heroEl ? heroEl.offsetHeight * 0.55 : 4);
  const onScroll = () => {
    stickyHeader.classList.toggle('is-stuck', window.scrollY > trigger());
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

// ---------------------------------------------------------------------------
// Hero figure — exploded view on hover, tap/click to lock it open.
// The slabs are moved by tweening each group's SVG `transform` attribute
// (supported by every SVG renderer) rather than a CSS transform on <g>,
// which some browsers animate unreliably.
// ---------------------------------------------------------------------------
const heroFigure = document.querySelector('.hero__figure');
if (heroFigure) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const parts = Array.prototype.slice
    .call(heroFigure.querySelectorAll('.hero-part'))
    .map((el) => ({
      el,
      x: 0, y: 0,
      gx: 0, gy: 0,
      tx: parseFloat(el.getAttribute('data-dx')) || 0,
      ty: parseFloat(el.getAttribute('data-dy')) || 0,
    }));

  let rafId = null;
  let hovering = false;
  let locked = false;

  const paint = () => {
    parts.forEach((p) => {
      p.el.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ')');
    });
  };
  const tick = () => {
    let moving = false;
    parts.forEach((p) => {
      const dx = p.gx - p.x;
      const dy = p.gy - p.y;
      if (Math.abs(dx) < 0.12 && Math.abs(dy) < 0.12) { p.x = p.gx; p.y = p.gy; }
      else { p.x += dx * 0.18; p.y += dy * 0.18; moving = true; }
    });
    paint();
    rafId = moving ? requestAnimationFrame(tick) : null;
  };
  const setExploded = (open) => {
    heroFigure.classList.toggle('is-exploded', open);
    parts.forEach((p) => { p.gx = open ? p.tx : 0; p.gy = open ? p.ty : 0; });
    if (reduceMotion) {
      parts.forEach((p) => { p.x = p.gx; p.y = p.gy; });
      paint();
    } else if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  };

  heroFigure.addEventListener('pointerenter', () => { hovering = true; setExploded(true); });
  heroFigure.addEventListener('pointerleave', () => { hovering = false; if (!locked) setExploded(false); });
  heroFigure.addEventListener('click', () => { locked = !locked; setExploded(locked || hovering); });

  // Gentle pointer parallax (desktop, motion allowed)
  if (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !reduceMotion
  ) {
    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
      heroFigure.style.setProperty('--px', x.toFixed(1) + 'px');
      heroFigure.style.setProperty('--py', y.toFixed(1) + 'px');
    }, { passive: true });
  }
}

// ---------------------------------------------------------------------------
// Active section highlight — drives both the top nav and the bottom tab bar
// ---------------------------------------------------------------------------
const navLinks = document.querySelectorAll('[data-nav] a');
const sections = document.querySelectorAll('main .sheet[id]');

if ('IntersectionObserver' in window && sections.length && navLinks.length) {
  const ratios = new Map();

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  };

  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        ratios.set(entry.target.id, entry.intersectionRatio);
      } else {
        ratios.delete(entry.target.id);
      }
    });

    if (ratios.size) {
      const top = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0][0];
      setActive(top);
    }
  }, { threshold: [0.15, 0.35, 0.6], rootMargin: '-15% 0px -45% 0px' });

  sections.forEach((s) => navIO.observe(s));
}
