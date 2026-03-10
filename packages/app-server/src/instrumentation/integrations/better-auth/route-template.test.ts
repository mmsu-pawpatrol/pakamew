import { describe, expect, it } from "vitest";
import { buildAuthRouteTemplateMatcher, getAuthRouteBasePath, matchAuthRouteTemplate } from "./route-template";

function createEndpoint(path: string, method?: string | string[]): unknown {
	const endpoint = (() => undefined) as (() => undefined) & {
		path: string;
		options?: { method?: string | string[] };
	};
	endpoint.path = path;
	if (method !== undefined) {
		endpoint.options = { method };
	}
	return endpoint;
}

describe("better-auth route-template helpers", () => {
	it("uses /api/auth as the default base path", () => {
		const authLike = {
			api: {},
		};

		expect(getAuthRouteBasePath(authLike)).toBe("/api/auth");
	});

	it("matches endpoint templates with method awareness", () => {
		const authLike = {
			options: { basePath: "/api/auth" },
			api: {
				getSession: createEndpoint("/get-session", "GET"),
				callback: createEndpoint("/callback/:id", ["GET", "POST"]),
			},
		};

		const matcher = buildAuthRouteTemplateMatcher(authLike);
		expect(matcher("GET", "/api/auth/get-session")?.name).toBe("getSession");
		expect(matcher("POST", "/api/auth/callback/123")?.name).toBe("callback");
		expect(matcher("DELETE", "/api/auth/get-session")).toBeUndefined();
	});

	it("prioritizes static routes over parameterized routes", () => {
		const authLike = {
			options: { basePath: "/api/auth" },
			api: {
				userById: createEndpoint("/user/:id", "GET"),
				userList: createEndpoint("/user/list", "GET"),
			},
		};

		const matcher = buildAuthRouteTemplateMatcher(authLike);
		expect(matcher("GET", "/api/auth/user/list")?.name).toBe("userList");
	});

	it("supports wildcard method endpoints", () => {
		const authLike = {
			options: { basePath: "/api/auth" },
			api: {
				openApiSchema: createEndpoint("/open-api/generate-schema"),
			},
		};

		const matcher = buildAuthRouteTemplateMatcher(authLike);
		expect(matcher("GET", "/api/auth/open-api/generate-schema")?.name).toBe("openApiSchema");
		expect(matcher("POST", "/api/auth/open-api/generate-schema")?.name).toBe("openApiSchema");
	});

	it("returns wildcard template and matched endpoint metadata", () => {
		const authLike = {
			options: { basePath: "/api/auth" },
			api: {
				openApiSchema: createEndpoint("/open-api/generate-schema", "GET"),
			},
		};

		expect(matchAuthRouteTemplate(authLike, "GET", "/api/auth/open-api/generate-schema")).toEqual({
			template: "/api/auth/open-api/generate-schema",
			endpointKey: "openApiSchema",
		});
	});
});
