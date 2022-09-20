import { AnimationDirection, AnimationItem } from 'lottie-web';
import { ITrigger } from './interfaces';

export interface ITargetEvent {
    name: string;
    options?: any;
}

/**
 * Main trigger. Important for creating new one.
 */
export class Trigger implements ITrigger {
    private _inAnimation: boolean = false;
    private _isReady: boolean = false;
    private _isConnected: boolean = false;
    private _events: any[] = []

    constructor(
        protected readonly element: HTMLElement,
        protected readonly lottie: AnimationItem,
    ) {
        const lottieReady = () => {
            if (this._isReady) {
                return;
            }

            this._isReady = true;
            this.onReady();
        }

        lottie.addEventListener('complete', () => {
            this._inAnimation = false;
            this.onComplete();
        });

        lottie.addEventListener('config_ready', lottieReady);

        if (this.lottie.isLoaded) {
            lottieReady();
        }
    }

    /**
     * The trigger has been connected.
     */
    connect() {
        this._isConnected = true;

        this.onConnected();
    }

    /**
     * The trigger has been disconnected.
     */
    disconnect() {
        this._isConnected = false;
        this.clearAllTargetEventsListeners();

        this.onDisconnected();
    }

    /**
     * The animation has been connected.
     */
    onConnected() { }

    /**
     * The animation has been disconnected.
     */
    onDisconnected() { }

    /**
     * Callback for animation ready.
     */
    onReady() { }

    /**
     * Callback for animation complete.
     */
    onComplete() { }

    addTargetEventListener(event: string | ITargetEvent, callback: () => any) {
        const newEvent: ITargetEvent = typeof event == 'string' ? { name: event } : event;
        const name = newEvent.name;

        this._events.push({ name, callback });

        this.targetElement.addEventListener(name, callback, newEvent.options);
    }

    clearAllTargetEventsListeners() {
        for (const event of this._events) {
            this.targetElement.removeEventListener(event.name, event.callback);
        }

        this._events = [];
    }

    /**
     * Play animation.
     */
    play() {
        this._inAnimation = true;
        this.lottie.play();
    }

    /**
     * Play animation from begining.
     */
    playFromBegining() {
        this._inAnimation = true;
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
        return this._inAnimation;
    }

    /**
     * Check whether the animation is ready.
     */
    get isReady() {
        return this._isReady;
    }

    /**
     * Trigger is connected.
     */
    get isConnected() {
        return this._isConnected;
    }

    /**
     * Get target element.
     */
    get targetElement() {
        const element = this.element;
        const targetProperty = element.getAttribute('target');
        const target = targetProperty ? element.closest(targetProperty) : null;

        return target || element;
    }
}