const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// Header: transparent over the hero, blurred after scrolling.
const header = $('#siteHeader');
const progressBar = $('#progressBar');
function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  header.classList.toggle('scrolled', window.scrollY > 35);
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

// Responsive navigation with a smooth hamburger animation.
const menuToggle = $('#menuToggle');
const navMenu = $('#navMenu');
function closeMenu() {
  navMenu.classList.remove('open');
  menuToggle.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Buka navigasi');
}
menuToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  menuToggle.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Tutup navigasi' : 'Buka navigasi');
});
$$('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.addEventListener('click', e => {
  if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
});

// Hero image slider: 6 slides, dots, arrows, autoplay and pause on hover.
const heroSlides = $$('.hero-slide');
const heroDots = $('#heroDots');
let heroIndex = 0;
let heroTimer;
heroSlides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
  dot.setAttribute('aria-label', `Buka slide ${i + 1}`);
  dot.addEventListener('click', () => showHeroSlide(i));
  heroDots.appendChild(dot);
});
function showHeroSlide(index) {
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => slide.classList.toggle('active', i === heroIndex));
  $$('.slider-dot', heroDots).forEach((dot, i) => dot.classList.toggle('active', i === heroIndex));
  $('#heroSlides').setAttribute('aria-label', `Slide ${heroIndex + 1} dari ${heroSlides.length}`);
}
function startHeroAutoplay() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => showHeroSlide(heroIndex + 1), 5500);
}
$('#heroPrev').addEventListener('click', () => { showHeroSlide(heroIndex - 1); startHeroAutoplay(); });
$('#heroNext').addEventListener('click', () => { showHeroSlide(heroIndex + 1); startHeroAutoplay(); });
$('#hero').addEventListener('mouseenter', () => clearInterval(heroTimer));
$('#hero').addEventListener('mouseleave', startHeroAutoplay);
startHeroAutoplay();

// Small documentation slider, supports arrows, touch swipes and mouse dragging.
const galleryTrack = $('#galleryTrack');
const galleryViewport = $('#galleryViewport');
const galleryItems = $$('.gallery-item', galleryTrack);
const galleryCount = $('#galleryCount');
let galleryIndex = 0;
let dragStartX = 0;
let dragDeltaX = 0;
let isDragging = false;
function galleryVisibleCount() {
  if (window.innerWidth <= 700) return 1;
  if (window.innerWidth <= 1000) return 3;
  return 4;
}
function updateGallery() {
  const visible = galleryVisibleCount();
  const maxIndex = Math.max(0, galleryItems.length - visible);
  galleryIndex = Math.max(0, Math.min(galleryIndex, maxIndex));
  const itemWidth = galleryItems[0].getBoundingClientRect().width;
  const gap = parseFloat(getComputedStyle(galleryTrack).gap) || 0;
  galleryTrack.style.transform = `translateX(-${galleryIndex * (itemWidth + gap)}px)`;
  galleryCount.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
}
$('#galleryPrev').addEventListener('click', () => { galleryIndex--; updateGallery(); });
$('#galleryNext').addEventListener('click', () => { galleryIndex++; updateGallery(); });
window.addEventListener('resize', updateGallery);
galleryViewport.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse') galleryViewport.setPointerCapture(e.pointerId);
  dragStartX = e.clientX;
  dragDeltaX = 0;
  isDragging = true;
});
galleryViewport.addEventListener('pointermove', e => {
  if (isDragging) dragDeltaX = e.clientX - dragStartX;
});
function finishGalleryDrag() {
  if (!isDragging) return;
  if (Math.abs(dragDeltaX) > 45) galleryIndex += dragDeltaX < 0 ? 1 : -1;
  isDragging = false;
  dragDeltaX = 0;
  updateGallery();
}
galleryViewport.addEventListener('pointerup', finishGalleryDrag);
galleryViewport.addEventListener('pointercancel', finishGalleryDrag);
updateGallery();

// Reveal cards as they enter the viewport.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

// Update active navigation based on the visible section.
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = `#${entry.target.id}`;
    $$('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === target));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
$$('main section[id]').forEach(section => sectionObserver.observe(section));

// Prevent blank project/social links from jumping to the top before you add URLs.
$$('a[href=""]').forEach(link => link.addEventListener('click', e => e.preventDefault()));


// Keep the footer year current automatically.
const copyrightYear = $('#copyrightYear');
if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();
