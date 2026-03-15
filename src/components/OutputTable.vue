<script setup lang="ts">
import { ref } from "vue";
import LucideIcon from "./LucideIcon.vue";

const table = defineModel<[string, string][]>({ required: true });

const copyTableOverride = ref<string | null>(null);

async function copyTable() {
    const csvTable = table.value.map((row) => row.join("\t")).join("\n");
    try {
        await navigator.clipboard.writeText(csvTable);
        copyTableOverride.value = "Table Copied";
    } catch {
        copyTableOverride.value = "Error";
    }
    setTimeout(() => {
        copyTableOverride.value = null;
    }, 1000);
}
</script>

<template>
    <table id="output" class="output">
        <colgroup>
            <col style="width: 25%" />
            <col />
        </colgroup>
        <tr v-for="(row, index) in table" :key="`out-row-${index}`">
            <td
                v-for="(item, index2) in row"
                :key="`out-cell-${index}-${index2}`"
            >
                {{ item }}
            </td>
        </tr>
    </table>
    <br />
    <p>
        <button @click="copyTable">
            <LucideIcon name="table" />&nbsp;
            <span v-if="copyTableOverride">{{ copyTableOverride }}</span>
            <span v-else>Copy table</span>
        </button>
    </p>
</template>

<style scoped>
table.output,
table.output th,
table.output td {
    border: 1px solid var(--text-secondary);
}

table.output td {
    text-align: center;
    font-size: 1.1em;
    padding: 0.25em 0.5em;
}

table.output td:first-child {
    text-align: right;
}
</style>
