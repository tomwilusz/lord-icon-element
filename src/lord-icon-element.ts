import { Element } from "./main/element.js";
import { Basic } from "./animations/basic.js";
import { Click } from "./animations/click.js";
import { Hover } from "./animations/hover.js";
import { Morph } from "./animations/morph.js";
import { MorphTwoWay } from "./animations/morph-two-way.js";
import { Loop } from "./animations/loop.js";
import { Auto } from "./animations/auto.js";
import { LottieLoader } from "./interfaces.js";

export * from "./helpers/colors.js";
export * from "./helpers/lottie.js";

export const LordIconElement = Element;

export const BasicAnimation = Basic;
export const ClickAnimation = Click;
export const HoverAnimation = Hover;
export const AutoAnimation = Auto;
export const LoopAnimation = Loop;
export const MorphAnimation = Morph;
export const MorphTwoWayAnimation = MorphTwoWay;

/**
 * Defines custom element "lord-icon". This methods also register all animations supported by this library.
 * @param loader Animation loader. Provide Lottie.loadAnimation here.
 */
export function defineLordIconElement(loader: LottieLoader) {
  Element.registerLoader(loader);

  Element.registerAnimation("hover", Hover);
  Element.registerAnimation("click", Click);
  Element.registerAnimation("morph", Morph);
  Element.registerAnimation("loop", Loop);
  Element.registerAnimation("auto", Auto);
  Element.registerAnimation("morph-two-way", MorphTwoWay);

  customElements.define("lord-icon", Element);
}
