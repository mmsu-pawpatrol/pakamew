import js from "@eslint/js";
import prettiereslint from "eslint-config-prettier/flat";
import reactDom from "eslint-plugin-react-dom";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react-x";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(globalIgnores(["node_modules", "dist", "generated"]), {
	files: ["**/*.{ts,tsx}"],
	extends: [
		js.configs.recommended,
		tseslint.configs.recommendedTypeChecked,
		tseslint.configs.stylisticTypeChecked,
		reactX.configs["recommended-type-checked"],
		reactDom.configs.recommended,
		reactHooks.configs.flat.recommended,
		reactRefresh.configs.vite,
		prettiereslint,
	],
	languageOptions: {
		ecmaVersion: 2020,
		parserOptions: {
			projectService: true,
		},
	},
});
