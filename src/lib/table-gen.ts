import { shuffleSeeded, splitmix32 } from "./random";
import { gcd } from "./math";

export class TableGenerator {
    candidates: string[];
    size: number;
    mixThreshold: number;
    slots: string[];
    prng: () => number;
    indexScores: Record<number, number>;
    minIndexScore: number;
    maxIndexScore: number;
    mixScores: Record<number, number>;
    minMixScore: number;
    maxMixScore: number;
    lastIndexes: number[];
    mixTable: boolean[];

    constructor(
        candidates: string[],
        mixThreshold: number,
        slots: string[],
        seed: number,
    ) {
        this.candidates = candidates;
        this.size = this.candidates.length;
        this.mixThreshold = mixThreshold;
        this.slots = slots;
        this.prng = splitmix32(seed);
        this.indexScores = this.initIndexScores();
        this.minIndexScore = 0;
        this.maxIndexScore = 0;
        this.mixScores = this.initMixScores();
        this.minMixScore = 0;
        this.maxMixScore = 0;
        this.lastIndexes = [];
        this.mixTable = this.initMixTable(seed);
    }

    initIndexScores(): Record<number, number> {
        return Object.fromEntries(
            this.candidates.map((line, index) => [index, 0]),
        );
    }

    initMixScores(): Record<number, number> {
        const scores: Record<number, number> = {};

        for (let index1 = 0; index1 < this.candidates.length - 1; index1 += 1) {
            for (
                let index2 = index1 + 1;
                index2 < this.candidates.length;
                index2 += 1
            ) {
                scores[this.mixKey(index1, index2)] = 0;
            }
        }

        return scores;
    }

    initMixTable(seed: number): boolean[] {
        const mixSlots = Math.round(this.mixThreshold * this.slots.length);
        if (mixSlots <= 0) {
            return [false];
        }
        const g = gcd(mixSlots, this.slots.length);
        const mixTableLength = this.slots.length / g;
        const tmpMixTable = new Array(mixTableLength)
            .fill(0)
            .map((unused, index) => index < mixSlots / g);
        return shuffleSeeded(tmpMixTable, seed + 1);
    }

    mixKey(index1: number, index2: number): number {
        return Math.min(index1, index2) * 1000 + Math.max(index1, index2);
    }

    getRandomIndex(): number {
        return Math.floor(this.prng() * this.size);
    }

    getRandomMix(): [number, number] {
        const index1 = this.getRandomIndex();
        let index2;
        do {
            index2 = this.getRandomIndex();
        } while (index1 === index2);
        return [index1, index2];
    }

    updateIndexScores(index1: number, index2: number): void {
        for (let index = 0; index < this.size; index += 1) {
            if (index !== index1 && index !== index2) {
                this.indexScores[index] = (this.indexScores[index] ?? 0) - 1;
            } else {
                this.indexScores[index] = 0;
            }
        }
        this.minIndexScore = Math.min(...Object.values(this.indexScores));
        this.maxIndexScore = Math.max(...Object.values(this.indexScores));
        this.lastIndexes = [index1, index2];
    }

    updateMixScores(index1: number, index2: number): void {
        this.updateIndexScores(index1, index2);
        this.mixScores[this.mixKey(index1, index2)] =
            (this.mixScores[this.mixKey(index1, index2)] ?? 0) + 1;
        this.minMixScore = Math.min(...Object.values(this.mixScores));
        this.maxMixScore = Math.max(...Object.values(this.mixScores));
    }

    indexScoreThreshold(value: number): number {
        return (
            this.minIndexScore +
            (this.maxIndexScore - this.minIndexScore) * value
        );
    }

    mixScoreThreshold(value: number): number {
        return this.minMixScore + (this.maxMixScore - this.minMixScore) * value;
    }

    getMixValue(): string | null {
        const indexScoreThreshold = this.indexScoreThreshold(this.mixThreshold);
        const mixScoreThreshold = this.mixScoreThreshold(0.1);
        let retries = 500;
        let index1, index2;
        do {
            [index1, index2] = this.getRandomMix();
        } while (
            (this.lastIndexes.includes(index1) ||
                this.lastIndexes.includes(index2) ||
                (this.indexScores[index1] ?? 0) > indexScoreThreshold ||
                (this.indexScores[index2] ?? 0) > indexScoreThreshold ||
                (this.mixScores[this.mixKey(index1, index2)] ?? 0) >
                    mixScoreThreshold) &&
            (retries -= 1) > 0
        );
        if (retries === 0) {
            return null;
        }
        this.updateMixScores(index1, index2);
        return `${this.candidates[index1] ?? "?"} & ${this.candidates[index2] ?? "?"}`;
    }

    getCandidateValue(): string {
        const indexScoreThreshold = this.indexScoreThreshold(0.1);
        let retries = 500;
        let index;
        do {
            index = this.getRandomIndex();
        } while (
            (this.lastIndexes.includes(index) ||
                (this.indexScores[index] ?? 0) > indexScoreThreshold) &&
            (retries -= 1) > 0
        );
        this.updateIndexScores(index, -1);
        return this.candidates[index] ?? "?";
    }

    getSlotValue(index: number): string {
        if (this.mixTable[index % this.mixTable.length]) {
            const value = this.getMixValue();
            if (value !== null) {
                return value;
            }
        }
        return this.getCandidateValue();
    }

    generate(): [string, string][] {
        return this.slots.map((slot, index) => [
            slot,
            this.getSlotValue(index),
        ]);
    }
}
