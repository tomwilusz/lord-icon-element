import utilsColors from './utils-colors.js';
import utilsHelpers from './utils-helpers.js';
import utilsLottie from './utils-lottie.js';

mocha.setup('bdd');

describe('utils', () => {
    utilsColors();
    utilsHelpers();
    utilsLottie();
});

mocha.run();