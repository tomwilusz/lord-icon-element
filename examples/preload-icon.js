import { defineLordIconElement, LordIconElement } from '../build/lord-icon-element.js';

// load icon data from json file
async function loadIcon(name) {
    const response = await fetch(`./icons/${name}.json`);
    return await response.json();
}

// load sample icons
(async () => {
    const [ firstIconData, secondIconData ] = await Promise.all([
        loadIcon('522-fish-outline'),
        loadIcon('421-wallet-purse-morph-outline'),
    ]);

    LordIconElement.registerIcon('first', firstIconData);
    LordIconElement.registerIcon('second', secondIconData);
})();

// register element
defineLordIconElement(lottie.loadAnimation);
