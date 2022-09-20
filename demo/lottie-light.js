import { Element } from '/dist/element.js';

Element.setAnimationLoader(lottie.loadAnimation);

customElements.define("lord-icon", Element);

const lordIconElement = document.querySelector('lord-icon');

lordIconElement.addEventListener('ready', () => {
    console.log('ready');
});

lordIconElement.addEventListener('complete', () => {
    console.log('complete');
});

document.getElementById('btn').addEventListener('click', e => {
    e.preventDefault();
    lordIconElement.connectedTrigger.playFromBegining();
});