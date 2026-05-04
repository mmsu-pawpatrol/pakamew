/**
 * Public Xendit client used by backend flows.
 *
 * The constructor resolves provider configuration once and exposes resource
 * clients that delegate to internal oRPC callables. Callers should construct
 * this class instead of reading Xendit env config themselves.
 */

import { resolveContext, type Context, type Options } from "./context";
import { createPaymentSessionClient, type PaymentSessionClient } from "./payment-session";

/** Xendit API surface available to backend flows. */
export class XenditClient {
	/** Internal oRPC context shared by resource clients. */
	readonly #context: Context;

	/** Payment-session resource API. */
	readonly PaymentSession: PaymentSessionClient;

	/**
	 * Build a Xendit client with env defaults and optional overrides.
	 *
	 * @param options - Optional provider config or service overrides.
	 */
	constructor(options: Options = {}) {
		this.#context = {
			xendit: resolveContext(options),
		};
		this.PaymentSession = createPaymentSessionClient(this.#context);
	}
}
