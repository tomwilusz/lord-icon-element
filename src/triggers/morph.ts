import { Trigger } from '../trigger.js';

/**
 * Morph animation from point A to B after mouse enter and from B to A after mouse leave.
 */
export class Morph extends Trigger {
    onConnected() {
        this.addTargetEventListener('mouseenter', () => {
            this.setDirection(1);
            this.play();
        });

        this.addTargetEventListener('mouseleave', () => {
            this.setDirection(-1);
            this.play();
        });
    }

    onDisconnected() {
        this.setDirection(1);
    }
}