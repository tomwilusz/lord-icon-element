import { VERSION } from "./global.js";
import { IconData, IconLoader, IPlayer, ITrigger, ITriggerConstructor, PlayerFactory } from './interfaces.js';
import { parseColors } from "./utils/colors.js";
import { isNil, isObjectLike } from './utils/helpers.js';

/**
 * List of icon extra features that need special treatment by our {@link Element | Element}.
 */
type IconFeature = 'css-variables';

/**
 * Use constructable stylesheets if supported (https://developers.google.com/web/updates/2019/02/constructable-stylesheets)
 */
const SUPPORTS_ADOPTING_STYLE_SHEETS = 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype;

const CENTER_VALUE = 50;

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
 * Current style sheet instance (if supported).
 */
let styleSheet: CSSStyleSheet;

/**
 * Supported attributes for this custom element.
 */
type SUPPORTED_ATTRIBUTES = |
  "colors" |
  "src" |
  "icon" |
  "state" |
  "trigger" |
  "loading" |
  "target" |
  "stroke" |
  "scale" |
  "axis-x" |
  "axis-y";

/**
 * Observed attributes for this custom element.
 */
const OBSERVED_ATTRIBUTES: SUPPORTED_ATTRIBUTES[] = [
  "colors",
  "src",
  "icon",
  "state",
  "trigger",
  "loading",
  "target",
  "stroke",
  "scale",
  "axis-x",
  "axis-y",
];

/**
 * Return list of supported features by icon.
 * @param data
 * @returns
 */
function iconFeatures(data: IconData): IconFeature[] {
  if (data && data.features && Array.isArray(data.features)) {
    return data.features;
  }

  return [];
}

/**
 * Description.
 */
export class Element<P extends IPlayer = IPlayer> extends HTMLElement {
  private static _iconLoader?: IconLoader;
  private static _playerFactory?: PlayerFactory;
  private static _definedTriggers: Map<string, ITriggerConstructor> = new Map<string, ITriggerConstructor>();

  /** 
   * Get element version.
   */
  static get version() {
    return VERSION;
  }

