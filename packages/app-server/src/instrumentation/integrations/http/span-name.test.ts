import { describe, expect, it } from "vitest";
import { resolveSpanName, writeSpanNameOverride } from "./span-name";

describe("http instrumentation request span naming", () => {
	it("uses explicit request-scoped span name overrides", () => {
		const request = new Request("http://localhost/api/users/123");

		writeSpanNameOverride(request, {
			method: "get",
			template: "api/users/:id?include=roles",
		});

		expect(
			resolveSpanName(request, {
				method: "POST",
				template: "/api/fallback",
			}),
		).toBe("GET /api/users/:id");
	});

	it("falls back to middleware route template when no override is set", () => {
		const request = new Request("http://localhost/api/ping");

		expect(
			resolveSpanName(request, {
				method: "post",
				template: "/api/ping",
			}),
		).toBe("POST /api/ping");
	});
});
