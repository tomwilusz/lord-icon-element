import { VERSION } from "./global.js";
import { IconData, IconLoader, IPlayer, ITrigger, ITriggerConstructor, PlayerFactory } from './interfaces.js';
import { parseColors } from "./utils/colors.js";
import { isNil, isObjectLike } from './utils/helpers.js';

/**
 * Supported icon loading strategies by our {@link Element | Element}.
 */
type LoadingType = 'lazy';

/**
 * Use constructable stylesheets if supported (https://developers.google.com/web/updates/2019/02/constructable-stylesheets)
 */
const SUPPORTS_ADOPTING_STYLE_SHEETS = 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype;

/**
 * Default value for many of supported properties.
 * For example stroke, scale can be changed in 0-100 range.
 */
const CENTER_VALUE = 50;

/**
 * Style for this element.
 */
const ELEMENT_STYLE = `
    :host {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 32px;
        transform: translate3d(0px, 0px, 0px);
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
        position: absolute;
        pointer-events: none;
        display: block;
        transform: none!important;
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
 * Custom element implementation that supports rendering, customizing and controlling of our icons in simple way.
 * 
 * Example:
 * ```js
 * import lottie from 'lottie-web';
 * import { Element } from 'lord-icon-element/element';
 * import { Player } from 'lord-icon-element/player';
 * 
 * Element.setPlayerFactory((container, iconData) => {
 *     return new Player(
 *         lottie.loadAnimation,
 *         container,
 *         iconData,
 *     );
 * });
 * 
 * customElements.define("lord-icon", Element);
 * ```
 * 
 * Notice: you can define this custom element, a lot easier with premade helper method: {@link index.defineElement | defineElement}.
 */
export class Element<P extends IPlayer = IPlayer> extends HTMLElement {
    protected static _iconLoader?: IconLoader;
    protected static _playerFactory?: PlayerFactory;
    protected static _definedTriggers: Map<string, ITriggerConstructor> = new Map<string, ITriggerConstructor>();

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
     * Assign callback responsible for loading icons. Allows our {@link element.Element | Element} to load {@link interfaces.IconData | icon data} from any source.
     * Remember to assign _icon loader_ before defining `lord-icon` custom element to take effect.
     * 
     * Example:
     * ```js
     * import lottie from 'lottie-web';
     * import { defineElement } from 'lord-icon-element';
     * import { Element } from 'lord-icon-element/element';
     * 
     * Element.setIconLoader(async (name) => {
     *     const response = await fetch(`https://example.com/${name}.json`);
     *     return await response.json();
     * });
     * 
     * defineElement(lottie.loadAnimation);
     * ```
     * 
     * @param loader Custom icon loader callback.
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

    protected _root?: ShadowRoot;
    protected _isConnected: boolean = false;
    protected _isReady: boolean = false;
    protected _triggerInstance?: ITrigger;
    protected _assignedIconData?: IconData;
    protected _loadedIconData?: IconData;
    protected _player?: IPlayer;
    protected _intersectionObserver?: IntersectionObserver;

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
        // create elements only once
        if (!this._root) {
            this.createElements();
        }

        if (this.loading === 'lazy') {
            const callback: IntersectionObserverCallback = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && this._intersectionObserver) {
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

        this._isConnected = true;
    }

    /**
     * Element disconnected.
     */
    protected disconnectedCallback() {
        if (this._intersectionObserver) {
            this._intersectionObserver!.unobserve(this);
            this._intersectionObserver = undefined;
        }

        this.destroyPlayer();

        this._isConnected = false;
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

        const container = document.createElement("div");
        container.classList.add('body');
        this._root.appendChild(container);
    }

    /**
     * Instantiate player intance on demand with assigned player factory.
     * @returns
     */
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

    /**
     * Destroy connected player and connected trigger. 
     * Player is recreated on every icon data change.
     */
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

    /**
     * Load icon with assigned icon loader or source indicated by src attribute.
     * @returns Icon data.
     */
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
        this.movePaletteToCssVariables();
    }

    /**
     * Update defaults for css variables.
     * Notice: css variables take precedence over colors assigned by other methods!
     */
    protected movePaletteToCssVariables() {
        for (const [key, value] of Object.entries(this.player!.colors || {})) {
            this.animationContainer!.style.setProperty(`--lord-icon-${key}-base`, value);
        }
    }

    /**
     * Target attribute changed. Element should reload it's trigger.
     */
    protected targetChanged() {
        this.triggerChanged();
    }

    /**
     * Loading attribute changed.
     */
    protected loadingChanged() {
    }

    /**
     * Trigger attribute changed. Disconnect old trigger and instantiate new one.
     */
    protected triggerChanged(): void {
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

    /**
     * Colors attribute changed. Notify about new value player.
     */
    protected colorsChanged() {
        if (!this.player) {
            return;
        }

        this.player.colors = parseColors(this.colors || '');
    }

    /**
     * Stroke attribute changed. Notify about new value player.
     */
    protected strokeChanged() {
        if (!this.player) {
            return;
        }

        this.player.stroke = this.stroke;
    }

    /**
     * State attribute changed. Notify about new value player.
     */
    protected stateChanged() {
        if (!this.player) {
            return;
        }

        this.player.state = this.state;
    }

    /**
     * Scale attribute changed. Notify about new value player.
     */
    protected scaleChanged() {
        if (!this.player) {
            return;
        }

        this.player.scale = this.scale;
    }

    /**
     * Axis attribute changed. Notify about new value player.
     */
    protected axisXChanged() {
        if (!this.player) {
            return;
        }

        this.player.axis = {
            x: isNil(this.axisX) ? CENTER_VALUE : this.axisX!,
            y: isNil(this.axisY) ? CENTER_VALUE : this.axisX!,
        };
    }

    /**
     * Axis attribute changed. Notify about new value player.
     */
    protected axisYChanged() {
        if (!this.player) {
            return;
        }

        this.player.axis = {
            x: isNil(this.axisX) ? CENTER_VALUE : this.axisX!,
            y: isNil(this.axisY) ? CENTER_VALUE : this.axisY!,
        };
    }

    /**
     * Icon attribute changed. Reload our player.
     */
    protected iconChanged() {
        if (!this._isConnected) {
            return;
        }

        this.destroyPlayer();
        this.createPlayer();
    }

    /**
     * Src attribute changed. Reload our player.
     */
    protected srcChanged() {
        if (!this._isConnected) {
            return;
        }

        this.destroyPlayer();
        this.createPlayer();
    }

    /**
     * Update current icon. We can assign here icon name handled by {@link interfaces.IconLoader | icon loader} or right away {@link interfaces.IconData | icon data}.
     */
    set icon(value: any) {
        if (value && isObjectLike(value)) {
            if (this._assignedIconData !== value) {
                this._assignedIconData = value;

                if (this.hasAttribute('icon')) {
                    this.removeAttribute('icon');
                } else {
                    this.iconChanged();
                }
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

    /**
     * Get icon (icon name or assiged directly {@link interfaces.IconData | icon data})
     */
    get icon(): any {
        return this._assignedIconData || this.getAttribute('icon');
    }

    /**
     * Set src value.
     */
    set src(value: string | null) {
        if (value) {
            this.setAttribute('src', value);
        } else {
            this.removeAttribute('src');
        }
    }

    /**
     * Get src value.
     */
    get src(): string | null {
        return this.getAttribute('src');
    }

    /**
     * Set state value. 
     * 
     * Notice: you can check available states for loaded icon with `states` property.
     */
    set state(value: string | null) {
        if (value) {
            this.setAttribute('state', value);
        } else {
            this.removeAttribute('state');
        }
    }

    /**
     * Get state value.
     */
    get state(): string | null {
        return this.getAttribute('state');
    }

    /**
     * Set colors value. We support here string format with comma color separation: "primary:#fdd394,secondary:#03a9f4".
     * 
     * Example:
     * ```html
     * <lord-icon colors="primary:#fdd394,secondary:#03a9f4" src="/icons/confetti.json"></lord-icon>
     * ```
     */
    set colors(value: string | null) {
        if (value) {
            this.setAttribute('colors', value);
        } else {
            this.removeAttribute('colors');
        }
    }

    /**
     * Get colors value.
     */
    get colors(): string | null {
        return this.getAttribute('colors');
    }


    /**
     * Set trigger value. Provide name of already defined trigger!
     */
    set trigger(value: string | null) {
        if (value) {
            this.setAttribute('trigger', value);
        } else {
            this.removeAttribute('trigger');
        }
    }

    /**
     * Get trigger value.
     */
    get trigger(): string | null {
        return this.getAttribute('trigger');
    }

    /**
     * Set loading strategy. By default {@link interfaces.IconData | icon data} are loaded instantly on {@link interfaces.IPlayer | player} initialisation. 
     * It's possible to delay icon loading (with _src_ and _icon_ attribute) by changing _loading_ value to _lazy_.
     */
    set loading(value: LoadingType | null) {
        if (value) {
            this.setAttribute('loading', value);
        } else {
            this.removeAttribute('loading');
        }
    }

    /**
     * Get loading value.
     */
    get loading(): LoadingType | null {
        if (this.getAttribute('loading') && this.getAttribute('loading')!.toLowerCase() === 'lazy') {
            return 'lazy';
        }

        return null;
    }

    /**
     * Assign query selector for closest element target used for listening events.
     */
    set target(value: string | null) {
        if (value) {
            this.setAttribute('target', value);
        } else {
            this.removeAttribute('target');
        }
    }

    /**
     * Get target value.
     */
    get target(): string | null {
        return this.getAttribute('target');
    }

    /**
     * Set stroke value (in range 0-100).
     */
    set stroke(value: number | null) {
        if (isNil(value)) {
            this.removeAttribute('stroke');
        } else {
            this.setAttribute('stroke', '' + value);
        }
    }

    /**
     * Get stroke value.
     */
    get stroke(): number | null {
        if (this.hasAttribute('stroke')) {
            return parseFloat(this.getAttribute('stroke')!);
        }
        return null;
    }

    /**
     * Set scale value (in range 0-100).
     */
    set scale(value: number | null) {
        if (isNil(value)) {
            this.removeAttribute('scale');
        } else {
            this.setAttribute('scale', '' + value);
        }
    }

    /**
     * Get scale value.
     */
    get scale(): number | null {
        if (this.hasAttribute('scale')) {
            return parseFloat(this.getAttribute('scale')!);
        }
        return null;
    }

    /**
     * Set axisX value.
     */
    set axisX(value: number | null) {
        if (isNil(value)) {
            this.removeAttribute('axis-x');
        } else {
            this.setAttribute('axis-x', '' + value);
        }
    }

    /**
     * Get axisX value.
     */
    get axisX(): number | null {
        if (this.hasAttribute('axis-x')) {
            return parseFloat(this.getAttribute('axis-x')!);
        }
        return null;
    }

    /**
     * Set axisY value.
     */
    set axisY(value: number | null) {
        if (isNil(value)) {
            this.removeAttribute('axis-y');
        } else {
            this.setAttribute('axis-y', '' + value);
        }
    }

    /**
     * Get axisY value.
     */
    get axisY() {
        if (this.hasAttribute('axis-y')) {
            return parseFloat(this.getAttribute('axis-y')!);
        }
        return null;
    }

    /**
     * Access animation {@link interfaces.IPlayer | player}.
     */
    get player(): P | undefined {
        return this._player as any;
    }

    /**
     * Check whether the element is ready (instantiated player, trigger and loaded icon data).
     * 
     * You can listen for element ready with event listener:
     * ```js
     * element.addEventListener('ready', () => {});
     * ```
     */
    get isReady() {
        return this._isReady;
    }

    /**
     * Access connected {@link interfaces.ITrigger | trigger} instance.
     */
    get triggerInstance() {
        return this._triggerInstance;
    }

    /**
     * Access animation container element.
     */
    protected get animationContainer(): HTMLElement | undefined {
        return this._root!.lastElementChild as any;
    }

    /**
     * Access loaded {@link interfaces.IconData | icon data}.
     */
    protected get iconData(): IconData | undefined {
        return this._assignedIconData || this._loadedIconData;
    }
}