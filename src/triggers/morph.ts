import { IPlayer, ITrigger } from '../interfaces.js';

/**
 * Morph animation from point A to B after mouse enter and from B to A after mouse leave.
 */
export class Morph implements ITrigger {
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

        this.player.direction = 1;
    }

    onMouseEnter() {
        this.player.direction = 1;
        this.player.play();
    }

    onMouseLeave() {
        this.player.direction = -1;
        this.player.play();
    }
}