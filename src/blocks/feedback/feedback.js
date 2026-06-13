import IMask from 'imask';

class Feedback {
  selectors = {
    root: '[data-js-feedback]',
    nameInput: '[data-js-feedback-name-input]',
    phoneInput: '[data-js-feedback-phone-input]',
  };

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.nameElement = this.rootElement.querySelector(this.selectors.nameInput);
    this.phoneElement = this.rootElement.querySelector(this.selectors.phoneInput);

    this.initPhoneMask();
    this.initNameMask();
  };

  initPhoneMask = () => {
    if (!this.phoneElement) return;

    IMask(this.phoneElement, {
      mask: '+7 (000) 000-00-00',
      lazy: false,
    });
  };

  initNameMask = () => {
    if (!this.nameElement) return;

    IMask(this.nameElement, {
      mask: /^[a-zA-Zа-яА-ЯёЁ\s-]+$/,
    });
  };
};

if (
  document.querySelector('[data-js-feedback]') &&
  document.querySelector('[data-js-feedback]').querySelector('[data-js-feedback-name-input]') &&
  document.querySelector('[data-js-feedback]').querySelector('[data-js-feedback-phone-input]')
) {
  new Feedback();
};