import { Element } from '/dist/element.js';
import { Trigger } from '/dist/trigger.js';

const CLICK_EVENTS = [
    'mousedown',
    { name: 'touchstart', options: { passive: true } },
];

class Custom extends Trigger {
    constructor(element, lottie) {
        super(element, lottie);

        this.direction = this.reverse ? -1 : 1;
        this.setDirection(this.direction);
    }

    onConnected() {
        for (const event of CLICK_EVENTS) {
            this.addTargetEventListener(event, () => {
                if (!this.inAnimation) {
                    this.play();
                }
            });
        }
    }

    onDisconnected() {
        this.setDirection(1);
    }

    onReady() {
        if (this.reverse) {
            this.goToLastFrame();
        }
    }

    onComplete() {
        this.direction = -this.direction;
        this.setDirection(this.direction);
    }

    get reverse() {
        return this.element.hasAttribute('reverse');
    }
}

Element.registerTrigger('custom', Custom);
Element.setAnimationLoader(lottie.loadAnimation);

customElements.define("lord-icon", Element);
