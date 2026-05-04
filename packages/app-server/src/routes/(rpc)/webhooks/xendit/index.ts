/**
 * Xendit webhook service exports.
 */

import { receive } from "./payment-session";

interface PaymentSessionService extends Record<string, typeof receive> {
	/**
	 * @see {@link receive}
	 */
	receive: typeof receive;
}

const PaymentSession: PaymentSessionService = {
	receive,
};

export interface XenditWebhookService extends Record<string, PaymentSessionService> {
	/** Xendit payment-session webhook handlers. */
	PaymentSession: PaymentSessionService;
}

/** Xendit webhook service methods published by the root oRPC router. */
export const Xendit: XenditWebhookService = {
	PaymentSession,
};
