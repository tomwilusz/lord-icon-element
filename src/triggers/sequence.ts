import { IPlayer, ITrigger } from '../interfaces.js';

/**
 * Sequence player.
 * 
 * Example usage:
 * ```html
 * <lord-icon trigger="sequence" sequence="state:intro-empty,play,state:hover-empty,play,state:morph-fill,play,state:morph-erase,play,state:intro-empty,delay:first:last:500,play:reverse" src="/trash.json"></lord-icon>
 * ```
 */
export class Sequence implements ITrigger {
    protected sequenceIndex: number = 0;
    protected frameState: string | null = null;
    protected frameDelayFirst: number | null = null;
    protected frameDelayLast: number | null = null;
    protected timer: any;

    constructor(
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
        protected player: IPlayer,
    ) {
    }

    onReady() {
        this.step();
    }

    onComplete() {
        this.timer = setTimeout(() => {
            this.timer = null;
            this.frameDelayLast = null;

            this.step();
        }, this.frameDelayLast || 0);
    }

    onConnected() {
    }

    onDisconnected() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    step() {
        const numberRegex = /^\d*(\.\d+)?$/
        const steps = this.sequence.split(',');

        const step = steps[this.sequenceIndex];

        this.sequenceIndex++;
        if (this.sequenceIndex >= steps.length) {
            this.sequenceIndex = 0;
        }

        const [action, ...params] = step.split(':');

        if (action === 'play') {
            if (this.frameState) {
                this.player.state = this.frameState;
                this.frameState = null;
            }

            const hasReverse = params.includes('reverse');
            if (hasReverse) {
                this.player.goToLastFrame();
                this.player.direction = -1;
            } else {
                this.player.goToFirstFrame();
                this.player.direction = 1;
            }

            this.timer = setTimeout(() => {
                this.timer = null;
                this.frameDelayFirst = null;

                this.player.play();
            }, this.frameDelayFirst || 0);
        } else if (action === 'frame') {
            let frameIndex = 0;
            if (params.length && params[0].match(numberRegex)) {
                frameIndex = Math.max(0, Math.min(this.player.frames, +params[0]));
            }

            this.player.frame = frameIndex;

            this.timer = setTimeout(() => {
                this.timer = null;
                this.frameDelayFirst = null;

                this.step();
            }, this.frameDelayFirst || 0);
        } else if (action === 'state') {
            this.frameState = params[0];

            this.step();
        } else if (action === 'delay') {
            let value: number | null = null;

            for (const param of params) {
                if (param && param.match(numberRegex)) {
                    value = +param;
                }
            }

            if (value && value > 0) {
                if (params.includes('first') && params.includes('last')) {
                    this.frameDelayFirst = value;
                    this.frameDelayLast = value;
                } else if (params.includes('first')) {
                    this.frameDelayFirst = value;
                } else if (params.includes('last')) {
                    this.frameDelayLast = value;
                } else {
                    this.frameDelayFirst = value;
                }
            }

            this.step();
        } else {
            throw new Error(`Invalid sequence action: ${action}`);
        }
    }

    get sequence() {
        return this.element.getAttribute('sequence') || 'play';
    }
}