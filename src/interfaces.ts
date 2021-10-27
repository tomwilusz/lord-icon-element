import { AnimationItem, AnimationConfigWithPath, AnimationConfigWithData } from "lottie-web";

export type LottieColor = [number, number, number];
export type LottieFieldType = 'color' | 'slider' | 'point' | 'checkbox';

/**
 * Constructor for trigger.
 * @param element Our custom element 
 * @param targetElement Target used for events listening
 * @param lottie Lottie player instance
 */
export interface ITriggerConstructor {
    new (element: HTMLElement, targetElement: HTMLElement, lottie: AnimationItem): ITrigger;
}

/**
 * Interface for trigger.
 */
export interface ITrigger {
    /**
     * The trigger has been connected.
     */
    connectedCallback(): void;

    /**
     * The trigger has been disconnected.
     */
    disconnectedCallback(): void;
}

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
export interface ILottieField {
    name: string;
    path: string;
    value: any;
    type: LottieFieldType;
}

/**
 * Type for loadAnimation method from Lottie.
 */
export type LottieLoader = (params: AnimationConfigWithPath | AnimationConfigWithData) => AnimationItem;