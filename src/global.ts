import { AnimationConfig } from 'lottie-web';

/**
 * Current version.
 */
export const VERSION = '0.0.0';

/**
 * Scale factor for supported properties for icons created by lordicon.com.
 */
export const PROPERTY_SCALE = 50;

/**
 * Prefix for icon states.
 */
export const STATE_PREFIX = 'State-';

/**
 * Default lottie-web options.
 */
export const ANIMATION_LOADER_OPTIONS: Omit<AnimationConfig, 'container'> = {
    renderer: "svg",
    loop: false,
    autoplay: false,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: false,
        hideOnTransparent: true,
    },
}