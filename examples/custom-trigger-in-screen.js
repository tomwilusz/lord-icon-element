import { Element } from '/dist/element.js';
import { defineElement } from '/dist/index.js';

class InScreen {
    element;
    targetElement;
    player;
    observer;

    constructor(element, targetElement, player) {
        this.element = element;
        this.targetElement = targetElement;
        this.player = player;

        const intersectionCallback = (entries, observer) => {
            entries.forEach((entry) => {
                if (!this.player.isPlaying) {
                    this.player.playFromBegining();
                }
            });
        };

        this.observer = new IntersectionObserver(intersectionCallback, {
            threshold: 0.75,
        });
    }

    onReady() {
        this.observer.observe(this.targetElement);
    }

    onDisconnected() {
        this.observer.disconnect();
    }
}

Element.defineTrigger('in-screen', InScreen);

defineElement(lottie.loadAnimation);