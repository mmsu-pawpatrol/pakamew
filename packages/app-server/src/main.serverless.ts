import { app } from "./app";

export const handleRequest: typeof app.fetch = (request, env, executionCtx) => app.fetch(request, env, executionCtx);

export default handleRequest;
