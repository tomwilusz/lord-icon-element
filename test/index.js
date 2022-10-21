import utilsColors from './utils-colors.js';
import utilsHelpers from './utils-helpers.js';
import utilsLottie from './utils-lottie.js';
import elementDefine from './element-define.js';
import elementMain from './element-main.js';
import elementIconLoader from './element-icon-loader.js';
import playerMain from './player-main.js';
import playerRender from './player-render.js';

mocha.setup('bdd');

describe('utils', () => {
    utilsColors();
    utilsHelpers();
    utilsLottie();
});

describe('element', () => {
    elementDefine();
    elementMain();
    elementIconLoader();
});

describe('player', () => {
    playerMain();
    playerRender();
});

mocha.run();