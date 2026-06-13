class CustomSelect {
  selectors = {
    root: '[data-js-select]',
    input: '[data-js-select-input]',
    selected: '[data-js-select-selected]',
    content: '[data-js-select-content]',
    option: '[data-js-select-option]',
  };

  stateClasses = {
    isOpen: 'select--is-open',
    optionIsHighlighted: 'select__option--is-highlighted',
  };

  attrs = {
    ariaExpanded: 'aria-expanded',
    ariaSelected: 'aria-selected',
    ariaHidden: 'aria-hidden',
    inert: 'inert',
    value: 'data-select-option-value',
  };

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.inputElement = rootElement.querySelector(this.selectors.input);
    this.selectedElement = rootElement.querySelector(this.selectors.selected);
    this.contentElement = rootElement.querySelector(this.selectors.content);
    this.optionElements = [...rootElement.querySelectorAll(this.selectors.option)];

    if (!this.inputElement || !this.selectedElement || !this.contentElement || !this.optionElements.length) return;

    this.totalOptions = this.optionElements.length;
    this.currentFocus = this.getSelectedIndex();

    this.selectedTextElement = this.selectedElement.querySelector('.select__selected-text');

    this.optionElements.forEach((opt, i) => { opt.tabIndex = i === this.currentFocus ? 0 : -1; });

    this.setContentPosition();
    this.bindEvents();
  }

  setContentPosition = () => {
    const selectedHeight = this.selectedElement.offsetHeight;
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const offsetRem = (selectedHeight + 10) / rootFontSize;
    this.contentElement.style.transform = `translateY(${offsetRem}rem)`;
  };

  getSelectedIndex = () => this.optionElements.findIndex(opt => opt.getAttribute(this.attrs.ariaSelected) === 'true');

  highlightOption = index => {
    this.optionElements.forEach((opt, i) => {
      opt.classList.toggle(this.stateClasses.optionIsHighlighted, i === index);
      opt.tabIndex = i === index ? 0 : -1;
    });
    this.optionElements[index].scrollIntoView({ block: 'nearest' });
    this.optionElements[index].focus({ preventScroll: true });
  };

  toggleOpen = () => {
    const isOpen = this.rootElement.classList.toggle(this.stateClasses.isOpen);
    this.selectedElement.setAttribute(this.attrs.ariaExpanded, String(isOpen));
    if (isOpen) {
      this.contentElement.removeAttribute(this.attrs.ariaHidden);
      this.contentElement.removeAttribute(this.attrs.inert);
      this.currentFocus = this.getSelectedIndex();
      this.highlightOption(this.currentFocus);
    }
  };

  close = () => {
    this.rootElement.classList.remove(this.stateClasses.isOpen);
    this.selectedElement.setAttribute(this.attrs.ariaExpanded, 'false');
    this.contentElement.setAttribute(this.attrs.ariaHidden, 'true');
    this.contentElement.setAttribute(this.attrs.inert, '');
    this.optionElements.forEach((opt, i) => { opt.tabIndex = i === this.getSelectedIndex() ? 0 : -1; });
  };

  selectOption = option => {
    const value = option.getAttribute(this.attrs.value);
    const text = option.querySelector('span').textContent;

    this.inputElement.value = value;
    this.selectedTextElement.textContent = text;

    this.optionElements.forEach(opt => opt.setAttribute(this.attrs.ariaSelected, 'false'));
    option.setAttribute(this.attrs.ariaSelected, 'true');

    this.currentFocus = this.getSelectedIndex();
    this.setContentPosition();
    this.close();
    this.selectedElement.focus();
  };

  onSelectedClick = () => { this.toggleOpen(); };

  onOptionClick = event => {
    const option = event.target.closest(this.selectors.option);
    if (!option) return;
    this.selectOption(option);
  };

  onKeydown = event => {
    if (event.key === 'Escape') {
      this.close();
      this.selectedElement.focus();
      return;
    }

    if (!this.rootElement.classList.contains(this.stateClasses.isOpen)) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.currentFocus = (this.currentFocus + 1) % this.totalOptions;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.currentFocus = (this.currentFocus - 1 + this.totalOptions) % this.totalOptions;
        break;
      case 'Home':
        event.preventDefault();
        this.currentFocus = 0;
        break;
      case 'End':
        event.preventDefault();
        this.currentFocus = this.totalOptions - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectOption(this.optionElements[this.currentFocus]);
        return;
      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) {
          this.currentFocus = (this.currentFocus - 1 + this.totalOptions) % this.totalOptions;
        } else {
          this.currentFocus = (this.currentFocus + 1) % this.totalOptions;
        }
        break;
      default:
        return;
    }

    this.highlightOption(this.currentFocus);
  };

  onOptionFocus = event => {
    const option = event.target.closest(this.selectors.option);
    if (!option) return;
    const index = this.optionElements.indexOf(option);
    if (index === -1) return;
    this.currentFocus = index;
    this.highlightOption(this.currentFocus);
  };

  onFocusout = event => {
    if (!this.rootElement.contains(event.relatedTarget)) {
      this.close();
    }
  };

  onOutsideClick = event => {
    if (this.rootElement.classList.contains(this.stateClasses.isOpen) && !this.rootElement.contains(event.target)) {
      this.close();
    }
  };

  bindEvents = () => {
    this.selectedElement.addEventListener('click', this.onSelectedClick);
    this.contentElement.addEventListener('click', this.onOptionClick);
    this.rootElement.addEventListener('keydown', this.onKeydown);
    this.rootElement.addEventListener('focusout', this.onFocusout);
    this.optionElements.forEach(opt => opt.addEventListener('focus', this.onOptionFocus));
    document.addEventListener('click', this.onOutsideClick);
  };
}

const customSelects = document.querySelectorAll('[data-js-select]');
customSelects.forEach(element => { new CustomSelect(element); });