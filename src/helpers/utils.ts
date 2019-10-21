export function deepClone(o: any, m?: any) {
    if('object' !== typeof o || o === null) {
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
                n[i] = deepClone(v, m);
            }
        });
        break;
    case ArrayBuffer:
        m.set(o, n = o.slice(0));
        break;
    case DataView:
        m.set(o, n = new (c)(deepClone(o.buffer, m), o.byteOffset, o.byteLength));
        break;
    case Map:
    case Set:
        m.set(o, n = new (c)(deepClone(Array.from(o.entries()), m)));
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
        m.set(o, n = new (c)(deepClone(o.buffer, m), o.byteOffset, o.length));
        break;
    case Date:
    case RegExp:
        m.set(o, n = new (c)(o));
        break;
    default:
        m.set(o, n = Object.assign(new (c)(), o));
        for(c in n) {
            if('object' === typeof n[c]) {
                n[c] = deepClone(n[c], m);
            }
        }
    }

    return n;
}
