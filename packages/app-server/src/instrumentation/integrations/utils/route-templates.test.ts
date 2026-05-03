import { describe, expect, it } from "vitest";
import {
	createRouteTemplateMatcher,
	joinRouteTemplates,
	normalizeRouteTemplate,
	selectMostSpecificRouteTemplate,
} from "./route-templates";

describe("route template utilities", () => {
	it("normalizes route templates and strips query strings", () => {
		expect(normalizeRouteTemplate("api//users/123/?q=1")).toBe("/api/users/123");
		expect(normalizeRouteTemplate("/")).toBe("/");
	});

	it("joins route templates with normalized separators", () => {
		expect(joinRouteTemplates("/api/auth/", "/open-api/generate-schema")).toBe("/api/auth/open-api/generate-schema");
		expect(joinRouteTemplates("/", "/ping")).toBe("/ping");
		expect(joinRouteTemplates("/api", "/")).toBe("/api");
	});

	it("matches the most specific template for a method and pathname", () => {
		const match = createRouteTemplateMatcher([
			{ method: "GET", template: "/api/users/:id", name: "userById" },
			{ method: "GET", template: "/api/users/list", name: "listUsers" },
			{ method: "*", template: "/api/users/*", name: "wildcard" },
		]);

		expect(match("GET", "/api/users/list")?.name).toBe("listUsers");
		expect(match("GET", "/api/users/42")?.name).toBe("userById");
		expect(match("POST", "/api/users/42")?.name).toBe("wildcard");
	});

	it("picks the most specific template from overlapping matched routes", () => {
		const match = selectMostSpecificRouteTemplate([
			{ method: "ALL", template: "*", name: "rootMiddleware" },
			{ method: "GET", template: "/api/health", name: "health" },
			{ method: "ALL", template: "/api/*", name: "rpcCatchAll" },
		]);

		expect(match?.name).toBe("health");
		expect(match?.template).toBe("/api/health");
	});
});
