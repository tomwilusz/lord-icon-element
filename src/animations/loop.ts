import { Basic } from './basic.js';

/**
 * Loop animation when mouse is on icon.
 */
export class Loop extends Basic {
    connectedCallback() {
        this.element.addEventListener('mouseenter', this.enterBound);
        this.element.addEventListener('mouseleave', this.leaveBound);
    }

    disconnectedCallback() {
        this.element.removeEventListener('mouseenter', this.enterBound);
        this.element.removeEventListener('mouseleave', this.leaveBound);

        this.setDirection(1);
    }

    enter() {
        this.setLoop(true);
        this.play();
    }

    leave() {
        this.setLoop(false);
    }
}