// ============================================================
// The Woo Cycle — shared behaviour + awwwards motion layer
// ============================================================

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// ---------- Sticky header shadow ----------
const header = document.getElementById('site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- Mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('open'); });
}

// ---------- Scroll reveal (interior pages + fallback) ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal-up').forEach(el => io.observe(el));

// ---------- Newsletter forms ----------
document.querySelectorAll('form[data-signup]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.reset();
    const thanks = form.parentElement.querySelector('.signup-thanks');
    if (thanks) thanks.style.display = 'inline';
  });
});

// ---------- Grain overlay (every page) ----------
const grain = document.createElement('div');
grain.className = 'grain';
grain.setAttribute('aria-hidden', 'true');
document.body.appendChild(grain);

// ---------- Custom cursor (desktop only) ----------
if (finePointer && !prefersReduced) {
  const cur = document.createElement('div');
  cur.className = 'woo-cursor';
  cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<span class="cur-label"></span>';
  document.body.appendChild(cur);
  document.body.classList.add('has-cursor');
  const label = cur.querySelector('.cur-label');

  let mx = -100, my = -100, cx = -100, cy = -100;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  window.addEventListener('mousedown', () => cur.classList.add('is-down'));
  window.addEventListener('mouseup', () => cur.classList.remove('is-down'));

  (function tick() {
    cx += (mx - cx) * 0.2;
    cy += (my - cy) * 0.2;
    cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)' + (cur.classList.contains('is-down') ? ' scale(.82)' : '');
    requestAnimationFrame(tick);
  })();

  document.addEventListener('mouseover', e => {
    const labelled = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button, input, [data-cursor]');
    cur.classList.toggle('is-label', !!labelled);
    cur.classList.toggle('is-link', !!link && !labelled);
    if (labelled) label.textContent = labelled.getAttribute('data-cursor');
    else if (link) label.textContent = '→';
    else label.textContent = '';
  });
}

// ---------- GSAP scenes (homepage) ----------
// (native scroll — no smooth-scroll library; scroll-behavior:smooth handles anchors)
if (window.gsap && window.ScrollTrigger && !prefersReduced) {
  gsap.registerPlugin(ScrollTrigger);

  // -- split hero lines into chars --
  document.querySelectorAll('[data-split]').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach(chr => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.innerHTML = chr === ' ' ? '&nbsp;' : chr;
      el.appendChild(s);
    });
  });

  // -- hero entrance --
  const heroChars = document.querySelectorAll('.wow-title .ch');
  if (heroChars.length) {
    gsap.from(heroChars, {
      yPercent: 118,
      rotate: () => gsap.utils.random(-9, 9),
      duration: 1.05,
      ease: 'power4.out',
      stagger: { each: 0.022, from: 'start' },
      delay: 0.15
    });
    gsap.from('.wow-art', {
      opacity: 0, scale: 0.85, rotate: -4,
      duration: 1.2, ease: 'power3.out', delay: 0.55
    });
  }

  // -- hero parallax drift --
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.getAttribute('data-parallax')) || -10;
    gsap.to(el, {
      yPercent: speed * 3,
      ease: 'none',
      scrollTrigger: { trigger: '.wow-hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  });
  if (document.querySelector('.wow-art')) {
    gsap.to('.wow-art', {
      yPercent: -14, ease: 'none',
      scrollTrigger: { trigger: '.wow-hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // -- pinned chapter: words light up as you read --
  const chapterText = document.querySelector('.chapter-text[data-words]');
  if (chapterText) {
    // wrap words (keeping styled sub-spans intact)
    const wrapWords = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'wd';
            w.textContent = part;
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrapWords(child);
        }
      });
    };
    wrapWords(chapterText);

    const words = chapterText.querySelectorAll('.wd');
    gsap.set(words, { opacity: 0.14 });
    const chTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.chapter',
        start: 'top top',
        end: '+=110%',
        pin: true,
        scrub: 0.3,
        anticipatePin: 1
      }
    });
    chTl.to(words, { opacity: 1, stagger: 0.06, ease: 'none' }, 0)
        .fromTo('.chapter-peek', { xPercent: 70, x: 0 }, { xPercent: 12, x: 0, ease: 'power1.out' }, 0.35)
        .from('.chapter-link', { opacity: 0, y: 20 }, '>-0.2');
  }

  // -- community cards float in --
  const cards = gsap.utils.toArray('.wow-cards .card');
  if (cards.length) {
    gsap.from(cards, {
      y: 90, autoAlpha: 0,
      rotate: i => (i % 2 ? 4 : -4),
      duration: 1, ease: 'power3.out', stagger: 0.12,
      clearProps: 'opacity,visibility,y,rotation',
      scrollTrigger: { trigger: '.wow-cards', start: 'top 82%' }
    });
  }

  // -- outro: outline fills with colour as you scroll --
  if (document.querySelector('.outro')) {
    gsap.fromTo('.outro-fill',
      { clipPath: 'inset(0% 100% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: '.outro', start: 'top 78%', end: 'bottom 45%', scrub: true }
      });
  }

  // -- marquee slows slightly on hover (craft detail) --
  const track = document.querySelector('.marquee-track');
  if (track) {
    const mq = document.querySelector('.marquee');
    mq.addEventListener('mouseenter', () => track.style.animationDuration = '48s');
    mq.addEventListener('mouseleave', () => track.style.animationDuration = '26s');
  }
}

// ---------- Magnetic buttons ----------
if (finePointer && !prefersReduced && window.gsap) {
  document.querySelectorAll('[data-magnet]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - r.left - r.width / 2) * 0.25,
        y: (e.clientY - r.top - r.height / 2) * 0.35,
        duration: 0.4, ease: 'power3.out'
      });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,.5)' });
    });
  });
}
