import { faker } from "@faker-js/faker";
import { DONATION_TIERS, type DonationTier } from "@pakamew/shared/lib/donation";
import { DispenseStatus, DonationStatus, type Prisma } from "../../prisma/generated/client";
import type { PrismaClient } from "../../src/prisma/client";
import { DonationWindowDays, SeededDonationReferencePrefix } from "./shared/config";
import { SeedUsers } from "./shared/users";

const DayMs = 86_400_000;

/** Deterministic random-number generator used by donation fixtures. */
export type SeedRandom = () => number;

/** Options for creating deterministic donation and dispense fixtures. */
export interface SeedDonationsOptions {
	/** Prisma client connected to the database being seeded. */
	prisma: PrismaClient;

	/** Seeded random-number generator shared by the seed run. */
	rng: SeedRandom;

	/** Clock source used to compute the trailing complete-day window. */
	now?: Date;
}

/** Summary returned after donation and dispense fixtures are created. */
export interface SeedDonationsSummary {
	/** Number of completed donations inserted. */
	donationCount: number;

	/** Number of successful dispense attempts inserted. */
	dispenseAttemptCount: number;

	/** Sum of seeded donation amounts in PHP. */
	totalDonationAmount: number;

	/** First seeded donation creation timestamp. */
	firstDonationAt: Date;

	/** Last seeded donation creation timestamp. */
	lastDonationAt: Date;
}

interface SeedDonationDonor {
	name: string | null;
	userId: string | null;
}

function randomInt(rng: SeedRandom, min: number, max: number): number {
	return Math.floor(rng() * (max - min + 1)) + min;
}

function donationTierWeight(index: number): number {
	const centerIndex = (DONATION_TIERS.length - 1) / 2;
	return Math.max(1, Math.round(24 - Math.abs(index - centerIndex) * 6));
}

function weightedDonationTier(rng: SeedRandom): DonationTier {
	const totalWeight = DONATION_TIERS.reduce((sum, _tier, index) => sum + donationTierWeight(index), 0);
	let threshold = rng() * totalWeight;

	for (let index = 0; index < DONATION_TIERS.length; index += 1) {
		threshold -= donationTierWeight(index);
		if (threshold <= 0) return DONATION_TIERS[index] ?? DONATION_TIERS[0];
	}

	return DONATION_TIERS[0];
}

function addMilliseconds(date: Date, milliseconds: number): Date {
	return new Date(date.getTime() + milliseconds);
}

function addDays(date: Date, days: number): Date {
	return addMilliseconds(date, days * DayMs);
}

function startOfUtcDay(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function firstSeededDay(now: Date): Date {
	return addDays(startOfUtcDay(now), -DonationWindowDays);
}

function endOfSeededDayRange(now: Date): Date {
	return startOfUtcDay(now);
}

function toDate(value: Date | string | undefined, fallback: Date): Date {
	if (value instanceof Date) return value;
	if (value) return new Date(value);
	return fallback;
}

function createDonationTimestamp(rng: SeedRandom, day: Date): Date {
	const hour = randomInt(rng, 7, 21);
	const minute = randomInt(rng, 0, 59);
	const second = randomInt(rng, 0, 59);
	return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute, second));
}

function createDonorPool(): string[] {
	return Array.from({ length: 90 }, () => faker.person.firstName());
}

function pickAccountDonor(donationIndex: number): SeedDonationDonor | null {
	if (donationIndex % 29 === 0) return { name: SeedUsers[0].name, userId: SeedUsers[0].id };
	if (donationIndex % 19 === 0) return { name: SeedUsers[1].name, userId: SeedUsers[1].id };
	return null;
}

function pickDonor(rng: SeedRandom, donorPool: string[], donationIndex: number): SeedDonationDonor {
	const accountDonor = pickAccountDonor(donationIndex);
	if (accountDonor) return accountDonor;
	if (rng() < 0.08) return { name: null, userId: null };

	return {
		name: donorPool[randomInt(rng, 0, donorPool.length - 1)] ?? faker.person.firstName(),
		userId: null,
	};
}

function createDailyDonationCount(rng: SeedRandom, day: Date): number {
	const dayOfWeek = day.getUTCDay();
	const weekendBonus = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
	const monthlyStartBonus = day.getUTCDate() <= 3 ? 1 : 0;
	return randomInt(rng, 3, 7) + weekendBonus + monthlyStartBonus;
}

