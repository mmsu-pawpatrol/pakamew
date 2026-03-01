import z from "zod";
import { InjectedKeySymbol, type RuntimeInjectedSchema, type UnknownObject } from "./types";

/**
 * env query resolver used by `createGetEnv`.
 *
 * This function intentionally stays runtime-focused and lightly typed:
 * - inject key metadata into object schema fields
 * - resolve selected entries back to original env keys
 * - build a slice schema and parse source
 *
 * @param schema - The schema to query the environment from.
 * @param select - The selected entries to query the environment from.
 * @param source - The source to query the environment from.
 * @returns The extracted environment.
 */
export function queryEnvFromSchema(
	schema: z.ZodObject<z.ZodRawShape>,
	select: (shape: unknown) => readonly unknown[],
	source: Record<string, unknown>,
): unknown {
	const shape = injectKeys(schema.shape);
	const query = select(shape) as readonly z.ZodTypeAny[];
	const slice = buildSliceShape(query);
	return z.object(slice as z.ZodRawShape).parse(source);
}

/**
 * Attach hidden metadata to each field in the object schema shape.
 *
 * @param shape - The shape to inject the keys into.
 * @returns The injected shape.
 */
function injectKeys(shape: z.ZodRawShape): z.ZodRawShape {
	for (const [key, field] of Object.entries(shape)) injectKey(field as z.ZodTypeAny, key);

	return shape;
}

/**
 * Attach key metadata to one schema node.
 * If the same schema instance is used under multiple keys, fail fast.
 *
 * @param schema - The schema to inject the key into.
 * @param key - The key to inject.
 */
function injectKey(schema: z.ZodTypeAny, key: string): void {
	const oldKey = (schema as RuntimeInjectedSchema)[InjectedKeySymbol];

	if (typeof oldKey == "string" && oldKey !== key) {
		throw new Error(`Schema field is already associated with key "${oldKey}" and cannot be reassigned to "${key}"`);
	}

	if (oldKey === key) return;

	Object.defineProperty(schema, InjectedKeySymbol, {
		value: key,
		enumerable: false,
		configurable: true,
	});
}

/**
 * Build a `{ [ENV_KEY]: schema }` object from selected entries.
 *
 * Rules:
 * - duplicate keys are allowed; later entries win
 * - each entry must resolve to exactly one distinct env key
 *
 * @param schemas - The schemas to build the slice shape from.
 * @returns The built slice shape.
 */
function buildSliceShape(schemas: readonly z.ZodTypeAny[]): Record<string, z.ZodTypeAny> {
	const shape: Record<string, z.ZodTypeAny> = {};

	for (const schema of schemas) {
		const key = findInjectedKey(schema);
		shape[key] = schema;
	}

	return shape;
}

/**
 * Find the original env key associated with a selected entry.
 *
 * @param schema - The schema to find the injected key in.
 * @returns The injected key.
 */
function findInjectedKey(schema: z.ZodTypeAny): string {
	const keys = collectInjectedKeys(schema);

	if (keys.size === 0) {
		throw new Error(
			"Unable to resolve an environment key from the selected schema. Use a schema field from the provided schema shape.",
		);
	}

	if (keys.size > 1) {
		const sortedKeys = Array.from(keys).sort();
		throw new Error(
			`Selected schema entry combines multiple environment keys (${sortedKeys.join(", ")}). Select and transform one key at a time.`,
		);
	}

	return keys.values().next().value!;
}

/**
 * BFS over the selected schema graph and nested `def` internals.
 * Transformed schemas are new objects, so injected metadata may only exist
 * deeper in referenced inner nodes.
 *
 * @param schema - The schema to collect the injected keys from.
 * @returns The collected keys.
 */
function collectInjectedKeys(schema: z.ZodTypeAny): Set<string> {
	const keys = new Set<string>();
	const queue: unknown[] = [schema];
	const visited = new Set<UnknownObject>();

	while (queue.length > 0) {
		const current = queue.pop();
		if (!isObject(current) || visited.has(current)) {
			continue;
		}

		visited.add(current);

		if (isZodSchema(current)) {
			const key = (current as RuntimeInjectedSchema)[InjectedKeySymbol];
			if (typeof key == "string") {
				keys.add(key);
			}

			queue.push(current.def);
			continue;
		}

		if (Array.isArray(current)) {
			for (const child of current) {
				queue.push(child);
			}
			continue;
		}

		for (const child of Object.values(current)) {
			queue.push(child);
		}
	}

	return keys;
}

function isObject(value: unknown): value is UnknownObject {
	return typeof value === "object" && value !== null;
}

function isZodSchema(value: unknown): value is z.ZodTypeAny {
	return isObject(value) && "def" in value;
}
