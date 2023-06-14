import { defineElement } from '/dist/index.js';

defineElement(lottie.loadAnimation);

const lordIconElement = document.querySelector('lord-icon');

function updateDescription() {
    const text = `frame: ${Math.round(lordIconElement.playerInstance.frame)} / ${lordIconElement.playerInstance.frames}`;
    document.getElementById('description').innerText = text;
}

lordIconElement.addEventListener('ready', () => {
    updateDescription();

    let direction = 1;

    lordIconElement.playerInstance.speed = 0.25;
    lordIconElement.playerInstance.stroke = 'light';
    lordIconElement.playerInstance.colors.primary = 'red';
    lordIconElement.playerInstance.colors.secondary = 'pink';

    lordIconElement.playerInstance.addEventListener('complete', () => {
        direction = -direction;
        lordIconElement.playerInstance.direction = direction;

    });

    lordIconElement.playerInstance.addEventListener('frame', () => {
        updateDescription();
    });
});

document.getElementById('play').addEventListener('click', e => {
    e.preventDefault();

    lordIconElement.playerInstance.play();
});

document.getElementById('next-frames').addEventListener('click', e => {
    e.preventDefault();

    lordIconElement.playerInstance.frame += 5;
});

document.getElementById('previous-frames').addEventListener('click', e => {
    e.preventDefault();

    lordIconElement.playerInstance.frame -= 5;
});

document.getElementById('switch-state').addEventListener('click', e => {
    e.preventDefault();

    const states = lordIconElement.playerInstance.states.map(c => c.name);

    // lordIconElement.playerInstance.frame -= 5;
    let index = states.indexOf(lordIconElement.playerInstance.state);
    index++;

    if (index >= states.length) {
        index = 0;
    }

    lordIconElement.playerInstance.direction = 1;
    lordIconElement.playerInstance.state = states[index];
});