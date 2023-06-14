import { defineElement } from '/dist/index.js';

defineElement(lottie.loadAnimation);

const iconElement = document.getElementById('main-icon');

iconElement.addEventListener('ready', () => {
    // initial play intro
    iconElement.playerInstance.state = 'in-reveal';
    iconElement.playerInstance.playFromBeginning();

    // store next state
    let nextState = null;

    // react on animation complete
    iconElement.playerInstance.addEventListener('complete', e => {
        // change to assigned state
        iconElement.playerInstance.state = nextState ?? 'loop-spin';

        // play from beginning
        iconElement.playerInstance.playFromBeginning();

        // clear next state
        nextState = null;
    });

    // react to mouse enter
    iconElement.addEventListener('mouseenter', e => {
        // set next state to hover
        nextState = 'hover-jump';
    });
});
