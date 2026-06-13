import tippy from 'tippy.js';

class About {
  selectors = {
    root: '[data-js-about]',
    slider: '[data-js-about-slider]',
    track: '[data-js-about-slider-track]',
    thumbsContainer: '[data-js-about-slider-thumbs]',
    thumbsWrapper: '[data-js-about-slider-thumbs-wrapper]',
    prevButton: '[data-js-about-slider-button-prev]',
    nextButton: '[data-js-about-slider-button-next]',
    thumb: '[data-js-about-slider-thumb]',
    progress: '[data-js-about-slider-progress]',
    progressLine: '[data-js-about-slider-progress-line]',
    progressText: '[data-js-about-slider-progress-text]',
  };

  stateClasses = {
    thumbIsActive: 'about__slider-thumb--is-active',
    isDragging: 'about__slider-track--is-dragging',
    isThumbsDragging: 'about__slider-thumbs-wrapper--is-dragging',
  };

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.sliderElement = this.rootElement.querySelector(this.selectors.slider);
    this.trackElement = this.rootElement.querySelector(this.selectors.track);
    this.prevButtonElement = this.rootElement.querySelector(this.selectors.prevButton);
    this.nextButtonElement = this.rootElement.querySelector(this.selectors.nextButton);
    this.thumbsElements = [...this.rootElement.querySelectorAll(this.selectors.thumb)];
    this.thumbsContainerElement = this.rootElement.querySelector(this.selectors.thumbsContainer);
    this.thumbsWrapperElement = this.rootElement.querySelector(this.selectors.thumbsWrapper);

    this.progressElement = this.rootElement.querySelector(this.selectors.progress);
    this.progressLineElement = this.rootElement.querySelector(this.selectors.progressLine);
    this.progressTextElement = this.rootElement.querySelector(this.selectors.progressText);

    this.currentIndex = 0;
    this.totalSlides = this.thumbsElements.length;

    this.isDragging = false;
    this.startX = 0;
    this.startTranslateX = 0;
    this.pointerId = -1;

    this.isThumbsDragging = false;
    this.thumbsElementsStartX = 0;
    this.thumbsTranslate = 0;
    this.thumbsPointerId = -1;

