import { Menu, X, MapPin, ChevronLeft, ChevronRight } from 'lucide';

const icons = {
  menu: Menu,
  x: X,
  'map-pin': MapPin,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-short-left': [['path', { d: 'M12 2L2 12.5L12 23' }]],
  'arrow-short-right': [['path', { d: 'M3 2L13 12.5L3 23' }]],
};

const viewBoxes = {
  'arrow-short-left': '0 0 15 25',
  'arrow-short-right': '0 0 15 25',
};

const fillNone = new Set(['menu', 'x', 'chevron-left', 'chevron-right', 'arrow-short-left', 'arrow-short-right']);

function createElement(name, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }
  return el;
}

function buildIconData(data) {
  const els = [];
  for (const [tag, attrs] of data) {
    els.push(createElement(tag, attrs));
  }
  return els;
}

export function initSprite() {
  const sprite = createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    style: 'display: none;',
  });

  for (const [id, iconData] of Object.entries(icons)) {
    const symbol = createElement('symbol', {
      id,
      viewBox: viewBoxes[id] || '0 0 24 24',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    });

    if (id === 'map-pin') {
      let pinD = '';
      for (const [tag, attrs] of iconData) {
        if (tag === 'path') pinD = attrs.d;
      }
      const holeD = 'M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0';
      symbol.append(createElement('path', {
        d: pinD + 'Z ' + holeD,
        'fill-rule': 'evenodd',
        fill: 'currentColor',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }));
    } else {
      for (const [tag, attrs] of iconData) {
        if (fillNone.has(id) && !attrs.fill) {
          attrs.fill = 'none';
        }
        symbol.append(createElement(tag, attrs));
      }
    }

    sprite.append(symbol);
  }

  document.body.prepend(sprite);
}
