import { Element } from '/dist/element.js';
import { Player } from '/dist/player.js';
import { Loop } from '/dist/triggers/loop.js';

Element.setPlayerLoader((container, iconData) => {
    return new Player(
        lottie.loadAnimation,
        container,
        iconData,
    );
});

Element.registerTrigger('loop', Loop);

customElements.define("lord-icon", Element);
