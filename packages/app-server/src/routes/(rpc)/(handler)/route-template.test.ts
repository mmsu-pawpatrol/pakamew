import { describe, expect, it } from "vitest";
import {
	applyOrpcRouteMetadata,
	createOrpcFallbackRouteMetadata,
	getOrpcFallbackProcedure,
	resolveOrpcHttpRouteTemplate,
	resolveOrpcRouteMetadata,
	type OrpcRouteMetadataCarrier,
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

	it("applies metadata updates to a route metadata carrier", () => {
		const carrier: OrpcRouteMetadataCarrier = {
			orpcRouteMetadata: {
				httpRouteTemplate: "/fallback",
				procedure: "/fallback",
			},
		};

		applyOrpcRouteMetadata(
			carrier,
			{
				"~orpc": {
					route: {
						path: "/posts/{postId}",
						operationId: "getPost",
					},
				},
			},
			["posts", "postId"],
		);

		expect(carrier.orpcRouteMetadata).toEqual({
			httpRouteTemplate: "/posts/{postId}",
			procedure: "/posts/postId",
			operationId: "getPost",
		});
	});

	it("converts resolved metadata templates to HTTP route templates", () => {
		expect(
			resolveOrpcHttpRouteTemplate({
				httpRouteTemplate: "/ping",
				procedure: "/ping",
			}),
		).toBe("/api/ping");
	});
});
