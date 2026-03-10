import { describe, expect, it } from "vitest";
import {
	clearOrpcInstrumentationState,
	readOrpcInstrumentationState,
	writeOrpcDispatchError,
	writeOrpcDispatchResult,
	writeOrpcRouteMetadata,
} from "./state";

describe("oRPC instrumentation state", () => {
	it("stores route metadata and dispatch result on a request", () => {
		const request = new Request("http://localhost/api/ping");
		writeOrpcRouteMetadata(request, {
			httpRouteTemplate: "/ping",
			procedure: "/ping",
			operationId: "ping",
		});
		writeOrpcDispatchResult(request, {
			matched: true,
			durationMs: 12.3,
		});

		expect(readOrpcInstrumentationState(request)).toEqual({
			routeMetadata: {
				httpRouteTemplate: "/ping",
				procedure: "/ping",
				operationId: "ping",
			},
			dispatchResult: {
				matched: true,
				durationMs: 12.3,
			},
		});
	});

	it("normalizes missing dispatch error code and clears state", () => {
		const request = new Request("http://localhost/api/ping");
		writeOrpcDispatchError(request, { durationMs: 8 });

		expect(readOrpcInstrumentationState(request)).toEqual({
			dispatchError: {
				durationMs: 8,
				errorCode: "unknown_error",
			},
		});

		clearOrpcInstrumentationState(request);
		expect(readOrpcInstrumentationState(request)).toBeUndefined();
	});
});
