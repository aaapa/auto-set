class Header {
  selectors = {
    root: '[data-js-header]',
    inner: '[data-js-header-inner]',
    top: '[data-js-header-top]',
    contacts: '[data-js-header-contacts]',
    bottom: '[data-js-header-bottom]',
    list: '[data-js-header-list]',
    menuButton: '[data-js-header-menu-button]',
    menuButtonText: '[data-js-header-menu-button-text]',
    menuButtonIcon: '[data-js-header-menu-button-icon]',
    main: '[data-js-main]',
  };

  headerHeight = '';

  isScrolled = false;

  stateClasses = {
    isOpen: 'menu-button__icon--is-open',
    scrollLock: 'scroll-lock',
    menuIsOpen: 'header__menu--is-open',
    isScrolled: 'header--is-scrolled',
    linkIsOpen: 'header__link--is-open',
  };

  attrs = {
    ariaExpanded: 'aria-expanded',
    ariaHidden: 'aria-hidden',
    inert: 'inert',
  };

  media = {
    tablet: '(width <= 71.875rem)',
  };

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.innerElement = this.rootElement.querySelector(this.selectors.inner);
    this.contactsElement = this.rootElement.querySelector(this.selectors.contacts);
    this.bottomElement = this.rootElement.querySelector(this.selectors.bottom);
    this.listElement = this.rootElement.querySelector(this.selectors.list);
    this.menuButtonElement = this.rootElement.querySelector(this.selectors.menuButton);
    this.menuButtonTextElement = this.menuButtonElement.querySelector(this.selectors.menuButtonText);
    this.menuButtonIconElement = this.menuButtonElement.querySelector(this.selectors.menuButtonIcon);
    this.topElement = this.rootElement.querySelector(this.selectors.top);
    this.mainElement = document.querySelector(this.selectors.main);

    this.menuElement = null;
    this.isOpen = false;

    this.menuButtonElement.setAttribute(this.attrs.ariaExpanded, 'false');

    this.matchMedia = window.matchMedia(this.media.tablet);

    this.headerResizeObserver = new ResizeObserver(() => {
      this.updateMainPadding();
    });
    this.headerResizeObserver.observe(this.rootElement);
    this.updateMainPadding();

    this.onScroll();
    this.bindEvents();
    this.onMatchMediaChange(this.matchMedia);
  }

  updateMainPadding = () => {
    if (!this.mainElement) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const height = this.rootElement.getBoundingClientRect().height;
    const paddingInRem = height / rootFontSize;

    this.mainElement.style.paddingBlockStart = `${paddingInRem}rem`;
  };

  onScroll = () => {
    const scrolled = window.scrollY > 10;
    if (scrolled === this.isScrolled) return;
    this.isScrolled = scrolled;
    this.rootElement.classList.toggle(this.stateClasses.isScrolled, scrolled);
  };

  onMatchMediaChange = event => event.matches ? this.createMenu() : this.destroyMenu();

  onMenuButtonClick = () => this.isOpen ? this.close() : this.open();

  onKeyDown = event => {if (event.key === 'Escape' && this.isOpen) this.close();};

  onListClick = event => {
    const linkElement = event.target.closest('.header__link');
    if (!linkElement || !this.listElement.contains(linkElement)) return;
    this.listElement.querySelectorAll('.header__link').forEach(item => item.classList.remove(this.stateClasses.linkIsOpen));
    linkElement.classList.add(this.stateClasses.linkIsOpen);
    if (this.isOpen) this.close();
  };

  createMenu = () => {
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'header__menu';
    this.menuElement.id = 'header-menu';
    this.menuElement.setAttribute('role', 'menu');
    this.menuButtonElement.setAttribute('aria-controls', 'header-menu');
    this.innerElement.append(this.menuElement);
    this.menuElement.append(this.contactsElement, this.bottomElement);

    this.isOpen && this.open();
  };

  destroyMenu = () => {
    if (!this.menuElement) return;

    this.close();

    this.menuButtonElement.removeAttribute('aria-controls');
    this.topElement.insertBefore(this.contactsElement, this.menuButtonElement);
    this.topElement.after(this.bottomElement);

    this.menuElement.remove();
    this.menuElement = null;
  };

  open = () => {
    this.isOpen = true;
    this.menuElement.setAttribute(this.attrs.ariaHidden, 'false');
    this.menuElement.removeAttribute(this.attrs.inert);
    this.menuElement.classList.add(this.stateClasses.menuIsOpen);
    this.menuButtonElement.setAttribute(this.attrs.ariaExpanded, 'true');
    this.menuButtonTextElement.textContent = 'Закрыть меню';
    this.menuButtonIconElement.classList.add(this.stateClasses.isOpen);
    document.body.classList.add(this.stateClasses.scrollLock);
  };

  close = () => {
    this.isOpen = false;
    if (!this.menuElement) return;
    this.menuElement.setAttribute(this.attrs.ariaHidden, 'true');
    this.menuElement.setAttribute(this.attrs.inert, '');
    this.menuElement.classList.remove(this.stateClasses.menuIsOpen);
    this.menuButtonElement.setAttribute(this.attrs.ariaExpanded, 'false');
    this.menuButtonTextElement.textContent = 'Открыть меню';
    this.menuButtonIconElement.classList.remove(this.stateClasses.isOpen);
    document.body.classList.remove(this.stateClasses.scrollLock);
  };

  bindEvents = () => {
    this.matchMedia.addEventListener('change', this.onMatchMediaChange);
    this.menuButtonElement.addEventListener('click', this.onMenuButtonClick);
    this.listElement.addEventListener('click', this.onListClick);
    document.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('scroll', this.onScroll, { passive: true });
  };
};

if (
  document.querySelector('[data-js-header]') &&
  document.querySelector('[data-js-main]') &&
  document.querySelector('[data-js-header]').querySelector('[data-js-header-inner]') &&
  document.querySelector('[data-js-header]').querySelector('[data-js-header-top]') &&
  document.querySelector('[data-js-header]').querySelector('[data-js-header-contacts]') &&
  document.querySelector('[data-js-header]').querySelector('[data-js-header-bottom]') &&
  document.querySelector('[data-js-header]').querySelector('[data-js-header-list]') &&
  document.querySelector('[data-js-header]').querySelector('[data-js-header-menu-button]') &&
  document.querySelector('[data-js-header]').querySelector('[data-js-header-menu-button]').querySelector('[data-js-header-menu-button-text]') &&
  document.querySelector('[data-js-header]').querySelector('[data-js-header-menu-button]').querySelector('[data-js-header-menu-button-icon]')) {
  new Header();
};