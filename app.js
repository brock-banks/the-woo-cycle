// ============================================================
// The Woo Cycle — shared behaviour
// ============================================================

// Sticky header shadow
const header = document.getElementById('site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('open'); });
}

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal-up').forEach(el => io.observe(el));

// Newsletter forms (data-signup)
document.querySelectorAll('form[data-signup]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.reset();
    const thanks = form.parentElement.querySelector('.signup-thanks');
    if (thanks) thanks.style.display = 'inline';
  });
});
