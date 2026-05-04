import fs from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { AnyContractRouter } from "@orpc/contract";
import type { Plugin } from "vite";

const currentFilePath = fileURLToPath(import.meta.url);
const scriptRoot = path.dirname(currentFilePath);
const serverRoot = path.resolve(scriptRoot, "..");
const workspaceRoot = path.resolve(serverRoot, "../..");
const serverRpcRoutesRoot = path.resolve(serverRoot, "src/routes/(rpc)");
const serverRpcRoutesModule = "../src/routes/(rpc)";
const generatedContractPath = path.resolve(serverRoot, "../app-web/src/lib/orpc-contract.generated.json");
const execFileAsync = promisify(execFile);

export async function generateORPCContract(outputPath = generatedContractPath): Promise<void> {
	const [{ minifyContractRouter }, { router }] = await Promise.all([
		import("@orpc/contract"),
		import(/* @vite-ignore */ serverRpcRoutesModule) as Promise<{ router: AnyContractRouter }>,
	]);
	const minifiedRouter = minifyContractRouter(router);

	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify(minifiedRouter)}\n`);
}

export function orpcContractPlugin(): Plugin {
	let generation: Promise<void> | undefined;
	let debounceTimer: NodeJS.Timeout | undefined;

	async function generateContract() {
		generation ??= execFileAsync("pnpm", ["--dir", serverRoot, "run", "orpc:contract"], {
			cwd: workspaceRoot,
		})
			.then(() => undefined)
			.finally(() => {
				generation = undefined;
			});

		await generation;
	}

	function scheduleGenerateContract() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			void generateContract();
		}, 100);
	}

	return {
		name: "pakamew-orpc-contract",
		async buildStart() {
			this.addWatchFile(currentFilePath);
			this.addWatchFile(serverRpcRoutesRoot);
			await generateContract();
		},
		configureServer(server) {
			server.watcher.add([currentFilePath, serverRpcRoutesRoot]);
			server.watcher.on("all", (_event, filePath) => {
				const resolvedFilePath = path.resolve(filePath);
				if (resolvedFilePath === currentFilePath || resolvedFilePath.startsWith(serverRpcRoutesRoot)) {
					scheduleGenerateContract();
				}
			});
			server.watcher.add(generatedContractPath);
		},
	};
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
	await generateORPCContract();
}
