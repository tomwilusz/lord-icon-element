import { Basic } from './basic.js';

/**
 * Loop animation when mouse is on icon.
 */
export class Loop extends Basic {
    connectedCallback() {
        this.target.addEventListener('mouseenter', this.enterBound);
        this.target.addEventListener('mouseleave', this.leaveBound);
    }

    disconnectedCallback() {
        this.target.removeEventListener('mouseenter', this.enterBound);
        this.target.removeEventListener('mouseleave', this.leaveBound);

        this.setDirection(1);
    }

    enter() {
        this.setLoop(true);
        this.play();
    }

    leave() {
        this.setLoop(false);
    }
}