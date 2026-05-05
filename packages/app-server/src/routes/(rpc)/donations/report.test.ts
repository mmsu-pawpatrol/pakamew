import { describe, expect, it } from "vitest";
import { DonationStatus } from "../../../../prisma/generated/client";
import { buildDonationReport, type DonationReportSourceDonation } from "./report-aggregation";

function donation(
	input: Partial<DonationReportSourceDonation> & Pick<DonationReportSourceDonation, "amount" | "id">,
): DonationReportSourceDonation {
	const occurredAt = input.paidAt ?? input.createdAt ?? new Date("2026-01-02T10:00:00.000Z");

	return {
		createdAt: occurredAt,
		name: "Test Donor",
		paidAt: occurredAt,
		status: DonationStatus.COMPLETED,
		userId: null,
		...input,
	};
}

describe("buildDonationReport", () => {
	it("sums completed donations and excludes pending or expired rows", () => {
		const report = buildDonationReport({
			availableMonthKeys: ["2026-01"],
			selectedMonthKey: "2026-01",
			donations: [
				donation({ id: "completed-1", amount: 100 }),
				donation({ id: "completed-2", amount: 50, paidAt: new Date("2026-01-20T10:00:00.000Z") }),
				donation({ id: "pending", amount: 999, status: DonationStatus.PENDING }),
				donation({ id: "expired", amount: 999, status: DonationStatus.EXPIRED }),
				donation({ id: "other-month", amount: 999, paidAt: new Date("2026-02-01T10:00:00.000Z") }),
			],
		});

		expect(report.stats.totalAmount).toBe(150);
		expect(report.stats.averageDonation).toBe(75);
		expect(report.donations.map((item) => item.id)).toEqual(["completed-2", "completed-1"]);
	});

	it("deduplicates known donors and counts unnamed anonymous donations individually", () => {
		const report = buildDonationReport({
			availableMonthKeys: ["2026-01"],
			selectedMonthKey: "2026-01",
			donations: [
				donation({ id: "user-first", amount: 20, userId: "user-1", name: "First Name" }),
				donation({ id: "user-second", amount: 30, userId: "user-1", name: "Changed Name" }),
				donation({ id: "named-first", amount: 40, name: "Maria Santos" }),
				donation({ id: "named-second", amount: 50, name: "maria santos" }),
				donation({ id: "anonymous-first", amount: 60, name: null }),
				donation({ id: "anonymous-second", amount: 70, name: null }),
			],
		});

		expect(report.stats.donorCount).toBe(4);
	});

	it("returns zero averages and stable empty buckets when there are no completed donations", () => {
		const report = buildDonationReport({
			availableMonthKeys: [],
			selectedMonthKey: "2026-02",
			donations: [donation({ id: "pending", amount: 100, status: DonationStatus.PENDING })],
		});

		expect(report.stats).toEqual({
			totalAmount: 0,
			donorCount: 0,
			averageDonation: 0,
		});
		expect(report.weeklyBuckets).toHaveLength(4);
		expect(report.dailyBuckets).toHaveLength(28);
		expect(report.weeklyBuckets.every((bucket) => bucket.amount === 0 && bucket.donationCount === 0)).toBe(true);
		expect(report.dailyBuckets.every((bucket) => bucket.amount === 0 && bucket.donationCount === 0)).toBe(true);
	});

	it("fills weekly and daily bucket gaps across the selected month", () => {
		const report = buildDonationReport({
			availableMonthKeys: ["2026-01"],
			selectedMonthKey: "2026-01",
			donations: [
				donation({ id: "jan-01", amount: 20, paidAt: new Date("2026-01-01T10:00:00.000Z") }),
				donation({ id: "jan-31", amount: 80, paidAt: new Date("2026-01-31T10:00:00.000Z") }),
			],
		});

		expect(report.weeklyBuckets).toHaveLength(5);
		expect(report.dailyBuckets).toHaveLength(31);
		expect(report.weeklyBuckets.map((bucket) => bucket.amount)).toEqual([20, 0, 0, 0, 80]);
		expect(report.dailyBuckets[0]?.amount).toBe(20);
		expect(report.dailyBuckets[1]?.amount).toBe(0);
		expect(report.dailyBuckets[30]?.amount).toBe(80);
	});
});
