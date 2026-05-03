import { getEnv } from "./env";

const { CORS_ALLOWED_ORIGINS } = getEnv((shape) => [shape.CORS_ALLOWED_ORIGINS]);

export const allowedOrigins = [...CORS_ALLOWED_ORIGINS];
