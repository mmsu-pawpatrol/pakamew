import { fileURLToPath } from "node:url";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { orpcContractPlugin } from "../app-server/scripts/orpc-contract";
import { getEnv } from "./src/env.server";

const env = getEnv((env) => [env.HOST, env.PORT]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
	appType: "spa",
	envPrefix: ["VITE_"],
	build: {
		reportCompressedSize: true,
		sourcemap: "hidden",
		emptyOutDir: true,
	},
	server: {
		host: env.HOST,
		port: env.PORT,
	},
	plugins: [
		...(command === "serve" ? [orpcContractPlugin()] : []),
		devtools(),
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
	],
	resolve: {
		tsconfigPaths: true,
		alias: [
			{
				find: /^@\//,
				replacement: `${path.resolve(__dirname, "./src")}/`,
			},
		],
	},
}));
