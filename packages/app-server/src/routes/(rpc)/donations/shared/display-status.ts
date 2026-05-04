/**
 * Donor-facing donation status copy helpers.
 */

import z from "zod";
import { DispenseStatus, DonationStatus } from "../../../../../prisma/generated/client";

/** Donor-facing display status schema. */
export const DisplayStatusSchema = z.enum([
	"Waiting payment confirmation",
	"Payment confirmed",
	"Dispensing",
	"Dispensed",
	"Payment received. Dispense is taking longer than expected.",
	"Payment session expired. Please try again.",
]);

/** Donor-facing display status type. */
export type DisplayStatus = z.infer<typeof DisplayStatusSchema>;

/**
 * Donation-status to donor-facing copy map.
 */
const donationStatusMap = new Map<DonationStatus, DisplayStatus>([
	[DonationStatus.PENDING, "Waiting payment confirmation"],
	[DonationStatus.EXPIRED, "Payment session expired. Please try again."],
]);

/**
 * Dispense-status to donor-facing copy map.
 */
const dispenseStatusMap = new Map<DispenseStatus, DisplayStatus>([
	[DispenseStatus.NOT_STARTED, "Payment confirmed"],
	[DispenseStatus.QUEUED, "Payment confirmed"],
	[DispenseStatus.DISPENSING, "Dispensing"],
	[DispenseStatus.DISPENSED, "Dispensed"],
	[DispenseStatus.DISPENSE_TIMEOUT, "Payment received. Dispense is taking longer than expected."],
	[DispenseStatus.DISPENSE_FAILED, "Payment received. Dispense is taking longer than expected."],
]);

/**
 * Resolve the donor-facing display status.
 *
 * @param params - Donation and dispense status values.
 * @returns The display status shown to donors.
 */
export function getDisplayStatus(params: {
	donationStatus: DonationStatus;
	dispenseStatus: DispenseStatus;
}): DisplayStatus {
	return (
		donationStatusMap.get(params.donationStatus) ??
		dispenseStatusMap.get(params.dispenseStatus) ??
		"Payment received. Dispense is taking longer than expected."
	);
}
