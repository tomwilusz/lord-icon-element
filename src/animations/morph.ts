import { Basic } from './basic.js';

/**
 * Morph animation from point A to B after mouse enter and from B to A after mouse leave.
 */
export class Morph extends Basic {
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
        this.setDirection(1);
        this.play();
    }

    leave() {
        this.setDirection(-1);
        this.play();
    }
}