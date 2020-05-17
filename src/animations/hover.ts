import { Basic } from './basic.js';

/**
 * Enter animation on icon hover.
 */
export class Hover extends Basic {
    connectedCallback() {
        super.connectedCallback();

        this.target.addEventListener('mouseenter', this.enterBound);
    }

    disconnectedCallback() {
        this.target.removeEventListener('mouseenter', this.enterBound);

        super.disconnectedCallback();
    }

    enter() {
        if (!this.inAnimation) {
            this.playFromBegining();
        }
    }
}