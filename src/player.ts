import { AnimationConfig, AnimationDirection, AnimationItem } from 'lottie-web';
import { AnimationLoader, IColors, IconData, IPlayer, IProperties, PlayerEventCallback, PlayerEventName } from './interfaces.js';
import { deepClone, get, isNil } from './utils/helpers.js';
import { ILottieProperty, lottieColorToHex, properties, resetProperties, updateProperties } from './utils/lottie.js';

export type LOTTIE_OPTIONS = Omit<AnimationConfig, 'container'>;

/**
 * Scale factor for supported properties.
 */
export const PROPERTY_SCALE = 50;

/**
 * Prefix for icon states.
 */
export const STATE_PREFIX = 'state-';

/**
 * Default lottie-web options used by provided Player.
 */
export const DEFAULT_LOTTIE_WEB_OPTIONS: Omit<AnimationConfig, 'container'> = {
    renderer: "svg",
    loop: false,
    autoplay: false,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: false,
        hideOnTransparent: true,
    },
}

function createColorsProxy(player: Player) {
    return new Proxy<Player>(player, {
        set: (target, property, value, receiver): boolean => {
            if (typeof property === 'string') {
                if (value) {
                    updateProperties(
                        player.lottie,
                        player.rawProperties.filter(c => c.type === 'color' && c.name === property.toLowerCase()),
                        value,
                    );
                } else {
                    resetProperties(
                        player.lottie,
                        player.rawProperties.filter(c => c.type === 'color' && c.name === property.toLowerCase()),
                    );
                }
                target.refresh();
            }
            return true;
        },
        get: (target, property, receiver) => {
            for (const current of target.rawProperties) {
                if (current.type == 'color' && typeof property === 'string' && property.toLowerCase() == current.name) {
                    return lottieColorToHex(get(player.lottie, current.path));
                }
            }
            return undefined;
        },
        deleteProperty: (target, property) => {
            if (typeof property === 'string') {
                resetProperties(
                    player.lottie,
                    player.rawProperties.filter(c => c.type === 'color' && c.name === property.toLowerCase()),
                );
                target.refresh();
            }
            return true;
        },
        ownKeys: (target) => {
            return target.rawProperties.filter(c => c.type == 'color').map(c => c.name);
        },
        has: (target, property) => {
            for (const current of target.rawProperties) {
                if (current.type == 'color' && typeof property === 'string' && property.toLowerCase() == current.name) {
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

/**
 * Wrapper arround lottie-web. Main purposes:
 * - Separate integration with lottie-web with this wprapper.
 * - Provide simple API to control animation and customize properties on the fly.
 */
export class Player implements IPlayer {
    private _animationLoader: AnimationLoader;
    private _container: HTMLElement;
    private _iconData: any;
    private _options: LOTTIE_OPTIONS;
    private _lottie?: AnimationItem;
    private _isReady: boolean = false;
    private _colorsProxy?: any;
    private _rawProperties?: ILottieProperty[];
    private _eventCallbacks: any = {};

    /**
     * 
     * @param animationLoader Provide "loadAnimation" here from lottie-web.
     * @param container DOM element in which the animation will be drawn.
     * @param iconData Lottie icon data.
     * @param options Options for lottie-web. If not provided default will be used.
     */
    constructor(animationLoader: AnimationLoader, container: HTMLElement, iconData: IconData, options?: LOTTIE_OPTIONS) {
        this._animationLoader = animationLoader;
        this._container = container;
        this._iconData = iconData;
        this._options = options || DEFAULT_LOTTIE_WEB_OPTIONS;
    }

    connect() {
        if (this._lottie) {
            throw new Error('Already connected player!');
        }

        this._lottie = this._animationLoader({
            ...this._options,
            container: this._container,
            animationData: deepClone(this._iconData),
        });

        this._lottie.addEventListener('complete', () => {
            this.triggerEvent('complete');
        });

        if (this._lottie.isLoaded) {
            this._isReady = true;
            this.triggerEvent('ready');
        } else {
            this._lottie.addEventListener('config_ready', () => {
                this._isReady = true;
                this.triggerEvent('ready');
            });
        }
    }

    disconnect() {
        if (!this._lottie) {
            throw new Error('Not connected player!');
        }

        this._isReady = false;

        this._lottie.destroy();
        this._lottie = undefined;

        this._colorsProxy = undefined;
        this._rawProperties = undefined;
    }

    addEventListener(name: PlayerEventName, callback: PlayerEventCallback): () => void {
        if (!this._eventCallbacks[name]) {
            this._eventCallbacks[name] = [];
        }
        this._eventCallbacks[name].push(callback);

        return () => {
            this.removeEventListener(name, callback);
        };
    }

    removeEventListener(eventName: PlayerEventName, callback?: PlayerEventCallback) {
        if (!callback) {
            this._eventCallbacks[eventName] = null;
        } else if (this._eventCallbacks[eventName]) {
            let i = 0;
            let len = this._eventCallbacks[eventName].length;
            while (i < len) {
                if (this._eventCallbacks[eventName][i] === callback) {
                    this._eventCallbacks[eventName].splice(i, 1);
                    i -= 1;
                    len -= 1;
                }
                i += 1;
            }
            if (!this._eventCallbacks[eventName].length) {
                this._eventCallbacks[eventName] = null;
            }
        }
    }

    protected triggerEvent(eventName: PlayerEventName, args?: any) {
        if (this._eventCallbacks[eventName]) {
            const callbacks = this._eventCallbacks[eventName];
            for (let i = 0; i < callbacks.length; i += 1) {
                callbacks[i](args);
            }
        }
    }

    /**
     * Play animation.
     */
    play() {
        this._lottie!.play();
    }

    /**
     * Play animation from begining.
     */
    playFromBegining() {
        this._lottie!.goToAndPlay(0);
    }

    /**
     * Stop animation.
     */
    stop() {
        this._lottie!.stop();
    }

    /**
     * Go to animation frame.
     * @param frame
     */
    goToFrame(frame: number) {
        this._lottie!.goToAndStop(frame, true);
    }

    /**
     * Go to first animation frame.
     */
    goToFirstFrame() {
        this.goToFrame(0);
    }

    /**
     * Go to last animation frame.
     */
    goToLastFrame() {
        this.goToFrame(Math.max(0, this._lottie!.getDuration(true) - 1));
    }

    /**
     * Set direction of animation.
     * @param direction Forward (1), backward (-1)
     */
    setDirection(direction: AnimationDirection) {
        this._lottie!.setDirection(direction);
    }

    /**
     * Enable or disable loop for this animation.
     * @param enabled
     */
    setLoop(enabled: boolean) {
        this._lottie!.loop = enabled;
    }

    /**
     * Controls speed of animation.
     * @param speed Animation speed (1 is normal speed)
     */
    setSpeed(speed: number) {
        this._lottie!.setSpeed(speed);
    }

    refresh() {
        this._lottie?.renderer.renderFrame(null);

        this.triggerEvent('refresh');
    }

    resetProperties(properties: IProperties = {}) {
        if (!properties || typeof properties !== 'object') {
            return;
        }

        // allows to optimize initial assign properties without redundant reset to default
        const alreadyCustomized = this._rawProperties ? true : false;

        // colors
        if (alreadyCustomized) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.type === 'color'),
            );
        }
        if (properties.colors && !isNil(properties.colors)) {
            for (const [key, value] of Object.entries(properties.colors)) {
                updateProperties(
                    this._lottie,
                    this.rawProperties.filter(c => c.type === 'color' && c.name === key.toLowerCase()),
                    value,
                );
            }
        }

        // state
        if (alreadyCustomized) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name.startsWith(STATE_PREFIX)),
            );
        }
        if (!isNil(properties.state) && properties.state) {
            const name = `${STATE_PREFIX}${properties.state.toLowerCase()}`;
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name.startsWith(STATE_PREFIX)),
                0,
            );
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === name),
                1,
            );
        }

        // stroke
        if (!isNil(properties.stroke)) {
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'stroke'),
                properties.stroke,
                { scale: PROPERTY_SCALE },
            );
        } else if (alreadyCustomized) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'stroke'),
            );
        }

        // scale
        if (!isNil(properties.scale)) {
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'scale'),
                properties.scale,
                { scale: PROPERTY_SCALE },
            );
        } else if (alreadyCustomized) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'scale'),
            );
        }

        // axis
        if (!isNil(properties.axis)) {
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'axis'),
                properties.axis,
                { scale: PROPERTY_SCALE },
            );
        } else if (alreadyCustomized) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'axis'),
            );
        }

        this.refresh();
    }


    /**
     * Assign multiple colors at once.
     */
    set colors(colors: IColors | null) {
        resetProperties(
            this._lottie,
            this.rawProperties.filter(c => c.type === 'color'),
        );

        if (colors) {
            for (const [key, value] of Object.entries(colors)) {
                updateProperties(
                    this._lottie,
                    this.rawProperties.filter(c => c.type === 'color' && c.name === key.toLowerCase()),
                    value,
                );
            }
        }

        this.refresh();
    }

    /**
     * Access to colors with convenient proxy.
     */
    get colors() {
        if (!this._colorsProxy) {
            this._colorsProxy = createColorsProxy(this);
        }

        return this._colorsProxy;
    }

    get stroke(): number | null {
        const property = this.rawProperties.filter(c => c.name === 'stroke')[0];
        if (property) {
            return get(this._lottie, property.path) * (PROPERTY_SCALE / property.value);
        }
        return null;
    }

    set stroke(stroke: number | null) {
        if (isNil(stroke)) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'stroke'),
            );
        } else {
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'stroke'),
                stroke,
                { scale: PROPERTY_SCALE },
            );
        }

        this.refresh();
    }

    get scale(): number | null {
        const property = this.rawProperties.filter(c => c.name === 'scale')[0];
        if (property) {
            return get(this._lottie, property.path) * (PROPERTY_SCALE / property.value);
        }
        return null;
    }

    set scale(scale: number | null) {
        if (isNil(scale)) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'scale'),
            );
        } else {
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'scale'),
                scale,
                { scale: PROPERTY_SCALE },
            );
        }

        this.refresh();
    }

    get state(): string | null {
        for (const property of this.rawProperties.filter(c => c.name.startsWith(STATE_PREFIX))) {
            const value = get(this._lottie, property.path);
            if (value) {
                return property.name.substr(STATE_PREFIX.length);
            }
        }

        return null;
    }

    set state(state: string | null) {
        if (isNil(state)) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'scale'),
            );
        } else {
            const name = `${STATE_PREFIX}${state!.toLowerCase()}`;
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name.startsWith(STATE_PREFIX)),
                0,
            );
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === name),
                1,
            );
        }

        this.refresh();
    }

    get axis(): { x: number, y: number } | null {
        const property = this.rawProperties.filter(c => c.name === 'axis')[0];
        if (property) {
            const x = get(this._lottie, property.path + '.0') * (PROPERTY_SCALE / property.value[0]);
            const y = get(this._lottie, property.path + '.1') * (PROPERTY_SCALE / property.value[1]);
            return { x, y };
        }
        return null;
    }

    set axis(axis: { x: number, y: number } | null) {
        if (isNil(axis)) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'axis'),
            );
        } else {
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'axis'),
                axis,
                { scale: PROPERTY_SCALE },
            );
        }

        this.refresh();
    }

    /**
     * Available states for current icon.
     */
    get states(): string[] {
        return this.rawProperties.filter(c => c.name.startsWith(STATE_PREFIX)).map(c => {
            return c.name.substr(STATE_PREFIX.length);
        });
    }

    /**
     * Checks whether the animation is in progress.
     */
    get inAnimation() {
        return !this._lottie!.isPaused;
    }

    /**
     * Check whether the animation is ready.
     */
    get isReady() {
        return this._isReady;
    }

    /**
     * Access to internal lottie player instance.
     */
    get lottie() {
        return this._lottie;
    }

    /**
     * Supported customizable properties by provided icon data.
     */
    get rawProperties(): ILottieProperty[] {
        if (!this._rawProperties && this._iconData) {
            this._rawProperties = properties(this._iconData, { lottieInstance: true });
        }

        return this._rawProperties || [];
    }
}