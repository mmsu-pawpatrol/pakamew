const REDACTED_VALUE = "[REDACTED]";
const SENSITIVE_ENV_KEY_PATTERN =
	/(^|_|-)(secret|token|password|passwd|passphrase|key|private|credential|auth|cookie)(_|-|$)/i;

function redactUrlCredentials(value: string): { value: string; redacted: boolean } {
	try {
		const parsed = new URL(value);
		if (!parsed.username && !parsed.password) {
			return { value, redacted: false };
		}

		parsed.username = parsed.username ? REDACTED_VALUE : "";
		parsed.password = parsed.password ? REDACTED_VALUE : "";
		return { value: parsed.toString(), redacted: true };
	} catch {
		return { value, redacted: false };
	}
}

function redactEnvValue(key: string, value: string | undefined): { value: string | undefined; redacted: boolean } {
	if (value === undefined) return { value: undefined, redacted: false };
	if (SENSITIVE_ENV_KEY_PATTERN.test(key)) return { value: REDACTED_VALUE, redacted: true };
	return redactUrlCredentials(value);
}

export function redactEnvLogValue(key: string, value: unknown): { value: unknown; redacted: boolean } {
	if (typeof value !== "string") return { value, redacted: false };
	return redactEnvValue(key, value);
}

/**
 * Build a raw environment snapshot limited to provided schema keys.
 */
export function getSchemaRawEnvSnapshot(
	schemaShape: Record<string, unknown>,
	source: NodeJS.ProcessEnv = process.env,
): Record<string, string | null | undefined> {
	const keys = Object.keys(schemaShape).sort();
	const snapshot: Record<string, string | null | undefined> = {};

	for (const key of keys) {
		const hasKey = Object.prototype.hasOwnProperty.call(source, key);
		const raw = source[key];
		if (!hasKey) {
			snapshot[key] = "$undefined";
			continue;
		}

		if (raw === "" || raw === undefined) {
			snapshot[key] = "$null";
			continue;
		}

		snapshot[key] = redactEnvValue(key, raw).value;
	}

	return snapshot;
}
