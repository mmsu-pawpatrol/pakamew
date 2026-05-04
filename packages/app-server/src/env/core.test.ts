import { describe, expect, it } from "vitest";
import { getEnv } from ".";
import { DEFAULT_CORS_ALLOWED_ORIGINS, parseAllowedOrigins } from "./core";

describe("CoreEnvSchema", () => {
	it("uses localhost origins by default for browser-facing development", () => {
		const env = getEnv((shape) => [shape.CORS_ALLOWED_ORIGINS], {});

		expect(env.CORS_ALLOWED_ORIGINS).toEqual([...DEFAULT_CORS_ALLOWED_ORIGINS]);
	});

	it("parses comma-separated origins and normalizes them", () => {
		const env = getEnv((shape) => [shape.CORS_ALLOWED_ORIGINS], {
			CORS_ALLOWED_ORIGINS: "https://pakamew.site, https://pakamew.site/, https://preview.pakamew.site/app",
		});

		expect(env.CORS_ALLOWED_ORIGINS).toEqual(["https://pakamew.site", "https://preview.pakamew.site"]);
	});

	it("rejects unsupported origin protocols", () => {
		expect(() => parseAllowedOrigins("ws://lsg.pakamew.site")).toThrow(
			"CORS allowed origins must use http or https: ws://lsg.pakamew.site",
		);
	});
});