    this.generateSlides();
    this.updateSlider();
    this.bindEvents();
    this.initTippy();
  }

  generateSlides = () => {
    this.trackElement.innerHTML = '';
    this.slidesElements = [];

    this.thumbsElements.forEach((thumb, index) => {
      const thumbImg = thumb.querySelector('img');
      const slide = document.createElement('div');
      slide.className = 'about__slider-track-slide';

      const img = document.createElement('img');
      img.className = 'about__slider-track-image';
      img.src = thumbImg.src;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      img.alt = thumbImg.alt;

      slide.append(img);
      this.trackElement.append(slide);
      this.slidesElements.push(slide);
    });
  };

  updateSlider = () => {
    this.trackElement.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    this.thumbsElements.forEach((thumb, index) => {
      const isActive = index === this.currentIndex;
      thumb.classList.toggle(this.stateClasses.thumbIsActive, isActive);
      thumb.disabled = isActive;
    });

    this.slidesElements.forEach((slide, index) => {
      const isActive = index === this.currentIndex;
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.inert = !isActive;
    });

    this.updateProgress();
    this.updateThumbsPosition();
  };

  updateProgress = () => {
    this.progressLineElement.style.width = `${100 / this.totalSlides}%`;
    this.progressLineElement.style.left = `${this.currentIndex * 100 / this.totalSlides}%`;

    const currentPage = this.currentIndex + 1;
    this.progressElement.setAttribute('aria-valuenow', currentPage);
    this.progressElement.setAttribute('aria-valuemax', this.totalSlides);
    this.progressTextElement.textContent = `Слайд ${currentPage} из ${this.totalSlides}`;
  };

  goToPrev = () => {
    this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlider();
  };

  goToNext = () => {
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
    this.updateSlider();
  };

  goToSlide = index => {
    if (index === this.currentIndex) return;
    this.currentIndex = index;
    this.updateSlider();
  };

  onPrevClick = () => this.goToPrev();
  onNextClick = () => this.goToNext();

  onThumbClick = event => {
    const thumb = event.target.closest(this.selectors.thumb);
    if (!thumb) return;
    const index = this.thumbsElements.indexOf(thumb);
    if (index === -1) return;
    this.goToSlide(index);
  };

  getViewportWidth = () => this.trackElement.parentElement.getBoundingClientRect().width;

  getRem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

  onPointerDown = event => {
    this.startX = event.clientX;
    this.startTranslateX = -this.currentIndex * 100;
    this.pointerId = event.pointerId;
  };

  onPointerMove = event => {
    if (this.pointerId === -1) return;
    const diff = event.clientX - this.startX;

    if (!this.isDragging) {
      if (Math.abs(diff) < 5) return;
      this.isDragging = true;
      this.trackElement.style.transition = 'none';
      this.trackElement.setPointerCapture(this.pointerId);
      this.trackElement.classList.add(this.stateClasses.isDragging);
    }

    const percentDragged = (diff / this.getViewportWidth()) * 100;
    const raw = this.startTranslateX + percentDragged;
    const clamped = Math.max(-(this.totalSlides - 1) * 100, Math.min(0, raw));
    this.trackElement.style.transform = `translateX(${clamped}%)`;
  };

  onPointerUp = () => {
    if (this.pointerId === -1) return;
    const savedPointerId = this.pointerId;
    const wasDragging = this.isDragging;
    this.pointerId = -1;
    this.isDragging = false;
    this.trackElement.classList.remove(this.stateClasses.isDragging);
    this.trackElement.style.transition = '';

    if (!wasDragging) return;

    this.trackElement.releasePointerCapture(savedPointerId);

    const match = this.trackElement.style.transform.match(/-?\d+\.?\d*/);
    if (!match) return;
    const currentTranslateX = parseFloat(match[0]);

    const nearestIndex = Math.round(-currentTranslateX / 100);
    const clampedIndex = Math.max(0, Math.min(nearestIndex, this.totalSlides - 1));

    if (clampedIndex !== this.currentIndex) {
      this.goToSlide(clampedIndex);
    } else {
      this.updateSlider();
    }
  };

  getThumbsMaxTranslate = () => {
    const thumbWidth = this.thumbsElements[0].offsetWidth / this.getRem();
    const gap = (parseFloat(getComputedStyle(this.thumbsContainerElement).columnGap) || 0) / this.getRem();
    const totalWidth = this.totalSlides * thumbWidth + (this.totalSlides - 1) * gap;
    const wrapperWidth = this.thumbsContainerElement.parentElement.offsetWidth / this.getRem();
    return Math.max(0, totalWidth - wrapperWidth);
  };

  updateThumbsPosition = () => {
    const thumbWidth = this.thumbsElements[0].offsetWidth / this.getRem();
    const gap = (parseFloat(getComputedStyle(this.thumbsContainerElement).columnGap) || 0) / this.getRem();
    const wrapperWidth = this.thumbsContainerElement.parentElement.offsetWidth / this.getRem();
    const maxTranslate = -(this.getThumbsMaxTranslate());
    const target = -(this.currentIndex * (thumbWidth + gap));
    this.thumbsTranslate = Math.max(maxTranslate, Math.min(0, target));
    this.thumbsContainerElement.style.transform = `translateX(${this.thumbsTranslate}rem)`;
  };

  onThumbsPointerDown = event => {
    this.thumbsElementsStartX = event.clientX;
    this.thumbsPointerId = event.pointerId;
    this.thumbsElementsStartTranslate = this.thumbsTranslate;
  };

  onThumbsPointerMove = event => {
    if (this.thumbsPointerId === -1) return;
    const diff = event.clientX - this.thumbsElementsStartX;

    if (!this.isThumbsDragging) {
      if (Math.abs(diff) < 5) return;
      this.isThumbsDragging = true;
      this.thumbsContainerElement.style.transition = 'none';
      this.thumbsWrapperElement.setPointerCapture(this.thumbsPointerId);
      this.thumbsWrapperElement.classList.add(this.stateClasses.isThumbsDragging);
    }

    const diffRem = diff / this.getRem();
    const maxTranslate = -this.getThumbsMaxTranslate();
    const raw = this.thumbsElementsStartTranslate + diffRem;
    this.thumbsTranslate = Math.max(maxTranslate, Math.min(0, raw));
    this.thumbsContainerElement.style.transform = `translateX(${this.thumbsTranslate}rem)`;
  };

  onThumbsPointerUp = () => {
    if (this.thumbsPointerId === -1) return;
    const savedPointerId = this.thumbsPointerId;
    const wasDragging = this.isThumbsDragging;
    this.thumbsPointerId = -1;
    this.isThumbsDragging = false;
    this.thumbsWrapperElement.classList.remove(this.stateClasses.isThumbsDragging);
    this.thumbsContainerElement.style.transition = '';

    if (!wasDragging) return;

    this.thumbsWrapperElement.releasePointerCapture(savedPointerId);
  };

  initTippy = () => {
    tippy([...this.rootElement.querySelectorAll('[data-tippy-content]')], {
      aria: { content: null, expanded: false },
    });
  };

  bindEvents = () => {
    this.prevButtonElement.addEventListener('click', this.onPrevClick);
    this.nextButtonElement.addEventListener('click', this.onNextClick);
    this.sliderElement.addEventListener('click', this.onThumbClick);
    this.trackElement.addEventListener('pointerdown', this.onPointerDown);
    this.trackElement.addEventListener('pointermove', this.onPointerMove);
    this.trackElement.addEventListener('pointerup', this.onPointerUp);
    this.trackElement.addEventListener('pointercancel', this.onPointerUp);
    this.thumbsWrapperElement.addEventListener('pointerdown', this.onThumbsPointerDown);
    this.thumbsWrapperElement.addEventListener('pointermove', this.onThumbsPointerMove);
    this.thumbsWrapperElement.addEventListener('pointerup', this.onThumbsPointerUp);
    this.thumbsWrapperElement.addEventListener('pointercancel', this.onThumbsPointerUp);
  };
}

if (
  document.querySelector('[data-js-about]') &&
  document.querySelector('[data-js-about]').querySelector('[data-js-about-slider]') &&
  document.querySelector('[data-js-about]').querySelector('[data-js-about-slider-track]') &&
  document.querySelector('[data-js-about]').querySelector('[data-js-about-slider-thumbs]') &&
  document.querySelector('[data-js-about]').querySelector('[data-js-about-slider-button-prev]') &&
  document.querySelector('[data-js-about]').querySelector('[data-js-about-slider-button-next]') &&
  document.querySelector('[data-js-about]').querySelector('[data-js-about-slider-thumb]') &&
  document.querySelector('[data-js-about]').querySelector('[data-js-about-slider-progress]') &&
  document.querySelector('[data-js-about]').querySelector('[data-js-about-slider-progress-line]') &&
  document.querySelector('[data-js-about]').querySelector('[data-js-about-slider-progress-text]')
) {
  new About();
}
