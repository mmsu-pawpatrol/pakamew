import type { Hono } from "hono";
import { initRpcHandlerRoutes } from "./(handler)";
import { initOpenApiRoutes } from "./openapi";
import { ping } from "./ping";

export const router = {
	ping,
};

export function initRpcRoutes(app: Hono) {
	initOpenApiRoutes(app, router);
	initRpcHandlerRoutes(app, router);
}
