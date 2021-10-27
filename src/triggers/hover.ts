import { Basic } from './basic.js';

/**
 * Enter animation on icon hover.
 */
export class Hover extends Basic {
    connectedCallback() {
        super.connectedCallback();

        this.addTargetEventListener('mouseenter', () => {
            if (!this.inAnimation) {
                this.playFromBegining();
            }
        });
    }
}