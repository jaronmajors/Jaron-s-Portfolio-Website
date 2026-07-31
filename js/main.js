// Reveal-on-scroll
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Title block "rev." date — last updated stamp
const revDate = document.getElementById('rev-date');
if (revDate) {
  const d = new Date();
  const opts = { year: 'numeric', month: 'short', day: '2-digit' };
  revDate.textContent = d.toLocaleDateString('en-US', opts);
}

// Active nav highlight
const sections = document.querySelectorAll('main .sheet[id]');
const navLinks = document.querySelectorAll('.titleblock__nav a');

if ('IntersectionObserver' in window && sections.length) {
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = document.querySelector(`.titleblock__nav a[href="#${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.style.borderColor = 'transparent');
        link.style.borderColor = 'var(--line)';
      }
    });
  }, { threshold: 0.35 });

  sections.forEach((s) => navIO.observe(s));
}
