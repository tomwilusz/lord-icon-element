import { IPlayer, ITrigger } from '../interfaces.js';

const CLICK_EVENTS = [
    { name: 'mousedown' },
    { name: 'touchstart', options: { passive: true } },
];

/**
 * Enter animation after icon click.
 */
export class Click implements ITrigger {
    constructor(
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
        protected player: IPlayer,
    ) {
        this.onClick = this.onClick.bind(this);
    }

    onConnected() {
        for (const event of CLICK_EVENTS) {
            this.targetElement.addEventListener(event.name, this.onClick, event.options)
        }
    }

    onDisconnected() {
        for (const event of CLICK_EVENTS) {
            this.targetElement.removeEventListener(event.name, this.onClick)
        }
    }

    onClick() {
        if (this.player.inAnimation) {
            return;
        }

        this.player.playFromBegining();
    }
}
