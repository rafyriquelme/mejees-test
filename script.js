/* ============================================================
   MEJEES WEBSITE — script.js
   Tu Familia del Cielo, Aquí en la Tierra
   ============================================================ */

'use strict';

/* ─── Navigation ─────────────────────────────────────────── */
const nav       = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

/* ─── Navbar: Cielo → Tierra color journey ───────────────
   Color stops mirror the section gradient progression:
   Dark navy  → Brand blue → Dusty blue → Earth (#B5A06D)
   ────────────────────────────────────────────────────── */
const NAV_COLOR_STOPS = [
  { r: 15,  g: 18,  b: 35  },   // 0%   — dark navy (above ministerios)
  { r: 21,  g: 101, b: 192 },   // 33%  — brand blue (ministerios → eventos)
  { r: 74,  g: 107, b: 138 },   // 66%  — dusty blue (eventos → next-steps)
  { r: 181, g: 160, b: 109 },   // 100% — earth #B5A06D
];

function lerpColor(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function updateNavColor() {
  const ministerios = document.getElementById('ministerios');
  const nextSteps   = document.querySelector('.section-next-steps');
  if (!ministerios || !nextSteps) return;

  const startY = ministerios.offsetTop;
  const endY   = nextSteps.offsetTop + nextSteps.offsetHeight;
  const scrollY = window.scrollY + nav.offsetHeight;

  // Before gradient zone — hold the dark navy (top color of #ministerios)
  if (scrollY <= startY) {
    nav.style.backgroundColor = 'rgba(26, 26, 46, 0.96)';
    return;
  }

  const rawProgress = (scrollY - startY) / (endY - startY);
  const progress    = Math.min(1, Math.max(0, rawProgress));

  // Map progress (0–1) across the 3 segments between 4 stops
  const segments = NAV_COLOR_STOPS.length - 1;
  const scaled   = progress * segments;
  const index    = Math.min(Math.floor(scaled), segments - 1);
  const t        = scaled - index;

  const color = lerpColor(NAV_COLOR_STOPS[index], NAV_COLOR_STOPS[index + 1], t);
  nav.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.96)`;
}

// Sticky nav + color journey — single scroll listener
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  updateNavColor();
}, { passive: true });

// Mobile menu toggle
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a link is tapped
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu when clicking outside
document.addEventListener('click', e => {
  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeMenu();
  }
});

// Close menu on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
});

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ─── Smooth Scroll (offset for fixed nav) ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── Active nav link on scroll ──────────────────────────── */
const sections    = document.querySelectorAll('section[id]');
const navLinkEls  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ─── Scroll-triggered Animations ───────────────────────── */
const animatedEls = document.querySelectorAll('[data-animate]');

const animObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('animate-in'), delay);
    animObserver.unobserve(el);
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -48px 0px',
});

animatedEls.forEach(el => {
  // Hero elements animate in immediately on load
  if (el.closest('.hero')) {
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('animate-in'), delay + 200);
  } else {
    animObserver.observe(el);
  }
});

/* ─── Video Fallback ─────────────────────────────────────── */
const heroVideo = document.querySelector('.hero-video');
const heroBg    = document.querySelector('.hero-bg-gradient');

if (heroVideo) {
  // If video loads successfully, fade the gradient to near-invisible
  heroVideo.addEventListener('canplaythrough', () => {
    if (heroBg) heroBg.style.opacity = '0.35';
  }, { once: true });

  // If video errors or is absent, ensure gradient is fully visible
  heroVideo.addEventListener('error', () => {
    heroVideo.style.display = 'none';
    if (heroBg) heroBg.style.opacity = '1';
  });
}

/* ─── Prayer / Contact Form ──────────────────────────────── */
const prayerForm   = document.getElementById('prayerForm');
const prayerSubmit = document.getElementById('prayerSubmit');

if (prayerForm && prayerSubmit) {
  prayerForm.addEventListener('submit', e => {
    e.preventDefault();

    const nameEl    = prayerForm.querySelector('#prayer-name');
    const requestEl = prayerForm.querySelector('#prayer-request');
    const name      = nameEl.value.trim();
    const request   = requestEl.value.trim();

    // Basic validation
    if (!name) {
      nameEl.focus();
      nameEl.style.borderColor = '#EF4444';
      setTimeout(() => nameEl.style.borderColor = '', 2500);
      return;
    }
    if (!request) {
      requestEl.focus();
      requestEl.style.borderColor = '#EF4444';
      setTimeout(() => requestEl.style.borderColor = '', 2500);
      return;
    }

    // Success state
    const originalHTML = prayerSubmit.innerHTML;
    prayerSubmit.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      ¡Solicitud Enviada — Oraremos Por Ti!
    `;
    prayerSubmit.disabled = true;
    prayerSubmit.style.cssText = 'background:var(--teal);border-color:var(--teal);color:var(--text-dark);';

    // Reset after 4 seconds
    // (In production, replace this with an actual API call / form service)
    setTimeout(() => {
      prayerSubmit.innerHTML = originalHTML;
      prayerSubmit.disabled = false;
      prayerSubmit.style.cssText = '';
      prayerForm.reset();
    }, 4500);
  });
}
