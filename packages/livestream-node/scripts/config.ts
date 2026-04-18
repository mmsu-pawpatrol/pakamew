export type ServerChoice = "wifi" | "wifi-ome" | "wired" | "webcam-test";

export type LaunchScript = "start:wifi" | "start:wifi:ome" | "start:wired" | "start:webcam-test";

export interface CreateLaunchStateOptions {
	serverChoice: ServerChoice;
}

export interface LaunchState {
	scriptName: LaunchScript;
	serverChoice: ServerChoice;
}

export function resolveLaunchScript(serverChoice: ServerChoice): LaunchScript {
	if (serverChoice === "wifi") return "start:wifi";
	if (serverChoice === "wifi-ome") return "start:wifi:ome";
	if (serverChoice === "wired") return "start:wired";
	return "start:webcam-test";
}

export function createLaunchState(options: CreateLaunchStateOptions): LaunchState {
	return {
		serverChoice: options.serverChoice,
		scriptName: resolveLaunchScript(options.serverChoice),
	};
}

export function createRestartLaunchState(previousLaunchState: LaunchState): LaunchState {
	return { ...previousLaunchState };
}
