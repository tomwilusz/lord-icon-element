import { Basic, ITargetEvent } from './basic.js';

const CLICK_EVENTS: Array<string | ITargetEvent> = [
    'mousedown',
    { name: 'touchstart', options: { passive: true } },
];

/**
 * Enter animation after icon click.
 */
export class Click extends Basic {
    connectedCallback() {
        super.connectedCallback();

        for (const event of CLICK_EVENTS) {
            this.addTargetEventListener(event, () => {
                if (!this.inAnimation) {
                    this.playFromBegining();
                }
            });
        }
    }
}
