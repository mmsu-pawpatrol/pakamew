import { describe, expect, it } from "vitest";
import z from "zod";
import { enrichZodErrorLogEntry, type ZodErrorLogDetails } from "./zod";

function expectZodErrorDetails(value: unknown): ZodErrorLogDetails {
	if (typeof value !== "object" || value === null || !("zodError" in value)) {
		throw new Error("Expected enriched log entry to contain zodError details.");
	}

	return value.zodError as ZodErrorLogDetails;
}

describe("enrichZodErrorLogEntry", () => {
	it("adds detailed Zod error context to log entries", () => {
		const result = z
			.object({
				payment_session_id: z.string().min(1),
				status: z.enum(["ACTIVE", "COMPLETED"]),
			})
			.safeParse({ payment_session_id: null, status: "UNKNOWN" });

		if (result.success) throw new Error("Expected schema parsing to fail.");

		const enriched = enrichZodErrorLogEntry({ source: "test", error: result.error });
		const zodError = expectZodErrorDetails(enriched);

		expect(zodError.name).toBe("ZodError");
		expect(zodError.issues).toHaveLength(2);
		expect(zodError.issues.map((issue) => issue.path.join("."))).toEqual(["payment_session_id", "status"]);
	});

	it("finds nested Zod errors on common error wrapper fields", () => {
		const result = z.object({ id: z.string().uuid() }).safeParse({ id: "not-a-uuid" });

		if (result.success) throw new Error("Expected schema parsing to fail.");

		const enriched = enrichZodErrorLogEntry({
			source: "test",
			error: {
				cause: result.error,
			},
		});
		const zodError = expectZodErrorDetails(enriched);

		expect(zodError.issues[0]?.path).toEqual(["id"]);
	});

	it("preserves entries without Zod errors", () => {
		const entry = { source: "test", error: new Error("plain error") };

		expect(enrichZodErrorLogEntry(entry)).toBe(entry);
	});
});
