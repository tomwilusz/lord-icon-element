import { AnimationItem } from 'lottie-web';
import { IconData, IProperties } from '../interfaces.js';
import { parseColor } from './colors.js';
import { set, deepClone, isObjectLike } from './helpers.js';
import { TEST_LAYER } from './other.js';

/**
 * Lottie color type.
 */
export type LottieColor = [number, number, number];

/**
 * Supported field types.
 */
export type LottieFieldType = 'color' | 'slider' | 'point' | 'checkbox' | 'pseudo';

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
            } else if (field.mn.startsWith('Pseudo/')) {
                type = 'pseudo';
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
export function updateProperties(data: IconData | AnimationItem, properties: ILottieProperty[], value: any): any {
    for (const property of properties) {
        if (property.type === 'color') {
            if (typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
                set(data, property.path, [toUnitVector(value.r), toUnitVector(value.g), toUnitVector(value.b)]);
            } else if (Array.isArray(value)) {
                set(data, property.path, value);
            } else if (typeof value === 'string') {
                set(data, property.path, hexToLottieColor(parseColor(value)));
            }
        } else {
            set(data, property.path, value);
        }
    }
}

export const SCALE_STROKE = 2;

export const STROKES = {
    1: 'light',
    2: 'regular',
    3: 'bold',
}

export function modifiedIconData(data: IconData, assignProperties: IProperties, params: { layer?: boolean, optimize?: boolean } = {}) {
    const rawProperties = properties(data);
    const keys = rawProperties.map(c => c.name);

    const newData = deepClone(data);

    if (assignProperties.state) {
        for (const marker of data.markers || []) {
            const [partA, partB] = marker.cm.split(':');
            const name = partB || partA;

            if (name !== assignProperties.state) {
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

    if (assignProperties.stroke) {
        // layers
        if (keys.includes('stroke-layers')) {
            const strokes = {
                1: findObject(newData, `effect('stroke-layers')('Menu') == 1`),
                2: findObject(newData, `effect('stroke-layers')('Menu') == 2`),
                3: findObject(newData, `effect('stroke-layers')('Menu') == 3`),
            }

            for (const k of [1, 2, 3]) {
                for (const s of (strokes as any)[k]) {
                    if (k == assignProperties.stroke) {
                        s.k = 100;
                    } else {
                        s.k = 0;
                    }
                }
            }
        } else if (keys.includes('stroke')) {
            const strokeObjects = findObject(newData, `effect('stroke')('Menu')`);
            for (const s of strokeObjects) {
                const scale = assignProperties.stroke / SCALE_STROKE;
                if (isObjectLike(s.k) && Array.isArray(s.k)) {
                    for (const l of s.k) {
                        if (Array.isArray(l.s)) {
                            l.s = l.s.map((cc: number) => cc * scale);
                        }
                    }
                } else {
                    s.k = s.k * scale;
                }
            }
        }

        // property
        for (const p of rawProperties) {
            if (p.name === 'stroke' || p.name === 'stroke-layers') {
                updateProperties(newData, [p], assignProperties.stroke);
            }
        }
    }

    if (assignProperties.colors) {
        for (const color of Object.keys(assignProperties.colors)) {
            const colorObjects = findObject(newData, `effect('${color}')('Color')`);

            console.log('---colorObjects', colorObjects);

            // layers
            for (const s of colorObjects) {
                s.k = [...hexToLottieColor(assignProperties.colors[color]), 1];
            }

            // property
            for (const p of rawProperties) {
                if (p.name === color) {
                    console.log('---update color', p, color, assignProperties.colors[color])
                    updateProperties(newData, [p], assignProperties.colors[color]);
                }
            }

            console.log('---colorObjects', color, colorObjects)
        }
    }

    if (params.optimize) {
        console.log('---optimize');

        const markers = (newData.markers || []).map((c: any) => {
            const [partA, partB] = c.cm.split(':');
            const name = partB || partA;
            return name;
        })

        // remove other markers
        if (assignProperties.state && newData.markers) {
            newData.markers = newData.markers.filter((c: any) => {
                const [partA, partB] = c.cm.split(':');
                const name = partB || partA;
                return name === assignProperties.state;
            });
        }

        // remove other 
        for (const key of ['assets', 'layers']) {
            newData[key] = newData[key].filter((c: any) => {
                const [partA, partB] = c.nm.split(':');
                const name = partB || partA;

                if (!markers.includes(name)) {
                    return true;
                }

                if (partB && assignProperties.stroke && partA != (STROKES as any)[assignProperties.stroke]) {
                    return false;
                }

                return name === assignProperties.state ? true : false;
            });
        }
    }

    if (params.layer) {
        const layer = deepClone(TEST_LAYER);
        layer.ip = newData.ip + 1;
        layer.op = newData.op;
        newData.layers.unshift(layer);
    }

    console.log('---assignProperties', assignProperties);
    console.log('---rawProperties', rawProperties);

    return newData;
}