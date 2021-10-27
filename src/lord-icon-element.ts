import { Element } from "./main/element.js";
import { Click } from "./triggers/click.js";
import { Hover } from "./triggers/hover.js";
import { Morph } from "./triggers/morph.js";
import { MorphTwoWay } from "./triggers/morph-two-way.js";
import { LoopOnHover } from "./triggers/loop-on-hover.js";
import { Loop } from "./triggers/loop.js";
import { State } from "./triggers/state.js";
import { LottieLoader } from "./interfaces.js";

export * from "./helpers/lottie.js";
export * from "./triggers/index.js";

export const LordIconElement = Element;

/**
 * Defines custom element `lord-icon` with premade triggers.
 * @param loader LottieLoader from `lottie-web` package
 */
export function defineLordIconElement(loader: LottieLoader) {
  Element.registerLoader(loader);

  Element.registerTrigger("click", Click);
  Element.registerTrigger("hover", Hover);
  Element.registerTrigger("loop", Loop);
  Element.registerTrigger("loop-on-hover", LoopOnHover);
  Element.registerTrigger("morph", Morph);
  Element.registerTrigger("morph-two-way", MorphTwoWay);
  Element.registerTrigger("state", State);

  if (!customElements.get || !customElements.get('lord-icon')) {
    customElements.define("lord-icon", Element);
  }
}