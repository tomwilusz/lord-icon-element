import { AnimationConfigWithData, AnimationConfigWithPath, AnimationItem } from "lottie-web";

export type IconData = any;

export type PlayerEventName = 'complete' | 'ready' | 'refresh';

export type PlayerEventCallback = () => void;

/**
 * Icon loader.
 */
export type IconLoader = (name: string) => Promise<IconData>;

export type PlayerLoader = (container: HTMLElement, iconData: IconData) => IPlayer;

/**
 * Type for loadAnimation method from Lottie.
 */
export type AnimationLoader = (params: AnimationConfigWithPath | AnimationConfigWithData) => AnimationItem;


export type IconFeature = 'css-variables';

export interface IColors {
    [key: string]: string;
}

export interface IPoint {
    x: number;
    y: number;
}

export interface IProperties {
    colors?: IColors | null;
    state?: string | null;
    stroke?: number | null;
    scale?: number | null;
    axis?: IPoint | null;
}

export interface IPlayer {
    connect(): void;
    disconnect(): void;

    addEventListener(name: PlayerEventName, callback: PlayerEventCallback): () => void;
    removeEventListener(eventName: PlayerEventName, callback?: PlayerEventCallback): void;

    play(): void;
    playFromBegining(): void;
    stop(): void;
    goToFrame(frame: number): void;
    goToFirstFrame(): void;
    goToLastFrame(): void;
    setDirection(direction: number): void;
    setLoop(enabled: boolean): void;
    setSpeed(speed: number): void;

    resetProperties(properties?: IProperties): void;

    colors: IColors | null;
    stroke: number | null;
    scale: number | null;
    state: string | null;
    axis: { x: number, y: number } | null;

    readonly isReady: boolean;
    readonly inAnimation: boolean;
    readonly states: string[];
}

/**
 * Interface for trigger.
 */
export interface ITrigger {
    /**
     * The trigger has been connected.
     */
    onConnected?: () => void;

    /**
     * The trigger has been disconnected.
     */
    onDisconnected?: () => void;

    /**
     * The trigger is ready to playing animation.
     */
    onReady?: () => void;

    /**
     * Animation is complete.
     */
    onComplete?: () => void;

    /**
     * Animation was refreshed.
     */
    onRefresh?: () => void;
}

/**
 * Constructor for trigger.
 * @param element Our custom element 
 * @param targetElement Target used for events listening
 * @param lottie Lottie player instance
 */
export interface ITriggerConstructor {
    new(element: HTMLElement, targetElement: HTMLElement, player: IPlayer): ITrigger;
}
