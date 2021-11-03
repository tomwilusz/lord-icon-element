import {
    ILottieProperty,
    IRGBColor,
    LottieColor
} from '../interfaces.js';

import {
    has,
    get,
    set
} from './utils.js';

/**
 * Scale factor for supported slider properties.
 */
const LORDICON_SCALE = 50;

function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

/**
 * Convert from color object to hex value.
 * @param value 
 * @returns 
 */
export function rgbToHex(value: IRGBColor): string {
    return (
        '#' +
        componentToHex(value.r) +
        componentToHex(value.g) +
        componentToHex(value.b)
    );
}

/**
 * Conver from hex to color object.
 * @param hex 
 * @returns 
 */
export function hexToRgb(hex: string): IRGBColor {
    let data = parseInt(hex[0] != '#' ? hex : hex.substring(1), 16);
    return {
        r: (data >> 16) & 255,
        g: (data >> 8) & 255,
        b: data & 255,
    };
}

/**
 * Helper method for scale value.
 * @param n
 * @returns 
 */
export function toUnitVector(n: number) {
    return Math.round((n / 255) * 1000) / 1000;
}

/**
 * Helper method for scale value.
 * @param n
 * @returns 
 */
export function fromUnitVector(n: number) {
    return Math.round(n * 255);
}

/**
 * Helper method for lottie color.
 * @param hex
 * @returns 
 */
export function hexToLottieColor(hex: string): LottieColor {
    const {
        r,
        g,
        b
    } = hexToRgb(hex);
    return [toUnitVector(r), toUnitVector(g), toUnitVector(b)];
}

/**
 * Return all supported properties for provided icon.
 * @param data Icon data.
 * @param lottieInstance Provide property path for running lottie instance.
 * @returns 
 */
export function allProperties(
    data: any,
    lottieInstance: boolean = false,
): ILottieProperty[] {
    const result: any[] = [];

    if (!data || !data.layers) {
        return result;
    }

    for (const [layerIndex, layer] of Object.entries(data.layers) as any) {
        if (!layer.nm) {
            continue;
        }

        if (!layer.nm.toLowerCase().includes('change')) {
            continue;
        }

        if (!layer.ef) {
            continue;
        }

        for (const [fieldIndex, field] of Object.entries(layer.ef) as any) {
            const subpath = 'ef.0.v.k';
            
            let path;
            if (lottieInstance) {
                path = `renderer.elements.${layerIndex}.effectsManager.effectElements.${fieldIndex}.effectElements.0.p.v`;
            } else {
                path = `layers.${layerIndex}.ef.${fieldIndex}.${subpath}`;
            }

            const hasValue = has(field, subpath);
            if (!hasValue) {
                continue;
            }

            const value = get(field, subpath);

            let type = 'unkown';

            if (field.mn === 'ADBE Color Control') {
                type = 'color';
            } else if (field.mn === 'ADBE Slider Control') {
                type = 'slider';
            } else if (field.mn === 'ADBE Point Control') {
                type = 'point';
            } else if (field.mn === 'ADBE Checkbox Control') {
                type = 'checkbox';
            }

            if (type === 'unkown') {
                continue;
            }

            const name = field.nm;

            result.push({
                name,
                path,
                value,
                type,
            });
        }
    }

    return result;
}

/**
 * Reset colors to original.
 * @param data
 * @param properties
 */
export function resetColors(data: any, properties: ILottieProperty[]) {
    for (const field of properties) {
        if (field.type !== 'color') {
            continue;
        }

        set(data, field.path, field.value);
    }
}

/**
 * Update colors.
 * @param data
 * @param properties
 * @param colors
 */
export function updateColors(data: any, properties: ILottieProperty[], colors: string): any {
    const parsedColors = colors.split(',');

    if (parsedColors.length) {
        for (const color of parsedColors) {
            const parts = color.split(':');
            if (parts.length !== 2) {
                continue;
            }

            for (const field of properties) {
                if (field.type !== 'color') {
                    continue;
                }

                if (field.name.toLowerCase() === parts[0].toLowerCase()) {
                    set(data, field.path, hexToLottieColor(parts[1]));
                }
            }
        }
    }
}

/**
 * Reset property to orignal value.
 * @param data
 * @param properties
 * @param name
 * @param extraPath
 */
export function resetProperty(data: any, properties: ILottieProperty[], name: string, extraPath ? : string): any {
    for (const field of properties) {
        if (field.name.toLowerCase() !== name.toLowerCase()) {
            continue;
        }

        if (extraPath) {
            set(data, field.path + `.${extraPath}`, get(field.value, extraPath));
        } else {
            set(data, field.path, field.value);
        }
    }
}

/**
 * Update property.
 * @param data
 * @param properties
 * @param name
 * @param value
 * @param extraPath
 */
export function updateProperty(data: any, properties: ILottieProperty[], name: string, value: any, extraPath ? : string): any {
    for (const field of properties) {
        if (field.name.toLowerCase() !== name.toLowerCase()) {
            continue;
        }

        const newPath = field.path + (extraPath ? `.${extraPath}` : '');
        let ratio = 1;

        if (field.type === 'slider') {
            ratio = field.value / LORDICON_SCALE;
        } else if (field.type === 'point') {
            ratio = ((field.value[0] + field.value[1]) / 2) / LORDICON_SCALE;
        }

        set(data, newPath, value * ratio);
    }
}

/**
 * Replace property value.
 * @param data
 * @param properties
 * @param name
 * @param value
 * @param extraPath
 */
export function replaceProperty(data: any, properties: ILottieProperty[], name: string, value: any, extraPath ? : string): any {
    for (const field of properties) {
        if (field.name.toLowerCase() !== name.toLowerCase()) {
            continue;
        }

        const newPath = field.path + (extraPath ? `.${extraPath}` : '');
      
        set(data, newPath, value);
    }
}
