import {
  AnimationItem
} from "lottie-web";

import {
  LottieAnimationLoader,
  IElement,
  ILottieProperty,
  ITrigger,
  ITriggerConstructor,
} from "../interfaces.js";

import {
  allProperties,
  resetProperty,
  updateProperty,
  replaceProperty,
  resetColors,
  updateColors,
} from "../helpers/lottie.js";

import {
  isObjectLike,
} from "../helpers/utils.js";

import {
  loadIcon,
  loadLottieAnimation,
  registerIcon,
  registerAnimationLoader,
  registerTrigger,
  connectInstance,
  disconnectInstance,
  getIcon,
  getTrigger,
} from "./manager.js";

/**
 * Loads lottie dom elements when needed.
 */
const PROGRESSIVE_LOAD = false;

/**
 * Prefix for icon states.
 */
const STATE_PREFIX = 'State-';

/**
 * Use constructable stylesheets if supported (https://developers.google.com/web/updates/2019/02/constructable-stylesheets)
 */
const SUPPORTS_ADOPTING_STYLE_SHEETS = "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;

/**
 * Style for this element.
 */
const ELEMENT_STYLE = `
    :host {
      display: inline-flex;
      width: 32px;
      height: 32px;
      align-items: center;
      justify-content: center;
      position: relative;
      vertical-align: middle;
      overflow: hidden;
    }

    :not(.inherit-color) svg .primary path[fill] {
      fill: var(--lord-icon-primary, black);
    }

    :not(.inherit-color) svg .primary path[stroke] {
      stroke: var(--lord-icon-primary, black);
    }

    :not(.inherit-color) svg .secondary path[fill] {
      fill: var(--lord-icon-secondary, black);
    }

    :not(.inherit-color) svg .secondary path[stroke] {
      stroke: var(--lord-icon-secondary, black);
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

/**
 * Current style sheet.
 */
let styleSheet: CSSStyleSheet;

/**
 * Observed attributes for this custom element.
 */
const OBSERVED_ATTRIBUTES = [
  "colors",
  "src",
  "icon",
  "state",
  "trigger",
  "speed",
  "stroke",
  "scale",
  "axis-x",
  "axis-y",
];

type SUPPORTED_ATTRIBUTES = |
  "colors" |
  "src" |
  "icon" |
  "state" |
  "trigger" |
  "speed" |
  "stroke" |
  "scale" |
  "axis-x" |
  "axis-y";

export class Element extends HTMLElement implements IElement {
  #root: ShadowRoot;
  #isReady: boolean = false;
  #lottie?: AnimationItem;
  #properties?: ILottieProperty[];
  #connectedTrigger?: ITrigger;
  #storedIconData?: any;

  /**
   * Register Lottie library.
   * @param animationLoader Provide "loadAnimation" here from Lottie.
   */
  static registerAnimationLoader(animationLoader: LottieAnimationLoader) {
    registerAnimationLoader(animationLoader);
  }

  /**
   * Register supported icon. This is helpful with any kind of preload icons.
   * @param name Icon name.
   * @param iconData Icon data.
   */
  static registerIcon(name: string, iconData: any) {
    registerIcon(name, iconData);
  }

  /**
   * Register supported animation.
   * @param name
   * @param triggerClass
   */
  static registerTrigger(name: string, triggerClass: ITriggerConstructor) {
    registerTrigger(name, triggerClass);
  }

  /**
   * Custom element observed attributes.
   */
  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }

  constructor() {
    super();

    // create shadow root for this element
    this.#root = this.attachShadow({
      mode: "open"
    });
  }

  /**
   * Element connected.
   */
  protected connectedCallback() {
    connectInstance(this);

    // execute init only once after connected
    if (!this.#isReady) {
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

  /**
   * Handle attribute update.
   * @param name
   * @param oldValue
   * @param newValue
   */
  protected attributeChangedCallback(
    name: SUPPORTED_ATTRIBUTES,
    oldValue: any,
    newValue: any
  ) {
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

  /**
   * Init element.
   * @returns
   */
  protected init() {
    if (this.#isReady) {
      return;
    }

    this.#isReady = true;

    if (SUPPORTS_ADOPTING_STYLE_SHEETS) {
      if (!styleSheet) {
        styleSheet = new CSSStyleSheet();
        (styleSheet as any).replaceSync(ELEMENT_STYLE);
      }

      (this.#root as any).adoptedStyleSheets = [ styleSheet ];
    } else {
      const style = document.createElement("style");
      style.innerHTML = ELEMENT_STYLE;
      this.#root.appendChild(style);
    }

    const slotContainer = document.createElement("div");
    slotContainer.innerHTML = "<slot></slot>";
    slotContainer.classList.add("slot");
    this.#root.appendChild(slotContainer);

    const container = document.createElement("div");
    this.#root.appendChild(container);

    this.registerLottie();
  }

  protected registerLottie() {
    let iconData = this.#iconData;
    if (!iconData) {
      return;
    }

    this.#lottie = loadLottieAnimation({
      container: this.#container as Element,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData: iconData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: PROGRESSIVE_LOAD,
        hideOnTransparent: true,
      },
    });

    if (this.state || this.colors || this.stroke || this.scale || this.axisX || this.axisY) {
      const properties = this.properties;

      if (properties) {
        if (this.colors) {
          updateColors(this.#lottie, properties, this.colors);
        }
        if (this.state) {
          for (const state of this.states) {
            replaceProperty(this.#lottie, properties, STATE_PREFIX + state, 0);
          }
          replaceProperty(this.#lottie, properties, STATE_PREFIX + this.state, 1);
        }
        if (this.stroke) {
          updateProperty(this.#lottie, properties, 'stroke', this.stroke);
        }
        if (this.scale) {
          updateProperty(this.#lottie, properties, 'scale', this.scale);
        }
        if (this.axisX) {
          updateProperty(this.#lottie, properties, 'axis', this.axisX, '0');
        }
        if (this.axisY) {
          updateProperty(this.#lottie, properties, 'axis', this.axisY, '1');
        }

        this.#lottie!.renderer.renderFrame(null);
      }
    }

    // set speed
    this.#lottie.setSpeed(this.#animationSpeed);

    // dispatch animation-complete
    this.#lottie.addEventListener("complete", () => {
      this.dispatchEvent(new CustomEvent("animation-complete"));
    });

    this.triggerChanged();

    this.dispatchEvent(new CustomEvent("icon-ready"));
  }

  protected unregisterLottie() {
    this.#properties = undefined;

    if (this.#connectedTrigger) {
      this.#connectedTrigger.disconnectedCallback();
      this.#connectedTrigger = undefined;
    }

    if (this.#lottie) {
      this.#lottie.destroy();
      this.#lottie = undefined;

      this.#container!.innerHTML = "";
    }
  }

  protected notify(name: string, from: "icon" | "trigger") {
    if (this[from] !== name) {
      return;
    }

    if (from === "icon") {
      if (this.#lottie) {
        this.unregisterLottie();
      }
      this.registerLottie();
    } else if (from === "trigger" && !this.#connectedTrigger) {
      this.triggerChanged();
    }
  }

  protected triggerChanged() {
    if (this.#connectedTrigger) {
      this.#connectedTrigger.disconnectedCallback();
      this.#connectedTrigger = undefined;
    }

    if (this.trigger && this.#lottie) {
      const TriggerClass = getTrigger(this.trigger);
      if (TriggerClass) {
        this.#connectedTrigger = new TriggerClass(this, this.#lottie);
        this.#connectedTrigger!.connectedCallback();
      }
    }
  }

  protected colorsChanged() {
    if (!this.#isReady || !this.properties) {
      return;
    }

    if (this.colors) {
      updateColors(this.#lottie, this.properties, this.colors);
    } else {
      resetColors(this.#lottie, this.properties);
    }

    this.#lottie!.renderer.renderFrame(null);
  }

  protected strokeChanged() {
    if (!this.#isReady || !this.properties) {
      return;
    }

    if (this.stroke) {
      updateProperty(this.#lottie, this.properties, 'stroke', this.stroke);
    } else {
      resetProperty(this.#lottie, this.properties, 'stroke');
    }

    this.#lottie!.renderer.renderFrame(null);
  }

  protected stateChanged() {
    if (!this.#isReady || !this.properties) {
      return;
    }

    if (this.state) {
      for (const state of this.states) {
        replaceProperty(this.#lottie, this.properties, STATE_PREFIX + state, 0);
      }
      replaceProperty(this.#lottie, this.properties, STATE_PREFIX + this.state, 1);
    } else {
      for (const state of this.states) {
        resetProperty(this.#lottie, this.properties, STATE_PREFIX + state);
      }
    }

    this.#lottie!.renderer.renderFrame(null);
  }

  protected scaleChanged() {
    if (!this.#isReady || !this.properties) {
      return;
    }

    if (this.scale) {
      updateProperty(this.#lottie, this.properties, 'scale', this.scale);
    } else {
      resetProperty(this.#lottie, this.properties, 'scale');
    }

    this.#lottie!.renderer.renderFrame(null);
  }

  protected axisXChanged() {
    if (!this.#isReady || !this.properties) {
      return;
    }

    if (this.axisX) {
      updateProperty(this.#lottie, this.properties, 'axis', this.axisX, '0');
    } else {
      resetProperty(this.#lottie, this.properties, 'axis', '0');
    }

    this.#lottie!.renderer.renderFrame(null);
  }

  protected axisYChanged() {
    if (!this.#isReady || !this.properties) {
      return;
    }

    if (this.axisY) {
      updateProperty(this.#lottie, this.properties, 'axis', this.axisY, '0');
    } else {
      resetProperty(this.#lottie, this.properties, 'axis', '0');
    }

    this.#lottie!.renderer.renderFrame(null);
  }

  protected speedChanged() {
    if (this.#lottie) {
      this.#lottie.setSpeed(this.#animationSpeed);
    }
  }

  protected iconChanged() {
    if (!this.#isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  protected async srcChanged() {
    if (this.src) {
      await loadIcon(this.src);
    }

    if (!this.#isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  /**
   * Access current trigger instance.
   */
  get connectedTrigger() {
    return this.#connectedTrigger;
  }

  /**
   * Available properties for current icon.
   */
  get properties() {
    if (!this.#properties && this.#iconData) {
      this.#properties = allProperties(this.#iconData, true);
    }

    return this.#properties || [];
  }

  /**
   * Available states for current icon.
   */
  get states(): string[] {
    return this.properties.filter(c => c.name.startsWith(STATE_PREFIX)).map(c => {
      return c.name.substr(STATE_PREFIX.length).toLowerCase();
    });
  }

  /**
   * Check whether the element is ready.
   */
  get isReady() {
    return this.#isReady;
  }

  /**
   * Access lottie animation instance.
   */
  get lottie() {
    return this.#lottie;
  }

  set icon(value: any) {
    if (isObjectLike(value)) {
      this.#storedIconData = value;
      this.removeAttribute('icon');
    } else {
      this.#storedIconData = undefined;

      if (value) {
        this.setAttribute('icon', value);
      } else {
        this.removeAttribute('icon');
      }
    }
  }

  get icon(): any {
    return this.#storedIconData || this.getAttribute('icon');
  }

  set src(value: string|null) {
    if (value) {
      this.setAttribute('src', value);
    } else {
      this.removeAttribute('src');
    }
  }

  get src(): string|null {
    return this.getAttribute('src');
  }

  set state(value: string|null) {
    if (value) {
      this.setAttribute('state', value);
    } else {
      this.removeAttribute('state');
    }
  }

  get state(): string|null {
    return this.getAttribute('state');
  }

  set colors(value: string|null) {
    if (value) {
      this.setAttribute('colors', value);
    } else {
      this.removeAttribute('colors');
    }
  }

  get colors(): string|null {
    return this.getAttribute('colors');
  }

  set trigger(value: string|null) {
    if (value) {
      this.setAttribute('trigger', value);
    } else {
      this.removeAttribute('trigger');
    }
  }

  get trigger(): string|null {
    return this.getAttribute('trigger');
  }

  set speed(value: any) {
    if (value) {
      this.setAttribute('speed', value);
    } else {
      this.removeAttribute('speed');
    }
  }

  get speed(): number|null {
    if (this.hasAttribute('speed')) {
      return parseFloat(this.getAttribute('speed')!);
    }
    return null;
  }

  set stroke(value: any) {
    if (value) {
      this.setAttribute('stroke', value);
    } else {
      this.removeAttribute('stroke');
    }
  }

  get stroke(): number|null {
    if (this.hasAttribute('stroke')) {
      return parseFloat(this.getAttribute('stroke')!);
    }
    return null;
  }

  set scale(value: any) {
    if (value) {
      this.setAttribute('scale', value);
    } else {
      this.removeAttribute('scale');
    }
  }

  get scale(): number|null {
    if (this.hasAttribute('scale')) {
      return parseFloat(this.getAttribute('scale')!);
    }
    return null;
  }

  set axisX(value: any) {
    if (value) {
      this.setAttribute('axis-x', value);
    } else {
      this.removeAttribute('axis-x');
    }
  }

  get axisX(): number|null {
    if (this.hasAttribute('axis-x')) {
      return parseFloat(this.getAttribute('axis-x')!);
    }
    return null;
  }

  set axisY(value: any) {
    if (value) {
      this.setAttribute('axis-y', value);
    } else {
      this.removeAttribute('axis-y');
    }
  }

  get axisY() {
    if (this.hasAttribute('axis-y')) {
      return parseFloat(this.getAttribute('axis-y')!);
    }
    return null;
  }

  /**
   * Access animation container element.
   */
  get #container(): HTMLElement | undefined {
    return this.#root.lastElementChild as any;
  }

  /**
   * Access icon data for this element.
   */
  get #iconData(): any {
    if (this.icon && typeof this.icon === "object") {
      return this.icon;
    }

    return getIcon(this.icon! || this.src!);
  }

  /**
   * Current animation speed.
   */
  get #animationSpeed(): number {
    if (this.hasAttribute('speed')) {
      const v = this.getAttribute('speed');
      return v === null ? 1 : parseFloat(v);
    }

    return 1;
  }
}