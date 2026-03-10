import type { OrpcRouteMetadata } from "./route-template";

const ORPC_INSTRUMENTATION_STATE_CONTEXT_KEY = "orpc.instrumentation.state";

/**
 * Dispatch success state written by the oRPC handler wrapper.
 */
export interface OrpcDispatchResultInput {
	/**
	 * Whether the request matched an oRPC procedure.
	 */
	matched: boolean;
	/**
	 * Measured dispatch duration in milliseconds.
	 */
	durationMs: number;
}

/**
 * Dispatch error state written when oRPC dispatch throws.
 */
export interface OrpcDispatchErrorInput {
	/**
	 * Measured dispatch duration in milliseconds.
	 */
	durationMs: number;
	/**
	 * Optional normalized error code.
	 */
	errorCode?: string;
}

/**
 * Request-scoped state shared across oRPC instrumentation stages.
 */
export interface OrpcInstrumentationState {
	/**
	 * Resolved route metadata for the active request.
	 */
	routeMetadata?: OrpcRouteMetadata;
	/**
	 * Result of oRPC dispatch when handler execution completes.
	 */
	dispatchResult?: OrpcDispatchResultInput;
	/**
	 * Error state captured when dispatch fails.
	 */
	dispatchError?: Required<OrpcDispatchErrorInput>;
}

/**
 * Casts a `Request` to a mutable record used for request-local state.
 * @param request - Request associated with the current flow.
 * @returns Mutable request record.
 */
function getRequestRecord(request: Request): Record<string, unknown> {
	return request as unknown as Record<string, unknown>;
}

/**
 * Reads or initializes request-scoped oRPC instrumentation state.
 * @param request - Request associated with the current flow.
 * @returns Existing or newly created state object.
 */
function ensureOrpcInstrumentationState(request: Request): OrpcInstrumentationState {
	const requestRecord = getRequestRecord(request);
	const rawValue = requestRecord[ORPC_INSTRUMENTATION_STATE_CONTEXT_KEY];
	if (rawValue && typeof rawValue === "object") {
		return rawValue as OrpcInstrumentationState;
	}

	const state: OrpcInstrumentationState = {};
	requestRecord[ORPC_INSTRUMENTATION_STATE_CONTEXT_KEY] = state;
	return state;
}

/**
 * Reads request-scoped oRPC instrumentation state.
 * @param request - Request that may contain instrumentation state.
 * @returns The current state when present.
 */
export function readOrpcInstrumentationState(request: Request): OrpcInstrumentationState | undefined {
	const rawValue = getRequestRecord(request)[ORPC_INSTRUMENTATION_STATE_CONTEXT_KEY];
	return rawValue && typeof rawValue === "object" ? (rawValue as OrpcInstrumentationState) : undefined;
}

/**
 * Writes route metadata into request-scoped instrumentation state.
 * @param request - Request associated with the current flow.
 * @param routeMetadata - Route metadata to persist.
 */
export function writeOrpcRouteMetadata(request: Request, routeMetadata: OrpcRouteMetadata): void {
	const state = ensureOrpcInstrumentationState(request);
	state.routeMetadata = {
		httpRouteTemplate: routeMetadata.httpRouteTemplate,
		procedure: routeMetadata.procedure,
		operationId: routeMetadata.operationId,
	};
}

/**
 * Writes dispatch result data into request-scoped instrumentation state.
 * @param request - Request associated with the current flow.
 * @param input - Dispatch result payload.
 */
export function writeOrpcDispatchResult(request: Request, input: OrpcDispatchResultInput): void {
	const state = ensureOrpcInstrumentationState(request);
	state.dispatchResult = {
		matched: input.matched,
		durationMs: input.durationMs,
	};
}

/**
 * Writes dispatch error data into request-scoped instrumentation state.
 * @param request - Request associated with the current flow.
 * @param input - Dispatch error payload.
 */
export function writeOrpcDispatchError(request: Request, input: OrpcDispatchErrorInput): void {
	const state = ensureOrpcInstrumentationState(request);
	state.dispatchError = {
		durationMs: input.durationMs,
		errorCode: input.errorCode ?? "unknown_error",
	};
}

/**
 * Clears request-scoped oRPC instrumentation state after request completion.
 * @param request - Request associated with the current flow.
 */
export function clearOrpcInstrumentationState(request: Request): void {
	delete getRequestRecord(request)[ORPC_INSTRUMENTATION_STATE_CONTEXT_KEY];
}
