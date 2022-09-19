import { AnimationConfigWithData, AnimationConfigWithPath, AnimationItem } from "lottie-web";

export type LottieColor = [number, number, number];
export type LottieFieldType = 'color' | 'slider' | 'point' | 'checkbox';
export type LordiconFeature = 'css-variables';

/**
 * Interface for colors parameters.
 */
export interface IRGBColor {
    r: number;
    g: number;
    b: number;
}

/**
 * Interface for found property.
 */
export interface ILottieProperty {
    name: string;
    path: string;
    value: any;
    type: LottieFieldType;
}

/**
 * Interface for trigger.
 */
export interface ITrigger {
    /**
     * The trigger has been connected.
     */
    connect(): void;

    /**
     * The trigger has been disconnected.
     */
    disconnect(): void;
}

/**
 * Constructor for trigger.
 * @param element Our custom element 
 * @param targetElement Target used for events listening
 * @param lottie Lottie player instance
 */
export interface ITriggerConstructor {
    new(element: HTMLElement, lottie: AnimationItem): ITrigger;
}

/**
 * Icon loader.
 */
export type IconLoader = (name: string) => Promise<any>;

/**
 * Type for loadAnimation method from Lottie.
 */
export type AnimationLoader = (params: AnimationConfigWithPath | AnimationConfigWithData) => AnimationItem;
