class ModelLine {
  selectors = {
    root: '[data-js-model-line]',
    slides: '[data-js-model-line-slider-slides]',
    slidesWrapper: '[data-js-model-line-slider-slides-wrapper]',
    slide: '[data-js-model-line-slider-slide]',
    prevButton: '[data-js-model-line-button-prev]',
    nextButton: '[data-js-model-line-button-next]',
    featuresList: '[data-js-model-line-card-features-list]',
    featuresMoreButton: '[data-js-model-line-card-features-more-button]',
    featuresHiddenItem: '[data-js-model-line-features-list-item-hidden]',
  };

  stateClasses = {
    featuresItemHidden: 'model-line__card-features-item--hidden',
    isDragging: 'model-line__slider-slides-wrapper--is-dragging',
  };

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.slidesContainerElement = this.rootElement.querySelector(this.selectors.slides);
    this.slidesElements = [...this.rootElement.querySelectorAll(this.selectors.slide)];
    this.slidesWrapperElement = this.rootElement.querySelector(this.selectors.slidesWrapper);
    this.prevButtonElement = this.rootElement.querySelector(this.selectors.prevButton);
    this.nextButtonElement = this.rootElement.querySelector(this.selectors.nextButton);
    this.featuresMoreButtons = [...this.rootElement.querySelectorAll(this.selectors.featuresMoreButton)];

    this.currentIndex = 0;
    this.totalSlides = this.slidesElements.length;

    this.isDragging = false;
    this.startX = 0;
    this.startTranslate = 0;
    this.pointerId = -1;

    this.updateSlider();
    this.bindEvents();
  }

  getMaxRemOffset = () => {
    const slideWidth = this.getSlideWidth();
    const gap = this.getGap();
    const totalContentWidth = this.totalSlides * slideWidth + (this.totalSlides - 1) * gap;
    const wrapperWidth = this.slidesContainerElement.parentElement.offsetWidth / this.getRem();
    return Math.max(0, totalContentWidth - wrapperWidth);
  };

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
    const wrapperWidth = this.slidesContainerElement.parentElement.offsetWidth / this.getRem();
    const slideWidth = this.getSlideWidth();
    const gap = this.getGap();
    const totalContentWidth = this.totalSlides * slideWidth + (this.totalSlides - 1) * gap;
    const maxTranslateX = Math.max(0, totalContentWidth - wrapperWidth);
    return Math.floor(maxTranslateX / (slideWidth + gap));
  };

  getOffsetForIndex = index => {
    const slideWidth = this.getSlideWidth();
    const gap = this.getGap();
    return -(index * (slideWidth + gap));
  };

  updateSlider = () => {
    const maxIndex = this.getMaxIndex();
    this.currentIndex = Math.min(this.currentIndex, maxIndex);
    const offset = this.getOffsetForIndex(this.currentIndex);
    this.slidesContainerElement.style.transform = `translateX(${offset}rem)`;
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

  toggleFeatures = (button, hiddenItems) => {
    const isHidden = button.textContent === 'Развернуть';
    hiddenItems.forEach(item => item.classList.toggle(this.stateClasses.featuresItemHidden, !isHidden));
    button.textContent = isHidden ? 'Свернуть' : 'Развернуть';
  };

  onPrevClick = () => { this.goToPrev(); };

  onNextClick = () => { this.goToNext(); };

  onFeaturesMoreClick = event => {
    const button = event.target.closest(this.selectors.featuresMoreButton);
    if (!button) return;
    const list = button.previousElementSibling;
    const hiddenItems = [...list.querySelectorAll(this.selectors.featuresHiddenItem)];
    if (!hiddenItems.length) return;
    this.toggleFeatures(button, hiddenItems);
  };

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
    this.rootElement.addEventListener('click', this.onFeaturesMoreClick);
    window.addEventListener('resize', this.updateSlider);

    this.slidesWrapperElement.addEventListener('pointerdown', this.onPointerDown);
    this.slidesWrapperElement.addEventListener('pointermove', this.onPointerMove);
    this.slidesWrapperElement.addEventListener('pointerup', this.onPointerUp);
    this.slidesWrapperElement.addEventListener('pointercancel', this.onPointerUp);
  };
}

if (
  document.querySelector('[data-js-model-line]') &&
  document.querySelector('[data-js-model-line]').querySelector('[data-js-model-line-slider-slides]') &&
  document.querySelector('[data-js-model-line]').querySelector('[data-js-model-line-slider-slides-wrapper]') &&
  document.querySelector('[data-js-model-line]').querySelector('[data-js-model-line-slider-slide]') &&
  document.querySelector('[data-js-model-line]').querySelector('[data-js-model-line-button-prev]') &&
  document.querySelector('[data-js-model-line]').querySelector('[data-js-model-line-button-next]') &&
  document.querySelector('[data-js-model-line]').querySelector('[data-js-model-line-card-features-list]') &&
  document.querySelector('[data-js-model-line]').querySelector('[data-js-model-line-card-features-more-button]') &&
  document.querySelector('[data-js-model-line]').querySelector('[data-js-model-line-features-list-item-hidden]')
) {
  new ModelLine();
}
