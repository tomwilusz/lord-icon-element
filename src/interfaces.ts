import { AnimationConfig, LottiePlayer } from "lottie-web";

export type LottieColor = [number, number, number];
export type LottieFieldType = 'color' | 'slider' | 'point' | 'checkbox';

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

    /**
     * Callback for trigger enter.
     */
    enter(): void;

    /**
     * Callback for trigger leave.
     */
    leave(): void;
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
export type LottieLoader = (params: AnimationConfig) => LottiePlayer;
