class Deals {
  selectors = {
    root: '[data-js-deals]',
    slidesWrapper: '[data-js-deals-slider-slides-wrapper]',
    slides: '[data-js-deals-slider-slides]',
    slide: '[data-js-deals-slider-slide]',
    prevButton: '[data-js-deals-button-prev]',
    nextButton: '[data-js-deals-button-next]',
    progress: '[data-js-deals-slider-progress]',
    progressLine: '[data-js-deals-slider-progress-line]',
    progressText: '[data-js-deals-slider-progress-text]',
  };

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.slidesWrapperElement = this.rootElement.querySelector(this.selectors.slidesWrapper);
    this.slidesContainerElement = this.rootElement.querySelector(this.selectors.slides);
    this.slidesElements = [...this.rootElement.querySelectorAll(this.selectors.slide)];
    this.prevButtonElement = this.rootElement.querySelector(this.selectors.prevButton);
    this.nextButtonElement = this.rootElement.querySelector(this.selectors.nextButton);
    this.progressElement = this.rootElement.querySelector(this.selectors.progress);
    this.progressLineElement = this.rootElement.querySelector(this.selectors.progressLine);
    this.progressTextElement = this.rootElement.querySelector(this.selectors.progressText);

    this.currentIndex = 0;
    this.totalSlides = this.slidesElements.length;

    this.isDragging = false;
    this.startX = 0;
    this.startTranslate = 0;
    this.pointerId = -1;

    this.stateClasses = {
      isDragging: 'deals__slider-slides-wrapper--is-dragging',
    };

