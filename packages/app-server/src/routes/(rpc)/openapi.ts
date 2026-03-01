import { SpanKind } from "@opentelemetry/api";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import type { Hono } from "hono";
import { withSpan } from "../../lib/instrumentation/tracer";

const openAPIGenerator = new OpenAPIGenerator({
	schemaConverters: [new ZodToJsonSchemaConverter()],
});

type OpenApiRouter = Parameters<typeof openAPIGenerator.generate>[0];

export function initOpenApiRoutes(app: Hono, router: OpenApiRouter) {
	app.get("/api/openapi/orpc.json", async (c) =>
		withSpan(
			"openapi.orpc.generate",
			async () => {
				const spec = await openAPIGenerator.generate(router, {
					info: { title: "Pakamew oRPC API", version: "1.0.0" },
					servers: [{ url: "/api" }],
				});

				return c.json(spec);
			},
			{
				attributes: { "http.method": c.req.method, "http.route": "/api/openapi/orpc.json" },
				kind: SpanKind.INTERNAL,
			},
		),
	);
}
