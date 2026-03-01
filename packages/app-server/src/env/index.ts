import "dotenv/config";
import { createGetEnv } from "@pakamew/shared/utils/get-env";
import z from "zod";
import { CoreEnvSchema, type CoreEnv } from "./core";
import {
	ObservabilityEnvSchema,
	ObservabilitySwitchesEnvSchema,
	type ObservabilityEnv,
	type ObservabilitySwitchesEnv,
} from "./observability";
import { OtelEnvSchema, type OtelEnv } from "./otel";

export interface Env extends CoreEnv, OtelEnv, ObservabilityEnv, ObservabilitySwitchesEnv {}

export const EnvSchema = z.object({
	...CoreEnvSchema.shape,
	...OtelEnvSchema.shape,
	...ObservabilityEnvSchema.shape,
	...ObservabilitySwitchesEnvSchema.shape,
}) satisfies z.ZodType<Env>;

/**
 * Get a slice of the environment variables. Since the backend runs in different environments, this helper function allows only requiring a subset of environment variables at a given time (Development, Testing, CI, Production, etc.).
 *
 * @param slice - The slice of the environment variables to get.
 * @param source - The source of the environment variables.
 * @returns The environment variables for the given slice.
 */
export const getEnv = createGetEnv<Env, typeof EnvSchema>(EnvSchema);
