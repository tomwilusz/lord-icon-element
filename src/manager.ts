import { AnimationConfigWithData, AnimationConfigWithPath, AnimationItem } from 'lottie-web';
import { Element } from './element.js';
import { LottieAnimationLoader } from './interfaces.js';

/**
 * Store loadAnimation from Lottie.
 */
let LOTTIE_ANIMATION_LOADER: LottieAnimationLoader | undefined;

/**
 * Store all intances of Element.
 */
const INSTANCES: Set<Element> = new Set();

/**
 * Store supported triggers.
 */
const TRIGGERS: Map<string, any> = new Map<string,
    any>();

/**
 * Store icons data in memory.
 */
const ICONS: Map<string, any> = new Map<string,
    any>();

/**
 * List of promises for pending icons.
 */
const LOADING: Map<string, Promise<any>> = new Map<string,
    Promise<any>>();

/**
 * Register new icon. Notify all instances about it.
 * @param name
 * @param iconData
 */
export function registerIcon(name: string, iconData: any) {
    ICONS.set(name, iconData);
    for (const instance of INSTANCES) {
        (instance as any).notify(name, 'icon');
    }
}

/**
 * Register new trigger. Notify all instances about it.
 * @param name
 * @param triggerClass
 */
export function registerTrigger(name: string, triggerClass: any) {
    TRIGGERS.set(name, triggerClass);
    for (const instance of INSTANCES) {
        (instance as any).notify(name, 'trigger');
    }
}

/**
 * Register lottie "loadAnimation" method.
 * @param animationLoader
 */
export function registerAnimationLoader(animationLoader: LottieAnimationLoader) {
    LOTTIE_ANIMATION_LOADER = animationLoader;
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
 * Get stored trigger.
 * @param name
 */
export function getTrigger(name: string) {
    return TRIGGERS.get(name);
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
export function loadLottieAnimation(params: AnimationConfigWithPath | AnimationConfigWithData): AnimationItem {
    if (!LOTTIE_ANIMATION_LOADER) {
        throw new Error('Unregistered Lottie.');
    }

    return LOTTIE_ANIMATION_LOADER(params);
}