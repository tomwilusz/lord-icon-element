import { Basic } from './basic.js';

const CLICK_EVENTS = [ 'mousedown', 'touchstart' ];

/**
 * Enter animation after icon click.
 */
export class Click extends Basic {
    connectedCallback() {
        for (const event of CLICK_EVENTS) {
            const options = event === 'touchstart' ? { passive: true } : undefined;
            this.element.addEventListener(event, this.enterBound, options);
        }
    }

    disconnectedCallback() {
        for (const event of CLICK_EVENTS) {
            this.element.removeEventListener(event, this.enterBound);
        }
    }

    enter() {
        if (!this.inAnimation) {
            this.playFromBegining();
        }
    }
}