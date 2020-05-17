import { Basic } from './basic.js';

/**
 * Morph animation from point A to B and then from B to A after mouse enter.
 */
export class MorphTwoWay extends Basic {
    connectedCallback() {
        super.connectedCallback();

        this.target.addEventListener('mouseenter', this.enterBound);
    }

    disconnectedCallback() {
        this.target.removeEventListener('mouseenter', this.enterBound);

        this.setDirection(1);

        super.disconnectedCallback();
    }

    enter() {
        this.setDirection(1);
        this.play();
    }

    complete() {
        this.setDirection(-1);
        this.play();
    }
}