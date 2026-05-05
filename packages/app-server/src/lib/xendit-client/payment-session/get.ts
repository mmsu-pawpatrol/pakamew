/**
 * Internal Xendit payment-session lookup.
 *
 * This file defines the oRPC callable that loads an existing payment session
 * from Xendit and returns the normalized response shape used by the server.
 * The procedure is internal to the server and is invoked through
 * `XenditClient.PaymentSession.get()`.
 */

import { ORPCError, type } from "@orpc/server";
import { getLogger } from "../../../instrumentation/core";
import { base } from "../context";
import { PaymentSessionSchema, toAuthorizationHeader, type PaymentSession } from "./shared";

const logger = getLogger().child({ scope: "xendit.payment-session.get" });

/**
 * Load one hosted payment session from Xendit.
 *
 * @remarks
 * Input is the provider session ID previously stored on a donation. Output is
 * the normalized subset of fields the server needs for reconciliation.
 *
 * @param input - Payment-session lookup payload.
 * @param input.id - Provider session ID stored on the donation row.
 */
export const get = base
	.input(type<{ id: string }>())
	.output(PaymentSessionSchema)
	.handler(async ({ context, input }) => {
		const url = new URL(`/sessions/${input.id}`, `${context.xendit.config.baseUrl}/`);
		const response = await context.xendit.services.fetch(url, {
			method: "GET",
			headers: {
				accept: "application/json",
				authorization: toAuthorizationHeader(context.xendit.config.secretKey),
			},
		});

		if (!response.ok) {
			// Only a bounded response slice is logged to avoid leaking full provider payloads.
			const body = await response.text();

			logger.error(
				{
					event: "xendit.payment-session.get.failed",
					paymentSessionId: input.id,
					status: response.status,
					statusText: response.statusText,
					responseBody: body.slice(0, 500),
				},
				"Failed to load Xendit payment session",
			);

			throw new ORPCError("BAD_GATEWAY", {
				message: `Xendit session lookup failed with status ${response.status}.`,
			});
		}

		return PaymentSessionSchema.parse(await response.json()) satisfies PaymentSession;
	})
	.callable();
