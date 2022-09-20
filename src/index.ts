import { Element } from "./element.js";
import { AnimationLoader } from "./interfaces.js";
import { Boomerang } from "./triggers/boomerang.js";
import { Click } from "./triggers/click.js";
import { Hover } from "./triggers/hover.js";
import { LoopOnHover } from "./triggers/loop-on-hover.js";
import { Loop } from "./triggers/loop.js";
import { Morph } from "./triggers/morph.js";

/**
 * Defines custom element `lord-icon` with premade triggers.
 * @param loader AnimationLoader from `lottie-web` package
 */
export function defineLordIconElement(loader: AnimationLoader) {
  Element.setAnimationLoader(loader);

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