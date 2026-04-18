import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cancel, intro, isCancel, outro, select } from "@clack/prompts";
import { createLaunchState, createRestartLaunchState, type LaunchState, type ServerChoice } from "./config.js";

type MenuChoice = ServerChoice | "exit";
type PostRunChoice = "restart" | "choose-another" | "exit";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function clearTerminal(): void {
	process.stdout.write("\u001bc");
}

function formatExitStatus(code: number | null, signal: NodeJS.Signals | null): string {
	if (signal !== null) return `The server exited after receiving ${signal}.`;
	return `The server exited with code ${code ?? 0}.`;
}

function handleCancelledPrompt(message: string): null {
	cancel(message);
	return null;
}

async function promptForServerChoice(): Promise<MenuChoice | null> {
	const selection = await select<MenuChoice>({
		message: "Which server would you like to start?",
		options: [
			{ value: "wifi", label: "WiFi relay", hint: "ESP32 camera over WiFi" },
			{ value: "wifi-ome", label: "WiFi relay + OME", hint: "ESP32 camera with OME forwarding" },
			{ value: "wired", label: "Wired relay", hint: "USB serial camera relay" },
			{ value: "webcam-test", label: "Webcam test", hint: "Browser webcam source" },
			{ value: "exit", label: "Exit", hint: "Close the launcher" },
		],
	});

	if (isCancel(selection)) return handleCancelledPrompt("Launcher cancelled.");

	return selection;
}

async function promptForLaunchState(): Promise<LaunchState | null> {
	const serverChoice = await promptForServerChoice();
	if (serverChoice === null || serverChoice === "exit") return null;

	return createLaunchState({ serverChoice });
}

function runServer(launchState: LaunchState): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
	return new Promise((resolvePromise, rejectPromise) => {
		const childProcess = spawn(pnpmCommand, ["run", launchState.scriptName], {
			cwd: packageRoot,
			env: process.env,
			stdio: "inherit",
		});

		const forwardSignal = (signal: NodeJS.Signals): void => {
			if (childProcess.exitCode === null) {
				childProcess.kill(signal);
			}
		};

		const handleSigint = (): void => forwardSignal("SIGINT");
		const handleSigterm = (): void => forwardSignal("SIGTERM");

		process.on("SIGINT", handleSigint);
		process.on("SIGTERM", handleSigterm);

		const cleanupSignalHandlers = (): void => {
			process.off("SIGINT", handleSigint);
			process.off("SIGTERM", handleSigterm);
		};

		childProcess.once("error", (error) => {
			cleanupSignalHandlers();
			rejectPromise(error);
		});

		childProcess.once("close", (code, signal) => {
			cleanupSignalHandlers();
			resolvePromise({ code, signal });
		});
	});
}

async function promptForPostRunChoice(
	code: number | null,
	signal: NodeJS.Signals | null,
): Promise<PostRunChoice | null> {
	const selection = await select<PostRunChoice>({
		message: `${formatExitStatus(code, signal)} What would you like to do next?`,
		options: [
			{ value: "restart", label: "Restart", hint: "Run the same server again" },
			{ value: "choose-another", label: "Choose another server", hint: "Return to the main menu" },
			{ value: "exit", label: "Exit", hint: "Close the launcher" },
		],
	});

	if (isCancel(selection)) return handleCancelledPrompt("Launcher cancelled.");

	return selection;
}

async function main(): Promise<void> {
	intro("livestream-node launcher");

	let lastLaunchState: LaunchState | null = null;
	let shouldRestart = false;

	while (true) {
		const launchState: LaunchState | null = shouldRestart
			? createRestartLaunchState(lastLaunchState!)
			: await promptForLaunchState();

		if (launchState === null) {
			outro("Exiting livestream-node launcher.");
			return;
		}

		lastLaunchState = launchState;
		clearTerminal();

		let exitStatus: { code: number | null; signal: NodeJS.Signals | null };

		try {
			exitStatus = await runServer(launchState);
		} catch (error) {
			cancel(
				error instanceof Error
					? `Failed to start ${launchState.scriptName}: ${error.message}`
					: "Failed to start the server.",
			);
			outro("Exiting livestream-node launcher.");
			process.exitCode = 1;
			return;
		}

		const nextAction = await promptForPostRunChoice(exitStatus.code, exitStatus.signal);

		if (nextAction === null || nextAction === "exit") {
			outro("Exiting livestream-node launcher.");
			return;
		}

		shouldRestart = nextAction === "restart";
	}
}

void main();
