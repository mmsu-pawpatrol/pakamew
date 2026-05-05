/**
 * Public donation report procedure.
 *
 * This route aggregates completed donation rows into month-scoped reporting
 * data for coordinator-facing dashboards.
 */

import { SpanKind } from "@opentelemetry/api";
import { os } from "@orpc/server";
import z from "zod";
import { DonationStatus } from "../../../../prisma/generated/client";
import { getLogger, withSpan } from "../../../instrumentation/core";
import { getPrisma } from "../../../prisma";
import { buildDonationReport, type DonationReport } from "./report-aggregation";

const prisma = getPrisma();
const logger = getLogger().child({ scope: "donations.report" });
const MonthKeyPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Month key accepted by donation report queries. */
export const ReportMonthKeySchema = z.string().regex(MonthKeyPattern);

const DonationReportStatsSchema = z.object({
	totalAmount: z.number().int().nonnegative(),
	donorCount: z.number().int().nonnegative(),
	averageDonation: z.number().nonnegative(),
});

const DonationReportMonthSchema = z.object({
	key: ReportMonthKeySchema,
	label: z.string().min(1),
});

const DonationReportWeeklyBucketSchema = z.object({
	key: z.string().min(1),
	label: z.string().min(1),
	startDate: z.string().date(),
	endDate: z.string().date(),
	amount: z.number().int().nonnegative(),
	donorCount: z.number().int().nonnegative(),
	donationCount: z.number().int().nonnegative(),
});

const DonationReportDailyBucketSchema = z.object({
	key: z.string().date(),
	label: z.string().min(1),
	date: z.string().date(),
	amount: z.number().int().nonnegative(),
	donorCount: z.number().int().nonnegative(),
	donationCount: z.number().int().nonnegative(),
});

const DonationReportDonationSchema = z.object({
	id: z.string().min(1),
	userId: z.string().nullable(),
	donorName: z.string().min(1),
	amount: z.number().int().positive(),
	occurredAt: z.string().datetime(),
});

/** Donation report payload returned to the web dashboard. */
export const DonationReportSchema: z.ZodType<DonationReport> = z.object({
	availableMonths: z.array(DonationReportMonthSchema),
	selectedMonth: DonationReportMonthSchema,
	stats: DonationReportStatsSchema,
	weeklyBuckets: z.array(DonationReportWeeklyBucketSchema),
	dailyBuckets: z.array(DonationReportDailyBucketSchema),
	donations: z.array(DonationReportDonationSchema),
});

function getMonthKey(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");

	return `${year}-${month}`;
}

function parseMonthKey(monthKey: string): { monthIndex: number; year: number } {
	const [year = 0, month = 1] = monthKey.split("-").map(Number);

	return { year, monthIndex: month - 1 };
}

function getMonthRange(monthKey: string): { end: Date; start: Date } {
	const { monthIndex, year } = parseMonthKey(monthKey);

	return {
		start: new Date(Date.UTC(year, monthIndex, 1)),
		end: new Date(Date.UTC(year, monthIndex + 1, 1)),
	};
}

async function findLatestCompletedDonationMonth(): Promise<string | null> {
	const latestDonation = await prisma.donation.findFirst({
		where: { status: DonationStatus.COMPLETED },
		orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
		select: {
			createdAt: true,
			paidAt: true,
		},
	});

	return latestDonation ? getMonthKey(latestDonation.paidAt ?? latestDonation.createdAt) : null;
}

/** Load a selected-month donation report for the reports page. */
export const report = os
	.route({ method: "GET", path: "/donations/report" })
	.input(
		z.object({
			month: ReportMonthKeySchema.optional(),
		}),
	)
	.output(DonationReportSchema)
	.handler(async ({ input }) => {
		const selectedMonthKey = input.month ?? (await findLatestCompletedDonationMonth()) ?? getMonthKey(new Date());
		const { end, start } = getMonthRange(selectedMonthKey);

		return await withSpan(
			"donations.report",
			async () => {
				const [availableMonthDonations, selectedMonthDonations] = await Promise.all([
					prisma.donation.findMany({
						where: { status: DonationStatus.COMPLETED },
						select: {
							createdAt: true,
							paidAt: true,
						},
					}),
					prisma.donation.findMany({
						where: {
							OR: [{ paidAt: { gte: start, lt: end } }, { paidAt: null, createdAt: { gte: start, lt: end } }],
						},
						select: {
							id: true,
							userId: true,
							name: true,
							amount: true,
							status: true,
							paidAt: true,
							createdAt: true,
						},
					}),
				]);
				const availableMonthKeys = availableMonthDonations.map((donation) =>
					getMonthKey(donation.paidAt ?? donation.createdAt),
				);
				const donationReport = buildDonationReport({
					availableMonthKeys,
					donations: selectedMonthDonations,
					selectedMonthKey,
				});

				logger.info(
					{
						event: "donations.report.loaded",
						month: selectedMonthKey,
						donation_count: donationReport.donations.length,
						total_amount: donationReport.stats.totalAmount,
					},
					"Donation report loaded",
				);

				return donationReport;
			},
			{
				kind: SpanKind.INTERNAL,
				attributes: {
					"donations.report.month": selectedMonthKey,
				},
			},
		);
	});
