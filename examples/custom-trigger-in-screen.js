import { Element } from '/dist/element.js';
import { defineElement } from '/dist/index.js';

class InScreen {
    player;
    element;
    targetElement;
    observer;

    constructor(player, element, targetElement) {
        this.player = player;
        this.element = element;
        this.targetElement = targetElement;

        const intersectionCallback = (entries, observer) => {
            entries.forEach((entry) => {
                if (!this.player.isPlaying) {
                    this.player.playFromBeginning();
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