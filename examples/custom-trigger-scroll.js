import { Element } from '/dist/element.js';
import { defineElement } from '/dist/index.js';

class Scroll {
    element;
    targetElement;
    player;

    constructor(element, targetElement, player) {
        this.element = element;
        this.targetElement = targetElement;
        this.player = player;

        this.scroll = this.scroll.bind(this);
    }

    onReady() {
        document.addEventListener('scroll', this.scroll);

        this.scroll();
    }

    onDisconnected() {
        document.removeEventListener('scroll', this.scroll);
    }

    scroll() {
        const wy = window.scrollY;
        const p = ((wy / window.innerHeight)) % 1;

        this.player.frame = this.player.frames * p;
    }
}

Element.defineTrigger('scroll', Scroll);

defineElement(lottie.loadAnimation);