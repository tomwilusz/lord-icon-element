const hasOwnProperty = Object.prototype.hasOwnProperty;
const propIsEnumerable = Object.prototype.propertyIsEnumerable;

function isObj(obj: any) {
    return typeof obj === "object";
}

function assignKey(to: any, from: any, key: any) {
    const val = from[key];

    if (val === undefined || val === null) {
        return;
    }

    if (hasOwnProperty.call(to, key)) {
        if (to[key] === undefined || to[key] === null) {
            throw new TypeError("Cannot convert undefined or null to object (" + key + ")");
        }
    }

    if (!hasOwnProperty.call(to, key) || !isObj(val)) {
        to[key] = val;
    } else {
        to[key] = assign(Object.assign({}, to[key]), from[key]);
    }
}

function assign(to: any, from: any) {
    if (to === from) {
        return to;
    }

    from = Object(from);

    for (const key in from) {
        if (hasOwnProperty.call(from, key)) {
            assignKey(to, from, key);
        }
    }

    if (Object.getOwnPropertySymbols) {
        const symbols = Object.getOwnPropertySymbols(from);

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
                assignKey(to, from, symbols[i]);
            }
        }
    }

    return to;
}

function toObject(value: any): object {
    if (value === null || value === undefined) {
        return {};
    }

    return Object(value);
}

export function deepClone(target: any, ...params: any[]): any {
    target = toObject(target);

    for (const param of params) {
        assign(target, param);
    }

    return target;
}
