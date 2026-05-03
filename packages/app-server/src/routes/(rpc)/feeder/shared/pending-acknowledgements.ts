import type { FeederDeviceMessage, FeederTriggerInput } from "./contracts";

export interface PendingAcknowledgement {
	command: FeederTriggerInput;
	requestedAt: number;
	resolve: (message: FeederDeviceMessage | null) => void;
	timeout: NodeJS.Timeout;
}

interface PendingAcknowledgementState {
	pending: Map<string, PendingAcknowledgement>;
}

function getPendingAcknowledgementState() {
	const globalState = globalThis as typeof globalThis & {
		__pakamewFeederAcknowledgements?: PendingAcknowledgementState;
	};

	globalState.__pakamewFeederAcknowledgements ??= {
		pending: new Map(),
	};

	return globalState.__pakamewFeederAcknowledgements;
}

export function setPendingAcknowledgement(requestId: string, pending: PendingAcknowledgement) {
	getPendingAcknowledgementState().pending.set(requestId, pending);
}

export function resolvePendingAcknowledgement(requestId: string, message: FeederDeviceMessage | null) {
	const pendingState = getPendingAcknowledgementState();
	const pending = pendingState.pending.get(requestId);
	if (!pending) {
		return;
	}

	clearTimeout(pending.timeout);
	pendingState.pending.delete(requestId);
	pending.resolve(message);
}
