import { DonationStatus } from "../../../../prisma/generated/client";

/** Month summary shown by donation report month selectors. */
export interface DonationReportMonth {
	key: string;
	label: string;
}

/** Aggregate summary for the selected donation report month. */
export interface DonationReportStats {
	averageDonation: number;
	donorCount: number;
	totalAmount: number;
}

/** Weekly donation report bucket. */
export interface DonationReportWeeklyBucket {
	amount: number;
	donationCount: number;
	donorCount: number;
	endDate: string;
	key: string;
	label: string;
	startDate: string;
}

/** Daily donation report bucket. */
export interface DonationReportDailyBucket {
	amount: number;
	date: string;
	donationCount: number;
	donorCount: number;
	key: string;
	label: string;
}

/** Donation row shown in the report donation table. */
export interface DonationReportDonation {
	amount: number;
	donorName: string;
	id: string;
	occurredAt: string;
	userId: string | null;
}

/** Raw donation row shape used by report aggregation helpers. */
export interface DonationReportSourceDonation {
	amount: number;
	createdAt: Date;
	id: string;
	name: string | null;
	paidAt: Date | null;
	status: DonationStatus;
	userId: string | null;
}

/** Donation report payload returned to the web dashboard. */
export interface DonationReport {
	availableMonths: DonationReportMonth[];
	dailyBuckets: DonationReportDailyBucket[];
	donations: DonationReportDonation[];
	selectedMonth: DonationReportMonth;
	stats: DonationReportStats;
	weeklyBuckets: DonationReportWeeklyBucket[];
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

function toDateKey(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function formatMonthLabel(monthKey: string): string {
	const { monthIndex, year } = parseMonthKey(monthKey);

	return new Intl.DateTimeFormat("en-PH", { month: "short", year: "numeric", timeZone: "UTC" }).format(
		new Date(Date.UTC(year, monthIndex, 1)),
	);
}

function getDonationReportDate(donation: DonationReportSourceDonation): Date {
	return donation.paidAt ?? donation.createdAt;
}

function getDonorName(donation: DonationReportSourceDonation): string {
	const donorName = donation.name?.trim();

	return donorName && donorName.length > 0 ? donorName : "Anonymous Donor";
}

function getDonorKey(donation: DonationReportSourceDonation): string {
	if (donation.userId) return `user:${donation.userId}`;

	const donorName = donation.name?.trim();
	if (donorName) return `name:${donorName.toLocaleLowerCase("en-PH")}`;

	return `anonymous:${donation.id}`;
}

function createEmptyDailyBuckets(monthKey: string): DonationReportDailyBucket[] {
	const { monthIndex, year } = parseMonthKey(monthKey);
	const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

	return Array.from({ length: daysInMonth }, (_, index) => {
		const day = index + 1;
		const date = new Date(Date.UTC(year, monthIndex, day));
		const dateKey = toDateKey(date);

		return {
			key: dateKey,
			label: String(day),
			date: dateKey,
			amount: 0,
			donorCount: 0,
			donationCount: 0,
		};
	});
}

function createEmptyWeeklyBuckets(monthKey: string): DonationReportWeeklyBucket[] {
	const { monthIndex, year } = parseMonthKey(monthKey);
	const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
	const weekCount = Math.ceil(daysInMonth / 7);

	return Array.from({ length: weekCount }, (_, index) => {
		const startDay = index * 7 + 1;
		const endDay = Math.min(startDay + 6, daysInMonth);
		const startDate = new Date(Date.UTC(year, monthIndex, startDay));
		const endDate = new Date(Date.UTC(year, monthIndex, endDay));

		return {
			key: `week-${index + 1}`,
			label: `Week ${index + 1}`,
			startDate: toDateKey(startDate),
			endDate: toDateKey(endDate),
			amount: 0,
			donorCount: 0,
			donationCount: 0,
		};
	});
}

function toMonthOptions(monthKeys: string[], selectedMonthKey: string): DonationReportMonth[] {
	const uniqueMonthKeys = Array.from(new Set([...monthKeys, selectedMonthKey]));
	uniqueMonthKeys.sort((left, right) => right.localeCompare(left));

	return uniqueMonthKeys.map((monthKey) => ({
		key: monthKey,
		label: formatMonthLabel(monthKey),
	}));
}

function incrementBucketDonors(donorSets: Map<string, Set<string>>, bucketKey: string, donorKey: string): number {
	const donors = donorSets.get(bucketKey) ?? new Set<string>();
	donors.add(donorKey);
	donorSets.set(bucketKey, donors);

	return donors.size;
}

/** Build a selected-month donation report from raw donation rows. */
export function buildDonationReport({
	availableMonthKeys,
	donations,
	selectedMonthKey,
}: {
	availableMonthKeys: string[];
	donations: DonationReportSourceDonation[];
	selectedMonthKey: string;
}): DonationReport {
	const { end, start } = getMonthRange(selectedMonthKey);
	const completedDonations = donations.filter((donation) => {
		if (donation.status !== DonationStatus.COMPLETED) return false;

		const occurredAt = getDonationReportDate(donation);
		return occurredAt >= start && occurredAt < end;
	});
	const sortedCompletedDonations = [...completedDonations].sort(
		(left, right) => getDonationReportDate(right).getTime() - getDonationReportDate(left).getTime(),
	);
	const donorKeys = new Set(sortedCompletedDonations.map(getDonorKey));
	const totalAmount = sortedCompletedDonations.reduce((total, donation) => total + donation.amount, 0);
	const weeklyBuckets = createEmptyWeeklyBuckets(selectedMonthKey);
	const dailyBuckets = createEmptyDailyBuckets(selectedMonthKey);
	const weeklyDonorSets = new Map<string, Set<string>>();
	const dailyDonorSets = new Map<string, Set<string>>();

	for (const donation of sortedCompletedDonations) {
		const occurredAt = getDonationReportDate(donation);
		const dayOfMonth = occurredAt.getUTCDate();
		const weekIndex = Math.floor((dayOfMonth - 1) / 7);
		const dailyIndex = dayOfMonth - 1;
		const donorKey = getDonorKey(donation);
		const weeklyBucket = weeklyBuckets[weekIndex];
		const dailyBucket = dailyBuckets[dailyIndex];

		weeklyBucket.amount += donation.amount;
		weeklyBucket.donationCount += 1;
		weeklyBucket.donorCount = incrementBucketDonors(weeklyDonorSets, weeklyBucket.key, donorKey);

		dailyBucket.amount += donation.amount;
		dailyBucket.donationCount += 1;
		dailyBucket.donorCount = incrementBucketDonors(dailyDonorSets, dailyBucket.key, donorKey);
	}

	return {
		availableMonths: toMonthOptions(availableMonthKeys, selectedMonthKey),
		selectedMonth: {
			key: selectedMonthKey,
			label: formatMonthLabel(selectedMonthKey),
		},
		stats: {
			totalAmount,
			donorCount: donorKeys.size,
			averageDonation:
				sortedCompletedDonations.length === 0
					? 0
					: Math.round((totalAmount / sortedCompletedDonations.length) * 100) / 100,
		},
		weeklyBuckets,
		dailyBuckets,
		donations: sortedCompletedDonations.map((donation) => ({
			id: donation.id,
			userId: donation.userId,
			donorName: getDonorName(donation),
			amount: donation.amount,
			occurredAt: getDonationReportDate(donation).toISOString(),
		})),
	};
}
