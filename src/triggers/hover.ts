import { IPlayer, ITrigger } from '../interfaces.js';

/**
 * Enter animation on icon hover.
 */
export class Hover implements ITrigger {
    constructor(
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
        protected player: IPlayer,
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
        if (this.player.inAnimation) {
            return;
        }

        this.player.playFromBegining();
    }
}