import { Base } from './base.js';

/**
 * Loop animation when mouse is on icon.
 */
export class LoopOnHover extends Base {
    playDelay: any = null;
    active = false;

    connectedCallback() {
        super.connectedCallback();
    
        this.target.addEventListener('mouseenter', this.enterBound);
        this.target.addEventListener('mouseleave', this.leaveBound);
    }

    disconnectedCallback() {
        this.resetPlayDelayTimer();

        this.target.removeEventListener('mouseenter', this.enterBound);
        this.target.removeEventListener('mouseleave', this.leaveBound);

        this.setDirection(1);

        super.disconnectedCallback();
    }

    enter() {
        this.active = true;

        if (!this.inAnimation) {
            this.playFromBegining();
        }
    }

    leave() {
        this.active = false;
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
        return this.element.hasAttribute('delay') ? +(this.element.getAttribute('delay') || 0) : 0;
    }
}