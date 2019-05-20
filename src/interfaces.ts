import { AnimationConfig, LottiePlayer } from "lottie-web";

/**
 * Interface for animation.
 */
export interface IAnimation {
    /**
     * The animation has been connected.
     */
    connectedCallback(): void;

    /**
     * The animation has been disconnected.
     */
    disconnectedCallback(): void;

    /**
     * Callback for animation enter.
     */
    enter(): void;

    /**
     * Callback for animation leave.
     */
    leave(): void;
}

/**
 * Interface for colors parameters.
 */
export interface IColor {
    r: number;
    g: number;
    b: number;
}

/**
 * Type for loadAnimation method from Lottie.
 */
export type LottieLoader = (params: AnimationConfig) => LottiePlayer;
