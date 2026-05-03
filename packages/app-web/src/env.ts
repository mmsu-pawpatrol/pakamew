import { z } from "zod/mini";

export interface Env {
	/** Base URL for the backend API server. */
	VITE_API_URL: string;

	/** Public HLS URL used for the default livestream player path. */
	VITE_LIVESTREAM_PUBLIC_HLS_URL: string;

	/** Gateway websocket URL for the raw-frame livestream fallback/debug path. */
	VITE_LIVESTREAM_GATEWAY_WS_URL: string;

	VITE_DESIGN_TIME: boolean;
}

export const EnvSchema = z.object({
	VITE_API_URL: z._default(z.string().check(z.url()), "http://127.0.0.1:3000"),

	VITE_LIVESTREAM_PUBLIC_HLS_URL: z._default(z.string(), ""),

	VITE_LIVESTREAM_GATEWAY_WS_URL: z._default(z.string(), "ws://127.0.0.1:3000/viewer"),

	VITE_DESIGN_TIME: z._default(z.stringbool(), false),
});

// NOTE: This is a workaround to allow the server-side code to import the client-side environment variables. "env.ts" is a client-side file and import.meta is not recognized in tsconfig.node.json (server-side tsconfig)
export const env: Env = EnvSchema.parse((import.meta as unknown as Record<string, unknown>).env ?? {});
