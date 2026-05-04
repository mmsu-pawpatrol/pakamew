/**
 * App-server environment schema composition.
 */

import "dotenv/config";
import { createGetEnv } from "@pakamew/shared/utils/get-env";
import z from "zod";
import { CoreEnvSchema, type CoreEnv } from "./core";
import { FeederEnvSchema, type FeederEnv } from "./feeder";
import {
	ObservabilityEnvSchema,
	ObservabilitySwitchesEnvSchema,
	type ObservabilityEnv,
	type ObservabilitySwitchesEnv,
} from "./observability";
import { OtelEnvSchema, type OtelEnv } from "./otel";
import { PaymentsEnvSchema, type PaymentsEnv } from "./payments";

/** Fully composed app-server environment contract. */
export interface Env extends CoreEnv, FeederEnv, PaymentsEnv, OtelEnv, ObservabilityEnv, ObservabilitySwitchesEnv {}

/** Runtime schema for the composed app-server environment. */
export const EnvSchema = z.object({
	...CoreEnvSchema.shape,
	...FeederEnvSchema.shape,
	...PaymentsEnvSchema.shape,
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
