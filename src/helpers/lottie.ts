import {
    ILottieField,
    IRGBColor,
    LottieColor
} from '../interfaces.js';

import {
    has,
    get,
    set
} from './utils.js';

const LORDICON_SCALE = 50;

function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex(value: IRGBColor): string {
    return (
        '#' +
        componentToHex(value.r) +
        componentToHex(value.g) +
        componentToHex(value.b)
    );
}

export function hexToRgb(hex: string): IRGBColor {
    let data = parseInt(hex[0] != '#' ? hex : hex.substring(1), 16);
    return {
        r: (data >> 16) & 255,
        g: (data >> 8) & 255,
        b: data & 255,
    };
}

export function toUnitVector(n: number) {
    return Math.round((n / 255) * 1000) / 1000;
}

export function fromUnitVector(n: number) {
    return Math.round(n * 255);
}

export function hexToLottieColor(hex: string): LottieColor {
    const {
        r,
        g,
        b
    } = hexToRgb(hex);
    return [toUnitVector(r), toUnitVector(g), toUnitVector(b)];
}

export function allFields(
    data: any,
): ILottieField[] {
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
            const path = `layers.${layerIndex}.ef.${fieldIndex}.${subpath}`;

            const hasValue = has(field, subpath);
            if (!hasValue) {
                continue;
            }

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

            const value = get(field, subpath);

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

export function replaceColors(data: any, fields: ILottieField[], colors: string): any {
    const parsedColors = colors.split(',');

    if (parsedColors.length) {

        for (const color of parsedColors) {
            const parts = color.split(':');
            if (parts.length !== 2) {
                continue;
            }

            for (const field of fields) {
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

export function replaceParams(data: any, fields: ILottieField[], name: string, value: any, extraPath ? : string): any {
    for (const field of fields) {
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