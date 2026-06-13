import '@/scss/simple-normalize.scss';
import '@/scss/fonts.scss';
import '@/scss/base.scss';

import '@/components/header/header.scss';
import '@/components/logo/logo.scss';
import '@/components/partner-logo/partner-logo.scss';
import '@/components/menu-button/menu-button.scss';
import '@/components/title/title.scss';
import '@/components/button/button.scss';
import '@/components/select/select.scss';
import '@/components/input/input.scss';
import '@/components/checkbox/checkbox.scss';
import '@/components/footer/footer.scss';

import '@/blocks/home/home.scss';
import '@/blocks/model-line/model-line.scss';
import '@/blocks/deals/deals.scss';
import '@/blocks/cta/cta.scss';
import '@/blocks/credit/credit.scss';
import '@/blocks/credit-guides/credit-guides.scss';
import '@/blocks/credit-request/credit-request.scss';
import '@/blocks/about/about.scss';
import '@/blocks/feedback/feedback.scss';
import '@/blocks/map/map.scss';

import '@/blocks/home/home.js';
import '@/components/select/select.js';
import '@/blocks/model-line/model-line.js';
import '@/blocks/deals/deals.js';
import '@/blocks/credit/credit.js';
import '@/blocks/credit-request/credit-request.js';
import '@/blocks/about/about.js';
import '@/blocks/feedback/feedback.js';
import '@/blocks/map/map.js';

import { initSprite } from '@/components/icons/icons.js';
initSprite();

import '@/components/header/header.js';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
tippy('[data-tippy-content]', {
  aria: {
    content: null,
    expanded: false,
  },
});