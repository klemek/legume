<script setup lang="ts">
import { computed } from "vue";
import * as icons from "lucide-vue-next";

interface Props {
    name: string;
    color?: string;
    strokeWidth?: string;
    defaultClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    color: "currentColor",
    strokeWidth: "2",
    defaultClass: "lucide",
});

function kebab2camel(kebab: string): string {
    return kebab
        .split("-")
        .map(
            (item) =>
                item.charAt(0).toUpperCase() + item.slice(1).toLowerCase(),
        )
        .join("");
}

// @ts-expect-error: cannot infer type of all exported data
const icon = computed(() => icons[kebab2camel(props.name)]);
</script>

<template>
    <component
        :is="icon"
        :color="color"
        :stroke-width="strokeWidth"
        :default-class="defaultClass"
    />
</template>
