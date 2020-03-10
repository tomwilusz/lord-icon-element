import { rgbToHex, hexToRgb } from './colors.js';
import { has, get, set } from './utils.js';

function toUnitVector(n: number) {
    return Math.round(n / 255 * 1000) / 1000;
}

function fromUnitVector(n: number) {
    return Math.round(n * 255);
}

function toLottieColor(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    
    return [
        toUnitVector(r),
        toUnitVector(g),
        toUnitVector(b),
    ];
}

function fromLottieColor(r: number, g: number, b: number) {
    r = fromUnitVector(r);
    g = fromUnitVector(g);
    b = fromUnitVector(b);

    return rgbToHex({ r, g, b });
}

type FIELD_TYPE = 'unkown' | 'color' | 'value';

/**
 * Extracts changeable fields. Supports lordicon.com namespace.
 * @param data
 */
function allChangeableFields(data: any) {
    const result: Array<{path: string, type: FIELD_TYPE, value: any}> = [];

    if (!data.layers) {
        return result;
    }

    for (const [ layerIndex, layer ] of Object.entries(data.layers) as any) {
        if (!layer.nm || !layer.nm.toLowerCase().includes('change')) {
            continue;
        }

        if (!layer.ef) {
            continue;
        }

        for (const [ fieldIndex, field ] of Object.entries(layer.ef) as any) {
            const subpath = 'ef.0.v.k';
            const path = `layers.${layerIndex}.ef.${fieldIndex}.${subpath}`;

            const hasValue = has(field, subpath);
            if (!hasValue) {
                continue;
            }

            let type: FIELD_TYPE = 'unkown';

            if (field.mn === 'ADBE Color Control') {
                type = 'color';
            } else if (field.mn === 'ADBE Slider Control') {
                type = 'value';
            }

            if (type === 'unkown') {
                continue;
            }

            const value = get(field, subpath);

            result.push({ path, value, type })
        }
    }

    return result;
}

/**
 * Extracts colors found in the animation in hex format.
 * @param data
 */
export function colors(data: any): string[] {
    return allChangeableFields(data)
        .filter(c => c.type === 'color')
        .map(c => {
        let [ r, g, b, a ] = c.value;
        return fromLottieColor(r, g, b);
    });
}

/**
 * Update fields of type with provide value and callback.
 * @param data Animation data.
 * @param values Replacement values. Separate them with ";" symbol.
 */
function updateData(data: any, type: FIELD_TYPE, values: string|string[], callback: any): any {
    if (!data || !type || !values) {
        throw new TypeError('Missing parameters.');
    }

    // all params of type
    const params = allChangeableFields(data).filter(c => c.type === type); 

    // new params values
    const newValues = Array.isArray(values) ? values : values.split(';').filter(c => c);

    for (const [index, value] of Object.entries(newValues) as any) {
        const currentParam = params[index];
        if (!currentParam) {
            continue;
        }

        const newValue = callback(value, currentParam.value);

        set(data, currentParam.path, newValue);
    }

    return data;
}

/**
 * Replace colors in provided animation and returns new version of it.
 * @param data Animation data.
 * @param palette Color replacement details. Separate new colors with ";" symbol.
 */
export function replacePalette(data: any, palette: string|string[]): any {
    const callback = (colorValue: string, previousLottieValue: any) => {
        let [ or, og, ob, oa ] = previousLottieValue;

        return [
            ...toLottieColor(colorValue),
            oa,
        ];
    };

    return updateData(data, 'color', palette, callback);
}

/**
 * Replace params in provided animation and returns new version of it.
 * @param data Animation data.
 * @param params Params used by animation. Separate them with ";" symbol.
 */
export function replaceParams(data: any, params: string|string[]): any {
    const callback = (paramValue: string) => {
        return +paramValue;
    };

    return updateData(data, 'value', params, callback);
}
