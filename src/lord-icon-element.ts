import { Element } from "./main/element.js";
import { Base } from "./triggers/base.js";
import { Click } from "./triggers/click.js";
import { Hover } from "./triggers/hover.js";
import { Morph } from "./triggers/morph.js";
import { MorphTwoWay } from "./triggers/morph-two-way.js";
import { LoopOnHover } from "./triggers/loop-on-hover.js";
import { Loop } from "./triggers/loop.js";
import { LottieLoader } from "./interfaces.js";

export * from "./helpers/lottie.js";

export const LordIconElement = Element;

export const BaseTrigger = Base;
export const ClickTrigger = Click;
export const HoverTrigger = Hover;
export const LoopTrigger = Loop;
export const LoopOnHoverTrigger = LoopOnHover;
export const MorphTrigger = Morph;
export const MorphTwoWayTrigger = MorphTwoWay;

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

  if (!customElements.get || !customElements.get('lord-icon')) {
    customElements.define("lord-icon", Element);
  }
}