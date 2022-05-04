import { Basic } from './basic.js';

/**
 * Morph animation from point A to B and then from B to A after mouse enter.
 */
export class Boomerang extends Basic {
    connectedCallback() {
        super.connectedCallback();

        this.addTargetEventListener('mouseenter', () => {
            this.setDirection(1);
            this.play();
        });
    }

    disconnectedCallback() {
        this.setDirection(1);

        super.disconnectedCallback();
    }

    complete() {
        this.setDirection(-1);
        this.play();
    }
}