import { Base } from './base.js';

/**
 * Morph animation from point A to B after mouse enter and from B to A after mouse leave.
 */
export class Morph extends Base {
    connectedCallback() {
        super.connectedCallback();

        this.target.addEventListener('mouseenter', this.enterBound);
        this.target.addEventListener('mouseleave', this.leaveBound);
    }

    disconnectedCallback() {
        this.target.removeEventListener('mouseenter', this.enterBound);
        this.target.removeEventListener('mouseleave', this.leaveBound);

        this.setDirection(1);

        super.disconnectedCallback();
    }

    enter() {
        this.setDirection(1);
        this.play();
    }

    leave() {
        this.setDirection(-1);
        this.play();
    }
}