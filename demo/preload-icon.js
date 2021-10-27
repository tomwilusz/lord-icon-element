import { LordIconElement, defineLordIconElement } from '/build/lord-icon-element.js';

// load icon data from json file
async function loadIcon(url) {
    const response = await fetch(url);
    return await response.json();
}

// load sample icons
(async () => {
    const [ firstIconData, secondIconData ] = await Promise.all([
        loadIcon('https://cdn.lordicon.com/lupuorrc.json'),
        loadIcon('https://cdn.lordicon.com/wxnxiano.json'),
    ]);

    LordIconElement.registerIcon('first', firstIconData);
    LordIconElement.registerIcon('second', secondIconData);
})();

// register element
defineLordIconElement(lottie.loadAnimation);
