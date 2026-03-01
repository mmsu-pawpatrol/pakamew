import { queryEnvFromSchema } from "./resolver";
import type { AnyObjectSchema, BoundGetEnv, UnboundGetEnv } from "./types";

export type { AnyObjectSchema, BoundGetEnv, UnboundGetEnv } from "./types";

/**
 * Create an unbound get environment function.
 *
 * @returns The created get environment function.
 */
export function createGetEnv(): UnboundGetEnv;

/**
 * Create a schema-bound get environment function with field-level docs sourced
 * from an env interface.
 *
 * @example
 * ```ts
 * interface Env {
 * 	// Host/IP address that the server binds to.
 * 	HOST: string;
 *
 * 	// TCP port that the server listens on.
 * 	PORT: number;
 * }
 *
 * const EnvSchema = z.object({
 * 	HOST: z.string().min(1),
 * 	PORT: z.coerce.number().int().min(1),
 * });
 *
 * // The explicit schema generic disambiguates overloaded signatures when
 * // providing EnvDocShape explicitly.
 * const getEnv = createGetEnv<Env, typeof EnvSchema>(EnvSchema);
 * const env = getEnv((shape) => [shape.HOST, shape.PORT]);
 * ```
 *
 * @param schema - The schema to get the environment from.
 * @returns The created get environment function.
 */
export function createGetEnv<EnvDocShape extends object, const Schema extends AnyObjectSchema>(
	schema: Schema,
): BoundGetEnv<Schema, EnvDocShape>;

/**
 * Create a schema-bound get environment function.
 *
 * @param schema - The schema to get the environment from.
 * @returns The created get environment function.
 */
export function createGetEnv<const Schema extends AnyObjectSchema>(schema: Schema): BoundGetEnv<Schema>;

export function createGetEnv(schema?: AnyObjectSchema): BoundGetEnv<AnyObjectSchema> | UnboundGetEnv {
	if (schema) {
		return ((select, source = process.env) =>
			queryEnvFromSchema(
				schema,
				select as (shape: unknown) => readonly unknown[],
				source,
			)) as BoundGetEnv<AnyObjectSchema>;
	}

	return ((unboundSchema, select, source = process.env) =>
		queryEnvFromSchema(unboundSchema, select as (shape: unknown) => readonly unknown[], source)) as UnboundGetEnv;
}
