import { Trigger } from '../trigger.js';

/**
 * Enter animation on icon hover.
 */
export class Hover extends Trigger {
    onConnected() {
        this.addTargetEventListener('mouseenter', () => {
            if (!this.inAnimation) {
                this.playFromBegining();
            }
        });
    }
}