import { LottiePlayer } from 'lottie-web';
import { IAnimation } from '../interfaces';

/**
 * Basic implementation for supported animations.
 */
export class Basic implements IAnimation {
    private myInAnimation: boolean = false;
    private myIsReady: boolean = false;
    private myLeaveBound: any;
    private myEnterBound: any;

    constructor(
        protected readonly element: HTMLElement,
        protected readonly lottie: LottiePlayer,
    ) {
        this.myEnterBound = this.enter.bind(this);
        this.myLeaveBound = this.leave.bind(this);

        const ready = () => {
            if (this.myIsReady) {
                return;
            }

            this.myIsReady = true;
            this.ready();
        }

        lottie.addEventListener('complete', () => {
            this.myInAnimation = false;
            this.complete();
        });

        lottie.addEventListener('config_ready', ready);    

        if (this.lottie.isLoaded) {
            ready();
        }
    }

    /**
     * The animation has been connected.
     */
    connectedCallback() {}

    /**
     * The animation has been disconnected.
     */
    disconnectedCallback() {}

    /**
     * Callback for animation ready.
     */
    ready() {}

    /**
     * Callback for animation complete.
     */
    complete() {}

    /**
     * Callback for animation enter.
     */
    enter() {}

    /**
     * Callback for animation leave.
     */
    leave() {}

    /**
     * Play animation.
     */
    play() {
        this.myInAnimation = true;
        this.lottie.play();
    }

    /**
     * Play animation from begining.
     */
    playFromBegining() {
        this.myInAnimation = true;
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
     * @param value
     */
    goToFrame(value: number) {
        this.lottie.setCurrentRawFrameValue(value);
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
        this.goToFrame(this.lottie.getDuration(true));
    }

    /**
     * Set direction of animation.
     * Forward (1) and backward (-1).
     */
    setDirection(direction: number) {
        this.lottie.setDirection(direction);
    }

    /**
     * Enable or disable loop for this animation.
     * @param value
     */
    setLoop(value: boolean) {
        this.lottie.loop = value;
    }

    /**
     * Controls speed of animation (1 is normal speed).
     * @param value
     */
    setSpeed(value: number) {
        this.lottie.setSpeed(value);
    }

    /**
     * Checks whether the animation is in progress.
     */
    get inAnimation() {
        return this.myInAnimation;
    }

    /**
     * Check whether the animation is ready.
     */
    get isReady() {
        return this.myIsReady;
    }

    /**
     * Bounded version of enter callback.
     */
    get enterBound() {
        return this.myEnterBound;
    }

    /**
     * Bounded version of leave callback.
     */
    get leaveBound() {
        return this.myLeaveBound;
    }
}