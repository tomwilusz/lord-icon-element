import { AnimationItem } from 'lottie-web';
import { IconData, IProperties } from '../interfaces.js';
import { parseColor } from './colors.js';
import { set, deepClone, isObjectLike } from './helpers.js';

/**
 * Lottie color type.
 */
export type LottieColor = [number, number, number];

/**
 * Supported field types.
 */
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
 * @param options Options.
 * @returns 
 */
export function properties(
    data: IconData,
    options: { lottieInstance?: boolean } = {},
): ILottieProperty[] {
    console.log('---properties', data, options);

    const result: any[] = [];
    const { lottieInstance } = options;

    if (!data || !data.layers) {
        return result;
    }

    data.layers.forEach((layer: any, layerIndex: number) => {
        if (!layer.nm || !layer.ef) {
            return;
        }

        layer.ef.forEach((field: any, fieldIndex: number) => {
            const value = field?.ef?.[0]?.v?.k;
            if (value === undefined) {
                return;
            }

            let path: string | undefined;
            if (lottieInstance) {
                path = `renderer.elements.${layerIndex}.effectsManager.effectElements.${fieldIndex}.effectElements.0.p.v`;
            } else {
                path = `layers.${layerIndex}.ef.${fieldIndex}.ef.0.v.k`;
            }

            let type: LottieFieldType | undefined;

            if (field.mn === 'ADBE Color Control') {
                type = 'color';
            } else if (field.mn === 'ADBE Slider Control') {
                type = 'slider';
            } else if (field.mn === 'ADBE Point Control') {
                type = 'point';
            } else if (field.mn === 'ADBE Checkbox Control') {
                type = 'checkbox';
            }

            if (!type) {
                return;
            }

            const name = field.nm.toLowerCase();

            result.push({
                name,
                path,
                value,
                type,
            });
        });
    });

    return result;
}

/**
 * Reset data by indicated properties.
 * @param data 
 * @param properties 
 */
export function resetProperties(data: IconData | AnimationItem, properties: ILottieProperty[]): any {
    for (const property of properties) {
        set(data, property.path, property.value);
    }
}

/**
 * Update data to value by indicated properties.
 * @param data 
 * @param properties 
 * @param value 
 * @param param3 
 */
export function updateProperties(data: IconData | AnimationItem, properties: ILottieProperty[], value: any, { scale }: { scale?: number } = {}): any {
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

export function modifiedIconData(data: IconData, properties: IProperties) {
    const newData = deepClone(data);

    if (properties.state) {
        for (const marker of data.markers || []) {
            if (marker.cm !== properties.state) {
                continue;
            }

            newData.ip = marker.tm;
            newData.op = marker.tm + marker.dr;
        }
    }

    const findObject: (currentData: any, key: string) => any[] = (currentData: any, key: string) => {
        const result: any[] = [];

        for (const k of Object.keys(currentData)) {
            const v = currentData[k];

            if (isObjectLike(v)) {
                result.push(...findObject(v, key));
            }
        }

        if (currentData.x && typeof currentData.x === 'string' && currentData.x.includes(key)) {
            result.push(currentData);
        }

        return result;
    }

    if (properties.stroke) {
        const strokeObjects = findObject(newData, `effect('Stroke')('Slider')`);
        for (const s of strokeObjects) {
            if (!s.__k) {
                s.__k = s.k;
            }

            const scale = properties.stroke / 50;
            s.k = s.__k * scale;
        }

        console.log('---strokeObjects', strokeObjects);
    }



    return newData;
}