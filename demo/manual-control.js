import { defineLordIconElement } from '/dist/index.js';

defineLordIconElement(lottie.loadAnimation);

const lordIconElement = document.querySelector('lord-icon');

lordIconElement.addEventListener('ready', () => {
    let direction = 1;

    lordIconElement.player.colors.primary = 'red';
    lordIconElement.player.colors.secondary = 'pink';
    lordIconElement.player.stroke = 75;

    lordIconElement.player.addEventListener('complete', () => {
        direction = -direction;
        lordIconElement.player.setDirection(direction);

    });
});

document.getElementById('btn').addEventListener('click', e => {
    e.preventDefault();

    lordIconElement.player.play();
});