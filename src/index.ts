import { Element } from './element.js';
import { AnimationLoader, Player } from './player.js';
import { Boomerang } from './triggers/boomerang.js';
import { Click } from './triggers/click.js';
import { Hover } from './triggers/hover.js';
import { LoopOnHover } from './triggers/loop-on-hover.js';
import { Loop } from './triggers/loop.js';
import { Morph } from './triggers/morph.js';

/**
 * Defines `lord-icon` custom element with premade triggers and {@link interfaces.PlayerFactory | player factory}.
 * 
 * This method defines the following triggers:
 * - {@link triggers/click.Click | click}
 * - {@link triggers/hover.Hover | hover}
 * - {@link triggers/loop.Loop | loop}
 * - {@link triggers/loop-on-hover.LoopOnHover | loop-on-hover}
 * - {@link triggers/morph.Morph | morph}
 * - {@link triggers/boomerang.Boomerang | boomerang}
 *
 * Example of tag definition with default setup:
 * ```js
 * import lottie from 'lottie-web';
 * import { defineElement } from 'lord-icon-element';
 * 
 * defineElement(lottie.loadAnimation);
 * ```
 * 
 * And basic usage from markup which is possible after tag defining:
 * ```html
 * <lord-icon trigger="hover" src="/icons/confetti.json"></lord-icon>
 * ```
 * 
 * @param animationLoader Use `loadAnimation` from `lottie-web` package.
 */
export function defineElement(animationLoader: AnimationLoader) {
  Element.setPlayerFactory((container: HTMLElement, iconData: any) => {
    return new Player(
      animationLoader,
      container,
      iconData,
    );
  });

  Element.defineTrigger('click', Click);
  Element.defineTrigger('hover', Hover);
  Element.defineTrigger('loop', Loop);
  Element.defineTrigger('loop-on-hover', LoopOnHover);
  Element.defineTrigger('morph', Morph);
  Element.defineTrigger('boomerang', Boomerang);

  if (!customElements.get || !customElements.get('lord-icon')) {
    customElements.define('lord-icon', Element);
  }
}