import { IPlayer, ITrigger } from '../interfaces.js';

/**
 * Hover trigger plays the animation from the first to last frame when the cursor hovers over the icon bounding box.
 */
export class Hover implements ITrigger {
    constructor(
        protected player: IPlayer,
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
    ) {
        this.onHover = this.onHover.bind(this);
    }

    onConnected() {
        this.targetElement.addEventListener('mouseenter', this.onHover);
    }

    onDisconnected() {
        this.targetElement.removeEventListener('mouseenter', this.onHover);
    }

    onHover() {
        if (this.player.isPlaying) {
            return;
        }

        this.player.playFromBeginning();
    }
}