import { defineElement } from '/dist/index.js';

defineElement(lottie.loadAnimation);

const iconElement = document.getElementById('main-icon');

iconElement.addEventListener('ready', () => {
    // initial play intro
    iconElement.state = 'intro';
    iconElement.player.playFromBegining();

    // store next state
    let nextState = null;

    // react on animation complete
    iconElement.player.addEventListener('complete', e => {
        // change to assigned state
        iconElement.state = nextState ?? 'loop';

        // play from begining
        iconElement.player.playFromBegining();

        // clear next state
        nextState = null;
    });

    // react to mouse enter
    iconElement.addEventListener('mouseenter', e => {
        // set next state to hover
        nextState = 'hover';
    });
});
