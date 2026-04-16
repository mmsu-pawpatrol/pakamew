import { fileURLToPath } from "url";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettiereslint from "eslint-config-prettier/flat";
import reactDom from "eslint-plugin-react-dom";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react-x";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	globalIgnores(["*.gen.ts", "packages/app-web/src/components/ui/**"]),
	{
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
		rules: {
			"react-refresh/only-export-components": ["error", { allowExportNames: ["Route"] }],
		},
	},
	{
		files: ["packages/app-web/src/routes/**/*.tsx"],
		rules: {
			"react-refresh/only-export-components": "off",
		},
	},
);
