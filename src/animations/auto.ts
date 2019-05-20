import { Basic } from './basic.js';

/**
 * Animation with auto start and loop.
 */
export class Auto extends Basic {
    ready() {
        this.setLoop(true);
        this.play();
    }

    disconnectedCallback() {
        this.setLoop(false);
    }
}