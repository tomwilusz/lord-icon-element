import { Element } from '/dist/element.js';
import { defineElement } from '/dist/index.js';

class Trash {
    player;
    element;
    targetElement;
    empty;

    constructor(player, element, targetElement) {
        this.player = player;
        this.element = element;
        this.targetElement = targetElement;

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
        this.player.state = 'in-trash-empty';
        this.player.playFromBeginning();
    }

    onClick() {
        if (this.empty) {
            this.player.state = 'morph-trash-full';
            this.empty = false;
        } else {
            this.player.state = 'morph-trash-full-to-empty';
            this.empty = true;
        }

        this.player.playFromBeginning();
    }

    onMouseEnter() {
        if (this.empty) {
            this.player.state = 'hover-trash-empty';
        } else {
            this.player.state = 'hover-trash-full';
        }

        this.player.playFromBeginning();
    }

    onMouseLeave() {
    }

    trashIntro() {
        this.player.state = 'in-trash-empty';
        this.empty = true;
        this.player.playFromBeginning();
    }

    trashFill() {
        this.player.state = 'morph-trash-full';
        this.empty = false;
        this.player.playFromBeginning();
    }

    trashErase() {
        this.player.state = 'morph-trash-full-to-empty';
        this.empty = true;
        this.player.playFromBeginning();
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