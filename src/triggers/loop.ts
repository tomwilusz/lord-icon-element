import { IPlayer, ITrigger } from '../interfaces.js';

/**
 * Loop trigger plays the animation from first to last frame infinitely, with no interaction necessary.
 */
export class Loop implements ITrigger {
    private playTimeout: any = null;

    constructor(
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
        protected player: IPlayer,
    ) {
    }

    onReady() {
        this.play();
    }

    onComplete() {
        this.play();
    }

    onDisconnected() {
        this.resetPlayDelayTimer();
    }

    play() {
        this.resetPlayDelayTimer();

        if (this.delay > 0) {
            this.playTimeout = setTimeout(() => {
                this.player.playFromBegining();
            }, this.delay)
        } else {
            this.player.playFromBegining();
        }
    }

    resetPlayDelayTimer() {
        if (!this.playTimeout) {
            return;
        }

        clearTimeout(this.playTimeout);
        this.playTimeout = null;
    }

    get delay() {
        const value = this.element.hasAttribute('delay') ? +(this.element.getAttribute('delay') || 0) : 0;
        return Math.max(value, 0);
    }
}