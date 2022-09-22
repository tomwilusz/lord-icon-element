import { Element } from '/dist/element.js';
import { defineLordIconElement } from '/dist/index.js';

const CLICK_EVENTS = [
    { name: 'mousedown' },
    { name: 'touchstart', options: { passive: true } },
];

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
        if (this.colorize) {
            this.player.colors.primary = 'red';
        }
        this.player.state = 'intro-empty';
        this.player.playFromBegining();
    }

    onComplete() {
    }

    onClick() {
        if (this.empty) {
            if (this.colorize) {
                this.player.colors.primary = 'green';
            }
            this.player.state = 'morph-fill';
            this.empty = false;
        } else {
            if (this.colorize) {
                this.player.colors.primary = 'blue';
            }
            this.player.state = 'morph-erase';
            this.empty = true;

        }

        this.player.playFromBegining();
    }

    onMouseEnter() {
        if (this.empty) {
            if (this.colorize) {
                this.player.colors.primary = 'darkkhaki';
            }
            this.player.state = 'hover-empty';
        } else {
            if (this.colorize) {
                this.player.colors.primary = 'darksalmon';
            }
            this.player.state = 'hover-full';
        }

        this.player.playFromBegining();
    }

    onMouseLeave() {
    }

    get colorize() {
        return this.element.hasAttribute('colorize');
    }
}

Element.registerTrigger('trash', Trash);

defineLordIconElement(lottie.loadAnimation);
