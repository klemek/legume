export function randomSeed(): number {
    return (Math.random() * 2 ** 32) >>> 0;
}

export function splitmix32(seed: number): () => number {
    let localSeed = seed;
    return function () {
        localSeed |= 0;
        localSeed = (localSeed + 0x9e3779b9) | 0;
        let tmp = localSeed ^ (localSeed >>> 16);
        tmp = Math.imul(tmp, 0x21f0aaad);
        tmp ^= tmp >>> 15;
        tmp = Math.imul(tmp, 0x735a2d97);
        return ((tmp ^ (tmp >>> 15)) >>> 0) / 4294967296;
    };
}

export function randomInt(max: number, seed: number) {
    const prng = splitmix32(seed);
    return Math.floor(prng() * max);
}

export function randomElement<T>(array: T[], seed: number): T {
    return array[randomInt(array.length, seed)] as T;
}

export function shuffleSeeded<T>(array: T[], seed: number): T[] {
    const output = array.slice();
    const prng = splitmix32(seed);
    for (let iteration = 0; iteration < array.length * 4; iteration += 1) {
        const i1 = Math.floor(prng() * array.length);
        const i2 = Math.floor(prng() * array.length);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const tmp = output[i2]!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        output[i2] = output[i1]!;
        output[i1] = tmp;
    }
    return output;
}
