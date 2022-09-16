/**
 * Deep clone of value.
 * @param value
 */
export function deepClone(value: any) {
    return JSON.parse(JSON.stringify(value));
}

/**
 * Check value is null or undefined.
 * @param value 
 * @returns
 */
export function isNil(value: any) {
    return value === null || value === undefined;
}

/**
 * Checks if value is object-like. A value is object-like if it"s not null and has a typeof result of "object".
 * @param value
 */
export function isObjectLike(value: any): value is object {
    return value !== null && typeof value === "object";
}

/**
 * Checks if path is a direct property of object.
 * @param object
 * @param path
 */
export function has<T>(object: T, path: string | string[]): boolean {
    const newPath = Array.isArray(path) ? path : path.split(".");
    let current: any = object;

    for (const key of newPath) {
        if (!isObjectLike(current)) {
            return false;
        }

        if (!(key in current)) {
            return false;
        }

        current = (current as any)[key];
    }

    return true;
}

/**
 * Get object value from path. Otherwise return defaultValue.
 * @param object
 * @param path
 * @param defaultValue
 */
export function get<T>(object: T, path: string | string[], defaultValue?: any): any {
    const newPath = Array.isArray(path) ? path : path.split(".");
    let current: any = object;

    for (const key of newPath) {
        if (!isObjectLike(current)) {
            return defaultValue;
        }

        if (!(key in current)) {
            return defaultValue;
        }

        current = (current as any)[key];
    }

    return current === undefined ? defaultValue : current;
}

/**
 * Update object value on path.
 * @param object
 * @param path
 * @param value
 */
export function set(object: any, path: string | string[], value: any) {
    let current = object;

    const newPath = Array.isArray(path) ? path : path.split(".");

    for (let i = 0; i < newPath.length; ++i) {
        if (i === newPath.length - 1) {
            current[newPath[i]] = value;
        } else {
            current = current[newPath[i]];
        }
    }
}
