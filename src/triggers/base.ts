import { AnimationItem, AnimationDirection } from 'lottie-web';
import { ITrigger } from '../interfaces';

/**
 * Base helper for triggers.
 */
export class Base implements ITrigger {
    #inAnimation: boolean = false;
    #isReady: boolean = false;
    #connected: boolean = false;

    constructor(
        protected readonly element: HTMLElement,
        protected readonly targetElement: HTMLElement,
        protected readonly lottie: AnimationItem,
    ) {
        const lottieReady = () => {
            if (this.#isReady) {
                return;
            }

            this.#isReady = true;
            this.ready();
        }

        lottie.addEventListener('complete', () => {
            this.#inAnimation = false;
            this.complete();
        });

        lottie.addEventListener('config_ready', lottieReady);    
        if (this.lottie.isLoaded) {
            lottieReady();
        }
    }

    /**
     * The animation has been connected.
     */
    connectedCallback() {
        this.#connected = true;
    }

    /**
     * The animation has been disconnected.
     */
    disconnectedCallback() {
        this.#connected = false;
    }

    /**
     * Callback for animation ready.
     */
    ready() {}

    /**
     * Callback for animation complete.
     */
    complete() {}

    /**
     * Play animation.
     */
    play() {
        this.#inAnimation = true;
        this.lottie.play();
    }

    /**
     * Play animation from begining.
     */
    playFromBegining() {
        this.#inAnimation = true;
        this.lottie.goToAndPlay(0);
    }

    /**
     * Stop animation.
     */
    stop() {
        this.lottie.stop();
    }

    /**
     * Go to animation frame.
     * @param frame
     */
    goToFrame(frame: number) {
        this.lottie.goToAndStop(frame, true);
    }

    /**
     * Go to first animation frame.
     */
    goToFirstFrame() {
        this.goToFrame(0);
    }

    /**
     * Go to last animation frame.
     */
    goToLastFrame() {
        this.goToFrame(Math.max(0, this.lottie.getDuration(true) - 1));
    }

    /**
     * Set direction of animation.
     * @param direction Forward (1), backward (-1)
     */
    setDirection(direction: AnimationDirection) {
        this.lottie.setDirection(direction);
    }

    /**
     * Enable or disable loop for this animation.
     * @param enabled
     */
    setLoop(enabled: boolean) {
        this.lottie.loop = enabled;
    }

    /**
     * Controls speed of animation.
     * @param speed Animation speed (1 is normal speed)
     */
    setSpeed(speed: number) {
        this.lottie.setSpeed(speed);
    }

    /**
     * Checks whether the animation is in progress.
     */
    get inAnimation() {
        return this.#inAnimation;
    }

    /**
     * Check whether the animation is ready.
     */
    get isReady() {
        return this.#isReady;
    }

    /**
     * Trigger is connected.
     */
    get connected() {
        return this.#connected;
    }
}