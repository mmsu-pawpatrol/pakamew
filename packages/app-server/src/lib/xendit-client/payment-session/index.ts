/**
 * Public Xendit payment-session resource surface.
 *
 * The resource methods delegate to internal oRPC callables bound to a resolved
 * Xendit context so callers do not pass provider configuration per request.
 */

import type { Context } from "../context";
import { create } from "./create";
import { get } from "./get";
import type { PaymentSession } from "./shared";

/** Resource client for Xendit payment sessions. */
export interface PaymentSessionClient {
	/**
	 * @see {@link create}
	 */
	create: (input: Parameters<typeof create>[0]) => Promise<PaymentSession>;

	/**
	 * @see {@link get}
	 */
	get: (id: string) => Promise<PaymentSession>;
}

/**
 * Bind payment-session operations to a resolved Xendit context.
 *
 * @param context - Resolved provider context reused by each resource method.
 * @returns Resource methods that pass the bound context into internal callables.
 */
export function createPaymentSessionClient(context: Context): PaymentSessionClient {
	return {
		create: async (input) => await create(input, { context }),

		get: async (id) => await get({ id }, { context }),
	};
}
