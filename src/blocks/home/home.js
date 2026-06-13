import tippy from 'tippy.js';

class Home {
  selectors = {
    root: '[data-js-home]',
    slides: '[data-js-home-slider-slides]',
    slidesWrapper: '[data-js-home-slider-slides-wrapper]',
    prevButton: '[data-js-home-slider-button-prev]',
    nextButton: '[data-js-home-slider-button-next]',
    pagination: '[data-js-home-pagination]',
  };

  stateClasses = {
    slideIsActive: 'home__slider-slide--is-active',
    paginationButtonIsActive: 'home__slider-pagination-button--is-active',
    isDragging: 'home__slider-slides-wrapper--is-dragging',
  };

  attrs = {
    ariaHidden: 'aria-hidden',
    inert: 'inert',
    ariaControls: 'aria-controls',
  };

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.slidesContainerElement = this.rootElement.querySelector(this.selectors.slides);
    this.slidesWrapperElement = this.rootElement.querySelector(this.selectors.slidesWrapper);
    this.slidesElements = [...this.slidesContainerElement.children];
    this.prevButtonElement = this.rootElement.querySelector(this.selectors.prevButton);
    this.nextButtonElement = this.rootElement.querySelector(this.selectors.nextButton);
    this.paginationElement = this.rootElement.querySelector(this.selectors.pagination);

    this.slidesElements.forEach((slide, index) => {
      slide.id = `home-slider-slide-${index}`;
    });
    this.slidesContainerElement.id = 'home-slider-slides';

    this.currentIndex = 0;
    this.totalSlides = this.slidesElements.length;

    this.isDragging = false;
    this.startX = 0;
    this.startTranslateX = 0;
    this.pointerId = -1;

    this.generatePagination();
    this.updateSlider();
    this.bindEvents();
  }

  generatePagination = () => {
    this.paginationElement.innerHTML = '';

    this.slidesElements.forEach((_, index) => {
      const li = document.createElement('li');
      li.className = 'home__slider-pagination-item';

      const button = document.createElement('button');
      button.className = 'home__slider-pagination-button';
      button.setAttribute(this.attrs.ariaControls, `home-slider-slide-${index}`);
      button.setAttribute('data-tippy-content', `Показать автомобиль №${index + 1}`);

      const span = document.createElement('span');
      span.className = 'visually-hidden';
      span.textContent = `Показать автомобиль №${index + 1}`;

      button.append(span);
      li.append(button);
      this.paginationElement.append(li);
    });

    tippy(this.paginationElement.querySelectorAll('[data-tippy-content]'), {
      aria: { content: null, expanded: false },
    });
  };

  updateSlider = () => {
    this.slidesContainerElement.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    this.slidesElements.forEach((slide, index) => {
      const isActive = index === this.currentIndex;
      slide.classList.toggle(this.stateClasses.slideIsActive, isActive);
      slide.setAttribute(this.attrs.ariaHidden, String(!isActive));
      if (isActive) {
        slide.removeAttribute(this.attrs.inert);
      } else {
        slide.setAttribute(this.attrs.inert, '');
      }
    });

    const paginationButtons = this.paginationElement.querySelectorAll('button');
    paginationButtons.forEach((btn, i) => {
      const isActive = i === this.currentIndex;
      btn.classList.toggle(this.stateClasses.paginationButtonIsActive, isActive);
      if (isActive) {
        btn.disabled = true;
      } else {
        btn.disabled = false;
      }
    });
  };

  goToPrev = () => {
    this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
  };

  goToNext = () => {
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
  };

  goToSlide = index => {
    this.currentIndex = index;
  };

  onPrevClick = () => {
    this.goToPrev();
    this.updateSlider();
  };

  onNextClick = () => {
    this.goToNext();
    this.updateSlider();
  };

  onPaginationClick = event => {
    const button = event.target.closest('button');
    if (!button) return;
    const buttons = [...this.paginationElement.querySelectorAll('button')];
    const index = buttons.indexOf(button);
    if (index === -1) return;
    this.goToSlide(index);
    this.updateSlider();
  };

  getViewportWidth = () => this.slidesWrapperElement.parentElement.getBoundingClientRect().width;

  onPointerDown = event => {
    this.startX = event.clientX;
    this.pointerId = event.pointerId;
    this.startTranslateX = -(this.currentIndex * 100);
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

    const percentDragged = (diff / this.getViewportWidth()) * 100;
    const raw = this.startTranslateX + percentDragged;
    const clamped = Math.max(-(this.totalSlides - 1) * 100, Math.min(0, raw));
    this.slidesContainerElement.style.transform = `translateX(${clamped}%)`;
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
    const currentTranslateX = parseFloat(match[0]);

    const nearestIndex = Math.round(-currentTranslateX / 100);
    const clampedIndex = Math.max(0, Math.min(nearestIndex, this.totalSlides - 1));

    if (clampedIndex !== this.currentIndex) {
      this.goToSlide(clampedIndex);
      this.updateSlider();
    } else {
      this.updateSlider();
    }
  };

  bindEvents = () => {
    this.prevButtonElement.setAttribute(this.attrs.ariaControls, this.slidesContainerElement.id);
    this.nextButtonElement.setAttribute(this.attrs.ariaControls, this.slidesContainerElement.id);
    this.prevButtonElement.addEventListener('click', this.onPrevClick);
    this.nextButtonElement.addEventListener('click', this.onNextClick);
    this.paginationElement.addEventListener('click', this.onPaginationClick);

    this.slidesWrapperElement.addEventListener('pointerdown', this.onPointerDown);
    this.slidesWrapperElement.addEventListener('pointermove', this.onPointerMove);
    this.slidesWrapperElement.addEventListener('pointerup', this.onPointerUp);
    this.slidesWrapperElement.addEventListener('pointercancel', this.onPointerUp);
  };
}

if (
  document.querySelector('[data-js-home]') &&
  document.querySelector('[data-js-home]').querySelector('[data-js-home-slider-slides]') &&
  document.querySelector('[data-js-home]').querySelector('[data-js-home-slider-slides-wrapper]') &&
  document.querySelector('[data-js-home]').querySelector('[data-js-home-slider-button-prev]') &&
  document.querySelector('[data-js-home]').querySelector('[data-js-home-slider-button-next]') &&
  document.querySelector('[data-js-home]').querySelector('[data-js-home-pagination]')
) {
  new Home();
}