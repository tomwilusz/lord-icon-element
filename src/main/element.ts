import { LottiePlayer, AnimationConfig } from "lottie-web";
import { ITrigger } from "../interfaces.js";
import { allFields, replaceColors, replaceParams } from "../helpers/lottie.js";
import { deepClone } from "../helpers/utils.js";
import {
  loadIcon,
  loadLottieAnimation,
  registerIcon,
  registerLoader,
  registerTrigger,
  connectInstance,
  disconnectInstance,
  getIcon,
  getTrigger,
} from "./manager.js";

const ELEMENT_STYLE = `
    :host {
      display: inline-flex;
      width: 32px;
      height: 32px;
      align-items: center;
      justify-content: center;
      position: relative;
      vertical-align: middle;
      fill: currentcolor;
      stroke: none;
      overflow: hidden;
    }

    :host(.inherit-color) svg path[fill] {
      fill: currentColor;
    }

    :host(.inherit-color) svg path[stroke] {
      stroke: currentColor;
    }

    svg {
        pointer-events: none;
        display: block;
    }

    div {    
        width: 100%;
        height: 100%;
    }

    div.slot {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
    }
`;

const OBSERVED_ATTRIBUTES = [
  "colors",
  "src",
  "icon",
  "trigger",
  "speed",
  "target",
  "stroke",
  "scale",
  "axis-x",
  "axis-y",
];

type SUPPORTED_ATTRIBUTES =
  | "colors"
  | "stroke"
  | "scale"
  | "axis-x"
  | "axis-y"
  | "src"
  | "icon"
  | "trigger"
  | "speed"
  | "target";

export class Element extends HTMLElement {
  protected isReady: boolean = false;
  protected root: ShadowRoot;
  protected lottie?: LottiePlayer;
  protected myConnectedTrigger?: ITrigger;
  protected icon?: string;
  protected src?: string;
  protected colors?: string;
  protected trigger?: string;
  protected speed?: string;
  protected stroke?: string;
  protected scale?: string;
  protected ["axis-x"]?: string;
  protected ["axis-y"]?: string;
  protected target?: string;

  /**
   * Register Lottie library.
   * @param loader Provide "loadAnimation" here from Lottie.
   */
  static registerLoader(loader: (params: AnimationConfig) => LottiePlayer) {
    registerLoader(loader);
  }

  /**
   * Register supported icon.
   * @param name
   * @param data
   */
  static registerIcon(name: string, data: any) {
    registerIcon(name, data);
  }

  /**
   * Register supported animation.
   * @param name
   * @param triggerClass
   */
  static registerTrigger(name: string, triggerClass: any) {
    registerTrigger(name, triggerClass);
  }

  constructor() {
    super();

    this.root = this.attachShadow({ mode: "open" });
  }

  /**
   * Element connected.
   */
  protected connectedCallback() {
    connectInstance(this);

    if (!this.isReady) {
      this.init();
    }
  }

  /**
   * Element disconnected.
   */
  protected disconnectedCallback() {
    this.unregisterLottie();

    disconnectInstance(this);
  }

  protected attributeChangedCallback(
    name: SUPPORTED_ATTRIBUTES,
    oldValue: any,
    newValue: any
  ) {
    this[name] = newValue;

    if (name === 'axis-x') {
      this.axisXChanged();
    } else if (name === 'axis-y') {
      this.axisYChanged();
    } else {
      const method = (this as any)[`${name}Changed`];
      if (method) {
        method.call(this);
      }
    }
  }

  protected init() {
    if (this.isReady) {
      return;
    }

    this.isReady = true;

    const style = document.createElement("style");
    style.innerHTML = ELEMENT_STYLE;
    this.root.appendChild(style);

    const slotContainer = document.createElement("div");
    slotContainer.innerHTML = "<slot></slot>";
    slotContainer.classList.add("slot");
    this.root.appendChild(slotContainer);

    const container = document.createElement("div");
    this.root.appendChild(container);

    this.registerLottie();
  }

  protected registerLottie() {
    let iconData = this.iconData;
    if (!iconData) {
      return;
    }

    if (this.colors || this.stroke || this.scale || this['axis-x'] || this['axis-y']) {
      const fields = allFields(iconData);
      
      iconData = deepClone(iconData);

      if (this.colors) {
        replaceColors(iconData, fields, this.colors);
      }
      if (this.stroke) {
        replaceParams(iconData, fields, 'stroke', this.stroke);
      }
      if (this.scale) {
        replaceParams(iconData, fields, 'scale', this.scale);
      }
      if (this['axis-x']) {
        replaceParams(iconData, fields, 'axis', this['axis-x'], '0');
      }
      if (this['axis-y']) {
        replaceParams(iconData, fields, 'axis', this['axis-y'], '1');
      }
    }

    this.lottie = loadLottieAnimation({
      container: this.container,
      renderer: "svg",
      loop: false,
      autoplay: false,
      preserveAspectRatio: "xMidYMid meet",
      progressiveLoad: true,
      hideOnTransparent: false,
      animationData: iconData,
    });

    // set speed
    this.lottie.setSpeed(this.animationSpeed);

    // dispatch animation-complete
    this.lottie.addEventListener("complete", () => {
      this.dispatchEvent(new CustomEvent("animation-complete"));
    });

    this.triggerChanged();
  }

  protected unregisterLottie() {
    if (this.myConnectedTrigger) {
      this.myConnectedTrigger.disconnectedCallback();
      this.myConnectedTrigger = undefined;
    }

    if (this.lottie) {
      this.lottie.destroy();
      this.lottie = undefined;

      this.container!.innerHTML = "";
    }
  }

  protected notify(name: string, from: "icon" | "trigger") {
    if (this[from] !== name) {
      return;
    }

    if (from === "icon") {
      if (this.lottie) {
        this.unregisterLottie();
      }
      this.registerLottie();
    } else if (from === "trigger" && !this.myConnectedTrigger) {
      this.triggerChanged();
    }
  }

  protected triggerChanged() {
    if (this.myConnectedTrigger) {
      this.myConnectedTrigger.disconnectedCallback();
      this.myConnectedTrigger = undefined;
    }

    if (this.trigger && this.lottie) {
      const TriggerClass = getTrigger(this.trigger);
      if (TriggerClass) {
        // find target event listener
        const target = this.target ? this.closest(this.target) : null;

        this.myConnectedTrigger = new TriggerClass(
          this,
          target || this,
          this.lottie
        );
        this.myConnectedTrigger!.connectedCallback();
      }
    }
  }

  protected colorsChanged() {
    if (!this.isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  protected strokeChanged() {
    if (!this.isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  protected scaleChanged() {
    if (!this.isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  protected axisXChanged() {
    if (!this.isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  protected axisYChanged() {
    if (!this.isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  protected speedChanged() {
    if (this.lottie) {
      this.lottie.setSpeed(this.animationSpeed);
    }
  }

  protected iconChanged() {
    if (!this.isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  protected async srcChanged() {
    if (this.src) {
      await loadIcon(this.src);
    }

    if (!this.isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  /**
   * Acces icon data for this element.
   */
  get iconData(): any {
    if (this.icon && typeof this.icon === "object") {
      return this.icon;
    }
    return getIcon(this.icon! || this.src!);
  }

  /**
   * Access current trigger instance.
   */
  get connectedTrigger() {
    return this.myConnectedTrigger;
  }

  protected get container(): HTMLElement | undefined {
    return this.root.lastElementChild as any;
  }

  protected get animationSpeed(): number {
    return this.speed ? parseFloat(this.speed) || 1 : 1;
  }

  protected static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }
}
