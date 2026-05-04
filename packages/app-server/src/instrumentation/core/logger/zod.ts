import { ZodError } from "zod";

/** Structured Zod validation details attached to log records. */
export interface ZodErrorLogDetails {
	issues: ZodError["issues"];
	message: string;
	name: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toZodErrorLogDetails(error: ZodError): ZodErrorLogDetails {
	return {
		name: error.name,
		message: error.message,
		issues: error.issues,
	};
}

function findZodError(value: unknown, seen = new WeakSet<object>()): ZodError | undefined {
	if (value instanceof ZodError) return value;
	if (!isRecord(value) || seen.has(value)) return undefined;

	seen.add(value);

	const directChildren = [
		value.error,
		value.err,
		value.cause,
		value.validationError,
		value.originalError,
		value.internal,
	];

	for (const child of directChildren) {
		const zodError = findZodError(child, seen);
		if (zodError) return zodError;
	}

	return undefined;
}

/** Enrich a log entry with Zod validation details when a ZodError is present. */
export function enrichZodErrorLogEntry<T>(value: T): T | (T & { zodError: ZodErrorLogDetails }) {
	if (!isRecord(value) || "zodError" in value) return value;

	const zodError = findZodError(value);
	if (!zodError) return value;

	return {
		...value,
		zodError: toZodErrorLogDetails(zodError),
	};
}
