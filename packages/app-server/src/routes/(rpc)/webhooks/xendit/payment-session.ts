/**
 * Xendit payment-session webhook procedure.
 *
 * This route trusts the webhook as the payment authority, persists the
 * completed or expired payment outcome, and starts the first dispense attempt
 * after successful payment confirmation.
 */

import { ORPCError, os, type } from "@orpc/server";
import { DONATION_TIERS } from "@pakamew/shared/lib/donation";
import z from "zod";
import { DispenseStatus, DonationStatus } from "../../../../../prisma/generated/client";
import { getEnv } from "../../../../env";
import { getLogger } from "../../../../instrumentation/core";
import { DispenserRepo } from "../../data/dispenser";
import { DonationRepo } from "../../data/donations";
import { publishFeederCommand } from "../../feeder/shared";

/** Base procedure with access to request headers. */
const base = os.$context<{ reqHeaders?: Headers }>();

const logger = getLogger().child({ scope: "webhooks.xendit.payment-session.receive" });

function getDispenseStatusForTriggerResult(result: string): DispenseStatus {
	if (result === "accepted") return DispenseStatus.DISPENSING;
	if (result === "timeout") return DispenseStatus.DISPENSE_TIMEOUT;
	return DispenseStatus.DISPENSE_FAILED;
}

/**
 * Start the first hardware dispense attempt for a completed donation.
 *
 * @param input - Dispense-start payload.
 * @param input.donationId - Completed donation that should trigger one feed attempt.
 */
const startDispense = os
	.input(type<{ donationId: string }>())
	.handler(async ({ input }) => {
		const donation = await DonationRepo.findById({ id: input.donationId });
		if (!donation)
			throw new ORPCError("NOT_FOUND", {
				message: "Donation not found.",
			});
		if (donation.status !== DonationStatus.COMPLETED)
			throw new ORPCError("CONFLICT", {
				message: "The donation payment has not been confirmed yet.",
			});

		const existingAttempt = await DispenserRepo.findFirst({
			where: {
				donationId: donation.id,
			},
		});
		if (existingAttempt) return existingAttempt;

		const tier = DONATION_TIERS.find((candidate) => candidate.amount === donation.amount);
		if (!tier)
			throw new ORPCError("BAD_REQUEST", {
				message: "The selected donation amount is not available.",
			});

		// The dispense command is issued only after webhook-confirmed payment completion.
		const response = await publishFeederCommand({
			mode: "duration",
			openDurationMs: tier.openDurationMs,
		});
		const attempt = await DispenserRepo.create({
			data: {
				donationId: donation.id,
				requestId: response.requestId,
				openDurationMs: tier.openDurationMs,
				result: response.result,
				acknowledgementState: response.acknowledgementState ?? null,
				message: response.message,
				requestedAt: new Date(response.requestedAt),
				respondedAt: new Date(response.respondedAt),
				completedAt: response.result === "accepted" ? null : new Date(response.respondedAt),
			},
		});

		await DonationRepo.update({
			id: donation.id,
			data: {
				dispenseStatus: getDispenseStatusForTriggerResult(response.result),
			},
		});

		logger.info(
			{
				event: "webhooks.xendit.payment-session.start-dispense.started",
				donationId: donation.id,
				requestId: response.requestId,
				result: response.result,
			},
			"Started donation dispense attempt",
		);

		return attempt;
	})
	.callable();

/** Handle Xendit payment-session webhooks. */
export const receive = base
	.route({ method: "POST", path: "/webhooks/xendit/payment-session" })
	.input(
		z.object({
			event: z.enum(["payment_session.completed", "payment_session.expired"]),
			business_id: z.string().min(1),
			created: z.string().min(1),
			data: z.object({
				payment_session_id: z.string().min(1),
				reference_id: z.string().min(1),
				status: z.enum(["ACTIVE", "COMPLETED", "EXPIRED", "CANCELED"]),
				amount: z.number().int().positive(),
				currency: z.string().min(1),
				payment_request_id: z.string().min(1).nullable().optional(),
				payment_id: z.string().min(1).nullable().optional(),
				payment_link_url: z.string().min(1).nullable().optional(),
				expires_at: z.string().min(1),
				updated: z.string().min(1),
			}),
		}),
	)
	.output(
		z.object({
			ok: z.literal(true),
		}),
	)
	.handler(async ({ context: requestContext, input }) => {
		const { XENDIT_WEBHOOK_CALLBACK_TOKEN } = getEnv((shape) => [shape.XENDIT_WEBHOOK_CALLBACK_TOKEN]);
		const callbackToken = requestContext.reqHeaders?.get("x-callback-token");

		if (callbackToken !== XENDIT_WEBHOOK_CALLBACK_TOKEN)
			throw new ORPCError("UNAUTHORIZED", {
				message: "Invalid Xendit callback token.",
			});

		// Both Xendit identifiers must match one donation before webhook state can mutate local records.
		const donation = await DonationRepo.findFirst({
			where: {
				xendit: {
					referenceId: input.data.reference_id,
					paymentSessionId: input.data.payment_session_id,
				},
			},
		});
		if (!donation) {
			logger.warn(
				{
					event: "webhooks.xendit.payment-session.unknown-reference",
					referenceId: input.data.reference_id,
					paymentSessionId: input.data.payment_session_id,
				},
				"Received payment-session webhook for an unknown donation",
			);

			return { ok: true };
		}

		if (input.event === "payment_session.expired") {
			// Expiry is idempotent and only moves still-pending checkout attempts.
			if (donation.status === DonationStatus.PENDING)
				await DonationRepo.update({
					id: donation.id,
					data: {
						status: DonationStatus.EXPIRED,
						expiresAt: new Date(input.data.expires_at),
						xenditPaymentSessionId: input.data.payment_session_id,
					},
				});

			return { ok: true };
		}

		// Payment completion is recorded before hardware work so donor polling can advance immediately.
		const completedDonation =
			donation.status === DonationStatus.COMPLETED
				? donation
				: await DonationRepo.update({
						id: donation.id,
						data: {
							status: DonationStatus.COMPLETED,
							dispenseStatus:
								donation.dispenseStatus === DispenseStatus.NOT_STARTED
									? DispenseStatus.QUEUED
									: donation.dispenseStatus,
							paidAt: new Date(input.created),
							xenditPaymentSessionId: input.data.payment_session_id,
							xenditPaymentRequestId: input.data.payment_request_id ?? null,
							xenditPaymentId: input.data.payment_id ?? null,
							paymentLinkUrl: input.data.payment_link_url ?? donation.paymentLinkUrl,
							expiresAt: new Date(input.data.expires_at),
						},
					});

		const latestAttempt = await DispenserRepo.findFirst({
			where: {
				donationId: completedDonation.id,
			},
		});

		// Duplicate completed webhooks must not create duplicate dispense attempts.
		if (
			!latestAttempt &&
			(completedDonation.dispenseStatus === DispenseStatus.QUEUED ||
				completedDonation.dispenseStatus === DispenseStatus.NOT_STARTED)
		) {
			try {
				await startDispense({ donationId: completedDonation.id });
			} catch (error) {
				logger.error(
					{
						event: "webhooks.xendit.payment-session.start-dispense.failed",
						donationId: completedDonation.id,
						error,
					},
					"Failed to start dispense after completed payment session",
				);

				throw new ORPCError("BAD_GATEWAY", {
					message: "Unable to start dispense right now.",
				});
			}
		}

		return { ok: true };
	});
