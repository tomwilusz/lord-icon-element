/**
 * Icon data in JSON format. This player is optimized to handle JSON (Lordicon Lottie) icons from [Lordicon Library](https://lordicon.com/).
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
 * - Abandon use {@link index.defineElement | defineElement} which defines default triggers as potentially redundant (in this case assign player factory before defining custom element).
 * - Allows to provide custom (your own) {@link IPlayer | player} implementation. 
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
 * Animation direction supported by {@link IPlayer | player instance}. "1" plays animation forward and "-1" plays the animation in reverse.
 */
export type AnimationDirection = 1 | -1;

/**
 * Interface for the object that stores multiple colors.
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
 * Interface for an object with customizable properties supported by {@link IPlayer | player}.
 * 
 * Notice: not every icon support all of that properties. This usually depends on the icon family.
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
     * Stroke width in the range: 0-100.
     */
    stroke?: number | null;

    /**
     * State (motion type) of the icon. States allow switching between multiple animations built into a single icon file.
     */
    state?: string | null;

    /**
     * Colors.
     */
    colors?: IColors | null;
}

/**
 * Interface for animation player. 
 * Provides simple API to control animation and customize icon properties on the fly.
 */
export interface IPlayer {
    /**
     * Connect the player with the element.
     */
    connect(): void;

    /**
     * Disconnect the player from the element.
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
     * Notice: finished animation can't be played again on the last frame.
     */
    play(): void;

    /**
     * Play animation from beginning.
     */
    playFromBegining(): void;

    /**
     * Pause animation.
     */
    pause(): void;

    /**
     * Stop animation.
     */
    stop(): void;

    /**
     * Go to the extact frame.
     * @param frame Frame number.
     */
    goToFrame(frame: number): void;

    /**
     * Go to the first animation frame.
     */
    goToFirstFrame(): void;

    /**
     * Go to the last animation frame.
     */
    goToLastFrame(): void;

    /**
     * Reset properties to default and optionally assign new one from provided param.
     * 
     * @param properties New properties to assign.
     */
    resetProperties(properties?: IProperties): void;

    /**
     * This property let you find out customizable colors or update them within a processed icon.
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
     * Stroke gives you the value of icon stroke width.
     */
    stroke: number | null;

    /**
     * This property allows to control state (motion type) of the icon.
     * States allow switching between multiple animations build into single icon file.
     */
    state: string | null;

    /**
     * This property allows to control the speed of the icon animation.
     */
    speed: number;

    /**
     * Access to player frame. You can control animation playing with changing this frame.
     */
    frame: number;

    /**
     * Direction lets you influence the playing course of the animation. Whether it plays forward (1) or reverse (-1).
     */
    direction: AnimationDirection;

    /**
     * This property allows to control player loop.
     */
    loop: boolean;

    /**
     * The player is ready.
     */
    readonly isReady: boolean;

    /**
     * The player is playing animation.
     */
    readonly isPlaying: boolean;

    /**
     * States give you the list of supported states by a processed icon.
     */
    readonly states: string[];

    /**
     * Frames give you the value of animation length in a number of frames.
     */
    readonly frames: number;

    /**
     * Duration gives you the value of animation length in seconds.
     */
    readonly duration: number;
}

/**
 * This is an interface for the trigger. Triggers provide interaction chains that can be handled by {@link element.Element | Element}. 
 * Implement this interface while creating new trigger.
 * You can get access to the current _element_, _targetElement_ and _player_ from trigger {@link interfaces.ITriggerConstructor | constructor}.
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
     * The {@link interfaces.IPlayer | player} is ready. Now you can control animation and icon properties with it.
     */
    onReady?: () => void;

    /**
     * The {@link interfaces.IPlayer | player} was refreshed. For example by icon customization.
     */
    onRefresh?: () => void;

    /**
     * The {@link interfaces.IPlayer | player} completes an animation.
     */
    onComplete?: () => void;

    /**
     * The {@link interfaces.IPlayer | player} renders frame.
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