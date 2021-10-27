import { Basic } from './basic.js';

/**
 * Morph animation from point A to B after mouse enter and from B to A after mouse leave.
 */
export class Morph extends Basic {
    connectedCallback() {
        super.connectedCallback();

        this.addTargetEventListener('mouseenter', () => {
            this.setDirection(1);
            this.play();
        });

        this.addTargetEventListener('mouseleave', () => {
            this.setDirection(-1);
            this.play();
        });
    }

    disconnectedCallback() {
        this.setDirection(1);
        super.disconnectedCallback();
    }
}