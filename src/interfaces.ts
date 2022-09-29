/**
 * Icon data in JSON format. Our player is optimized to handle icons from [lordicon.com](https://lordicon.com/).
 */
export type IconData = any;

/**
 * Supported event types by our {@link IPlayer | player}.
 */
export type PlayerEventName = 'ready' | 'refresh' | 'complete' | 'frame';

/**
 * Callback type for {@link IPlayer | player}.
 */
export type PlayerEventCallback = () => void;

/**
 * Callback with custom icon loader. Allows our {@link element.Element | Element} to load {@link IconData | icon data} from any source.
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
 * @param name Icon name.
 */
export type IconLoader = (name: string) => Promise<IconData>;

/**
 * Defines the callback that will create {@link IPlayer | player instance} on {@link element.Element | Element} demand.
 * 
 * Some use cases for providing own player factory:
 * 
 * - Abandon use {@link index.defineElement | defineElement} which defines default triggers potentially redundant for you (in this case remember to assign player factory before defining custom element).
 * - Allows to provide your own {@link IPlayer | player} implementation. 
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
 */
export type PlayerFactory = (container: HTMLElement, iconData: IconData) => IPlayer;

/**
 * Animation direction supported by {@link IPlayer | player instance}. 1 is forward and -1 is reverse.
 */
export type AnimationDirection = 1 | -1;

/**
 * Interface for an x-y point in a two-dimensional space.
 * 
 * Example:
 * ```js
 * {
 *     x: 50,
 *     y: 50,
 * }
 * ```
 */
export interface IPoint {
    /**
     * X value.
     */
    x: number;

    /**
     * Y value.
     */
    y: number;
}

/**
 * Interface for object that stores multiple colors.
 * 
 * Example:
 * ```js
 * {
 *     primary: 'red',
 *     secondary: '#ff0000', 
 * }
 * ```
 */
export interface IColors {
    [key: string]: string;
}

/**
 * Interface for object with customizable properties supported by our {@link IPlayer | player}.
 * 
 * Notice: not every icon support all of that properties. This usually depends by icon family.
 * 
 * Example:
 * ```js
 * {
 *     stroke: 50,
 *     scale: 50,
 *     colors: {
 *         primary: 'red',
 *     },
 * }
 * ```
 */
export interface IProperties {
    /**
     * Stroke. Number in range: 0-100.
     */
    stroke?: number | null;

    /**
     * Scale. Number in range: 0-100.
     */
    scale?: number | null;

    /**
     * State.
     */
    state?: string | null;

    /**
     * Axis.
     */
    axis?: IPoint | null;

    /**
     * Colors.
     */
    colors?: IColors | null;
}

/**
 * Interface for trigger. Triggers provides interactions strategies which can be handled by our {@link element.Element | Element}. 
 * Implement this interface while creating new trigger.
 * You can get access to current _element_, _targetElement_ and _player_ from trigger {@link interfaces.ITriggerConstructor | constructor}.
 * 
 * Example:
 * ```js
 * import lottie from 'lottie-web';
 * import { defineElement } from 'lord-icon-element';
 * import { Element } from 'lord-icon-element/element';
 * 
 * class Custom {
 *     element;
 *     targetElement;
 *     player;
 * 
 *     constructor(element, targetElement, player) {
 *         this.element = element;
 *         this.targetElement = targetElement;
 *         this.player = player;
 *     }
 * 
 *     onReady() {
 *         this.player.play();
 *     }
 * }
 * 
 * Element.defineTrigger('custom', Custom);
 * 
 * defineElement(lottie.loadAnimation);
 * ```
 */
export interface ITrigger {
    /**
     * The trigger has been connected with {@link element.Element | Element}.
     */
    onConnected?: () => void;

    /**
     * The trigger has been disconnected from {@link element.Element | Element}.
     * 
     * Notice: remember to remove here all potential event listeners you assigned earlier.
     */
    onDisconnected?: () => void;

