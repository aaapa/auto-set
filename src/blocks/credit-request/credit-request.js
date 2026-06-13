import IMask from 'imask';

class CreditRequest {
  selectors = {
    root: '[data-js-credit-request]',
    phoneInput: '[data-js-credit-request-phone-input]',
    emailInput: '[data-js-credit-request-email-input]',
    firstNameInput: '[data-js-credit-request-first-name-input]',
    lastNameInput: '[data-js-credit-request-last-name-input]',
    patronymicInput: '[data-js-credit-request-patronymic-input]',
  };

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.phoneElement = this.rootElement.querySelector(this.selectors.phoneInput);
    this.emailElement = this.rootElement.querySelector(this.selectors.emailInput);
    this.firstNameElement = this.rootElement.querySelector(this.selectors.firstNameInput);
    this.lastNameElement = this.rootElement.querySelector(this.selectors.lastNameInput);
    this.patronymicElement = this.rootElement.querySelector(this.selectors.patronymicInput);

    this.initPhoneMask();
    this.initEmailMask();
    this.initNameMasks();
  }

  initPhoneMask = () => {
    if (!this.phoneElement) return;

    IMask(this.phoneElement, {
      mask: '+7 (000) 000-00-00',
      lazy: false,
    });
  };

  initEmailMask = () => {
    if (!this.emailElement) return;

    IMask(this.emailElement, {
      mask: /^[a-zA-Z0-9._%+\-@]+$/,
    });
  };

  initNameMasks = () => {
    const inputs = [this.firstNameElement, this.lastNameElement, this.patronymicElement];

    inputs.forEach(input => {
      if (!input) return;

      IMask(input, {
        mask: /^[a-zA-Zа-яА-ЯёЁ\s-]+$/,
      });
    });
  };
}

if (
  document.querySelector('[data-js-credit-request]') &&
  document.querySelector('[data-js-credit-request]').querySelector('[data-js-credit-request-phone-input]') &&
  document.querySelector('[data-js-credit-request]').querySelector('[data-js-credit-request-email-input]') &&
  document.querySelector('[data-js-credit-request]').querySelector('[data-js-credit-request-first-name-input]') &&
  document.querySelector('[data-js-credit-request]').querySelector('[data-js-credit-request-last-name-input]') &&
  document.querySelector('[data-js-credit-request]').querySelector('[data-js-credit-request-patronymic-input]')
) {
  new CreditRequest();
}
