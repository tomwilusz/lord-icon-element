import { Element } from "./main/element.js";
import { Basic } from "./triggers/basic.js";
import { Click } from "./triggers/click.js";
import { Hover } from "./triggers/hover.js";
import { Morph } from "./triggers/morph.js";
import { LoopOnHover } from "./triggers/loop-on-hover.js";
import { Loop } from "./triggers/loop.js";
import { Boomerang } from "./triggers/boomerang.js";
import { LottieAnimationLoader } from "./interfaces.js";

export * from "./helpers/lottie.js";
export * from "./triggers/index.js";

export const LordIconElement = Element;

/**
 * Defines custom element `lord-icon` with premade triggers.
 * @param loader LottieAnimationLoader from `lottie-web` package
 */
export function defineLordIconElement(loader: LottieAnimationLoader) {
  Element.registerAnimationLoader(loader);

  Element.registerTrigger("basic", Basic);
  Element.registerTrigger("click", Click);
  Element.registerTrigger("hover", Hover);
  Element.registerTrigger("loop", Loop);
  Element.registerTrigger("loop-on-hover", LoopOnHover);
  Element.registerTrigger("morph", Morph);
  Element.registerTrigger("boomerang", Boomerang);

  if (!customElements.get || !customElements.get('lord-icon')) {
    customElements.define("lord-icon", Element);
  }
}