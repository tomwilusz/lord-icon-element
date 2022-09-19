import { Trigger } from '../trigger.js';

/**
 * Loop animation when mouse is on icon.
 */
export class LoopOnHover extends Trigger {
    playDelay: any = null;
    active = false;

    onConnected() {
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

    onDisconnected() {
        this.resetPlayDelayTimer();
    }

    onComplete() {
        this.resetPlayDelayTimer();

        if (!this.active || !this.isConnected) {
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