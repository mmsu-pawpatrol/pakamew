/**
 * Webhook service router exports.
 */

import { Xendit } from "./xendit";

type WebhookServiceMethod = typeof Xendit;

export interface WebhookService extends Record<string, WebhookServiceMethod> {
	/** Xendit webhook handlers. */
	Xendit: typeof Xendit;
}

/** Webhook service methods published by the root oRPC router. */
export const WebhookService: WebhookService = {
	Xendit,
};

/** Webhook service router export used by the root router. */
export const webhook = WebhookService;
