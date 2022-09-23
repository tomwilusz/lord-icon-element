import { Element } from '/dist/element.js';
import { defineElement } from '/dist/index.js';

const CLICK_EVENTS = [
    { name: 'mousedown' },
    { name: 'touchstart', options: { passive: true } },
];

class Custom {
    element;
    targetElement;
    player;

    constructor(element, targetElement, player) {
        this.element = element;
        this.targetElement = targetElement;
        this.player = player;
        this.direction = this.reverse ? -1 : 1;
        this.onClick = this.onClick.bind(this);
    }

    onConnected() {
        for (const event of CLICK_EVENTS) {
            this.targetElement.addEventListener(event.name, this.onClick, event.options);
        }
    }

    onDisconnected() {
        for (const event of CLICK_EVENTS) {
            this.targetElement.removeEventListener(event.name, this.onClick);
        }

        this.player.direction = 1;
    }

    onReady() {
        this.player.direction = this.direction;

        if (this.reverse) {
            this.player.goToLastFrame();
        }
    }

    onComplete() {
        this.direction = -this.direction;
        this.player.direction = this.direction;
    }

    onClick() {
        if (!this.player.isPlaying) {
            this.player.play();
        }
    }

    get reverse() {
        return this.element.hasAttribute('reverse');
    }
}

Element.defineTrigger('custom', Custom);

defineElement(lottie.loadAnimation);
