import { Trigger } from '../trigger.js';

const CLICK_EVENTS = [
    'mousedown',
    { name: 'touchstart', options: { passive: true } },
];

/**
 * Enter animation after icon click.
 */
export class Click extends Trigger {
    onConnected() {
        for (const event of CLICK_EVENTS) {
            this.addTargetEventListener(event, () => {
                if (!this.inAnimation) {
                    this.playFromBegining();
                }
            });
        }
    }
}