  /**
   * Custom element observed attributes.
   */
  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }

  /**
   * Assign callback responsible for loading icons.
   * @param loader
   */
  static setIconLoader(loader: IconLoader) {
    Element._iconLoader = loader;
  }

  /**
   * Assign callback which create a player. Player is responsible for customizing icons and playing animations.
   * @param loader
   */
  static setPlayerFactory(loader: PlayerFactory) {
    Element._playerFactory = loader;
  }

  /**
   * Define supported trigger. Triggers allows to define interaction strategy with icon.
   * @param name
   * @param triggerClass
   */
  static defineTrigger(name: string, triggerClass: ITriggerConstructor) {
    Element._definedTriggers.set(name, triggerClass);
  }

  private _root?: ShadowRoot;
  private _isInitialized: boolean = false;
  private _isReady: boolean = false;
  private _triggerInstance?: ITrigger;
  private _assignedIconData?: IconData;
  private _loadedIconData?: IconData;
  private _player?: IPlayer;
  private _intersectionObserver?: IntersectionObserver;

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
    switch (name) {
      case 'axis-x':
        this.axisXChanged();
        break;
      case 'axis-y':
        this.axisYChanged();
        break;
      default:
        this[`${name}Changed`].call(this);
        break;
    }
  }

  /**
   * Element connected.
   */
  protected connectedCallback() {
    // execute init only once after connected
    if (this._isInitialized) {
      return;
    }

    this._isInitialized = true;

    this.createElements();

    if (this.loading && this.loading.toLowerCase() === 'lazy') {
      const callback: IntersectionObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this._intersectionObserver!.unobserve(this);
            this._intersectionObserver = undefined;
            this.createPlayer();
          }
        });
      };
      this._intersectionObserver = new IntersectionObserver(callback);
      this._intersectionObserver.observe(this);
    } else {
      this.createPlayer();
    }
  }

  /**
   * Element disconnected.
   */
  protected disconnectedCallback() {
    this.destroyPlayer();
  }

  /**
   * Create DOM elements.
   * @returns
   */
  protected createElements() {
    // create shadow root for this element
    this._root = this.attachShadow({
      mode: "open"
    });

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
  }

  protected async createPlayer(): Promise<void> {
    // notify about missing loader
    if (!Element._playerFactory) {
      throw new Error('Missing player loader!');
    }

    // already on awaiting state
    if (this._intersectionObserver) {
      return;
    }

    const iconData = await this.loadIconData();
    if (!iconData) {
      return;
    }

    this._player = Element._playerFactory(this.animationContainer!, iconData);
    this._player.connect();

    // assign initial properties for icon
    if (this.state || this.colors || this.stroke || this.scale || this.axisX || this.axisY) {
      this.player!.resetProperties({
        colors: parseColors(this.colors || ''),
        stroke: this.stroke,
        scale: this.scale,
        state: this.state,
        axis: isNil(this.axisX) && isNil(this.axisY) ? null : {
          x: isNil(this.axisX) ? CENTER_VALUE : this.axisX!,
          y: isNil(this.axisY) ? CENTER_VALUE : this.axisY!,
        },
      });
    }

    // listen for ready
    this._player.addEventListener('ready', () => {
      if (this._triggerInstance && this._triggerInstance.onReady) {
        this._triggerInstance.onReady();
      }
    });

    // listen for refresh
    this._player.addEventListener('refresh', () => {
      this.refresh();

      if (this._triggerInstance && this._triggerInstance.onRefresh) {
        this._triggerInstance.onRefresh();
      }
    });

    // listen for complete
    this._player.addEventListener('complete', () => {
      if (this._triggerInstance && this._triggerInstance.onComplete) {
        this._triggerInstance.onComplete();
      }
    });

    // listen for frame
    this._player.addEventListener('frame', () => {
      if (this._triggerInstance && this._triggerInstance.onFrame) {
        this._triggerInstance.onFrame();
      }
    });

    // refresh element instantly
    this.refresh();

    // create trigger (only if assigned)
    this.triggerChanged();

    // wait for player ready
    await new Promise<void>((resolve, reject) => {
      if (this._player!.isReady) {
        resolve();
      } else {
        this._player!.addEventListener('ready', resolve);
      }
    });

    // mark ready
    this._isReady = true;

    // notify about ready
    this.dispatchEvent(new CustomEvent("ready"));
  }

  protected destroyPlayer() {
    // mark not ready
    this._isReady = false;

    // clear stored icon data
    this._loadedIconData = undefined;

    // remove trigger
    if (this._triggerInstance) {
      if (this._triggerInstance.onDisconnected) {
        this._triggerInstance.onDisconnected();
      }
      this._triggerInstance = undefined;
    }

    // remove player
    if (this._player) {
      this._player.disconnect();
      this._player = undefined;
    }
  }

  protected async loadIconData(): Promise<IconData> {
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

  /**
   * Synchronize element state with player.
   */
  protected refresh() {
    if (iconFeatures(this.iconData).includes('css-variables')) {
      this.movePaletteToCssVariables();
    }
  }

  /**
   * Update default css variables.
   */
  protected movePaletteToCssVariables() {
    for (const [key, value] of Object.entries(this.player!.colors || {})) {
      (this._root!.querySelector('.body') as HTMLElement).style.setProperty(`--lord-icon-${key}-base`, value);
    }
  }

  protected targetChanged() {
    this.triggerChanged();
  }

  protected loadingChanged() {
  }

  protected triggerChanged() {
    if (this._triggerInstance) {
      if (this._triggerInstance.onDisconnected) {
        this._triggerInstance.onDisconnected();
      }
      this._triggerInstance = undefined;
    }

    if (!this.trigger || !this._player) {
      return;
    }

    const TriggerClass = Element._definedTriggers.get(this.trigger);
    if (!TriggerClass) {
      throw new Error(`Can't use unregistered trigger!`)
    }

    const targetElement = this.target ? this.closest<HTMLElement>(this.target) : null;

    this._triggerInstance = new TriggerClass(
      this,
      targetElement || this,
      this._player,
    );

    if (this._triggerInstance.onConnected) {
      this._triggerInstance.onConnected();
    }

    if (this._player.isReady && this._triggerInstance.onReady) {
      this._triggerInstance.onReady();
    }
  }

  protected colorsChanged() {
    if (!this.player) {
      return;
    }

    this.player.colors = parseColors(this.colors || '');
  }

  protected strokeChanged() {
    if (!this.player) {
      return;
    }

    this.player.stroke = this.stroke;
  }

  protected stateChanged() {
    if (!this.player) {
      return;
    }

    this.player.state = this.state;
  }

  protected scaleChanged() {
    if (!this.player) {
      return;
    }

    this.player.scale = this.scale;
  }

  protected axisXChanged() {
    if (!this.player) {
      return;
    }

    this.player.axis = {
      x: isNil(this.axisX) ? CENTER_VALUE : this.axisX!,
      y: isNil(this.axisY) ? CENTER_VALUE : this.axisX!,
    };
  }

  protected axisYChanged() {
    if (!this.player) {
      return;
    }

    this.player.axis = {
      x: isNil(this.axisX) ? CENTER_VALUE : this.axisX!,
      y: isNil(this.axisY) ? CENTER_VALUE : this.axisX!,
    };
  }

  protected iconChanged() {
    if (!this._isInitialized) {
      return;
    }

    this.destroyPlayer();
    this.createPlayer();
  }

  protected srcChanged() {
    if (!this._isInitialized) {
      return;
    }

    this.destroyPlayer();
    this.createPlayer();
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

  set loading(value: string | null) {
    if (value) {
      this.setAttribute('loading', value);
    } else {
      this.removeAttribute('loading');
    }
  }

  get loading(): string | null {
    return this.getAttribute('loading');
  }

  set target(value: string | null) {
    if (value) {
      this.setAttribute('target', value);
    } else {
      this.removeAttribute('target');
    }
  }

  get target(): string | null {
    return this.getAttribute('target');
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

  set scale(value: number | null) {
    if (isNil(value)) {
      this.removeAttribute('scale');
    } else {
      this.setAttribute('scale', '' + value);
    }
  }

  get scale(): number | null {
    if (this.hasAttribute('scale')) {
      return parseFloat(this.getAttribute('scale')!);
    }
    return null;
  }

  set axisX(value: number | null) {
    if (isNil(value)) {
      this.removeAttribute('axis-x');
    } else {
      this.setAttribute('axis-x', '' + value);
    }
  }

  get axisX(): number | null {
    if (this.hasAttribute('axis-x')) {
      return parseFloat(this.getAttribute('axis-x')!);
    }
    return null;
  }

  set axisY(value: number | null) {
    if (isNil(value)) {
      this.removeAttribute('axis-y');
    } else {
      this.setAttribute('axis-y', '' + value);
    }
  }

  get axisY() {
    if (this.hasAttribute('axis-y')) {
      return parseFloat(this.getAttribute('axis-y')!);
    }
    return null;
  }

  /**
   * Access animation player.
   */
  get player(): P | undefined {
    return this._player as any;
  }

  /**
   * Check whether the element is ready.
   */
  get isReady() {
    return this._isReady;
  }

  /**
   * Access connected trigger instance.
   */
  get triggerInstance() {
    return this._triggerInstance;
  }

  /**
   * Access animation container element.
   */
  private get animationContainer(): HTMLElement | undefined {
    return this._root!.lastElementChild as any;
  }

  /**
   * Access loaded icon data.
   */
  private get iconData(): IconData | undefined {
    return this._assignedIconData || this._loadedIconData;
  }
}