/**
 * Public donation event-feed procedure.
 *
 * This route reads recent donation-backed feeder activity directly from the
 * database and returns presentation-ready feed entries for donor-facing pages.
 */

import { os } from "@orpc/server";
import z from "zod";
import { DispenseStatus, DonationStatus } from "../../../../prisma/generated/client";
import { getPrisma } from "../../../prisma";
import { DisplayStatusSchema, getDisplayStatus } from "./shared/display-status";

const prisma = getPrisma();
const MaxEventsLimit = 50;
const PesoFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

/** Donor-facing feeder event returned by the public donation feed route. */
const FeederEventSchema = z.object({
	id: z.string().min(1),
	userId: z.string().nullable(),
	donorName: z.string().min(1),
	amount: z.number().int().positive(),
	occurredAt: z.string().datetime(),
	donationStatus: z.nativeEnum(DonationStatus),
	dispenseStatus: z.nativeEnum(DispenseStatus),
	displayStatus: DisplayStatusSchema,
	title: z.string().min(1),
	description: z.string().min(1),
});

type FeederEventTitleKey =
	| "donation-completed"
	| "donation-expired"
	| "donation-pending"
	| "dispense-dispensed"
	| "dispense-dispensing"
	| "dispense-failed"
	| "dispense-queued"
	| "dispense-timeout";

const feederEventTitleMap = new Map<FeederEventTitleKey, string>([
	["dispense-dispensed", "Feeding Dispensed"],
	["dispense-dispensing", "Dispensing In Progress"],
	["dispense-failed", "Dispense Failed"],
	["dispense-queued", "Dispense Queued"],
	["dispense-timeout", "Dispense Timed Out"],
	["donation-completed", "Donation Completed"],
	["donation-expired", "Donation Expired"],
	["donation-pending", "Donation Pending"],
]);

function getFeederEventTitle(params: { donationStatus: DonationStatus; dispenseStatus: DispenseStatus }): string {
	if (params.donationStatus === DonationStatus.EXPIRED) return feederEventTitleMap.get("donation-expired")!;
	if (params.donationStatus === DonationStatus.PENDING) return feederEventTitleMap.get("donation-pending")!;

	if (params.dispenseStatus === DispenseStatus.DISPENSED) return feederEventTitleMap.get("dispense-dispensed")!;
	if (params.dispenseStatus === DispenseStatus.DISPENSING) return feederEventTitleMap.get("dispense-dispensing")!;
	if (params.dispenseStatus === DispenseStatus.DISPENSE_FAILED) return feederEventTitleMap.get("dispense-failed")!;
	if (params.dispenseStatus === DispenseStatus.QUEUED) return feederEventTitleMap.get("dispense-queued")!;
	if (params.dispenseStatus === DispenseStatus.DISPENSE_TIMEOUT) return feederEventTitleMap.get("dispense-timeout")!;

	return feederEventTitleMap.get("donation-completed")!;
}

function getFeederEventDescription(params: {
	donorName: string;
	amount: number;
	displayStatus: z.infer<typeof DisplayStatusSchema>;
}): string {
	return `${params.donorName} donated ${PesoFormatter.format(params.amount)}. ${params.displayStatus}`;
}

/** Load recent donation-backed feeder events for donor-facing pages. */
export const events = os
	.route({ method: "GET", path: "/donations/events" })
	.input(
		z.object({
			limit: z.coerce.number().int().positive().max(MaxEventsLimit).default(12),
			userId: z.string().min(1).optional(),
		}),
	)
	.output(z.array(FeederEventSchema))
	.handler(async ({ input }) => {
		const donations = await prisma.donation.findMany({
			where: input.userId ? { userId: input.userId } : undefined,
			orderBy: [{ createdAt: "desc" }],
			take: input.limit,
			select: {
				id: true,
				userId: true,
				name: true,
				amount: true,
				status: true,
				dispenseStatus: true,
				paidAt: true,
				createdAt: true,
				user: {
					select: {
						name: true,
					},
				},
				dispenseAttempts: {
					orderBy: [{ completedAt: "desc" }, { respondedAt: "desc" }, { requestedAt: "desc" }],
					take: 1,
					select: {
						completedAt: true,
						respondedAt: true,
						requestedAt: true,
					},
				},
			},
		});

		return donations.map((donation) => {
			const latestAttempt = donation.dispenseAttempts[0];
			const donorName = donation.name ?? donation.user?.name ?? "Anonymous Donor";
			const displayStatus = getDisplayStatus({
				donationStatus: donation.status,
				dispenseStatus: donation.dispenseStatus,
			});
			const occurredAt =
				latestAttempt?.completedAt ??
				latestAttempt?.respondedAt ??
				latestAttempt?.requestedAt ??
				donation.paidAt ??
				donation.createdAt;

			return {
				id: donation.id,
				userId: donation.userId,
				donorName,
				amount: donation.amount,
				occurredAt: occurredAt.toISOString(),
				donationStatus: donation.status,
				dispenseStatus: donation.dispenseStatus,
				displayStatus,
				title: getFeederEventTitle({
					donationStatus: donation.status,
					dispenseStatus: donation.dispenseStatus,
				}),
				description: getFeederEventDescription({
					donorName,
					amount: donation.amount,
					displayStatus,
				}),
			};
		});
	});
