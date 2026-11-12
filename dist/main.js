document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');
const mobileNavigation = window.matchMedia('(max-width: 860px)');
const siteHeader = document.querySelector('.site-header');
let menuScrollY = 0;
let menuScrollLocked = false;
function lockPageForMobileMenu() {
  if (!mobileNavigation.matches || menuScrollLocked) return;
  menuScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${menuScrollY}px`;
  document.body.style.width = '100%';
  menuScrollLocked = true;
}
function unlockPageAfterMobileMenu() {
  if (!menuScrollLocked) return;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  menuScrollLocked = false;
  window.scrollTo(0, menuScrollY);
}
const pageHero = document.querySelector('.hero, .page-hero');
if (siteHeader && pageHero) {
  siteHeader.classList.add('hero-overlay-enabled');
  const syncHeroHeader = () => {
    const heroBottom = pageHero.getBoundingClientRect().bottom;
    const headerBottom = siteHeader.getBoundingClientRect().bottom;
    siteHeader.classList.toggle('is-over-hero', heroBottom > headerBottom);
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  syncHeroHeader();
  window.addEventListener('scroll', syncHeroHeader, { passive: true });
  window.addEventListener('resize', syncHeroHeader);
}
const yearNodes = document.querySelectorAll('.current-year');
yearNodes.forEach((node) => { node.textContent = String(new Date().getFullYear()); });

const gallerySlideshow = document.querySelector('[data-gallery-slideshow]');
if (gallerySlideshow) {
  const slides = [...gallerySlideshow.querySelectorAll('.gallery-slideshow__slide')];
  const dots = [...gallerySlideshow.querySelectorAll('.gallery-slideshow__dots button')];
  const previous = gallerySlideshow.querySelector('[data-gallery-prev]');
  const next = gallerySlideshow.querySelector('[data-gallery-next]');
  const pause = gallerySlideshow.querySelector('[data-gallery-pause]');
  let activeSlide = 0;
  let manuallyPaused = reducedMotion.matches;
  let interactionPaused = false;
  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeSlide;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeSlide) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };
  const setPaused = (paused) => {
    manuallyPaused = paused;
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    pause.textContent = paused ? '▶' : 'Ⅱ';
  };
  previous.addEventListener('click', () => showSlide(activeSlide - 1));
  next.addEventListener('click', () => showSlide(activeSlide + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
  pause.addEventListener('click', () => setPaused(!isPaused));
  gallerySlideshow.addEventListener('mouseenter', () => { interactionPaused = true; });
  gallerySlideshow.addEventListener('mouseleave', () => { interactionPaused = false; });
  gallerySlideshow.addEventListener('focusin', () => { interactionPaused = true; });
  gallerySlideshow.addEventListener('focusout', (event) => {
    if (!gallerySlideshow.contains(event.relatedTarget)) interactionPaused = false;
  });
  reducedMotion.addEventListener?.('change', () => { if (reducedMotion.matches) setPaused(true); });
  showSlide(0);
  setPaused(reducedMotion.matches);
  window.setInterval(() => {
    if (!manuallyPaused && !interactionPaused && !document.hidden) showSlide(activeSlide + 1);
  }, 8000);
}

function closeMenu() {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  navigation.classList.remove('is-open');
  navigation.inert = mobileNavigation.matches;
  document.body.classList.remove('menu-open');
  unlockPageAfterMobileMenu();
}

if (menuButton && navigation) {
  navigation.inert = mobileNavigation.matches;
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    const willOpen = !isOpen;
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
    navigation.classList.toggle('is-open', willOpen);
    navigation.inert = mobileNavigation.matches && !willOpen;
    document.body.classList.toggle('menu-open', willOpen);
    if (willOpen) lockPageForMobileMenu();
    else unlockPageAfterMobileMenu();
  });
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => {
    if (!mobileNavigation.matches) closeMenu();
    else navigation.inert = menuButton.getAttribute('aria-expanded') !== 'true';
  }, { passive: true });
}

const serviceTrack = document.querySelector('#service-track');
const serviceGallery = document.querySelector('.service-gallery');
const autoplayButton = document.querySelector('.carousel-toggle');
const previousButton = document.querySelector('.carousel-arrow--prev');
const nextButton = document.querySelector('.carousel-arrow--next');

if (serviceTrack && serviceGallery && autoplayButton && previousButton && nextButton) {
  const originalCards = [...serviceTrack.querySelectorAll('.service-card')];
  const duplicateCards = originalCards.map((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    serviceTrack.append(clone);
    return clone;
  });

  let manuallyPaused = false;
  let pauseUntil = 0;
  let previousFrame = 0;
  let animationFrame = 0;
  serviceTrack.classList.add('is-moving');

  const loopWidth = () => {
    if (!originalCards.length || !duplicateCards.length) return 0;
    return duplicateCards[0].offsetLeft - originalCards[0].offsetLeft;
  };
  const cardStep = () => {
    if (originalCards.length > 1) return originalCards[1].offsetLeft - originalCards[0].offsetLeft;
    return originalCards[0]?.getBoundingClientRect().width || 280;
  };
  const updateToggle = () => {
    autoplayButton.setAttribute('aria-pressed', String(manuallyPaused));
    autoplayButton.setAttribute('aria-label', manuallyPaused ? 'Resume automatic gallery' : 'Pause automatic gallery');
    const icon = autoplayButton.querySelector('.carousel-toggle__icon');
    if (icon) icon.textContent = manuallyPaused ? '▶' : 'Ⅱ';
    serviceTrack.classList.toggle('is-moving', !manuallyPaused && !reducedMotion.matches);
  };
  const normalizeScroll = () => {
    const distance = loopWidth();
    if (distance > 0 && serviceTrack.scrollLeft >= distance) serviceTrack.scrollLeft -= distance;
    else if (distance > 0 && serviceTrack.scrollLeft < 0) serviceTrack.scrollLeft += distance;
  };
  const moveOneCard = (direction) => {
    const step = cardStep();
    const distance = loopWidth();
    const current = serviceTrack.scrollLeft;
    let target = current + (step * direction);
    if (direction < 0 && current < step / 2 && distance > 0) target = distance - step;
    else if (direction > 0 && target >= distance && distance > 0) target -= distance;
    pauseUntil = Date.now() + 1400;
    serviceTrack.scrollTo({ left: target, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    window.setTimeout(normalizeScroll, reducedMotion.matches ? 0 : 450);
  };
  const animate = (timestamp) => {
    if (!previousFrame) previousFrame = timestamp;
    const elapsed = Math.min(timestamp - previousFrame, 50);
    previousFrame = timestamp;
    const shouldPause = manuallyPaused || reducedMotion.matches || document.hidden || Date.now() < pauseUntil;

    if (!shouldPause) {
      const distance = loopWidth();
      if (distance > 0) {
        serviceTrack.scrollLeft += elapsed * 0.07;
        normalizeScroll();
      }
    }
    animationFrame = window.requestAnimationFrame(animate);
  };
  const startAnimation = () => {
    if (!reducedMotion.matches && !animationFrame) {
      previousFrame = 0;
      animationFrame = window.requestAnimationFrame(animate);
    }
  };
  const stopAnimation = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousFrame = 0;
  };

  autoplayButton.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    if (!manuallyPaused) pauseUntil = 0;
    updateToggle();
    if (manuallyPaused) stopAnimation();
    else startAnimation();
  });
  previousButton.addEventListener('click', () => moveOneCard(-1));
  nextButton.addEventListener('click', () => moveOneCard(1));
  serviceTrack.addEventListener('keydown', (event) => {
    if (event.target !== serviceTrack) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveOneCard(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  serviceTrack.addEventListener('pointerdown', () => { pauseUntil = Date.now() + 1400; }, { passive: true });
  serviceTrack.addEventListener('touchstart', () => { pauseUntil = Date.now() + 1400; }, { passive: true });
  serviceTrack.addEventListener('scroll', normalizeScroll, { passive: true });
  reducedMotion.addEventListener?.('change', () => {
    updateToggle();
    if (reducedMotion.matches) stopAnimation();
    else if (!manuallyPaused) startAnimation();
  });
  updateToggle();
  startAnimation();
}

if (!reducedMotion.matches) {
  document.querySelectorAll('[data-service-images]').forEach((image, imageOrder) => {
    const frames = image.dataset.serviceImages.split('|').filter(Boolean);
    if (frames.length < 2) return;

    let frameIndex = 0;
    const indicators = [...image.closest('.service-card__image').querySelectorAll('.service-card__pips i')];
    const changeFrame = () => {
      if (document.hidden) return;
      frameIndex = (frameIndex + 1) % frames.length;
      image.classList.add('is-changing');
      window.setTimeout(() => {
        image.src = frames[frameIndex];
        image.classList.remove('is-changing');
        indicators.forEach((indicator, index) => indicator.classList.toggle('is-active', index === frameIndex));
      }, 180);
    };
    window.setTimeout(() => window.setInterval(changeFrame, 4200), imageOrder * 700);
  });
}

const servicesImageSlider = document.querySelector('[data-services-image-slider]');
if (servicesImageSlider) {
  const viewport = servicesImageSlider.querySelector('[data-services-slider-viewport]');
  const track = servicesImageSlider.querySelector('.services-image-slider__track');
  const usedImagePaths = new Set(
    [...document.querySelectorAll('.services-grid .service-card__image img, .services-mini-slider__track img')]
      .map((image) => new URL(image.getAttribute('src'), document.baseURI).pathname),
  );
  const originalSlides = [...track.children].filter((slide) => {
    const image = slide.querySelector('img');
    return image && !usedImagePaths.has(new URL(image.getAttribute('src'), document.baseURI).pathname);
  });
  track.replaceChildren(...originalSlides);
  originalSlides.forEach((slide) => slide.querySelector('.services-image-slider__caption')?.remove());
  const updateServicesSliderLoop = () => {
    track.querySelectorAll('[data-services-slider-clone]').forEach((slide) => slide.remove());
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const setDistance = originalSlides.reduce((width, slide) => width + slide.getBoundingClientRect().width, 0) + gap * originalSlides.length;
    if (!setDistance || !viewport?.clientWidth) return;

    let setCount = 1;
    while (track.scrollWidth < viewport.clientWidth + setDistance && setCount < 8) {
      originalSlides.forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('data-services-slider-clone', '');
        clone.inert = true;
        clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
        track.append(clone);
      });
      setCount += 1;
    }
    track.style.setProperty('--ritual-loop-distance', `-${setDistance}px`);
    track.style.setProperty('--services-slider-duration', `${setDistance / 68}s`);
  };
  requestAnimationFrame(updateServicesSliderLoop);
  if ('ResizeObserver' in window) new ResizeObserver(updateServicesSliderLoop).observe(viewport);
  else window.addEventListener('resize', updateServicesSliderLoop);
}

const servicesMiniTrack = document.querySelector('[data-services-mini-track]');
if (servicesMiniTrack) {
  const viewport = servicesMiniTrack.parentElement;
  const originalImages = [...servicesMiniTrack.children];
  const updateServicesMiniLoop = () => {
    servicesMiniTrack.querySelectorAll('[data-services-mini-clone]').forEach((image) => image.remove());
    const gap = Number.parseFloat(getComputedStyle(servicesMiniTrack).columnGap) || 0;
    const setDistance = originalImages.reduce((width, image) => width + image.getBoundingClientRect().width, 0) + gap * originalImages.length;
    if (!setDistance || !viewport?.clientWidth) return;

    let setCount = 1;
    while (servicesMiniTrack.scrollWidth < viewport.clientWidth + setDistance && setCount < 8) {
      originalImages.forEach((image) => {
        const clone = image.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('data-services-mini-clone', '');
        clone.inert = true;
        servicesMiniTrack.append(clone);
      });
      setCount += 1;
    }
    servicesMiniTrack.style.setProperty('--ritual-loop-distance', `-${setDistance}px`);
    servicesMiniTrack.style.setProperty('--services-mini-duration', `${setDistance / 68}s`);
  };
  requestAnimationFrame(updateServicesMiniLoop);
  if ('ResizeObserver' in window) new ResizeObserver(updateServicesMiniLoop).observe(viewport);
  else window.addEventListener('resize', updateServicesMiniLoop);
}

const ritualList = document.querySelector('#ritual-list');
const ritualToggle = document.querySelector('.ritual-toggle');
if (ritualList) {
  ritualList.querySelectorAll('.ritual-row__track').forEach((track) => {
    const originalPhotos = [...track.children];
    const viewport = track.closest('.ritual-row__viewport');
    const updateLoop = () => {
      track.querySelectorAll('[data-ritual-clone]').forEach((photo) => photo.remove());
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      const setDistance = originalPhotos.reduce((width, photo) => width + photo.getBoundingClientRect().width, 0) + gap * originalPhotos.length;
      if (!setDistance || !viewport?.clientWidth) return;

      let setCount = 1;
      while (track.scrollWidth < viewport.clientWidth + setDistance && setCount < 8) {
        originalPhotos.forEach((photo) => {
          const copy = photo.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');
          copy.setAttribute('data-ritual-clone', '');
          copy.inert = true;
          copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
          track.append(copy);
        });
        setCount += 1;
      }
      track.style.setProperty('--ritual-loop-distance', `-${setDistance}px`);
    };

    requestAnimationFrame(updateLoop);
    if ('ResizeObserver' in window) new ResizeObserver(updateLoop).observe(viewport);
    else window.addEventListener('resize', updateLoop);
  });
}
if (ritualList && ritualToggle) {
  ritualToggle.addEventListener('click', () => {
    const paused = ritualToggle.getAttribute('aria-pressed') !== 'true';
    ritualToggle.setAttribute('aria-pressed', String(paused));
    ritualToggle.setAttribute('aria-label', paused ? 'Resume all service sliders' : 'Pause all service sliders');
    ritualToggle.querySelector('.carousel-toggle__icon').textContent = paused ? '▶' : 'Ⅱ';
    ritualToggle.querySelector('.ritual-toggle__label').textContent = paused ? 'Resume movement' : 'Pause movement';
    ritualList.classList.toggle('is-paused', paused);
  });
}

const testimonialTrack = document.querySelector('.testimonials-grid');
const reviewCarousel = document.querySelector('.review-carousel');
const reviewViewport = document.querySelector('.testimonial-viewport');
if (reviewCarousel && reviewViewport) {
  const reviewStep = () => {
    const card = reviewViewport.querySelector('.testimonial-card');
    const trackStyles = window.getComputedStyle(testimonialTrack);
    const gap = Number.parseFloat(trackStyles.columnGap) || 0;
    return (card?.getBoundingClientRect().width || reviewViewport.clientWidth * 0.8) + gap;
  };
  reviewCarousel.querySelector('.review-arrow--prev')?.addEventListener('click', () => {
    reviewCarousel.classList.add('is-manual');
    reviewViewport.scrollBy({ left: -reviewStep(), behavior: 'smooth' });
  });
  reviewCarousel.querySelector('.review-arrow--next')?.addEventListener('click', () => {
    reviewCarousel.classList.add('is-manual');
    reviewViewport.scrollBy({ left: reviewStep(), behavior: 'smooth' });
  });
}

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const serviceSelect = document.querySelector('#service-select');
if (serviceSelect) {
  const requestedService = new URLSearchParams(window.location.search).get('service');
  const validOption = [...serviceSelect.options].some((option) => option.value === requestedService);
  if (validOption) serviceSelect.value = requestedService;
}
const dateInput = document.querySelector('#preferred-date');
if (dateInput) {
  const localToday = new Date();
  localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
  dateInput.min = localToday.toISOString().slice(0, 10);
}

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity() || !status) return;
    const name = String(new FormData(form).get('name') || '').trim();
    if (form.dataset.demoForm === 'appointment') {
      status.textContent = `Thanks${name ? `, ${name}` : ''} — this is a static demo, so no appointment details were sent or stored. Connect the salon’s contact or booking provider before accepting requests.`;
    } else {
      status.textContent = `Thanks${name ? `, ${name}` : ''} — this is a static demo, so your enquiry was not sent or stored. Connect a salon contact channel before accepting messages.`;
    }
    form.reset();
  });
});
