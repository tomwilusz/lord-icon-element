import { Base } from './base.js';

/**
 * Animation with auto start and loop.
 */
export class Loop extends Base {
    playDelay: any = null;

    ready() {
        this.play();
    }

    disconnectedCallback() {
        this.resetPlayDelayTimer();

        super.disconnectedCallback();
    }

    complete() {
        this.resetPlayDelayTimer();

        if (!this.connected) {
            return;
        }

        if (this.delay > 0) {
            this.playDelay = setTimeout(() => {
                this.playFromBegining();
            }, this.delay)
        } else {
            this.playFromBegining();
        }
    }

    resetPlayDelayTimer() {
        if (!this.playDelay) {
            return;
        }

        clearTimeout(this.playDelay);
        this.playDelay = null;
    }

    get delay() {
        return this.element.hasAttribute('delay') ? +(this.element.getAttribute('delay') || 0) : 0;
    }
}