function buildDonationRecords(rng: SeedRandom, now: Date) {
	const donorPool = createDonorPool();
	const donations: Prisma.DonationCreateManyInput[] = [];
	const dispenseAttempts: Prisma.DispenseAttemptCreateManyInput[] = [];
	let donationIndex = 0;

	for (let day = firstSeededDay(now); day < endOfSeededDayRange(now); day = addDays(day, 1)) {
		const dailyDonationCount = createDailyDonationCount(rng, day);

		for (let dailyIndex = 0; dailyIndex < dailyDonationCount; dailyIndex += 1) {
			donationIndex += 1;
			const sequence = String(donationIndex).padStart(5, "0");
			const paidAt = createDonationTimestamp(rng, day);
			const requestedAt = addMilliseconds(paidAt, randomInt(rng, 1_000, 10_000));
			const respondedAt = addMilliseconds(requestedAt, randomInt(rng, 400, 1_500));
			const completedAt = addMilliseconds(respondedAt, randomInt(rng, 1_500, 4_500));
			const donationId = `seed-donation-${sequence}`;
			const donationTier = weightedDonationTier(rng);
			const donor = pickDonor(rng, donorPool, donationIndex);

			donations.push({
				id: donationId,
				userId: donor.userId,
				name: donor.name,
				amount: donationTier.amount,
				currency: "PHP",
				status: DonationStatus.COMPLETED,
				dispenseStatus: DispenseStatus.DISPENSED,
				xenditReferenceId: `${SeededDonationReferencePrefix}-${sequence}`,
				xenditPaymentSessionId: `ps_seed_${sequence}`,
				xenditPaymentRequestId: `pr_seed_${sequence}`,
				xenditPaymentId: `py_seed_${sequence}`,
				paymentLinkUrl: `https://checkout.example.test/${SeededDonationReferencePrefix}-${sequence}`,
				expiresAt: addMilliseconds(paidAt, DayMs),
				paidAt,
				createdAt: paidAt,
				updatedAt: completedAt,
			});

			dispenseAttempts.push({
				id: `seed-dispense-attempt-${sequence}`,
				donationId,
				requestId: `seed-dispense-request-${sequence}`,
				openDurationMs: donationTier.openDurationMs,
				result: "DISPENSED",
				acknowledgementState: "ACKNOWLEDGED",
				message: "Seeded successful dispense attempt.",
				requestedAt,
				respondedAt,
				completedAt,
				createdAt: requestedAt,
				updatedAt: completedAt,
			});
		}
	}

	return { donations, dispenseAttempts };
}

async function deleteSeededDonations(prisma: PrismaClient): Promise<void> {
	await prisma.donation.deleteMany({
		where: {
			xenditReferenceId: {
				startsWith: SeededDonationReferencePrefix,
			},
		},
	});
}

async function createInBatches<T>(
	items: T[],
	batchSize: number,
	createMany: (data: T[]) => Promise<unknown>,
): Promise<void> {
	for (let index = 0; index < items.length; index += batchSize) {
		await createMany(items.slice(index, index + batchSize));
	}
}

/**
 * Regenerate deterministic completed donations and successful dispense attempts.
 *
 * @param options - Database client, seeded RNG, and optional clock source.
 * @param options.prisma - Prisma client connected to the database being seeded.
 * @param options.rng - Deterministic random-number generator for amounts, names, and times.
 * @param options.now - Optional clock override; defaults to the current runtime time.
 * @returns Donation and dispense-attempt counts plus the covered timestamp range.
 */
export async function seedDonations({
	prisma,
	rng,
	now = new Date(),
}: SeedDonationsOptions): Promise<SeedDonationsSummary> {
	const { donations, dispenseAttempts } = buildDonationRecords(rng, now);
	const firstSeedDate = firstSeededDay(now);

	await deleteSeededDonations(prisma);
	await createInBatches(donations, 500, async (data) => await prisma.donation.createMany({ data }));
	await createInBatches(dispenseAttempts, 500, async (data) => await prisma.dispenseAttempt.createMany({ data }));

	return {
		donationCount: donations.length,
		dispenseAttemptCount: dispenseAttempts.length,
		totalDonationAmount: donations.reduce((sum, donation) => sum + donation.amount, 0),
		firstDonationAt: toDate(donations[0]?.createdAt, firstSeedDate),
		lastDonationAt: toDate(donations.at(-1)?.createdAt, firstSeedDate),
	};
}
