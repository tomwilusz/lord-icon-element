import { IColor } from '../interfaces.js';

function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

/**
 * Parse color parameters to hex value.
 * @param r
 * @param g
 * @param b
 */
export function rgbToHex(value: IColor): string {
    return '#' + componentToHex(value.r) + componentToHex(value.g) + componentToHex(value.b);
}

/**
 * Parse hex value to colors parameters.
 * @param hex
 */
export function hexToRgb(hex: string): IColor {
    let data = parseInt( hex[0] != '#' ? hex : hex.substring( 1 ), 16 );
    return {
        r: data >> 16 & 255,
        g: data >> 8 & 255,
        b: data & 255,
    };
}
