import { Basic } from './basic.js';

/**
 * Trigger for multistate icon.
 */
export class State extends Basic {
    ready() {
        this.play();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    complete() {
        console.log('state');
        this.playFromBegining();
    }

    // get delay() {
    //     const value = this.element.hasAttribute('delay') ? +(this.element.getAttribute('delay') || 0) : 0;
    //     return Math.max(value, 0);
    // }
}