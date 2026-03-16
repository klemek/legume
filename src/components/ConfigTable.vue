<script setup lang="ts">
import { DEFAULT_CONFIG, VEGETABLES } from "@/contants";
import { type Config } from "@/interfaces";
import { getDataCookie, setCookie } from "@/lib/cookies";
import { randomSeed, shuffleSeeded } from "@/lib/random";
import { formatTime, timeToMinute } from "@/lib/time";
import { computed, onMounted, watch } from "vue";
import LucideIcon from "./LucideIcon.vue";

const config = defineModel<Config>({ required: true });

const candidates = computed<string[]>(() =>
    config.value.candidates
        .split("\n")
        .map((line) => line.trim())
        .filter(
            (value, index, array) =>
                value.length && array.indexOf(value) === index,
        ),
);

const startTimeMinute = computed<number>(() =>
    timeToMinute(config.value.startTime),
);
const endTimeMinute = computed<number>(() => {
    const result = timeToMinute(config.value.endTime);
    return result < startTimeMinute.value ? result + 1440 : result;
});
const totalDuration = computed<number>(
    () => endTimeMinute.value - startTimeMinute.value,
);

const slotTooBig = computed<boolean>(() => {
    const slotCount = Math.ceil(
        totalDuration.value / parseInt(config.value.duration, 10),
    );

    if (config.value.endWithAll) {
        return slotCount - 1 < candidates.value.length;
    }

    return slotCount < candidates.value.length;
});

function newSeed() {
    config.value.seed = randomSeed();
}

function saveConfig() {
    setCookie("legume-config", JSON.stringify(config.value));
}

function loadConfig() {
    config.value = getDataCookie("legume-config", DEFAULT_CONFIG);
}

function newVegetables() {
    config.value.candidates = shuffleSeeded(
        Object.keys(VEGETABLES),
        randomSeed(),
    )
        .map((key) => `${key} ${VEGETABLES[key] ?? "?"}`)
        .slice(0, 6)
        .join("\n");
}

onMounted(() => {
    newVegetables();
    loadConfig();
});

watch(config, saveConfig, { deep: true });
</script>

<template>
    <table class="config">
        <colgroup>
            <col style="width: 25%" />
            <col />
            <col style="width: 25%" />
        </colgroup>
        <tr>
            <td><label for="start-time">Start time:</label></td>
            <td>
                <input id="start-time" v-model="config.startTime" type="time" />
            </td>
        </tr>
        <tr>
            <td><label for="end-time">End time:</label></td>
            <td>
                <input id="end-time" v-model="config.endTime" type="time" />
            </td>
            <td>Total: {{ formatTime(totalDuration) }}</td>
        </tr>
        <tr>
            <td><label for="duration">Slot duration:</label></td>
            <td>
                <input
                    id="duration"
                    v-model="config.duration"
                    type="range"
                    min="5"
                    :max="totalDuration"
                    step="5"
                />
            </td>
            <td>
                <span v-if="slotTooBig" title="slot duration might be too big">
                    <LucideIcon name="triangle-alert" />
                    {{ config.duration }} minutes
                </span>
                <span v-else> {{ config.duration }} minutes </span>
            </td>
        </tr>
        <tr>
            <td><label for="seed">Seed:</label></td>
            <td><input v-model="config.seed" type="number" /></td>
            <td>
                <button @click="newSeed"><LucideIcon name="dices" /></button>
            </td>
        </tr>
        <tr>
            <td><label for="mix">Mix policy:</label></td>
            <td>
                <input
                    id="mix"
                    v-model="config.mix"
                    type="range"
                    min="0"
                    max="100"
                />
            </td>
            <td>
                <span v-if="parseInt(config.mix, 10) <= 0">None</span>
                <span v-else>~{{ config.mix }}%</span>
            </td>
        </tr>
        <tr>
            <td><label for="candidates">Candidates:</label></td>
            <td>
                <textarea
                    id="candidates"
                    v-model="config.candidates"
                    rows="8"
                ></textarea>
            </td>
            <td>
                <button @click="newVegetables">
                    <LucideIcon name="dices" />
                </button>
                <br />
                <span
                    v-if="candidates.length <= 2"
                    title="not enough candidates"
                >
                    <LucideIcon name="triangle-alert" />
                    <LucideIcon name="users-round" />
                    {{ candidates.length }}
                </span>
                <span v-else>
                    <LucideIcon name="users-round" /> {{ candidates.length }}
                </span>
            </td>
        </tr>
        <tr>
            <td></td>
            <td>
                <button
                    class="full"
                    title="Ends event with all candidates (aka salad)"
                    @click="config.endWithAll = !config.endWithAll"
                >
                    🥗 With salad: {{ config.endWithAll ? "✅" : "❌" }}
                </button>
            </td>
        </tr>
    </table>
</template>

<style scoped>
table.config td {
    padding: 0.25em 0.5em;
    vertical-align: top;
}

table.config input,
table.config select,
button.full {
    width: 100%;
}

table.config td:first-child {
    text-align: right;
}
</style>
