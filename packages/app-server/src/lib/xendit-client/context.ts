/**
 * Shared Xendit dependency injection for internal oRPC procedures.
 *
 * This module centralizes how provider config and overridable services are
 * resolved so resource callables and the public `XenditClient` stay aligned.
 */

import { os } from "@orpc/server";
import { getEnv } from "../../env";

/** Resolved Xendit API configuration. */
export interface Config {
	/** Base URL for Xendit's REST API. */
	baseUrl: string;

	/** Secret key used for basic-auth requests. */
	secretKey: string;
}

/** Shared services used by Xendit procedures. */
export interface Services {
	/** Fetch implementation used for outbound HTTP requests. */
	fetch: typeof fetch;
}

/** Constructor-friendly overrides for the Xendit client. */
export interface Options {
	/** Optional config overrides. */
	config?: Partial<Config>;

	/** Optional shared-service overrides. */
	services?: Partial<Services>;
}

/** Fully resolved dependencies for Xendit procedures. */
export interface ResolvedContext {
	/** Resolved API configuration. */
	config: Config;

	/** Resolved shared services. */
	services: Services;
}

/** Initial oRPC context accepted by Xendit procedures. */
export interface Context {
	/** Optional Xendit overrides provided by the caller. */
	xendit?: Options | ResolvedContext;
}

/** Base procedure builder that resolves Xendit dependencies once per call. */
export const base = os.$context<Context>().use(async ({ context, next }) =>
	next({
		context: {
			...context,
			xendit: resolveContext(context.xendit),
		},
	}),
);

/**
 * Resolve provider config from env and optional overrides.
 *
 * @param overrides - Optional config overrides for tests or custom clients.
 * @returns Provider config safe to pass into internal callables.
 */
export function resolveConfig(overrides: Partial<Config> = {}): Config {
	const env = getEnv((shape) => [shape.XENDIT_BASE_URL, shape.XENDIT_SECRET_KEY]);

	return {
		baseUrl: overrides.baseUrl ?? env.XENDIT_BASE_URL,
		secretKey: overrides.secretKey ?? env.XENDIT_SECRET_KEY,
	};
}

/**
 * Resolve shared services from optional overrides.
 *
 * @param overrides - Optional service overrides for tests or adapters.
 * @returns Shared services used by internal callables.
 */
export function resolveServices(overrides: Partial<Services> = {}): Services {
	return {
		fetch: overrides.fetch ?? globalThis.fetch,
	};
}

/**
 * Resolve the full provider context consumed by internal callables.
 *
 * @param options - Optional config and service overrides.
 * @returns The normalized context shape used by Xendit callables.
 */
export function resolveContext(options: Options | ResolvedContext = {}): ResolvedContext {
	return {
		config: resolveConfig(options.config),
		services: resolveServices(options.services),
	};
}
