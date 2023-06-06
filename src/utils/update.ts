import { IProperties, IconData } from '../interfaces.js';
import { deepClone, isObjectLike } from './helpers.js';
import { hexToLottieColor, rawProperties, updateProperties } from './lottie.js';

/**
 * Default stroke for supported icons.
 */
export const DEFAULT_STROKE = 2;

/**
 * Supported stroke variants.
 */

export const STROKES = {
    1: 'light',
    2: 'regular',
    3: 'bold',
}

/**
 * Create new customized icon data.
 * @param data 
 * @param assignProperties 
 * @param params 
 * @returns 
 */
export function update(data: IconData, assignProperties: IProperties, params: { minimize?: boolean } = {}) {
    const ppp = rawProperties(data);
    const keys = ppp.map(c => c.name);

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
                const scale = assignProperties.stroke / DEFAULT_STROKE;
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
        for (const p of ppp) {
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
            for (const p of ppp) {
                if (p.name === color) {
                    console.log('---update color', p, color, assignProperties.colors[color])
                    updateProperties(newData, [p], assignProperties.colors[color]);
                }
            }

            console.log('---colorObjects', color, colorObjects)
        }
    }

    if (params.minimize) {
        console.log('---optimize');

        const markers = (newData.markers || []).map((c: any) => {
            const [partA, partB] = c.cm.split(':');
            const name = partB || partA;
            return name;
        })

        // remove redundant markers
        if (assignProperties.state && newData.markers) {
            newData.markers = newData.markers.filter((c: any) => {
                const [partA, partB] = c.cm.split(':');
                const name = partB || partA;
                return name === assignProperties.state;
            });
        }

        // remove redundant layers 
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

    /*
    if (params.layer) {
        const layer = deepClone(TEST_LAYER);
        layer.ip = newData.ip + 1;
        layer.op = newData.op;
        newData.layers.unshift(layer);
    }
    */

    console.log('---assignProperties', assignProperties);
    console.log('---rawProperties', ppp);

    return newData;
}