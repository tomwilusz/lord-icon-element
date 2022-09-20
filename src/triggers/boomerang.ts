import { Trigger } from '../trigger.js';

/**
 * Morph animation from point A to B and then from B to A after mouse enter.
 * @category Trigger
 */
export class Boomerang extends Trigger {
    onConnected() {
        this.addTargetEventListener('mouseenter', () => {
            this.setDirection(1);
            this.play();
        });
    }

    onDisconnected() {
        this.setDirection(1);
    }

    onComplete() {
        this.setDirection(-1);
        this.play();
    }
}