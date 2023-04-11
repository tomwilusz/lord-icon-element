import { IPlayer, ITrigger } from '../interfaces.js';

/**
 * LoopOnHover trigger plays the animation from first to last frame infinitely, when the cursor hovers over the icon.
 */
export class LoopOnHover implements ITrigger {
    playTimeout: any = null;
    mouseIn: boolean = false;

    constructor(
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
        protected player: IPlayer,
    ) {
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    onConnected() {
        this.targetElement.addEventListener('mouseenter', this.onMouseEnter);
        this.targetElement.addEventListener('mouseleave', this.onMouseLeave);
    }

    onDisconnected() {
        this.targetElement.removeEventListener('mouseenter', this.onMouseEnter);
        this.targetElement.removeEventListener('mouseleave', this.onMouseLeave);

        this.resetPlayDelayTimer();
    }

    onMouseEnter() {
        this.mouseIn = true;

        if (!this.player.isPlaying) {
            this.play();
        }
    }

    onMouseLeave() {
        this.mouseIn = false;

        this.resetPlayDelayTimer();
    }

    onComplete() {
        this.play();
    }

    play() {
        this.resetPlayDelayTimer();

        if (!this.mouseIn) {
            return;
        }

        if (this.delay > 0) {
            this.playTimeout = setTimeout(() => {
                this.player.playFromBeginning();
            }, this.delay)
        } else {
            this.player.playFromBeginning();
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