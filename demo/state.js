import { defineLordIconElement } from '/dist/index.js';

defineLordIconElement(lottie.loadAnimation);

function handleIconStates(iconElement) {
    let nextState = null;

    iconElement.addEventListener('icon-ready', e => {
        iconElement.state = 'intro';
        iconElement.connectedTrigger.playFromBegining();
    });

    iconElement.addEventListener('animation-complete', e => {
        iconElement.state = nextState ?? 'loop';
        iconElement.connectedTrigger.playFromBegining();

        nextState = null;
    });

    iconElement.addEventListener('mouseenter', e => {
        nextState = 'hover';
    });
}

handleIconStates(document.getElementById('main-icon'));