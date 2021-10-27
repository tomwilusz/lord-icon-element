import { defineLordIconElement, LordIconElement, BasicTrigger } from '/build/lord-icon-element.js';

const CLICK_EVENTS = [
    'mousedown',
    { name: 'touchstart', options: { passive: true } },
];

class Custom extends BasicTrigger {
    constructor(element, targetElement, lottie) {
        super(element, targetElement, lottie);

        this.direction = this.reverse ? -1 : 1;
        this.setDirection(this.direction);
    }

    connectedCallback() {
        super.connectedCallback();

        for (const event of CLICK_EVENTS) {
            this.addTargetEventListener(event, () => {
                if (!this.inAnimation) {
                    this.play();
                }
                console.log('goo!');
            });
        }
    }

    disconnectedCallback() {
        this.setDirection(1);

        super.disconnectedCallback();
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

LordIconElement.registerTrigger('custom', Custom);

defineLordIconElement(lottie.loadAnimation);
