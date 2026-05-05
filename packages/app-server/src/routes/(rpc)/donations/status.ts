/**
 * Public donation status procedure.
 *
 * This route returns the donor-facing status model and reconciles the latest
 * feeder device event against the most recent dispense attempt when needed.
 */

import { ORPCError, os, type } from "@orpc/server";
import z from "zod";
import { DispenseStatus, DonationStatus } from "../../../../prisma/generated/client";
import { DispenserRepo } from "../data/dispenser";
import { DonationRepo } from "../data/donations";
import { getFeederStatus } from "../feeder/shared";
import { DisplayStatusSchema, getDisplayStatus } from "./shared/display-status";

/**
 * Reconcile the latest feeder device event into a donation's dispense status.
 *
 * @param input - Donation reconciliation payload.
 * @param input.donationId - Donation whose latest dispense attempt should be checked.
 */
const reconcile = os
	.input(type<{ donationId: string }>())
	.handler(async ({ input }) => {
		const donation = await DonationRepo.findById({ id: input.donationId });
		if (!donation)
			throw new ORPCError("NOT_FOUND", {
				message: "Donation not found.",
			});

		// Terminal dispense states are already reconciled and should not be rewritten by later polling.
		if (
			donation.dispenseStatus === DispenseStatus.DISPENSED ||
			donation.dispenseStatus === DispenseStatus.DISPENSE_FAILED ||
			donation.dispenseStatus === DispenseStatus.DISPENSE_TIMEOUT
		)
			return donation;

		const latestAttempt = await DispenserRepo.findFirst({
			where: {
				donationId: donation.id,
			},
		});
		if (!latestAttempt) return donation;

		// Only the latest device event for this attempt is allowed to update the donation status.
		const feederStatus = getFeederStatus();
		if (feederStatus.latestKnownDeviceState.requestId !== latestAttempt.requestId) return donation;

		const completedAt = feederStatus.latestKnownDeviceState.timestamp
			? new Date(feederStatus.latestKnownDeviceState.timestamp)
			: new Date();
		const respondedAt = feederStatus.latestKnownDeviceState.timestamp
			? new Date(feederStatus.latestKnownDeviceState.timestamp)
			: latestAttempt.respondedAt;

		if (feederStatus.latestKnownDeviceState.state === "completed") {
			await DispenserRepo.update({
				id: latestAttempt.id,
				data: {
					acknowledgementState: feederStatus.latestKnownDeviceState.state,
					message: feederStatus.latestKnownDeviceState.message,
					respondedAt,
					completedAt,
				},
			});

			return await DonationRepo.update({
				id: donation.id,
				data: {
					dispenseStatus: DispenseStatus.DISPENSED,
				},
			});
		}

		if (feederStatus.latestKnownDeviceState.state === "failed") {
			await DispenserRepo.update({
				id: latestAttempt.id,
				data: {
					acknowledgementState: feederStatus.latestKnownDeviceState.state,
					message: feederStatus.latestKnownDeviceState.message,
					respondedAt,
					completedAt,
				},
			});

			return await DonationRepo.update({
				id: donation.id,
				data: {
					dispenseStatus: DispenseStatus.DISPENSE_FAILED,
				},
			});
		}

		return donation;
	})
	.callable();

/** Load the current donation status. */
export const status = os
	.route({ method: "GET", path: "/donations/status/:donationId" })
	.input(
		z.object({
			donationId: z.uuid(),
		}),
	)
	.output(
		z.object({
			donationId: z.uuid(),
			amount: z.number().int().positive(),
			donationStatus: z.nativeEnum(DonationStatus),
			dispenseStatus: z.nativeEnum(DispenseStatus),
			displayStatus: DisplayStatusSchema,
		}),
	)
	.handler(async ({ input }) => {
		const donation = await reconcile({ donationId: input.donationId });

		return {
			donationId: donation.id,
			amount: donation.amount,
			donationStatus: donation.status,
			dispenseStatus: donation.dispenseStatus,
			displayStatus: getDisplayStatus({
				donationStatus: donation.status,
				dispenseStatus: donation.dispenseStatus,
			}),
		};
	});
