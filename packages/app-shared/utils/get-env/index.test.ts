import { describe, expect, expectTypeOf, it } from "vitest";
import z from "zod";
import { createGetEnv } from "./index";

const TestEnvSchema = z.object({
	HOST: z.string().min(1).default("127.0.0.1"),
	PORT: z.coerce.number().int().min(1).max(65535).default(3000),
	DATABASE_URL: z.string().min(1),
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

describe("createGetEnv", () => {
	it("parses selected fields from a bound schema", () => {
		const getEnv = createGetEnv(TestEnvSchema);
		const env = getEnv((shape) => [shape.HOST, shape.PORT], {});

		expect(env).toEqual({
			HOST: "127.0.0.1",
			PORT: 3000,
		});
	});

	it("resolves original keys after schema transformations", () => {
		const getEnv = createGetEnv(TestEnvSchema);
		const env = getEnv((shape) => [shape.DATABASE_URL.optional(), shape.PORT.transform((value) => value + 1)], {
			PORT: "3000",
		});

		expect(env).toEqual({
			DATABASE_URL: undefined,
			PORT: 3001,
		});
	});

	it("supports unbound usage with schema provided per call", () => {
		const getEnv = createGetEnv();
		const env = getEnv(TestEnvSchema, (shape) => [shape.NODE_ENV], { NODE_ENV: "test" });

		expect(env).toEqual({
			NODE_ENV: "test",
		});
	});

	it("throws for schemas not selected from the injected shape", () => {
		const getEnv = createGetEnv(TestEnvSchema);

		expect(() => getEnv(() => [z.string()], {})).toThrowError(
			"Unable to resolve an environment key from the selected schema. Use a schema field from the provided schema shape.",
		);
	});

	it("uses the latest entry when the same environment key is selected multiple times", () => {
		const getEnv = createGetEnv(TestEnvSchema);
		const env = getEnv((shape) => [shape.PORT, shape.PORT.transform((value) => value + 1)], { PORT: "3000" });

		expect(env).toEqual({
			PORT: 3001,
		});
	});

	it("throws when one selected entry combines multiple environment keys", () => {
		const getEnv = createGetEnv(TestEnvSchema);

		expect(() =>
			getEnv((shape) => [z.union([shape.HOST, shape.DATABASE_URL])], { HOST: "127.0.0.1", DATABASE_URL: "db" }),
		).toThrowError(
			"Selected schema entry combines multiple environment keys (DATABASE_URL, HOST). Select and transform one key at a time.",
		);
	});

	it("infers optional and nullable output from selected transformed schemas", () => {
		const getEnv = createGetEnv(TestEnvSchema);

		const optionalEnv = getEnv((shape) => [shape.DATABASE_URL.optional()], {});
		expectTypeOf(optionalEnv).toEqualTypeOf<{ DATABASE_URL?: string | undefined }>();

		const nullableEnv = getEnv((shape) => [shape.HOST.nullable()], { HOST: "127.0.0.1" });
		expectTypeOf(nullableEnv).toEqualTypeOf<{ HOST: string | null }>();
	});
});
