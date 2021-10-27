import { Basic } from './basic.js';

/**
 * Loop animation when mouse is on icon.
 */
export class LoopOnHover extends Basic {
    playDelay: any = null;
    active = false;

    connectedCallback() {
        super.connectedCallback();
    
        this.addTargetEventListener('mouseenter', () => {
            this.active = true;

            if (!this.inAnimation) {
                this.playFromBegining();
            }
        });

        this.addTargetEventListener('mouseleave', () => {
            this.active = false;
        });
    }

    disconnectedCallback() {
        this.resetPlayDelayTimer();

        super.disconnectedCallback();
    }

    complete() {
        this.resetPlayDelayTimer();

        if (!this.active || !this.connected) {
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
        const value = this.element.hasAttribute('delay') ? +(this.element.getAttribute('delay') || 0) : 0; 
        return Math.max(value, 0);
    }
}