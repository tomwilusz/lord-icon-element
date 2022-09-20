import { AnimationItem } from 'lottie-web';
import { ANIMATION_LOADER_OPTIONS, PROPERTY_SCALE, STATE_PREFIX, VERSION } from "./global.js";
import { AnimationLoader, IconLoader, ILottieProperty, ITrigger, ITriggerConstructor } from './interfaces.js';
import { Trigger } from './trigger.js';
import { deepClone, get, isNil, isObjectLike } from './utils/helpers.js';
import { allProperties, iconFeatures, lottieColorToHex, resetColor, resetColors, resetProperty, updateColor, updateColors, updateProperty } from './utils/lottie.js';

/**
 * Use constructable stylesheets if supported (https://developers.google.com/web/updates/2019/02/constructable-stylesheets)
 */
const SUPPORTS_ADOPTING_STYLE_SHEETS = 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype;

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
  "stroke" |
  "scale" |
  "axis-x" |
  "axis-y";

/**
 * Description.
 */
export class Element extends HTMLElement {
  private _root: ShadowRoot;
  private _isReady: boolean = false;
  private _lottie?: AnimationItem;
  private _properties?: ILottieProperty[];
  private _connectedTrigger?: ITrigger;
  private _assignedIconData?: any;
  private _loadedIconData?: any;
  private _palette?: any;

  private static _iconLoader?: IconLoader;
  private static _animationLoader?: AnimationLoader;
  private static _triggers: Map<string, any> = new Map<string, any>();
  private static _animationLoaderOptions: any = ANIMATION_LOADER_OPTIONS;

  /**
   * Set icon loader.
   * @param loader
   */
  static setIconLoader(loader: IconLoader) {
    Element._iconLoader = loader;
  }

  /**
   * Register Lottie library
   * @param loader Provide "loadAnimation" here from Lottie.
   * @param options Options for lottie-web.
   */
  static setAnimationLoader(loader: AnimationLoader, options?: any) {
    Element._animationLoader = loader;
    Element._animationLoaderOptions = options || ANIMATION_LOADER_OPTIONS;
  }

  /**
   * Register supported animation.
   * @param name
   * @param triggerClass
   */
  static registerTrigger(name: string, triggerClass: ITriggerConstructor) {
    Element._triggers.set(name, triggerClass);
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
        styleSheet.replaceSync(ELEMENT_STYLE);
      }

      this._root.adoptedStyleSheets = [styleSheet];
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

  protected async loadIcon() {
    let iconData = this.iconData;

    if (!iconData) {
      if (this.icon && Element._iconLoader) {
        this._loadedIconData = iconData = await Element._iconLoader(this.icon);
      } else if (this.src) {
        const response = await fetch(this.src);
        this._loadedIconData = iconData = await response.json();
      }
    }

    return iconData;
  }

  protected async registerLottie() {
    if (!Element._animationLoader) {
      throw new Error('Missing animation loader!');
    }

    const iconData = await this.loadIcon();
    if (!iconData) {
      return;
    }

    this._lottie = Element._animationLoader!({
      container: this.container!,
      animationData: deepClone(iconData),
      ...Element._animationLoaderOptions,
    });

    if (this.state || this.colors || this.stroke || this.scale || this.axisX || this.axisY) {
      const properties = this.properties;

      if (properties) {
        if (this.colors) {
          updateColors(this._lottie, properties, this.colors);
        }
        if (this.state) {
          for (const state of this.states) {
            updateProperty(this._lottie, properties, STATE_PREFIX + state, 0);
          }
          updateProperty(this._lottie, properties, STATE_PREFIX + this.state, 1);
        }
        if (this.stroke) {
          updateProperty(this._lottie, properties, 'stroke', this.stroke, undefined, PROPERTY_SCALE);
        }
        if (this.scale) {
          updateProperty(this._lottie, properties, 'scale', this.scale, undefined, PROPERTY_SCALE);
        }
        if (this.axisX) {
          updateProperty(this._lottie, properties, 'axis', this.axisX, '0', PROPERTY_SCALE);
        }
        if (this.axisY) {
          updateProperty(this._lottie, properties, 'axis', this.axisY, '1', PROPERTY_SCALE);
        }

        this._lottie!.renderer.renderFrame(null);
      }
    }

    // dispatch complete
    this._lottie.addEventListener("complete", () => {
      this.dispatchEvent(new CustomEvent("complete"));
    });

    this.triggerChanged();

    // move palette to css variables instantly on this icon
    if (iconFeatures(iconData).includes('css-variables')) {
      this.movePaletteToCssVariables();
    }

    // notify about ready
    this.dispatchEvent(new CustomEvent("ready"));
  }

