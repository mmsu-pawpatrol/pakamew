import type { RouterClient } from "@orpc/server";
import type { router } from "../routes/(rpc)";

export type ApiClient = RouterClient<typeof router>;
