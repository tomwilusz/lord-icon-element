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

const TEST_LAYER = {
    "ddd": 0,
    "ind": 0,
    "ty": 4,
    "nm": "wwww",
    "sr": 1,
    "ks": {
        "o": {
            "a": 0,
            "k": 100,
            "ix": 11,
            "x": "var $bm_rt = 80;"
        },
        "r": {
            "a": 0,
            "k": 0,
            "ix": 10
        },
        "p": {
            "a": 0,
            "k": [
                249.934,
                481.369,
                0
            ],
            "ix": 2,
            "l": 2
        },
        "a": {
            "a": 0,
            "k": [
                79.934,
                0.369,
                0
            ],
            "ix": 1,
            "l": 2
        },
        "s": {
            "a": 0,
            "k": [
                265.159,
                265.159,
                100
            ],
            "ix": 6,
            "l": 2
        }
    },
    "ao": 0,
    "shapes": [
        {
            "ind": 0,
            "ty": "sh",
            "ix": 1,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            1.415,
                            0
                        ],
                        [
                            11.014,
                            0
                        ],
                        [
                            11.014,
                            -2.523
                        ],
                        [
                            4.656,
                            -2.523
                        ],
                        [
                            4.656,
                            -14.809
                        ],
                        [
                            1.415,
                            -14.809
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "l",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 1,
            "ty": "sh",
            "ix": 2,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            -3.938
                        ],
                        [
                            -1.62,
                            -1.723
                        ],
                        [
                            -1.949,
                            0
                        ],
                        [
                            -1.641,
                            1.846
                        ],
                        [
                            0,
                            2.154
                        ],
                        [
                            1.579,
                            1.805
                        ],
                        [
                            1.579,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            1.354
                        ],
                        [
                            1.354,
                            1.415
                        ],
                        [
                            1.231,
                            0
                        ],
                        [
                            1.21,
                            -1.354
                        ],
                        [
                            0,
                            -1.456
                        ],
                        [
                            -1.456,
                            -1.641
                        ],
                        [
                            -5.333,
                            0
                        ]
                    ],
                    "v": [
                        [
                            11.167,
                            -7.199
                        ],
                        [
                            12.992,
                            -1.661
                        ],
                        [
                            18.243,
                            0.369
                        ],
                        [
                            23.514,
                            -1.743
                        ],
                        [
                            25.381,
                            -7.548
                        ],
                        [
                            23.494,
                            -13.127
                        ],
                        [
                            18.284,
                            -15.137
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "o",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 2,
            "ty": "sh",
            "ix": 3,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            1.415
                        ],
                        [
                            -0.841,
                            1.026
                        ],
                        [
                            -1.19,
                            0
                        ],
                        [
                            -0.615,
                            -1.825
                        ],
                        [
                            0,
                            -0.718
                        ],
                        [
                            0.492,
                            -0.738
                        ],
                        [
                            1.292,
                            0
                        ],
                        [
                            0.451,
                            0.615
                        ]
                    ],
                    "o": [
                        [
                            0,
                            -1.682
                        ],
                        [
                            0.595,
                            -0.759
                        ],
                        [
                            1.518,
                            0
                        ],
                        [
                            0.308,
                            0.902
                        ],
                        [
                            0,
                            2.359
                        ],
                        [
                            -0.595,
                            0.923
                        ],
                        [
                            -1.477,
                            0
                        ],
                        [
                            -0.882,
                            -1.149
                        ]
                    ],
                    "v": [
                        [
                            14.49,
                            -7.302
                        ],
                        [
                            15.577,
                            -11.609
                        ],
                        [
                            18.305,
                            -12.86
                        ],
                        [
                            21.689,
                            -10.235
                        ],
                        [
                            22.058,
                            -7.589
                        ],
                        [
                            21.053,
                            -3.343
                        ],
                        [
                            18.284,
                            -1.969
                        ],
                        [
                            15.597,
                            -3.159
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "o",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 3,
            "ty": "sh",
            "ix": 4,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            -0.287,
                            -0.841
                        ],
                        [
                            -0.144,
                            -0.82
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0.164,
                            0.656
                        ],
                        [
                            0.226,
                            1.743
                        ],
                        [
                            2.236,
                            0.205
                        ],
                        [
                            0,
                            2.769
                        ],
                        [
                            0.923,
                            0.8
                        ],
                        [
                            1.641,
                            -0.021
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0.533,
                            0
                        ],
                        [
                            0.205,
                            0.574
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            -0.164,
                            -0.246
                        ],
                        [
                            -0.103,
                            -0.41
                        ],
                        [
                            -0.267,
                            -1.928
                        ],
                        [
                            0.718,
                            -0.205
                        ],
                        [
                            0,
                            -0.964
                        ],
                        [
                            -1.19,
                            -1.026
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            27.381,
                            0
                        ],
                        [
                            30.622,
                            0
                        ],
                        [
                            30.622,
                            -5.989
                        ],
                        [
                            33.411,
                            -5.989
                        ],
                        [
                            35.011,
                            -5.148
                        ],
                        [
                            35.811,
                            0
                        ],
                        [
                            39.318,
                            0
                        ],
                        [
                            38.867,
                            -1.067
                        ],
                        [
                            38.416,
                            -3.938
                        ],
                        [
                            35.749,
                            -7.343
                        ],
                        [
                            38.847,
                            -10.973
                        ],
                        [
                            37.554,
                            -13.824
                        ],
                        [
                            33.063,
                            -14.829
                        ],
                        [
                            27.381,
                            -14.829
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "r",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 4,
            "ty": "sh",
            "ix": 5,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            -0.492,
                            -0.349
                        ],
                        [
                            0,
                            -1.005
                        ],
                        [
                            0.226,
                            -0.164
                        ],
                        [
                            0.369,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            0
                        ],
                        [
                            1.005,
                            0
                        ],
                        [
                            0.287,
                            0.185
                        ],
                        [
                            0,
                            1.046
                        ],
                        [
                            -0.513,
                            0.41
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            30.519,
                            -12.491
                        ],
                        [
                            32.652,
                            -12.491
                        ],
                        [
                            34.744,
                            -12.142
                        ],
                        [
                            35.524,
                            -10.481
                        ],
                        [
                            34.703,
                            -8.758
                        ],
                        [
                            33.083,
                            -8.348
                        ],
                        [
                            30.519,
                            -8.348
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "r",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 5,
            "ty": "sh",
            "ix": 6,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            -0.554,
                            0.103
                        ],
                        [
                            0,
                            4.553
                        ],
                        [
                            1.866,
                            1.374
                        ],
                        [
                            0.82,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            0
                        ],
                        [
                            1.497,
                            0
                        ],
                        [
                            2.81,
                            -0.513
                        ],
                        [
                            0,
                            -2.113
                        ],
                        [
                            -1.784,
                            -1.313
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            41.068,
                            0
                        ],
                        [
                            45.683,
                            0
                        ],
                        [
                            48.349,
                            -0.164
                        ],
                        [
                            53.6,
                            -7.609
                        ],
                        [
                            51.077,
                            -13.434
                        ],
                        [
                            45.97,
                            -14.768
                        ],
                        [
                            41.068,
                            -14.788
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "d",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 6,
            "ty": "sh",
            "ix": 7,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            -0.656,
                            -0.185
                        ],
                        [
                            0,
                            -2.092
                        ],
                        [
                            1.251,
                            -1.251
                        ],
                        [
                            1.354,
                            0
                        ],
                        [
                            0.349,
                            0.021
                        ]
                    ],
                    "o": [
                        [
                            1.825,
                            -0.082
                        ],
                        [
                            1.99,
                            0.554
                        ],
                        [
                            0,
                            0.718
                        ],
                        [
                            -0.923,
                            0.923
                        ],
                        [
                            -0.369,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            44.288,
                            -12.388
                        ],
                        [
                            47.611,
                            -12.183
                        ],
                        [
                            50.318,
                            -7.609
                        ],
                        [
                            48.985,
                            -3.425
                        ],
                        [
                            45.539,
                            -2.4
                        ],
                        [
                            44.288,
                            -2.441
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "d",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 7,
            "ty": "sh",
            "ix": 8,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            55.669,
                            0
                        ],
                        [
                            58.849,
                            0
                        ],
                        [
                            58.849,
                            -14.87
                        ],
                        [
                            55.669,
                            -14.87
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "i",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 8,
            "ty": "sh",
            "ix": 9,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            3.241,
                            0
                        ],
                        [
                            0,
                            -4.697
                        ],
                        [
                            -5.107,
                            0
                        ],
                        [
                            -1.313,
                            1.354
                        ],
                        [
                            -0.062,
                            0.882
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            1.333,
                            0
                        ],
                        [
                            0,
                            0.882
                        ],
                        [
                            -2.359,
                            0
                        ],
                        [
                            -0.062,
                            -0.513
                        ]
                    ],
                    "o": [
                        [
                            0,
                            -2.954
                        ],
                        [
                            -4.164,
                            0
                        ],
                        [
                            0,
                            3.671
                        ],
                        [
                            1.354,
                            0
                        ],
                        [
                            1.19,
                            -1.231
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            -0.062,
                            1.969
                        ],
                        [
                            -3.097,
                            0
                        ],
                        [
                            0,
                            -3.056
                        ],
                        [
                            2.154,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            73.104,
                            -9.989
                        ],
                        [
                            67.587,
                            -14.911
                        ],
                        [
                            60.798,
                            -7.097
                        ],
                        [
                            67.566,
                            0.349
                        ],
                        [
                            71.894,
                            -1.313
                        ],
                        [
                            73.227,
                            -4.799
                        ],
                        [
                            69.884,
                            -4.799
                        ],
                        [
                            67.218,
                            -1.99
                        ],
                        [
                            64.121,
                            -7.076
                        ],
                        [
                            67.464,
                            -12.593
                        ],
                        [
                            69.864,
                            -9.989
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "c",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 9,
            "ty": "sh",
            "ix": 10,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            -3.938
                        ],
                        [
                            -1.62,
                            -1.723
                        ],
                        [
                            -1.949,
                            0
                        ],
                        [
                            -1.641,
                            1.846
                        ],
                        [
                            0,
                            2.154
                        ],
                        [
                            1.579,
                            1.805
                        ],
                        [
                            1.579,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            1.354
                        ],
                        [
                            1.354,
                            1.415
                        ],
                        [
                            1.231,
                            0
                        ],
                        [
                            1.21,
                            -1.354
                        ],
                        [
                            0,
                            -1.456
                        ],
                        [
                            -1.456,
                            -1.641
                        ],
                        [
                            -5.333,
                            0
                        ]
                    ],
                    "v": [
                        [
                            74.546,
                            -7.199
                        ],
                        [
                            76.372,
                            -1.661
                        ],
                        [
                            81.622,
                            0.369
                        ],
                        [
                            86.894,
                            -1.743
                        ],
                        [
                            88.76,
                            -7.548
                        ],
                        [
                            86.873,
                            -13.127
                        ],
                        [
                            81.663,
                            -15.137
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "o",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 10,
            "ty": "sh",
            "ix": 11,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            1.415
                        ],
                        [
                            -0.841,
                            1.026
                        ],
                        [
                            -1.19,
                            0
                        ],
                        [
                            -0.615,
                            -1.825
                        ],
                        [
                            0,
                            -0.718
                        ],
                        [
                            0.492,
                            -0.738
                        ],
                        [
                            1.292,
                            0
                        ],
                        [
                            0.451,
                            0.615
                        ]
                    ],
                    "o": [
                        [
                            0,
                            -1.682
                        ],
                        [
                            0.595,
                            -0.759
                        ],
                        [
                            1.518,
                            0
                        ],
                        [
                            0.308,
                            0.902
                        ],
                        [
                            0,
                            2.359
                        ],
                        [
                            -0.595,
                            0.923
                        ],
                        [
                            -1.477,
                            0
                        ],
                        [
                            -0.882,
                            -1.149
                        ]
                    ],
                    "v": [
                        [
                            77.869,
                            -7.302
                        ],
                        [
                            78.956,
                            -11.609
                        ],
                        [
                            81.684,
                            -12.86
                        ],
                        [
                            85.068,
                            -10.235
                        ],
                        [
                            85.437,
                            -7.589
                        ],
                        [
                            84.432,
                            -3.343
                        ],
                        [
                            81.663,
                            -1.969
                        ],
                        [
                            78.977,
                            -3.159
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "o",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 11,
            "ty": "sh",
            "ix": 12,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            91.007,
                            0
                        ],
                        [
                            94.001,
                            0
                        ],
                        [
                            94.001,
                            -12.306
                        ],
                        [
                            99.744,
                            0
                        ],
                        [
                            104.113,
                            0
                        ],
                        [
                            104.113,
                            -14.829
                        ],
                        [
                            101.159,
                            -14.829
                        ],
                        [
                            101.159,
                            -3.159
                        ],
                        [
                            95.601,
                            -14.829
                        ],
                        [
                            91.007,
                            -14.829
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "n",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 12,
            "ty": "sh",
            "ix": 13,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            106.893,
                            0
                        ],
                        [
                            109.497,
                            0
                        ],
                        [
                            109.497,
                            -2.728
                        ],
                        [
                            106.893,
                            -2.728
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": ".",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 13,
            "ty": "sh",
            "ix": 14,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            3.241,
                            0
                        ],
                        [
                            0,
                            -4.697
                        ],
                        [
                            -5.107,
                            0
                        ],
                        [
                            -1.313,
                            1.354
                        ],
                        [
                            -0.062,
                            0.882
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            1.333,
                            0
                        ],
                        [
                            0,
                            0.882
                        ],
                        [
                            -2.359,
                            0
                        ],
                        [
                            -0.062,
                            -0.513
                        ]
                    ],
                    "o": [
                        [
                            0,
                            -2.954
                        ],
                        [
                            -4.164,
                            0
                        ],
                        [
                            0,
                            3.671
                        ],
                        [
                            1.354,
                            0
                        ],
                        [
                            1.19,
                            -1.231
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            -0.062,
                            1.969
                        ],
                        [
                            -3.097,
                            0
                        ],
                        [
                            0,
                            -3.056
                        ],
                        [
                            2.154,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            124.04,
                            -9.989
                        ],
                        [
                            118.523,
                            -14.911
                        ],
                        [
                            111.734,
                            -7.097
                        ],
                        [
                            118.502,
                            0.349
                        ],
                        [
                            122.83,
                            -1.313
                        ],
                        [
                            124.163,
                            -4.799
                        ],
                        [
                            120.82,
                            -4.799
                        ],
                        [
                            118.154,
                            -1.99
                        ],
                        [
                            115.057,
                            -7.076
                        ],
                        [
                            118.4,
                            -12.593
                        ],
                        [
                            120.8,
                            -9.989
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "c",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 14,
            "ty": "sh",
            "ix": 15,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            -3.938
                        ],
                        [
                            -1.62,
                            -1.723
                        ],
                        [
                            -1.949,
                            0
                        ],
                        [
                            -1.641,
                            1.846
                        ],
                        [
                            0,
                            2.154
                        ],
                        [
                            1.579,
                            1.805
                        ],
                        [
                            1.579,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            1.354
                        ],
                        [
                            1.354,
                            1.415
                        ],
                        [
                            1.231,
                            0
                        ],
                        [
                            1.21,
                            -1.354
                        ],
                        [
                            0,
                            -1.456
                        ],
                        [
                            -1.456,
                            -1.641
                        ],
                        [
                            -5.333,
                            0
                        ]
                    ],
                    "v": [
                        [
                            125.482,
                            -7.199
                        ],
                        [
                            127.308,
                            -1.661
                        ],
                        [
                            132.558,
                            0.369
                        ],
                        [
                            137.829,
                            -1.743
                        ],
                        [
                            139.696,
                            -7.548
                        ],
                        [
                            137.809,
                            -13.127
                        ],
                        [
                            132.599,
                            -15.137
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "o",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 15,
            "ty": "sh",
            "ix": 16,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            1.415
                        ],
                        [
                            -0.841,
                            1.026
                        ],
                        [
                            -1.19,
                            0
                        ],
                        [
                            -0.615,
                            -1.825
                        ],
                        [
                            0,
                            -0.718
                        ],
                        [
                            0.492,
                            -0.738
                        ],
                        [
                            1.292,
                            0
                        ],
                        [
                            0.451,
                            0.615
                        ]
                    ],
                    "o": [
                        [
                            0,
                            -1.682
                        ],
                        [
                            0.595,
                            -0.759
                        ],
                        [
                            1.518,
                            0
                        ],
                        [
                            0.308,
                            0.902
                        ],
                        [
                            0,
                            2.359
                        ],
                        [
                            -0.595,
                            0.923
                        ],
                        [
                            -1.477,
                            0
                        ],
                        [
                            -0.882,
                            -1.149
                        ]
                    ],
                    "v": [
                        [
                            128.805,
                            -7.302
                        ],
                        [
                            129.892,
                            -11.609
                        ],
                        [
                            132.62,
                            -12.86
                        ],
                        [
                            136.004,
                            -10.235
                        ],
                        [
                            136.373,
                            -7.589
                        ],
                        [
                            135.368,
                            -3.343
                        ],
                        [
                            132.599,
                            -1.969
                        ],
                        [
                            129.912,
                            -3.159
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "o",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ind": 16,
            "ty": "sh",
            "ix": 17,
            "ks": {
                "a": 0,
                "k": {
                    "i": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "o": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            0
                        ]
                    ],
                    "v": [
                        [
                            141.696,
                            0
                        ],
                        [
                            144.67,
                            0
                        ],
                        [
                            144.67,
                            -12.716
                        ],
                        [
                            148.629,
                            0
                        ],
                        [
                            151.254,
                            0
                        ],
                        [
                            155.295,
                            -12.716
                        ],
                        [
                            155.295,
                            0
                        ],
                        [
                            158.453,
                            0
                        ],
                        [
                            158.453,
                            -14.829
                        ],
                        [
                            153.408,
                            -14.829
                        ],
                        [
                            150.024,
                            -4.041
                        ],
                        [
                            146.885,
                            -14.829
                        ],
                        [
                            141.696,
                            -14.829
                        ]
                    ],
                    "c": true
                },
                "ix": 2
            },
            "nm": "m",
            "mn": "ADBE Vector Shape - Group",
            "hd": false
        },
        {
            "ty": "fl",
            "c": {
                "a": 0,
                "k": [
                    0,
                    0,
                    0,
                    1
                ],
                "ix": 4
            },
            "o": {
                "a": 0,
                "k": 100,
                "ix": 5
            },
            "r": 1,
            "bm": 0,
            "nm": "Fill 1",
            "mn": "ADBE Vector Graphic - Fill",
            "hd": false
        }
    ],
    "ip": 1,
    "op": 100,
    "st": 0,
    "bm": 0
};

