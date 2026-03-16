import { globalIgnores } from "eslint/config";
import {
    defineConfigWithVueTs,
    vueTsConfigs,
} from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { configureVueProject } from "@vue/eslint-config-typescript";

configureVueProject({ scriptLangs: ["ts", "tsx"] });

export default defineConfigWithVueTs(
    {
        name: "app/files-to-lint",
        files: ["**/*.{ts,mts,tsx,vue}"],
    },

    globalIgnores(["**/dist/**"]),

    pluginVue.configs["flat/recommended"],
    vueTsConfigs.strictTypeChecked,
    vueTsConfigs.stylisticTypeChecked,
    skipFormatting,

    {
        rules: {
            "no-console": "error",
        },
    },
);