    this.updateSlider();
    this.bindEvents();
  }

  getMaxRemOffset = () => {
    const slideWidth = this.getSlideWidth();
    const gap = this.getGap();
    const totalContentWidth = this.totalSlides * slideWidth + (this.totalSlides - 1) * gap;
    const wrapperWidth = this.slidesWrapperElement.offsetWidth / this.getRem();
    return Math.max(0, totalContentWidth - wrapperWidth);
  }

  getRem = () => {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  };

  getSlideWidth = () => {
    return this.slidesElements[0].offsetWidth / this.getRem();
  };

  getGap = () => {
    return (parseFloat(getComputedStyle(this.slidesContainerElement).columnGap) || 0) / this.getRem();
  };

  getMaxIndex = () => {
    const wrapperWidth = this.slidesWrapperElement.offsetWidth / this.getRem();
    const slideWidth = this.getSlideWidth();
    const gap = this.getGap();
    const totalContentWidth = this.totalSlides * slideWidth + (this.totalSlides - 1) * gap;
    if (totalContentWidth <= wrapperWidth) return 0;
    return Math.ceil((totalContentWidth - wrapperWidth) / (slideWidth + gap));
  };

  getOffsetForIndex = index => {
    const maxIndex = this.getMaxIndex();
    const slideWidth = this.getSlideWidth();
    const gap = this.getGap();
    const wrapperWidth = this.slidesWrapperElement.offsetWidth / this.getRem();
    const totalContentWidth = this.totalSlides * slideWidth + (this.totalSlides - 1) * gap;

    if (index === maxIndex && maxIndex > 0) {
      return -(totalContentWidth - wrapperWidth);
    }
    return -(index * (slideWidth + gap));
  };

  updateSlider = () => {
    const maxIndex = this.getMaxIndex();
    this.currentIndex = Math.min(this.currentIndex, maxIndex);
    const offset = this.getOffsetForIndex(this.currentIndex);
    this.slidesContainerElement.style.transform = `translateX(${offset}rem)`;

    this.updateProgress(maxIndex);
  };

  updateProgress = maxIndex => {
    const rem = this.getRem();
    const slideWidth = this.getSlideWidth();
    const gap = this.getGap();
    const totalContentWidth = this.totalSlides * slideWidth + (this.totalSlides - 1) * gap;
    const wrapperWidth = this.slidesWrapperElement.offsetWidth / rem;
    const visibleRatio = Math.min(1, wrapperWidth / (totalContentWidth || 1));

    const trackWidthRem = this.progressElement.offsetWidth / rem;
    const lineWidthRem = trackWidthRem * visibleRatio;
    this.progressLineElement.style.width = `${lineWidthRem}rem`;

    const progress = maxIndex > 0 ? this.currentIndex / maxIndex : 0;
    const maxLeftRem = trackWidthRem - lineWidthRem;
    this.progressLineElement.style.left = `${progress * maxLeftRem}rem`;

    const currentPage = this.currentIndex + 1;
    const totalPages = maxIndex + 1;
    this.progressElement.setAttribute('aria-valuenow', currentPage);
    this.progressElement.setAttribute('aria-valuemax', totalPages);
    this.progressTextElement.textContent = `Слайд ${currentPage} из ${totalPages}`;
  };

  goToPrev = () => {
    const maxIndex = this.getMaxIndex();
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : maxIndex;
    this.updateSlider();
  };

  goToNext = () => {
    const maxIndex = this.getMaxIndex();
    this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
    this.updateSlider();
  };

  onPrevClick = () => { this.goToPrev(); };

  onNextClick = () => { this.goToNext(); };

  onPointerDown = event => {
    this.startX = event.clientX;
    this.pointerId = event.pointerId;
    this.startTranslate = this.getOffsetForIndex(this.currentIndex);
    this.minTranslate = -this.getMaxRemOffset();
    this.maxTranslate = 0;
  };

  onPointerMove = event => {
    if (this.pointerId === -1) return;
    const diff = event.clientX - this.startX;

    if (!this.isDragging) {
      if (Math.abs(diff) < 5) return;
      this.isDragging = true;
      this.slidesContainerElement.style.transition = 'none';
      this.slidesWrapperElement.setPointerCapture(this.pointerId);
      this.slidesWrapperElement.classList.add(this.stateClasses.isDragging);
    }

    const diffRem = diff / this.getRem();
    const raw = this.startTranslate + diffRem;
    const clamped = Math.max(this.minTranslate, Math.min(this.maxTranslate, raw));
    this.slidesContainerElement.style.transform = `translateX(${clamped}rem)`;
  };

  onPointerUp = () => {
    if (this.pointerId === -1) return;
    const savedPointerId = this.pointerId;
    const wasDragging = this.isDragging;
    this.pointerId = -1;
    this.isDragging = false;
    this.slidesWrapperElement.classList.remove(this.stateClasses.isDragging);
    this.slidesContainerElement.style.transition = '';

    if (!wasDragging) return;

    this.slidesWrapperElement.releasePointerCapture(savedPointerId);

    const match = this.slidesContainerElement.style.transform.match(/-?\d+\.?\d*/);
    if (!match) return;
    const currentTranslate = parseFloat(match[0]);

    const expectedTranslate = this.getOffsetForIndex(this.currentIndex);
    const moved = currentTranslate - expectedTranslate;
    const slideWidth = this.getSlideWidth();
    const gap = this.getGap();
    const threshold = (slideWidth + gap) * 0.2;

    if (moved < -threshold) {
      this.goToNext();
    } else if (moved > threshold) {
      this.goToPrev();
    } else {
      this.updateSlider();
    }
  };

  bindEvents = () => {
    this.prevButtonElement.addEventListener('click', this.onPrevClick);
    this.nextButtonElement.addEventListener('click', this.onNextClick);
    window.addEventListener('resize', this.updateSlider);

    this.slidesWrapperElement.addEventListener('pointerdown', this.onPointerDown);
    this.slidesWrapperElement.addEventListener('pointermove', this.onPointerMove);
    this.slidesWrapperElement.addEventListener('pointerup', this.onPointerUp);
    this.slidesWrapperElement.addEventListener('pointercancel', this.onPointerUp);
  };
}

if (
  document.querySelector('[data-js-deals]') &&
  document.querySelector('[data-js-deals]').querySelector('[data-js-deals-slider-slides-wrapper]') &&
  document.querySelector('[data-js-deals]').querySelector('[data-js-deals-slider-slides]') &&
  document.querySelector('[data-js-deals]').querySelector('[data-js-deals-slider-slide]') &&
  document.querySelector('[data-js-deals]').querySelector('[data-js-deals-button-prev]') &&
  document.querySelector('[data-js-deals]').querySelector('[data-js-deals-button-next]') &&
  document.querySelector('[data-js-deals]').querySelector('[data-js-deals-slider-progress]') &&
  document.querySelector('[data-js-deals]').querySelector('[data-js-deals-slider-progress-line]') &&
  document.querySelector('[data-js-deals]').querySelector('[data-js-deals-slider-progress-text]')
) {
  new Deals();
}