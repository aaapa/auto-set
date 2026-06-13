class Map {
  selectors = {
    root: '[data-js-map]',
    canvas: '[data-js-map-canvas]',
  };

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.canvasElement = this.rootElement.querySelector(this.selectors.canvas);
    this.loadMapAPI();
  }

  loadMapAPI = () => {
    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=093aa711-af23-4025-845b-4d5273cbf527&lang=ru_RU';
    script.onload = () => { ymaps.ready(this.createMap); };
    document.head.appendChild(script);
  };

  createMap = () => {
    const map = new ymaps.Map(this.canvasElement, {
      center: [57.8769936, 59.9386079],
      zoom: 16,
      controls: ['zoomControl'],
    });

    const placemark = new ymaps.Placemark([57.874548, 59.939297], {}, {
      iconLayout: 'default#image',
      iconImageHref: 'imgs/map/map-label.svg',
      iconImageSize: [179, 83],
      iconImageOffset: [-89.5, -83],
    });

    map.geoObjects.add(placemark);
  };
}

if (
  document.querySelector('[data-js-map]') &&
  document.querySelector('[data-js-map]').querySelector('[data-js-map-canvas]')
) {
  new Map();
}