export function modifiedIconData(data: IconData, assignProperties: IProperties, w?: boolean) {
    const rawProperties = properties(data);

    const newData = deepClone(data);

    if (assignProperties.state) {
        for (const marker of data.markers || []) {
            if (marker.cm !== assignProperties.state) {
                continue;
            }

            newData.ip = marker.tm;
            newData.op = marker.tm + marker.dr;
        }
    }

    const capitalize: (s: string) => string = (s: string) => {
        return s[0].toUpperCase() + s.slice(1);
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
        const strokeObjects = findObject(newData, `effect('Stroke')('Slider')`);
        for (const s of strokeObjects) {
            if (!s.__k) {
                s.__k = s.k;
            }

            const scale = assignProperties.stroke / 50;
            if (isObjectLike(s.k) && Array.isArray(s.k)) {
                for (const l of s.k) {
                    if (Array.isArray(l.s)) {
                        l.s = l.s.map((cc: number) => cc * scale);
                    }
                }
            } else {
                s.k = s.__k * scale;
            }
        }

        // console.log('---strokeObjects', strokeObjects);
        // for (const p of rawProperties) {
        //     if (p.name === 'stroke') {
        //         updateProperties(newData, [p], 50 / assignProperties.stroke);
        //     }
        // }
    }

    if (assignProperties.colors) {
        for (const color of Object.keys(assignProperties.colors)) {
            const colorObjects = findObject(newData, `effect('${capitalize(color)}')('Color')`);

            for (const s of colorObjects) {
                if (!s.__k) {
                    s.__k = s.k;
                }

                s.k = [...hexToLottieColor(assignProperties.colors[color]), 1];
            }

            for (const p of rawProperties) {
                if (p.name === color) {
                    updateProperties(newData, [p], assignProperties.colors[color]);
                }
            }

            console.log('---colorObjects', color, colorObjects)
        }
    }

    if (w) {
        const layer = deepClone(TEST_LAYER);
        layer.ip = newData.ip + 1;
        layer.op = newData.op;
        newData.layers.unshift(layer);
    }

    console.log('---assignProperties', assignProperties);
    console.log('---raw properties', rawProperties);

    return newData;
}