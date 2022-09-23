import { Element } from '/dist/element.js';
import { defineElement } from '/dist/index.js';

// List of supported icons by our icon loader.
const ICONS = {
    first: '/icons/confetti.json',
    second: '/icons/book.json',
}

// Custom icon loader which can provide icon data from any place you want.
// In this example our loader fetch icon data from provided url.
Element.setIconLoader(async (iconName) => {
    const response = await fetch(ICONS[iconName]);
    return await response.json();
});

// Register element.
defineElement(lottie.loadAnimation);
