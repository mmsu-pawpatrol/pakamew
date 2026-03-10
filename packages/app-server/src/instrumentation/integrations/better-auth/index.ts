import type { Auth } from "better-auth/types";
import type { MiddlewareHandler } from "hono";
import { matchAuthRouteTemplate } from "../better-auth/route-template";
import { HttpInstrumentation } from "../http";

/**
 * Better Auth integration that normalizes auth endpoint routes and
 * applies request-scoped HTTP span name overrides.
 */
export const BetterAuthInstrumentation = {
	/**
	 * Creates Hono middleware for Better Auth route span-name overrides.
	 * @param deps - Integration dependencies.
	 * @param deps.auth - Better Auth instance used to resolve endpoint templates.
	 * @returns A middleware that sets a normalized auth span name template.
	 */
	middleware(deps: { auth: Auth }): MiddlewareHandler {
		return async (c, next) => {
			const pathname = new URL(c.req.url).pathname;
			const match = matchAuthRouteTemplate(deps.auth, c.req.method, pathname);
			const template = match?.template ?? "/api/auth/*";

			HttpInstrumentation.setSpanName(c.req.raw, { method: c.req.method, template });
			await next();
		};
	},
};
