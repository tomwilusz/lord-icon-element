import { LottiePlayer, AnimationConfig } from 'lottie-web';
import { IAnimation } from '../interfaces.js';
import { replacePalette, replaceParams } from '../helpers/lottie.js';
import { deepClone } from '../helpers/utils.js';
import { loadIcon, loadLottieAnimation, registerIcon, registerLoader, registerAnimation, connectInstance, disconnectInstance,
    getIcon, getAnimation } from './manager.js';

const ELEMENT_STYLE = `
    :host {
        display: inline-flex;
        width: 32px;
        height: 32px;
        align-items: center;
        justify-content: center;
        position: relative;
        vertical-align: middle;
        fill: currentcolor;
        stroke: none;
        overflow: hidden;
    }

    svg {
        pointer-events: none;
        display: block;
    }

    div {    
        width: 100%;
        height: 100%;
    }

    div.slot {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
    }
`;

const OBSERVED_ATTRIBUTES = [
    'palette',
    'src',
    'icon',
    'animation',
    'speed',
    'target',
    'params',
];

type SUPPORTED_ATTRIBUTES = 'palette'|'params'|'src'|'icon'|'animation'|'speed'|'target';

export class Element extends HTMLElement {
    protected isReady: boolean = false;
    protected root: ShadowRoot;
    protected lottie?: LottiePlayer;
    protected myConnectedAnimation?: IAnimation;
    protected icon?: string;
    protected src?: string;
    protected palette?: string;
    protected animation?: string;
    protected speed?: string;
    protected params?: string;
    protected target?: string;

    /**
     * Register Lottie library.
     * @param loader Provide "loadAnimation" here from Lottie.
     */
    static registerLoader(loader: (params: AnimationConfig) => LottiePlayer) {
        registerLoader(loader);
    }

    /**
     * Register supported icon. 
     * @param name
     * @param data
     */
    static registerIcon(name: string, data: any) {
        registerIcon(name, data);
    }

    /**
     * Register supported animation.
     * @param name
     * @param animationClass
     */
    static registerAnimation(name: string, animationClass: any) {
        registerAnimation(name, animationClass);
    }

    constructor() {
        super();

        this.root = this.attachShadow({mode: "open"});
    }

    /**
     * Element connected.
     */
    protected connectedCallback() {
        connectInstance(this);

        if (!this.isReady) {
            this.init();
        }
    }

    /**
     * Element disconnected.
     */
    protected disconnectedCallback() {
        disconnectInstance(this);
    }

    protected attributeChangedCallback(name: SUPPORTED_ATTRIBUTES, oldValue: any, newValue: any) {
        this[name] = newValue;

        const method = (this as any)[`${name}Changed`];
        if (method) {
            method.call(this);
        }
    }

    protected init() {
        if (this.isReady) {
            return;
        }

        this.isReady = true;

        const style = document.createElement('style');
        style.innerHTML = ELEMENT_STYLE;
        this.root.appendChild(style);

        const slotContainer = document.createElement('div');
        slotContainer.innerHTML = '<slot></slot>';
        slotContainer.classList.add('slot');
        this.root.appendChild(slotContainer);

        const container = document.createElement('div');
        this.root.appendChild(container);

        this.registerLottie();
    }

    protected registerLottie() {
        let iconData = this.iconData;
        if (!iconData) {
            return;
        }

        if (this.palette || this.params) {
            iconData = deepClone(iconData);
        }

        if (this.palette) {
            iconData = replacePalette(iconData, this.palette);
        }
        if (this.params) {
            iconData = replaceParams(iconData, this.params);
        }

        this.lottie = loadLottieAnimation({
            container: this.container,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true,
            hideOnTransparent: false,
            animationData: iconData,
        });
        
        // set speed
        this.lottie.setSpeed(this.animationSpeed);

        // dispatch animation-complete
        this.lottie.addEventListener('complete', () => {
            this.dispatchEvent(new CustomEvent('animation-complete'));
        });

        this.animationChanged();
    }

    protected unregisterLottie() {
        if (this.myConnectedAnimation) {
            this.myConnectedAnimation.disconnectedCallback();
            this.myConnectedAnimation = undefined;
        }

        if (this.lottie) {
            this.lottie.destroy();
            this.lottie = undefined;

            this.container!.innerHTML = '';
        }
    }

    protected notify(name: string, from: 'icon'|'animation') {
        if (this[from] !== name) {
            return;
        }

        if (from === 'icon' && !this.lottie) {
            this.registerLottie();
        } else if (from === 'animation' && !this.myConnectedAnimation) {
            this.animationChanged();
        }
    }

    protected animationChanged() {
        if (this.myConnectedAnimation) {
            this.myConnectedAnimation.disconnectedCallback();
            this.myConnectedAnimation = undefined;
        }

        if (this.animation && this.lottie) {
            const AnimationClass = getAnimation(this.animation);
            if (AnimationClass) {
                // find target event listener
                const target = this.target ? this.closest(this.target) : null;

                this.myConnectedAnimation = new AnimationClass(this, target || this, this.lottie);
                this.myConnectedAnimation!.connectedCallback();
            }
        }
    }

    protected paletteChanged() {
        if (!this.isReady) {
            return;
        }

        this.unregisterLottie();
        this.registerLottie();
    }

    protected paramsChanged() {
        if (!this.isReady) {
            return;
        }

        this.unregisterLottie();
        this.registerLottie();
    }

    protected speedChanged() {
        if (this.lottie) {
            this.lottie.setSpeed(this.animationSpeed);
        }
    }

    protected iconChanged() {
        if (!this.isReady) {
            return;
        }

        this.unregisterLottie();
        this.registerLottie();
    }

    protected async srcChanged() {
        if (this.src) {
            await loadIcon(this.src);
        }

        if (!this.isReady) {
            return;
        }

        this.unregisterLottie();
        this.registerLottie();
    }

    /**
     * Acces icon data for this element.
     */
    get iconData(): any {
        return getIcon(this.icon! || this.src!);
    }

    /**
     * Access current animation instance.
     */
    get connectedAnimation() {
        return this.myConnectedAnimation;
    }

    protected get container(): HTMLElement|undefined {
        return this.root.lastElementChild as any;
    }

    protected get animationSpeed(): number {
        return this.speed ? (parseFloat(this.speed) || 1) : 1;
    }

    protected static get observedAttributes() { 
        return OBSERVED_ATTRIBUTES; 
    }
}
