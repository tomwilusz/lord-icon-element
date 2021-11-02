import { AnimationItem, AnimationConfigWithPath, AnimationConfigWithData } from "lottie-web";

export type LottieColor = [number, number, number];
export type LottieFieldType = 'color' | 'slider' | 'point' | 'checkbox';

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
    connectedCallback(): void;

    /**
     * The trigger has been disconnected.
     */
    disconnectedCallback(): void;
}

/**
 * Constructor for trigger.
 * @param element Our custom element 
 * @param targetElement Target used for events listening
 * @param lottie Lottie player instance
 */
export interface ITriggerConstructor {
    new (element: HTMLElement & IElement, lottie: AnimationItem): ITrigger;
}

/**
 * Interface for our custom element.
 */
export interface IElement {
    connectedTrigger?: ITrigger;
    properties: ILottieProperty[];
    states: string[];
    
    icon: any;
    src: string|null;
    state: string|null;
    colors: string|null;
    trigger: string|null;
    speed: number|null;
    stroke: number|null;
    scale: number|null;
    axisX: number|null;
    axisY: number|null;
}

/**
 * Type for loadAnimation method from Lottie.
 */
export type LottieAnimationLoader = (params: AnimationConfigWithPath | AnimationConfigWithData) => AnimationItem;