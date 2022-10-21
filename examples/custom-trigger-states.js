import { Element } from '/dist/element.js';
import { defineElement } from '/dist/index.js';

class Trash {
    element;
    targetElement;
    player;
    empty;

    constructor(element, targetElement, player) {
        this.element = element;
        this.targetElement = targetElement;
        this.player = player;

        this.empty = true;

        this.onClick = this.onClick.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    onConnected() {
        this.targetElement.addEventListener('click', this.onClick);
        this.targetElement.addEventListener('mouseenter', this.onMouseEnter);
        this.targetElement.addEventListener('mouseleave', this.onMouseLeave);
    }

    onDisconnected() {
        this.targetElement.removeEventListener('click', this.onClick);
        this.targetElement.removeEventListener('mouseenter', this.onMouseEnter);
        this.targetElement.removeEventListener('mouseleave', this.onMouseLeave);
    }

    onReady() {
        this.player.state = 'intro-empty';
        this.player.playFromBegining();
    }

    onClick() {
        if (this.empty) {
            this.player.state = 'morph-fill';
            this.empty = false;
        } else {
            this.player.state = 'morph-erase';
            this.empty = true;
        }

        this.player.playFromBegining();
    }

    onMouseEnter() {
        if (this.empty) {
            this.player.state = 'hover-empty';
        } else {
            this.player.state = 'hover-full';
        }

        this.player.playFromBegining();
    }

    onMouseLeave() {
    }

    trashIntro() {
        this.player.state = 'intro-empty';
        this.empty = true;
        this.player.playFromBegining();
    }

    trashFill() {
        this.player.state = 'morph-fill';
        this.empty = false;
        this.player.playFromBegining();
    }

    trashErase() {
        this.player.state = 'morph-erase';
        this.empty = true;
        this.player.playFromBegining();
    }
}

Element.defineTrigger('trash', Trash);

defineElement(lottie.loadAnimation);

// control animation manualy with trigger instance
const element = document.querySelector('lord-icon');
element.addEventListener('ready', () => {
    document.getElementById('trash-intro').addEventListener('click', e => {
        e.preventDefault();
        element.triggerInstance.trashIntro()
    });

    document.getElementById('trash-fill').addEventListener('click', e => {
        e.preventDefault();
        element.triggerInstance.trashFill()
    });

    document.getElementById('trash-erase').addEventListener('click', e => {
        e.preventDefault();
        element.triggerInstance.trashErase()
    });
});