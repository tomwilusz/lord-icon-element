import { AnimationItem } from 'lottie-web';
import { Base } from './base.js';

export interface ITargetEvent {
    name: string;
    options?: any;
}

/**
 * Basic helper for triggers.
 */
export class Basic extends Base {
    #events: any[] = [];

    constructor(
        protected readonly element: HTMLElement,
        protected readonly targetElement: HTMLElement,
        protected readonly lottie: AnimationItem,
    ) {
        super(element, targetElement, lottie);
    }

    addTargetEventListener(event: string|ITargetEvent, callback: () => any) {
        const newEvent: ITargetEvent = typeof event == 'string' ? { name: event } : event;
        const name = newEvent.name;

        this.#events.push({ name, callback });

        this.targetElement.addEventListener(name, callback, newEvent.options);
    }

    clearAllTargetEventsListeners() {
        for (const event of this.#events) {
            this.targetElement.removeEventListener(event.name, event.callback);
        }

        this.#events = [];
    }

    disconnectedCallback() {
        this.clearAllTargetEventsListeners();
        super.disconnectedCallback();
    }
}