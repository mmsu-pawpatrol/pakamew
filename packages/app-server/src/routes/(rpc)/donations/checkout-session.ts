/**
 * Public donation checkout creation procedure.
 *
 * This route validates the donor's selected tier, creates the pending
 * donation record, starts a hosted Xendit checkout session, and stores the
 * provider identifiers needed for later webhook reconciliation.
 */

import { ORPCError, os } from "@orpc/server";
import { DONATION_TIERS } from "@pakamew/shared/lib/donation";
import { ShortTermDefaultDonationUserId } from "@pakamew/shared/lib/testing";
import z from "zod";
import { DispenseStatus, DonationStatus } from "../../../../prisma/generated/client";
import { getEnv } from "../../../env";
import { getLogger } from "../../../instrumentation/core";
import { XenditClient } from "../../../lib/xendit-client";
import { DonationRepo } from "../data/donations";
import { getFeederStatus } from "../feeder/shared";

const logger = getLogger().child({ scope: "donations.checkout-session.create" });
const xendit = new XenditClient();

/** Create a donation checkout session. */
export const create = os
	.route({ method: "POST", path: "/donations/checkout-session" })
	.input(
		z.object({
			amount: z.number().int().positive(),
			name: z.string().trim().max(120).optional(),
		}),
	)
	.output(
		z.object({
			donationId: z.uuid(),
			paymentLinkUrl: z.string().url(),
			expiresAt: z.string().min(1),
		}),
	)
	.handler(async ({ input }) => {
		const tier = DONATION_TIERS.find((candidate) => candidate.amount === input.amount);
		if (!tier)
			throw new ORPCError("BAD_REQUEST", {
				message: "The selected donation amount is not available.",
			});

		// Checkout creation is blocked before payment when the feeder cannot reasonably fulfill an immediate feed.
		const feederStatus = getFeederStatus();
		if (!feederStatus.broker.connected)
			throw new ORPCError("CONFLICT", {
				message: "The feeder is currently unavailable.",
			});
		if (feederStatus.latestKnownDeviceState.state === "offline")
			throw new ORPCError("CONFLICT", {
				message: "The feeder is currently offline.",
			});
		if (feederStatus.latestKnownDeviceState.busy)
			throw new ORPCError("CONFLICT", {
				message: "The feeder is currently busy.",
			});

		const env = getEnv((shape) => [
			shape.XENDIT_SUCCESS_RETURN_URL,
			shape.XENDIT_CANCEL_RETURN_URL,
			shape.XENDIT_ALLOWED_PAYMENT_CHANNELS,
		]);
		const donationId = crypto.randomUUID();
		const donorName = input.name?.trim();
		const normalizedDonorName = donorName && donorName.length > 0 ? donorName : null;

		// Persist the donation before contacting Xendit so webhooks have a durable reconciliation target.
		const donation = await DonationRepo.create({
			data: {
				id: donationId,
				userId: ShortTermDefaultDonationUserId,
				name: normalizedDonorName,
				amount: tier.amount,
				status: DonationStatus.PENDING,
				dispenseStatus: DispenseStatus.NOT_STARTED,
				xenditReferenceId: `donation_${donationId}`,
			},
		});

		// Xendit return URLs are navigation-only; payment truth still comes from the webhook.
		const successReturnUrl = new URL(env.XENDIT_SUCCESS_RETURN_URL);
		successReturnUrl.searchParams.set("donationId", donation.id);

		const cancelReturnUrl = new URL(env.XENDIT_CANCEL_RETURN_URL);
		cancelReturnUrl.searchParams.set("donationId", donation.id);

		let paymentSession;
		try {
			// Xendit receives only checkout data needed for hosted payment; anonymous donors use generic display copy.
			paymentSession = await xendit.PaymentSession.create({
				reference_id: donation.xenditReferenceId,
				session_type: "PAY",
				mode: "PAYMENT_LINK",
				amount: donation.amount,
				currency: "PHP",
				country: "PH",
				customer: {
					reference_id: `donor_${donation.id}`,
					type: "INDIVIDUAL",
					individual_detail: {
						given_names: donation.name ?? "Anonymous Donor",
					},
				},
				allowed_payment_channels: env.XENDIT_ALLOWED_PAYMENT_CHANNELS,
				success_return_url: successReturnUrl.toString(),
				cancel_return_url: cancelReturnUrl.toString(),
				description: "Pakamew immediate-feed donation",
				metadata: {
					donation_id: donation.id,
					flow: "IMMEDIATE_FEED_MVP",
				},
			});
		} catch (error) {
			logger.error(
				{
					event: "donations.checkout-session.failed",
					donationId: donation.id,
					error,
				},
				"Failed to create donation checkout session",
			);

			throw new ORPCError("BAD_GATEWAY", {
				message: "Unable to start checkout right now.",
			});
		}

		if (!paymentSession.payment_link_url)
			throw new ORPCError("BAD_GATEWAY", {
				message: "Checkout session did not return a hosted payment URL.",
			});

		const updatedDonation = await DonationRepo.update({
			id: donation.id,
			data: {
				xenditPaymentSessionId: paymentSession.id,
				xenditPaymentRequestId: paymentSession.payment_request_id,
				xenditPaymentId: paymentSession.payment_id,
				paymentLinkUrl: paymentSession.payment_link_url,
				expiresAt: new Date(paymentSession.expires_at),
			},
		});

		logger.info(
			{
				event: "donations.checkout-session.created",
				donationId: updatedDonation.id,
				amount: updatedDonation.amount,
			},
			"Created donation checkout",
		);

		return {
			donationId: updatedDonation.id,
			paymentLinkUrl: updatedDonation.paymentLinkUrl!,
			expiresAt: updatedDonation.expiresAt!.toISOString(),
		};
	});
