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
  lottieColorToHex,
  updateColor,
  resetColor,
  iconFeatures,
} from "../helpers/lottie.js";

import {
  get,
  isObjectLike,
  isNil,
  deepClone,
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

import { VERSION } from "../global.js";

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

    :host(.current-color) svg path[fill] {
      fill: currentColor;
    }

    :host(.current-color) svg path[stroke] {
      stroke: currentColor;
    }

    :host(:not(.current-color)) svg .primary path[fill] {
      fill: var(--lord-icon-primary, var(--lord-icon-primary-base));
    }

    :host(:not(.current-color)) svg .primary path[stroke] {
      stroke: var(--lord-icon-primary, var(--lord-icon-primary-base));
    }

    :host(:not(.current-color)) svg .secondary path[fill] {
      fill: var(--lord-icon-secondary, var(--lord-icon-secondary-base));
    }

    :host(:not(.current-color)) svg .secondary path[stroke] {
      stroke: var(--lord-icon-secondary, var(--lord-icon-secondary-base));
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
  private _root: ShadowRoot;
  private _isReady: boolean = false;
  private _lottie?: AnimationItem;
  private _properties?: ILottieProperty[];
  private _connectedTrigger?: ITrigger;
  private _storedIconData?: any;
  private _palette?: any;

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

  /** 
   * Check element version.
   */
  static get version() {
    return VERSION;
  }

  constructor() {
    super();

    // create shadow root for this element
    this._root = this.attachShadow({
      mode: "open"
    });
  }

  /**
   * Element connected.
   */
  protected connectedCallback() {
    connectInstance(this);

    // execute init only once after connected
    if (!this._isReady) {
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
    if (this._isReady) {
      return;
    }

    this._isReady = true;

    if (SUPPORTS_ADOPTING_STYLE_SHEETS) {
      if (!styleSheet) {
        styleSheet = new CSSStyleSheet();
        (styleSheet as any).replaceSync(ELEMENT_STYLE);
      }

      (this._root as any).adoptedStyleSheets = [styleSheet];
    } else {
      const style = document.createElement("style");
      style.innerHTML = ELEMENT_STYLE;
      this._root.appendChild(style);
    }

    const slotContainer = document.createElement("div");
    slotContainer.innerHTML = "<slot></slot>";
    slotContainer.classList.add("slot");
    this._root.appendChild(slotContainer);

    const container = document.createElement("div");
    container.classList.add('body');
    this._root.appendChild(container);

    this.registerLottie();
  }

  protected registerLottie() {
    let iconData = this.iconData;
    if (!iconData) {
      return;
    }

    this._lottie = loadLottieAnimation({
      container: this.container as Element,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData: deepClone(iconData),
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
          updateColors(this._lottie, properties, this.colors);
        }
        if (this.state) {
          for (const state of this.states) {
            replaceProperty(this._lottie, properties, STATE_PREFIX + state, 0);
          }
          replaceProperty(this._lottie, properties, STATE_PREFIX + this.state, 1);
        }
        if (this.stroke) {
          updateProperty(this._lottie, properties, 'stroke', this.stroke);
        }
        if (this.scale) {
          updateProperty(this._lottie, properties, 'scale', this.scale);
        }
        if (this.axisX) {
          updateProperty(this._lottie, properties, 'axis', this.axisX, '0');
        }
        if (this.axisY) {
          updateProperty(this._lottie, properties, 'axis', this.axisY, '1');
        }

        this._lottie!.renderer.renderFrame(null);
      }
    }

    // set speed
    this._lottie.setSpeed(this.animationSpeed);

    // dispatch animation-complete
    this._lottie.addEventListener("complete", () => {
      this.dispatchEvent(new CustomEvent("animation-complete"));
    });

    this.triggerChanged();

    this.dispatchEvent(new CustomEvent("icon-ready"));

    // move palette to css variables instantly on this icon
    if (iconFeatures(iconData).includes('css-variables')) {
      this.movePaletteToCssVariables();
    }
  }

  protected unregisterLottie() {
    this._properties = undefined;

    if (this._connectedTrigger) {
      this._connectedTrigger.disconnectedCallback();
      this._connectedTrigger = undefined;
    }

    if (this._lottie) {
      this._lottie.destroy();
      this._lottie = undefined;

      this.container!.innerHTML = "";
    }
  }

  protected refresh() {
    this._lottie!.renderer.renderFrame(null);

    this.movePaletteToCssVariables();
  }

  protected notify(name: string, from: "icon" | "trigger") {
    if (this[from] !== name) {
      return;
    }

    if (from === "icon") {
      if (this._lottie) {
        this.unregisterLottie();
      }
      this.registerLottie();
    } else if (from === "trigger" && !this._connectedTrigger) {
      this.triggerChanged();
    }
  }

  protected triggerChanged() {
    if (this._connectedTrigger) {
      this._connectedTrigger.disconnectedCallback();
      this._connectedTrigger = undefined;
    }

    if (this.trigger && this._lottie) {
      const TriggerClass = getTrigger(this.trigger);
      if (TriggerClass) {
        this._connectedTrigger = new TriggerClass(this, this._lottie);
        this._connectedTrigger!.connectedCallback();
      }
    }
  }

  protected colorsChanged() {
    if (!this._isReady || !this.properties) {
      return;
    }

    if (this.colors) {
      updateColors(this._lottie, this.properties, this.colors);
    } else {
      resetColors(this._lottie, this.properties);
    }

    this.refresh();
  }

  protected strokeChanged() {
    if (!this._isReady || !this.properties) {
      return;
    }

    if (isNil(this.stroke)) {
      resetProperty(this._lottie, this.properties, 'stroke');
    } else {
      updateProperty(this._lottie, this.properties, 'stroke', this.stroke);
    }

    this.refresh();
  }

  protected stateChanged() {
    if (!this._isReady || !this.properties) {
      return;
    }

    if (this.state) {
      for (const state of this.states) {
        replaceProperty(this._lottie, this.properties, STATE_PREFIX + state, 0);
      }
      replaceProperty(this._lottie, this.properties, STATE_PREFIX + this.state, 1);
    } else {
      for (const state of this.states) {
        resetProperty(this._lottie, this.properties, STATE_PREFIX + state);
      }
    }

    this.refresh();
  }

  protected scaleChanged() {
    if (!this._isReady || !this.properties) {
      return;
    }

    if (isNil(this.scale)) {
      resetProperty(this._lottie, this.properties, 'scale');
    } else {
      updateProperty(this._lottie, this.properties, 'scale', this.scale);
    }

    this.refresh();
  }

  protected axisXChanged() {
    if (!this._isReady || !this.properties) {
      return;
    }

    if (isNil(this.axisX)) {
      resetProperty(this._lottie, this.properties, 'axis', '0');
    } else {
      updateProperty(this._lottie, this.properties, 'axis', this.axisX, '0');
    }

    this.refresh();
  }

  protected axisYChanged() {
    if (!this._isReady || !this.properties) {
      return;
    }

    if (isNil(this.axisY)) {
      resetProperty(this._lottie, this.properties, 'axis', '1');
    } else {
      updateProperty(this._lottie, this.properties, 'axis', this.axisY, '1');
    }

    this.refresh();
  }

  protected speedChanged() {
    if (this._lottie) {
      this._lottie.setSpeed(this.animationSpeed);
    }
  }

  protected iconChanged() {
    if (!this._isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  protected async srcChanged() {
    if (this.src) {
      await loadIcon(this.src);
    }

    if (!this._isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();
  }

  protected movePaletteToCssVariables() {
    for (const [key, value] of Object.entries(this.palette)) {
      (this._root.querySelector('.body') as HTMLElement).style.setProperty(`--lord-icon-${key}-base`, value);
    }
  }

  /**
   * Access current trigger instance.
   */
  get connectedTrigger() {
    return this._connectedTrigger;
  }

  /**
   * Available properties for current icon.
   */
  get properties() {
    if (!this._properties && this.iconData) {
      this._properties = allProperties(this.iconData, true);
    }

    return this._properties || [];
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
    return this._isReady;
  }

  /**
   * Access lottie animation instance.
   */
  get lottie() {
    return this._lottie;
  }

  /**
   * Update palette.
   */
  set palette(colors: { [key: string]: string }) {
    if (!colors || typeof colors !== 'object') {
      return;
    }

    for (const current of this.properties) {
      if (current.type !== 'color') {
        continue;
      }

      const name = current.name.toLowerCase();

      if (name in colors && colors[name]) {
        updateColor(this._lottie, this.properties, name, colors[name]);
      } else {
        resetColor(this._lottie, this.properties, name);
      }
    }

    this.refresh();
  }

  /**
   * Access to colors get / update with convenient way. 
   */
  get palette() {
    if (!this._palette) {
      this._palette = new Proxy(this, {
        set: (target, property, value, receiver): boolean => {
          for (const current of target.properties) {
            if (current.type == 'color' && typeof property === 'string' && property.toLowerCase() == current.name.toLowerCase()) {
              if (value) {
                updateColor(target._lottie, target.properties, property, value);
              } else if (value === undefined) {
                resetColor(target._lottie, target.properties, property);
              }
              target.refresh();
            }
          }
          return true;
        },
        get: (target, property, receiver) => {
          for (const current of target.properties) {
            if (current.type == 'color' && typeof property === 'string' && property.toLowerCase() == current.name.toLowerCase()) {
              return lottieColorToHex(get(target._lottie, current.path));
            }
          }
          return undefined;
        },
        deleteProperty: (target, property) => {
          for (const current of target.properties) {
            if (current.type == 'color' && typeof property === 'string' && property.toLowerCase() == current.name.toLowerCase()) {
              resetColor(target._lottie, target.properties, property);
              target.refresh();
            }
          }
          return true;
        },
        ownKeys: (target) => {
          return target.properties.filter(c => c.type == 'color').map(c => c.name.toLowerCase());
        },
        has: (target, property) => {
          for (const current of target.properties) {
            if (current.type == 'color' && typeof property === 'string' && property.toLowerCase() == current.name.toLowerCase()) {
              return true;
            }
          }
          return false;
        },
        getOwnPropertyDescriptor: (target) => {
          return {
            enumerable: true,
            configurable: true,
          };
        },
      });
    }

    return this._palette;
  }

  set icon(value: any) {
    if (value && isObjectLike(value)) {
      this._storedIconData = value;

      if (this.hasAttribute('icon')) {
        this.removeAttribute('icon');
      } else {
        this.iconChanged();
      }
    } else {
      const oldIconData = this._storedIconData;
      this._storedIconData = undefined;

      if (value) {
        this.setAttribute('icon', value);
      } else {
        this.removeAttribute('icon');

        if (oldIconData) {
          this.iconChanged();
        }
      }
    }
  }

  get icon(): any {
    return this._storedIconData || this.getAttribute('icon');
  }

  set src(value: string | null) {
    if (value) {
      this.setAttribute('src', value);
    } else {
      this.removeAttribute('src');
    }
  }

  get src(): string | null {
    return this.getAttribute('src');
  }

  set state(value: string | null) {
    if (value) {
      this.setAttribute('state', value);
    } else {
      this.removeAttribute('state');
    }
  }

  get state(): string | null {
    return this.getAttribute('state');
  }

  set colors(value: string | null) {
    if (value) {
      this.setAttribute('colors', value);
    } else {
      this.removeAttribute('colors');
    }
  }

  get colors(): string | null {
    return this.getAttribute('colors');
  }

  set trigger(value: string | null) {
    if (value) {
      this.setAttribute('trigger', value);
    } else {
      this.removeAttribute('trigger');
    }
  }

  get trigger(): string | null {
    return this.getAttribute('trigger');
  }

  set speed(value: any) {
    if (isNil(value)) {
      this.removeAttribute('speed');
    } else {
      this.setAttribute('speed', value);
    }
  }

  get speed(): number | null {
    if (this.hasAttribute('speed')) {
      return parseFloat(this.getAttribute('speed')!);
    }
    return null;
  }

  set stroke(value: any) {
    if (isNil(value)) {
      this.removeAttribute('stroke');
    } else {
      this.setAttribute('stroke', value);
    }
  }

  get stroke(): number | null {
    if (this.hasAttribute('stroke')) {
      return parseFloat(this.getAttribute('stroke')!);
    }
    return null;
  }

  set scale(value: any) {
    if (isNil(value)) {
      this.removeAttribute('scale');
    } else {
      this.setAttribute('scale', value);
    }
  }

  get scale(): number | null {
    if (this.hasAttribute('scale')) {
      return parseFloat(this.getAttribute('scale')!);
    }
    return null;
  }

  set axisX(value: any) {
    if (isNil(value)) {
      this.removeAttribute('axis-x');
    } else {
      this.setAttribute('axis-x', value);
    }
  }

  get axisX(): number | null {
    if (this.hasAttribute('axis-x')) {
      return parseFloat(this.getAttribute('axis-x')!);
    }
    return null;
  }

  set axisY(value: any) {
    if (isNil(value)) {
      this.removeAttribute('axis-y');
    } else {
      this.setAttribute('axis-y', value);
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
  private get container(): HTMLElement | undefined {
    return this._root.lastElementChild as any;
  }

  /**
   * Access icon data for this element.
   */
  private get iconData(): any {
    if (this.icon && typeof this.icon === "object") {
      return this.icon;
    }

    return getIcon(this.icon! || this.src!);
  }

  /**
   * Current animation speed.
   */
  private get animationSpeed(): number {
    if (this.hasAttribute('speed')) {
      const v = this.getAttribute('speed');
      return v === null ? 1 : parseFloat(v);
    }

    return 1;
  }

  /** 
   * Check element version.
   */
  get version() {
    return VERSION;
  }
}