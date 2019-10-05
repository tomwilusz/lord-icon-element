import { rgbToHex, hexToRgb } from './colors.js';

function toUnitVector(n: number) {
    return Math.round(n / 255 * 1000) / 1000;
}

function fromUnitVector(n: number) {
    return Math.round(n * 255);
}

function clone(o: any, m?: any){
    if('object' !== typeof o) {
        return o;
    }

    if('object' !== typeof m || null === m) {
        m = new WeakMap();
    }

    let n = m.get(o);

    if ('undefined' !== typeof n) {
        return n;
    }

    let c = Object.getPrototypeOf(o).constructor;

    switch(c) {
    case Boolean:
    case Error:
    case Function:
    case Number:
    case Promise:
    case String:
    case Symbol:
    case WeakMap:
    case WeakSet:
        n = o;
        break;
    case Array:
        m.set(o, n = o.slice(0));
        n.forEach((v: any, i: any) => {
            if('object' ===typeof v) {
                n[i] = clone(v, m);
            }
        });
        break;
    case ArrayBuffer:
        m.set(o, n = o.slice(0));
        break;
    case DataView:
        m.set(o, n = new (c)(clone(o.buffer, m), o.byteOffset, o.byteLength));
        break;
    case Map:
    case Set:
        m.set(o, n = new (c)(clone(Array.from(o.entries()), m)));
        break;
    case Int8Array:
    case Uint8Array:
    case Uint8ClampedArray:
    case Int16Array:
    case Uint16Array:
    case Int32Array:
    case Uint32Array:
    case Float32Array:
    case Float64Array:
        m.set(o, n = new (c)(clone(o.buffer, m), o.byteOffset, o.length));
        break;
    case Date:
    case RegExp:
        m.set(o, n = new (c)(o));
        break;
    default:
        m.set(o, n = Object.assign(new (c)(), o));
        for(c in n) {
            if('object' === typeof n[c]) {
                n[c] = clone(n[c], m);
            }
        }
    }

    return n;
}

function colorsIterator(data: any, callback: any, asset: number = -1) {
    if (!data) {
        return;
    }

    data.forEach((layer: any, i: number) => {
        if (layer.shapes) {
            layer.shapes.forEach((shape: any, j: number) => {
                if (!shape.it) {
                    return;
                }
                shape.it.forEach((prop: any, k: number) => {
                    if (['fl', 'st'].includes(prop.ty)) {
                        if (!callback) {
                            return;
                        }

                        let [r, g, b, a] = prop.c.k;

                        r = fromUnitVector(r);
                        g = fromUnitVector(g);
                        b = fromUnitVector(b);

                        callback({
                            asset,
                            i,
                            j,
                            k,
                            r,
                            g,
                            b,
                            a,
                            color: rgbToHex({ r, g, b }),
                        });
                    }
                });
            });
        }
    });
};

/**
 * Extracts colors found in the animation.
 * @param data
 */
export function colors(data: any): string[] {
    const colors: string[] = [];

    colorsIterator(data.layers, (row: any) => {
        const { color } = row;
        if (!colors.includes(color)) {
            colors.push(color);
        }
    });

    for (const [i, asset] of (data.assets || []).entries()) {
        colorsIterator(asset.layers, (row: any) => {
            const { color } = row;
            if (!colors.includes(color)) {
                colors.push(color);
            }
        }, i);
    }

    return colors;
}

/**
 * Replace colors in provided animation and returns new version of it.
 * @param data Animation data.
 * @param palette Color replacement details. Separate new colors with ";" symbol.
 */
export function replacePalette(data: any, palette: string): any;
/**
 * Replace colors in provided animation and returns new version of it.
 * @param data Animation data.
 * @param palette Color replacement object. Key define original color and value is new one.
 */
export function replacePalette(data: any, palette: { [key: string]: string }): any;
export function replacePalette(data: any, paletteData: any) {
    if (!paletteData || !data) {
        throw new TypeError('Missing parameters.');
    }

    if (typeof data !== 'object' || (typeof paletteData !== 'object' && typeof paletteData !== 'string')) {
        throw new TypeError('Invalid parameters.');
    }

    let parsedPalette: { [key: string]: string } = {};
    if (typeof paletteData === 'object') {
        parsedPalette = paletteData;
    } else if (typeof paletteData === 'string') {
        let usedColors: string[]|undefined;
        const sections = paletteData.split(';').filter(c => c);

        for (let i = 0; i < sections.length; ++i) {
            const currentSection = sections[i];
            const parts = currentSection.split(':').filter(c => c);
            const [ first, second ] = parts;

            if (first && second) {
                parsedPalette[first] = second;
            } else if (first) {
                if (!usedColors) {
                    usedColors = colors(data);
                }

                parsedPalette[usedColors[i]] = first;
            }
        }
    }

    if (!Object.keys(parsedPalette).length) {
        return data;
    }

    const clonedData = clone(data);

    // update layers colors
    colorsIterator(clonedData.layers, (row: any) => {
        const { i, j, k, a, color } = row;
        if (!parsedPalette![color]) {
            return;
        }

        const { r, g, b } = hexToRgb(parsedPalette![color]);
    
        clonedData.layers[i].shapes[j].it[k].c.k = [
            toUnitVector(r),
            toUnitVector(g),
            toUnitVector(b),
            a,
        ];
    });

    // update assets colors
    for (const [i, asset] of (clonedData.assets || []).entries()) {
        colorsIterator(asset.layers, (row: any) => {
            const { i, j, k, a, color, asset } = row;
            if (!parsedPalette![color]) {
                return;
            }
    
            const { r, g, b } = hexToRgb(parsedPalette![color]);
        
            clonedData.assets[asset].layers[i].shapes[j].it[k].c.k = [
                toUnitVector(r),
                toUnitVector(g),
                toUnitVector(b),
                a,
            ];
        }, i);
    }

    return clonedData;
}
