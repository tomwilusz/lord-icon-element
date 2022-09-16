import { defineLordIconElement, Element } from '/dist/index.js';
import { Basic as BasicTrigger } from '/dist/triggers/basic.js';

const CLICK_EVENTS = [
    'mousedown',
    { name: 'touchstart', options: { passive: true } },
];

class Custom extends BasicTrigger {
    constructor(element, lottie) {
        super(element, lottie);

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
            });
        }
    }

    disconnectedCallback() {
        this.setDirection(1);

        super.disconnectedCallback();
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

Element.registerTrigger('custom', Custom);

defineLordIconElement(lottie.loadAnimation);
