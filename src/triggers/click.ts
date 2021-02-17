import { Basic } from './basic.js';

const CLICK_EVENTS = [ 'mousedown', 'touchstart' ];

/**
 * Enter animation after icon click.
 */
export class Click extends Basic {
    connectedCallback() {
        super.connectedCallback();

        for (const event of CLICK_EVENTS) {
            const options = event === 'touchstart' ? { passive: true } : undefined;
            this.target.addEventListener(event, this.enterBound, options);
        }
    }

    disconnectedCallback() {
        for (const event of CLICK_EVENTS) {
            this.target.removeEventListener(event, this.enterBound);
        }

        super.disconnectedCallback();
    }

    enter() {
        if (!this.inAnimation) {
            this.playFromBegining();
        }
    }
}