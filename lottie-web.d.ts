declare namespace Lottie {
    export interface AnimationConfig {
        animationData?: any;
        path?: string;
        loop?: boolean | number;
        autoplay?: boolean; 
        name?: string;
        renderer?: string;
        container?: any;
        preserveAspectRatio?: string;
        progressiveLoad?: boolean;
        hideOnTransparent?: boolean;
    }

    export class LottiePlayer {
        readonly isLoaded: boolean;
        loop: boolean;

        play(name?: string): void;
        goToAndPlay(value: any, isFrame?: boolean): void;
        setCurrentRawFrameValue(value: any): void;
        stop(name?: string): void;
        setSpeed(speed: number, name?: string): void;
        setDirection(direction: number, name?: string): void;
        setQuality(quality: string | number): void;
        destroy(): void;
        addEventListener(name: string, cb: () => void): void;
        getDuration(inFrames: boolean): number;
    }

    export function loadAnimation(params: AnimationConfig): LottiePlayer; 
}

declare module "lottie-web" {
    export = Lottie;
}
