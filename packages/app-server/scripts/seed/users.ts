import type { PrismaClient } from "../../src/prisma/client";
import { PersistedTestPasswordHash } from "./shared/config";
import { SeedUsers, type SeedUser } from "./shared/users";

/** Summary returned after seeded user accounts are upserted. */
export interface SeedUsersSummary {
	/** Number of deterministic user fixtures processed. */
	userCount: number;
}

async function upsertSeedUser(prisma: PrismaClient, user: SeedUser): Promise<void> {
	const now = new Date();

	const seededUser = await prisma.users.upsert({
		where: { email: user.email },
		create: {
			id: user.id,
			name: user.name,
			email: user.email,
			emailVerified: true,
			role: user.role,
			banned: false,
			isAnonymous: false,
			createdAt: now,
			updatedAt: now,
		},
		update: {
			name: user.name,
			emailVerified: true,
			role: user.role,
			banned: false,
			banReason: null,
			banExpires: null,
			isAnonymous: false,
			updatedAt: now,
		},
	});

	await prisma.accounts.upsert({
		where: { id: user.accountId },
		create: {
			id: user.accountId,
			accountId: seededUser.id,
			providerId: "credential",
			userId: seededUser.id,
			password: PersistedTestPasswordHash,
			createdAt: now,
			updatedAt: now,
		},
		update: {
			accountId: seededUser.id,
			providerId: "credential",
			userId: seededUser.id,
			password: PersistedTestPasswordHash,
			updatedAt: now,
		},
	});
}

/**
 * Upsert deterministic local test users and their credential accounts.
 *
 * @param prisma - Prisma client connected to the database being seeded.
 * @returns Count of processed user fixtures.
 */
export async function seedUsers(prisma: PrismaClient): Promise<SeedUsersSummary> {
	await Promise.all(SeedUsers.map((user) => upsertSeedUser(prisma, user)));

	return { userCount: SeedUsers.length };
}
