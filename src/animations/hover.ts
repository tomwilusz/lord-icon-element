import { Basic } from './basic.js';

/**
 * Enter animation on icon hover.
 */
export class Hover extends Basic {
    connectedCallback() {
        this.element.addEventListener('mouseenter', this.enterBound);
    }

    disconnectedCallback() {
        this.element.removeEventListener('mouseenter', this.enterBound);
    }

    enter() {
        if (!this.inAnimation) {
            this.playFromBegining();
        }
    }
}