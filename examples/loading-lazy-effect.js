import { defineElement } from '/dist/index.js';

document.querySelectorAll('lord-icon').forEach((element) => {
    element.addEventListener('ready', () => {
        element.classList.add('ready');
    });
})

defineElement(lottie.loadAnimation);