    /**
     * The {@link IPlayer | player} is ready. Now you can control animation and icon properties with it.
     */
    onReady?: () => void;

    /**
     * The {@link IPlayer | player} was refreshed. For example by icon customization.
     */
    onRefresh?: () => void;

    /**
     * The {@link IPlayer | player} completes an animation.
     */
    onComplete?: () => void;

    /**
     * The {@link IPlayer | player} renders frame.
     */
    onFrame?: () => void;
}

/**
 * Definition of supported trigger constructor.
 */
export interface ITriggerConstructor {
    /**
     * @param element Our custom element. 
     * @param targetElement Target element for events listening.
     * @param player Player instance.
     */
    new(element: HTMLElement, targetElement: HTMLElement, player: IPlayer): ITrigger;
}

/**
 * Interface for animation player.
 * Provides simple API to control animation and customize icon properties on the fly.
 * Allows to react on animation life cycle.
 */
export interface IPlayer {
    /**
     * Connect player with element.
     */
    connect(): void;

    /**
     * Disconnect player from element.
     */
    disconnect(): void;

    /**
     * Start listening for event.
     * @param name Event name.
     * @param callback Event callback.
     */
    addEventListener(name: PlayerEventName, callback: PlayerEventCallback): () => void;

    /**
     * Stop listening for event.
     * @param eventName Event name.
     * @param callback Event callback.
     */
    removeEventListener(eventName: PlayerEventName, callback?: PlayerEventCallback): void;

    /**
     * Play animation. 
     * 
     * Notice: finished animation can't be played again on last frame.
     */
    play(): void;

    /**
     * Play animation from begining.
     */
    playFromBegining(): void;

    /**
     * Pause animation;
     */
    pause(): void;

    /**
     * Stop animation.
     */
    stop(): void;

    /**
     * Go to frame.
     * @param frame Frame number.
     */
    goToFrame(frame: number): void;

    /**
     * Go to first animation frame.
     */
    goToFirstFrame(): void;

    /**
     * Go to last animation frame.
     */
    goToLastFrame(): void;

    /**
     * Reset properties to default and assign new one from provided param.
     * 
     * @param properties New properties to assign.
     */
    resetProperties(properties?: IProperties): void;

    /**
     * Access to icon colors.
     * With this object you can check supported colors by loaded icon or update any color with convenient way.
     * 
     * Example (list all supported colors by icon):
     * ```js
     * { ...iconElement.player.colors }
     * ```
     * 
     * Example (update just single color):
     * ```js
     * iconElement.player.colors.primary = '#ff0000';
     * ```
     * 
     * Example (update many colors at once):
     * ```js
     * iconElement.player.colors = { primary: 'red', secondary: 'blue' };
     * ```
     * 
     * Example (reset all colors to default):
     * ```js
     * iconElement.player.colors = null;
     * ```
     */
    colors: IColors | null;

    /**
     * Access to icon stroke.
     */
    stroke: number | null;

    /**
     * Access to icon scale.
     */
    scale: number | null;

    /**
     * Access to icon axis.
     */
    axis: IPoint | null;

    /**
     * Access to icon state. 
     * States allow to switch between multiple animations build into single icon file. 
     */
    state: string | null;

    /**
     * Access to playing speed. 
     */
    speed: number;

    /**
     * Access to player frame. You can control animation playing with changing this frame.
     */
    frame: number;

    /**
     * Access to player playing direction.
     */
    direction: AnimationDirection;

    /**
     * Allow control player loop. 
     */
    loop: boolean;

    /**
     * Player is ready.
     */
    readonly isReady: boolean;

    /**
     * Player is playing animation.
     */
    readonly isPlaying: boolean;

    /**
     * List of supported states by loaded icon.
     */
    readonly states: string[];

    /**
     * Animation frames inside loaded icon.
     */
    readonly frames: number;

    /**
     * Animation duration (in seconds).
     */
    readonly duration: number;
}
