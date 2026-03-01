import type { IncomingMessage, ServerResponse } from "node:http";
import { getRequestListener } from "@hono/node-server";
import type { Connect } from "vite";
import { app, isAppRoute } from "./app";

const listener = getRequestListener(app.fetch);

function getRequestPathname(req: IncomingMessage): string {
	const host = req.headers.host ?? "localhost";
	const url = req.url ?? "/";

	return new URL(url, `http://${host}`).pathname;
}

export const viteNodeApp = async (
	req: IncomingMessage,
	res: ServerResponse,
	next?: Connect.NextFunction,
): Promise<void> => {
	const pathname = getRequestPathname(req);
	const method = req.method ?? "GET";

	if (!isAppRoute(method, pathname)) {
		if (next) next();
		return;
	}

	await listener(req, res);
};
