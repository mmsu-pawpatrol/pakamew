import { describe, expect, it } from "vitest";
import {
	createOrpcFallbackRouteMetadata,
	getOrpcFallbackProcedure,
	resolveOrpcHttpRouteTemplate,
	resolveOrpcRouteMetadata,
} from "./route-template";

describe("oRPC route-template helpers", () => {
	it("derives fallback procedure names from request pathname", () => {
		expect(getOrpcFallbackProcedure("/api/ping")).toBe("/ping");
		expect(getOrpcFallbackProcedure("/api")).toBe("/");
		expect(getOrpcFallbackProcedure("/health")).toBe("/health");
	});

	it("creates fallback route metadata from pathname", () => {
		expect(createOrpcFallbackRouteMetadata("/api/ping")).toEqual({
			httpRouteTemplate: "/ping",
			procedure: "/ping",
		});
	});

	it("resolves route metadata from procedure internals when present", () => {
		const procedure = {
			"~orpc": {
				route: {
					path: "/users/{userId}",
					operationId: "getUser",
				},
			},
		};

		expect(resolveOrpcRouteMetadata(procedure, ["users", "userId"])).toEqual({
			httpRouteTemplate: "/users/{userId}",
			procedure: "/users/userId",
			operationId: "getUser",
		});
	});

	it("falls back to procedure path and inferred operation id", () => {
		const procedure = {
			"~orpc": {
				route: {},
			},
		};

		expect(resolveOrpcRouteMetadata(procedure, ["ping"])).toEqual({
			httpRouteTemplate: "/ping",
			procedure: "/ping",
			operationId: "ping",
		});
	});

	it("converts resolved metadata templates to HTTP route templates", () => {
		expect(
			resolveOrpcHttpRouteTemplate({
				httpRouteTemplate: "/ping",
				procedure: "/ping",
			}),
		).toBe("/api/ping");

		expect(
			resolveOrpcHttpRouteTemplate({
				httpRouteTemplate: "/api/ping",
				procedure: "/api/ping",
			}),
		).toBe("/api/ping");
	});
});
