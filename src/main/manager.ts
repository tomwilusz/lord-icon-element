import { LottiePlayer, AnimationConfig } from 'lottie-web';
import { Element } from './element.js';
import { LottieLoader } from '../interfaces.js';

/**
 * Store loadAnimation from Lottie.
 */
let LOTTIE_LOADER: LottieLoader|undefined;

/**
 * Store all intances of Element.
 */
const INSTANCES: Set<Element> = new Set();

/**
 * Store supported animations.
 */
const ANIMATIONS: Map<string, any> = new Map<string, any>();

/**
 * Store icons in memory.
 */
const ICONS: Map<string, any> = new Map<string, any>();

/**
 * List of promises for pending icons.
 */
const LOADING: Map<string, Promise<any>> = new Map<string, Promise<any>>();

/**
 * Register new icon. Notify all Element instances about it.
 * @param name
 * @param animationClass
 */
export function registerIcon(name: string, data: any) {
    ICONS.set(name, data);
    for (const instance of INSTANCES) {
        (instance as any).notify(name, 'icon');
    }
}

/**
 * Register new animation. Notify all Element instances about it.
 * @param name
 * @param animationClass
 */
export function registerAnimation(name: string, animationClass: any) {
    ANIMATIONS.set(name, animationClass);
    for (const instance of INSTANCES) {
        (instance as any).notify(name, 'animation');
    }
}

/**
 * Register lottie "loadAnimation" method.
 * @param loader
 */
export function registerLoader(loader: (params: AnimationConfig) => LottiePlayer) {
    LOTTIE_LOADER = loader;
}

/**
 * Store element instance.
 * @param element
 */
export function connectInstance(element: Element) {
    INSTANCES.add(element);
}

/**
 * Remove element instance.
 * @param element
 */
export function disconnectInstance(element: Element) {
    INSTANCES.delete(element);
}

/**
 * Get stored icon.
 * @param name
 */
export function getIcon(name: string) {
    return ICONS.get(name);
}

/**
 * Get stored animation.
 * @param name
 */
export function getAnimation(name: string) {
    return ANIMATIONS.get(name);
}

/**
 * Fetch icon data from server.
 * @param url
 */
export async function loadIconData(url: string) {
    const response = await fetch(url);
    return await response.json();
}

/**
 * Load icon from url. This method tries to load single icon only once.
 * @param url
 */
export async function loadIcon(url: string) {
    if (ICONS.has(url)) {
        return;
    }

    const current = LOADING.get(url);
    if (current) {
        await current;
        return;
    }

    if (current === undefined) {
        const promise = loadIconData(url);

        LOADING.set(url, promise);
        const data = await promise;
        LOADING.delete(url);

        ICONS.set(url, data);
    }
}

/**
 * Execute animation loading with provided "loadAnimation".
 * @param params
 */
export function loadLottieAnimation(params: AnimationConfig): LottiePlayer {
    if (!LOTTIE_LOADER) {
        throw new Error('Unregistered Lottie.');
    }

    return LOTTIE_LOADER(params);
}