  protected unregisterLottie() {
    this._properties = undefined;
    this._loadedIconData = undefined;

    if (this._connectedTrigger) {
      this._connectedTrigger.disconnect();
      this._connectedTrigger = undefined;
    }

    if (this._lottie) {
      this._lottie.destroy();
      this._lottie = undefined;
    }
  }

  protected refresh() {
    this._lottie?.renderer.renderFrame(null);

    if (iconFeatures(this.iconData).includes('css-variables')) {
      this.movePaletteToCssVariables();
    }
  }

  protected triggerChanged() {
    if (this._connectedTrigger) {
      this._connectedTrigger.disconnect();
      this._connectedTrigger = undefined;
    }

    if (this._lottie) {
      if (this.trigger) {
        const TriggerClass = Element._triggers.get(this.trigger);
        if (!TriggerClass) {
          throw new Error(`Can't use unregistered trigger!`)
        }
        this._connectedTrigger = new TriggerClass(this, this._lottie);
      } else {
        this._connectedTrigger = new Trigger(this, this._lottie);
      }

      this._connectedTrigger!.connect();
    }
  }

  protected colorsChanged() {
    if (!this.customizable) {
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
    if (!this.customizable) {
      return;
    }

    if (isNil(this.stroke)) {
      resetProperty(this._lottie, this.properties, 'stroke');
    } else {
      updateProperty(this._lottie, this.properties, 'stroke', this.stroke, undefined, PROPERTY_SCALE);
    }

    this.refresh();
  }

  protected stateChanged() {
    if (!this.customizable) {
      return;
    }

    if (this.state) {
      for (const state of this.states) {
        updateProperty(this._lottie, this.properties, STATE_PREFIX + state, 0);
      }
      updateProperty(this._lottie, this.properties, STATE_PREFIX + this.state, 1);
    } else {
      for (const state of this.states) {
        resetProperty(this._lottie, this.properties, STATE_PREFIX + state);
      }
    }

    this.refresh();
  }

  protected scaleChanged() {
    if (!this.customizable) {
      return;
    }

    if (isNil(this.scale)) {
      resetProperty(this._lottie, this.properties, 'scale');
    } else {
      updateProperty(this._lottie, this.properties, 'scale', this.scale, undefined, PROPERTY_SCALE);
    }

    this.refresh();
  }

  protected axisXChanged() {
    if (!this.customizable) {
      return;
    }

    if (isNil(this.axisX)) {
      resetProperty(this._lottie, this.properties, 'axis', '0');
    } else {
      updateProperty(this._lottie, this.properties, 'axis', this.axisX, '0', PROPERTY_SCALE);
    }

    this.refresh();
  }

  protected axisYChanged() {
    if (!this.customizable) {
      return;
    }

    if (isNil(this.axisY)) {
      resetProperty(this._lottie, this.properties, 'axis', '1');
    } else {
      updateProperty(this._lottie, this.properties, 'axis', this.axisY, '1', PROPERTY_SCALE);
    }

    this.refresh();
  }

  protected iconChanged() {
    if (!this._isReady) {
      return;
    }

    this.unregisterLottie();
    this.registerLottie();

  }

  protected async srcChanged() {
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
  get properties(): ILottieProperty[] {
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
   * Find default state.
   */
  get defaultState(): string | undefined {
    const states = this.properties.filter(c => c.name.startsWith(STATE_PREFIX) && c.value);
    if (states.length) {
      return states[0].name.substr(STATE_PREFIX.length).toLowerCase();
    }
    return undefined;
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
      this._assignedIconData = value;

      if (this.hasAttribute('icon')) {
        this.removeAttribute('icon');
      } else {
        this.iconChanged();
      }
    } else {
      const oldIconData = this._assignedIconData;
      this._assignedIconData = undefined;

      if (value && typeof value === 'string') {
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
    return this._assignedIconData || this.getAttribute('icon');
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

  set stroke(value: number | null) {
    if (isNil(value)) {
      this.removeAttribute('stroke');
    } else {
      this.setAttribute('stroke', '' + value);
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
    return this._assignedIconData || this._loadedIconData;
  }

  /**
   * Current icon is customizable.
   */
  private get customizable(): boolean {
    return (this._isReady && this._lottie && this.properties) ? true : false;
  }

  /** 
   * Check element version.
   */
  get version() {
    return VERSION;
  }
}