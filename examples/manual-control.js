import { defineElement } from '/dist/index.js';

defineElement(lottie.loadAnimation);

const lordIconElement = document.querySelector('lord-icon');

function updateDescription() {
    const text = `frame: ${Math.round(lordIconElement.player.frame)} / ${lordIconElement.player.frames}`;
    document.getElementById('description').innerText = text;
}

lordIconElement.addEventListener('ready', () => {
    updateDescription();

    let direction = 1;

    lordIconElement.player.speed = 0.25;
    lordIconElement.player.stroke = 40;
    lordIconElement.player.colors.primary = 'red';
    lordIconElement.player.colors.secondary = 'pink';

    lordIconElement.player.addEventListener('complete', () => {
        direction = -direction;
        lordIconElement.player.direction = direction;

    });

    lordIconElement.player.addEventListener('frame', () => {
        updateDescription();
    });
});

document.getElementById('play').addEventListener('click', e => {
    e.preventDefault();

    lordIconElement.player.play();
});

document.getElementById('next-frames').addEventListener('click', e => {
    e.preventDefault();

    lordIconElement.player.frame += 5;
});

document.getElementById('previous-frames').addEventListener('click', e => {
    e.preventDefault();

    lordIconElement.player.frame -= 5;
});