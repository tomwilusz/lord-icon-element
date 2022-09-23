import { IPlayer, ITrigger } from '../interfaces.js';

/**
 * Morph animation from point A to B and then from B to A after mouse enter.
 */
export class Boomerang implements ITrigger {
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

        this.player.direction = 1;
    }

    onComplete() {
        this.player.direction = -1;
        this.player.play();
    }

    onHover() {
        this.player.direction = 1;
        this.player.play();
    }
}