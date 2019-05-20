import { defineLordIconElement, LordIconElement, BasicAnimation } from '../build/lord-icon-element.js';

const CLICK_EVENTS = [ 'mousedown', 'touchstart' ];

class Custom extends BasicAnimation {
    constructor(element, lottie) {
        super(element, lottie);

        this.direction = this.reverse ? -1 : 1;
        this.setDirection(this.direction);
    }

    connectedCallback() {
        for (const event of CLICK_EVENTS) {
            const options = event === 'touchstart' ? { passive: true } : undefined;
            this.element.addEventListener(event, this.enterBound, options);
        }
    }

    disconnectedCallback() {
        for (const event of CLICK_EVENTS) {
            this.element.removeEventListener(event, this.enterBound);
        }

        this.setDirection(1);
    }

    enter() {
        if (!this.inAnimation) {
            this.play();
        }
    }

    ready() {
        if (this.reverse) {
            this.goToLastFrame();
        }
    }

    complete() {
        this.direction = -this.direction;
        this.setDirection(this.direction);
    }

    get reverse() {
        return this.element.hasAttribute('reverse');
    }
}

LordIconElement.registerAnimation('custom', Custom);

// register element
defineLordIconElement(lottie.loadAnimation);
