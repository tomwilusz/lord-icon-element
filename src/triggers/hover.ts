import { Base } from './base.js';

/**
 * Enter animation on icon hover.
 */
export class Hover extends Base {
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