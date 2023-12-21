export function decodeBase64(s) {
    if (s.length % 4 != 0) {
        s += '===='.substr(0, 4 - s.length % 4);
    }
    return new Uint8Array(
        atob2(s)
            .split('')
            .map(charCodeAt)
    );
}

export function encodeBase64(data) {
    return typeof atob === 'function'
        ? btoa(String.fromCharCode.apply(null, data))
        : Buffer.from(data).toString('base64');
}

export function toSafeForFileName(str) {
    return str
        .replace(/=+$/, '')
        .replace(/\//g, '_')
        .replace(/\+/g, '-')
}

export function toNormal(str) {
    return str
        .replace(/_/g, '/')
        .replace(/-/g, '+')
}

function atob2(data) {
    return typeof atob === 'function'
        ? atob(data)
        : Buffer.from(data, 'base64').toString('binary');
}

function charCodeAt(c) {
    return c.charCodeAt(0);
}
