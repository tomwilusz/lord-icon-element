import { IconData } from '../interfaces.js';
import { parseColor } from './colors.js';
import { get, has, set } from './helpers.js';

export type LottieColor = [number, number, number];

export type LottieFieldType = 'color' | 'slider' | 'point' | 'checkbox';

/**
 * Interface for colors parameters.
 */
export interface IRGBColor {
    r: number;
    g: number;
    b: number;
}

/**
 * Interface for found property.
 */
export interface ILottieProperty {
    name: string;
    path: string;
    value: any;
    type: LottieFieldType;
}

/**
 * Convert to hexadecimal value.
 * @param c 
 * @returns 
 */
function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

/**
 * Convert from color object to hex value.
 * @param value 
 * @returns 
 */
function rgbToHex(value: IRGBColor): string {
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
function hexToRgb(hex: string): IRGBColor {
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
function toUnitVector(n: number) {
    return Math.round((n / 255) * 1000) / 1000;
}

/**
 * Helper method for scale value.
 * @param n
 * @returns 
 */
function fromUnitVector(n: number) {
    return Math.round(n * 255);
}

/**
 * Convert hex color to lottie representation.
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
 * Conver lottie color representation to hex.
 * @param value 
 * @returns 
 */
export function lottieColorToHex(value: LottieColor): string {
    const color: IRGBColor = {
        r: fromUnitVector(value[0]),
        g: fromUnitVector(value[1]),
        b: fromUnitVector(value[2]),
    };
    return rgbToHex(color);
}

/**
 * Return all supported customizable properties.
 * @param data Icon data.
 * @param lottieInstance Resolve property path for running lottie instance.
 * @returns 
 */
export function properties(
    data: IconData,
    { lottieInstance }: { lottieInstance?: boolean } = {},
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

            const name = field.nm.toLowerCase();

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

export function resetProperties(data: IconData, properties: ILottieProperty[]): any {
    for (const property of properties) {
        set(data, property.path, property.value);
    }
}

export function updateProperties(data: IconData, properties: ILottieProperty[], value: any, { scale }: { scale?: number } = {}): any {
    for (const property of properties) {
        if (property.type === 'color') {
            if (typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
                set(data, property.path, [toUnitVector(value.r), toUnitVector(value.g), toUnitVector(value.b)]);
            } else if (Array.isArray(value)) {
                set(data, property.path, value);
            } else if (typeof value === 'string') {
                set(data, property.path, hexToLottieColor(parseColor(value)));
            }
        } else if (property.type === 'point') {
            let ratio = 1;
            if (scale) {
                ratio = ((property.value[0] + property.value[1]) / 2) / scale
            }
            if (typeof value === 'object' && 'x' in value && 'y' in value) {
                set(data, property.path + '.0', value.x * ratio);
                set(data, property.path + '.1', value.y * ratio);
            } else if (Array.isArray(value)) {
                set(data, property.path + '.0', value[0] * ratio);
                set(data, property.path + '.1', value[1] * ratio);
            }
        } else {
            let ratio = 1;
            if (scale) {
                ratio = property.value / scale;
            }
            set(data, property.path, value * ratio);
        }
    }
}
