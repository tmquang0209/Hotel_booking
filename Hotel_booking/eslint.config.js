import pluginJs from "@eslint/js";
import globals from "globals";

export default [
    { languageOptions: { globals: globals.node } },
    {
        ignores: ["test/**", "**/migrations/**"],
    },
    pluginJs.configs.recommended,
];
