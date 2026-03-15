export function setCookie(name: string, value: string, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; path=/; ${expires}`;
}

export function getCookie(name: string, defaultValue: string): string {
    const prefix = `${name}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(";");
    for (const cookie of cookies) {
        if (cookie.trim().startsWith(prefix)) {
            return cookie.trim().substring(prefix.length, cookie.length);
        }
    }
    return defaultValue;
}

export function getDataCookie<T extends object>(
    name: string,
    defaultValue: T,
): T {
    const rawCookie = getCookie(name, "");
    if (rawCookie.length) {
        try {
            const parsedConfig = JSON.parse(rawCookie) as T;
            return { ...parsedConfig, ...defaultValue };
        } catch {
            /* Empty */
        }
    }
    return defaultValue;
}
