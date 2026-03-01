import { SpanKind } from "@opentelemetry/api";
import type { Hono } from "hono";
import { auth } from "../../auth";
import { withSpan } from "../../lib/instrumentation/tracer";
import { getAuthWildcardRouteTemplate, matchAuthRouteTemplate } from "./(auth)/route-template";

export function initAuthRoutes(app: Hono) {
	const fallbackRouteTemplate = getAuthWildcardRouteTemplate(auth);

	app.on(["GET", "POST"], "/api/auth/*", async (c) => {
		const pathname = new URL(c.req.url).pathname;
		const match = matchAuthRouteTemplate(auth, c.req.method, pathname);
		const routeTemplate = match?.template ?? fallbackRouteTemplate;
		const attributes: Record<string, string> = {
			"http.method": c.req.method,
			"http.route": routeTemplate,
		};

		if (match?.endpointKey) {
			attributes["auth.endpoint"] = match.endpointKey;
		}

		return withSpan("auth.handler", () => auth.handler(c.req.raw), {
			attributes,
			kind: SpanKind.SERVER,
		});
	});
}
