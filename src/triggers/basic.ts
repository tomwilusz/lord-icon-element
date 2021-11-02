import { Base } from './base.js';

export interface ITargetEvent {
    name: string;
    options?: any;
}

/**
 * Basic trigger for manual usage.
 */
export class Basic extends Base {
    #events: any[] = [];

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