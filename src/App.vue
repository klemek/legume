<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import LucideIcon from "./components/LucideIcon.vue";
import { DEFAULT_CONFIG, VEGETABLES } from "./contants";
import { type Config } from "./interfaces";
import { randomElement } from "./lib/random";
import { TableGenerator } from "./lib/table-gen";
import { formatTime, timeToMinute } from "./lib/time";
import ConfigTable from "./components/ConfigTable.vue";
import OutputTable from "./components/OutputTable.vue";

const visible = ref<boolean>(false);
const config = ref<Config>(DEFAULT_CONFIG);
const table = ref<[string, string][]>([]);

const vegetable = computed<string>(() =>
    randomElement(Object.keys(VEGETABLES), config.value.seed),
);
const vegetable2 = computed<string>(() =>
    randomElement(Object.keys(VEGETABLES), config.value.seed + 1),
);
const startTimeMinute = computed<number>(() =>
    timeToMinute(config.value.startTime),
);
const endTimeMinute = computed<number>(() => {
    const result = timeToMinute(config.value.endTime);
    return result < startTimeMinute.value ? result + 1440 : result;
});

const candidates = computed<string[]>(() =>
    config.value.candidates
        .split("\n")
        .map((line) => line.trim())
        .filter(
            (value, index, array) =>
                value.length && array.indexOf(value) === index,
        ),
);

function generateData() {
    table.value.splice(0, table.value.length);
    if (candidates.value.length <= 2) {
        return;
    }
    const duration = parseInt(config.value.duration, 10);
    const mixThreshold = parseInt(config.value.mix, 10) / 100;
    const slots = [];
    for (
        let currentTimeMinute = startTimeMinute.value;
        currentTimeMinute < endTimeMinute.value;
        currentTimeMinute += duration
    ) {
        slots.push(formatTime(currentTimeMinute));
    }

    const generator = new TableGenerator(
        candidates.value,
        mixThreshold,
        slots,
        config.value.seed,
    );

    const newTable = generator.generate();

    if (config.value.endWithAll && newTable.length > 0) {
        newTable.splice(-1, 1, [slots.slice(-1)[0] ?? "?", "🥗 SALAD 🥗"]);
    }

    table.value.push(...newTable);
}

onMounted(() => {
    setTimeout(() => {
        visible.value = true;
    });
    document.title = `${vegetable.value} Légume`;
});

watch(vegetable, () => {
    document.title = `${vegetable.value} Légume`;
});

watch(config, generateData, { deep: true });
</script>

<template>
    <main :style="{ display: visible ? 'inherit' : 'none' }">
        <h1>{{ vegetable }} Legume</h1>
        <br />
        <ConfigTable v-model="config" />
        <template v-if="table.length">
            <h2>{{ vegetable2 }} Output (Vege)Table</h2>
            <OutputTable v-model="table" />
        </template>
        <br />
        <hr />
        <small class="footer">
            <LucideIcon name="at-sign" />
            &nbsp;
            <a href="https://github.com/klemek" target="_blank">klemek</a>
            -
            <LucideIcon name="github" />
            &nbsp;
            <a href="https://github.com/klemek/legume" target="_blank">
                Repository
            </a>
            - 2025
        </small>
    </main>
</template>

<style scoped>
.button {
    display: block;
    width: 100%;
    text-decoration: none;
    padding: 1em;
    margin-bottom: 0.75em;
    border: 1px solid var(--color-primary);
    border-radius: 0.5em;
    background-color: var(--background);
    cursor: pointer;
    font-size: 1.333em;
}

.button:hover {
    background-color: var(--background-secondary);
}

.footer {
    opacity: 50%;
}
</style>
