import { defineLordIconElement, LordIconElement } from '../build/lord-icon-element.js';

// load icon data from json file
async function loadIcon(name) {
    const response = await fetch(`./icons/${name}.json`);
    return await response.json();
}

// load sample icons
(async () => {
    LordIconElement.registerIcon('first', await loadIcon('36-bulb-outline'));
    LordIconElement.registerIcon('second', await loadIcon('9-cloud-settings-outline'));
})();

// register element
defineLordIconElement(lottie.loadAnimation);
