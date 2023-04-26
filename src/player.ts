import { AnimationConfig, AnimationConfigWithData, AnimationConfigWithPath, AnimationDirection, AnimationItem } from 'lottie-web';
import { IColors, IconData, IPlayer, IProperties, PlayerEventCallback, PlayerEventName } from './interfaces.js';
import { deepClone, get, isNil } from './utils/helpers.js';
import { ILottieProperty, SCALE_STROKE, lottieColorToHex, properties, resetProperties, updateProperties } from './utils/lottie.js';

/**
 * Type for options supported by {@link player.Player | Player}.
 */
export type LottieOptions = Omit<AnimationConfig, 'container'>;

/**
 * Type for `loadAnimation` method from `lottie-web` package.
 */
export type AnimationLoader = (params: AnimationConfigWithPath | AnimationConfigWithData) => AnimationItem;

/**
 * Prefix for icon states. Properties with this prefix are handled as icon states.
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
        progressiveLoad: true,
        hideOnTransparent: true,
    },
}

/**
 * Create convenient proxy for manipulating colors.
 */
function createColorsProxy(this: Player) {
    return new Proxy<Player>(this, {
        set: (target, property, value, receiver): boolean => {
            if (typeof property === 'string') {
                if (value) {
                    updateProperties(
                        this.lottie,
                        this.rawProperties.filter(c => c.type === 'color' && c.name === property.toLowerCase()),
                        value,
                    );
                } else {
                    resetProperties(
                        this.lottie,
                        this.rawProperties.filter(c => c.type === 'color' && c.name === property.toLowerCase()),
                    );
                }
                target.refresh();
            }
            return true;
        },
        get: (target, property, receiver) => {
            for (const current of target.rawProperties) {
                if (current.type == 'color' && typeof property === 'string' && property.toLowerCase() == current.name) {
                    const data = get(this.lottie, current.path);
                    // console.log('---color data', this.lottie, current.name, data);
                    if (data) {
                        return lottieColorToHex(data);
                    }
                }
            }
            return undefined;
        },
        deleteProperty: (target, property) => {
            if (typeof property === 'string') {
                resetProperties(
                    this.lottie,
                    this.rawProperties.filter(c => c.type === 'color' && c.name === property.toLowerCase()),
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

interface IState {
    time: number;
    duration: number;
    name: string;
    default?: boolean;
}

/**
 * The player implementation as a wrapper around `lottie-web`.
 * 
 * Main purposes:
 * 
 * - Provides simple API to control animation and customize icon properties on the fly.
 * - Allows to react on the animation life cycle.
 * - Separate integration with `lottie-web` from our custom element. That way, the player can potentially work without a _custom element_.
 * - Simplifies custom element implementation.
 * - Simplifies testing.
 */
export class Player implements IPlayer {
    protected _animationLoader: AnimationLoader;
    protected _container: HTMLElement;
    protected _iconData: any;
    protected _options: LottieOptions;
    protected _lottie?: AnimationItem;
    protected _isReady: boolean = false;
    protected _colorsProxy?: any;
    protected _direction: AnimationDirection = 1;
    protected _speed: number = 1;
    protected _rawProperties?: ILottieProperty[];
    protected _eventCallbacks: any = {};

    protected _state?: IState;
    protected _states?: IState[];

    /**
     * 
     * @param animationLoader Provide `loadAnimation` here from `lottie-web`.
     * @param container DOM element in which the animation will be drawn.
     * @param iconData Lottie icon data.
     * @param options Options for `lottie-web`. If not provided {@link DEFAULT_LOTTIE_WEB_OPTIONS | default} will be used.
     */
    constructor(animationLoader: AnimationLoader, container: HTMLElement, iconData: IconData, options?: LottieOptions) {
        this._animationLoader = animationLoader;
        this._container = container;
        this._iconData = iconData;
        this._options = options || DEFAULT_LOTTIE_WEB_OPTIONS;

        if (iconData.markers && iconData.markers.length) {
            this._states = iconData.markers.map((c: any) => {
                const [partA, partB] = c.cm.split(':');
                const newState: IState = {
                    time: c.tm,
                    duration: c.dr,
                    name: partB || partA,
                    default: partB && partA.includes('default') ? true : false,
                };

                return newState;
            });

            // select default state
            for (const state of this._states || []) {
                if (state.default) {
                    this._state = state;
                }
            }

            // select first and last state
            const firstState = this._states?.[0]!;
            const lastState = this._states?.[this._states!.length - 1]!;

            console.log('---states', this._states);
            console.log('---state', this._state);

            // fix animation states
            iconData.ip = firstState.time;
            iconData.op = lastState.time + lastState.duration + 1;
        }
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

        this._lottie.addEventListener('loopComplete', () => {
            this.triggerEvent('complete');
        });

        this._lottie.addEventListener('enterFrame', (params) => {
            this.triggerEvent('frame');
        });

        if (this._lottie.isLoaded) {
            this._container.classList.add('ready');
            this._isReady = true;
            this.triggerEvent('ready');
        } else {
            this._lottie.addEventListener('config_ready', () => {
                this._container.classList.add('ready');
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

        this._container.classList.remove('ready');
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

    /**
     * Trigger event.
     * @param eventName Event name.
     * @param args Args.
     */
    protected triggerEvent(eventName: PlayerEventName, args?: any) {
        if (this._eventCallbacks[eventName]) {
            const callbacks = this._eventCallbacks[eventName];
            for (let i = 0; i < callbacks.length; i += 1) {
                callbacks[i](args);
            }
        }
    }

    /**
     * Refresh animation and notify about that fact.
     */
    protected refresh() {
        this._lottie?.renderer.renderFrame(null);

        this.triggerEvent('refresh');
    }

    play() {
        console.log('---play', this._state);

        console.log('---raw properties', this._rawProperties);

        if (this._state) {
            this._lottie!.playSegments([this._state.time, this._state.time + this._state.duration], true);
        } else {
            this._lottie!.play();
        }
    }

    playFromBegining() {
        if (this._state) {
            this._lottie!.playSegments([this._state.time, this._state.time + this._state.duration], true);
        } else {
            this._lottie!.goToAndPlay(0);
        }
    }

    pause() {
        this._lottie!.pause();
    }

    stop() {
        this._lottie!.stop();
    }

    goToFrame(frame: number) {
        this._lottie!.goToAndStop(frame, true);
    }

    goToFirstFrame() {
        this.goToFrame(0);
    }

    goToLastFrame() {
        this.goToFrame(Math.max(0, this._lottie!.getDuration(true) - 1));
    }

    resetProperties(properties: IProperties = {}) {
        if (!properties || typeof properties !== 'object') {
            return;
        }

        console.log('---resetProperties', properties, this._state, this._states);

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
        if (this._states) {
            const currentState = properties.state ? this._states.filter(c => c.name === properties.state)[0] : this._states[0];
            if (currentState) {
                this._state = currentState;
                this.frame = currentState.time;
            }
        } else {
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
        }

        // stroke
        if (!isNil(properties.stroke)) {
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'stroke'),
                properties.stroke,
            );
        } else if (alreadyCustomized) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'stroke'),
            );
        }

        this.refresh();
    }

    xxx(name: string, value: any) {
        updateProperties(
            this._lottie,
            this.rawProperties.filter(c => c.type === 'pseudo' && c.name === name),
            value,
        );
    }

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

    get colors() {
        if (!this._colorsProxy) {
            this._colorsProxy = createColorsProxy.call(this);
        }

        return this._colorsProxy;
    }

    set stroke(stroke: number | null) {
        if (isNil(stroke)) {
            resetProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'stroke' || c.name === 'stroke-layers'),
            );
        } else {
            updateProperties(
                this._lottie,
                this.rawProperties.filter(c => c.name === 'stroke' || c.name === 'stroke-layers'),
                stroke,
            );
        }

        this.refresh();
    }

    get stroke(): number | null {
        const keys = this.rawProperties.map(c => c.name);

        if (keys.includes('stroke-layers')) {
            const property = this.rawProperties.filter(c => c.name === 'stroke' || c.name === 'stroke-layers')[0];
            const value = get(this._lottie, property.path);
            return isNaN(value) ? null : value;
        } else if (keys.includes('stroke')) {
            const property = this.rawProperties.filter(c => c.name === 'stroke')[0];
            const value = get(this._lottie, property.path) * property.value / SCALE_STROKE;
            return isNaN(value) ? null : value;
        }

        return null;
    }

    set state(state: string | null) {
        console.log('---set state', state);
        if (this._states) {
            const isPlaying = this.isPlaying;
            const newState = this._states.filter(c => c.name === state)[0];
            if (newState) {
                this._state = newState;
                this.frame = newState.time;

                if (isPlaying) {
                    this.pause();
                    this.play();
                }
            }
        } else {
            if (isNil(state)) {
                resetProperties(
                    this._lottie,
                    this.rawProperties.filter(c => c.name.startsWith(STATE_PREFIX)),
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
    }

    get state(): string | null {
        if (this._state) {
            return this._state.name;
        }

        for (const property of this.rawProperties.filter(c => c.name.startsWith(STATE_PREFIX))) {
            const value = get(this._lottie, property.path);
            if (value) {
                return property.name.substr(STATE_PREFIX.length);
            }
        }

        return null;
    }

    set speed(speed: number) {
        this._speed = speed;
        this._lottie?.setSpeed(speed);
    }

    get speed() {
        return this._speed;
    }

    set direction(direction: AnimationDirection) {
        this._direction = direction;
        this._lottie!.setDirection(direction);
    }

    get direction() {
        return this._direction;
    }

    set loop(loop: boolean) {
        this._lottie!.loop = loop;
    }

    get loop() {
        return this._lottie!.loop ? true : false;
    }

    get properties(): IProperties {
        return {
            colors: { ...this.colors },
            state: this.state,
            stroke: this.stroke,
        };
    }

    set frame(frame: number) {
        this.goToFrame(Math.max(0, Math.min(this.frames, frame)));
    }

    get frame() {
        return this._lottie!.currentFrame;
    }

    get states(): string[] {
        if (this._states) {
            return this._states.map(c => c.name);
        }

        return this.rawProperties.filter(c => c.name.startsWith(STATE_PREFIX)).map(c => {
            return c.name.substr(STATE_PREFIX.length);
        });
    }

    get isPlaying() {
        return !this._lottie!.isPaused;
    }

    get isReady() {
        return this._isReady;
    }

    get frames() {
        return this._lottie!.getDuration(true) - 1;
    }

    get duration() {
        return this._lottie!.getDuration(false);
    }

    /**
     * Access to internal lottie player instance.
     */
    get lottie() {
        return this._lottie;
    }

    /**
     * Supported customizable properties by loaded icon.
     */
    get rawProperties(): ILottieProperty[] {
        if (!this._rawProperties && this._iconData) {
            this._rawProperties = properties(this._iconData, { lottieInstance: true });
        }

        return this._rawProperties || [];
    }
}