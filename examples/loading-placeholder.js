import { defineElement } from '/dist/index.js';
import { Element } from '/dist/element.js';

const ICONS = {};

async function loadIcons() {
    for (const icon of ['lock', 'puzzle', 'coins']) {
        const response = await fetch(`/icons/${icon}.json`);
        const data = await response.json();

        ICONS[icon] = data;
    }
}

function initElement() {
    // Custom icon loader which can provide icon data from any place you want.
    Element.setIconLoader((iconName) => {
        return ICONS[iconName];
    });

    // Register element.
    defineElement(lottie.loadAnimation);
}

(async () => {
    await loadIcons();

    // Simulate loading delay for icons (in real world loading this library or icons may take a while).
    setTimeout(() => {
        initElement();
    }, 1000);
})();
