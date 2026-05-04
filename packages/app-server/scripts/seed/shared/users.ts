/** Seed account fixture consumed by Better Auth-compatible user seeding. */
export interface SeedUser {
	/** Stable user primary key for idempotent local seeding. */
	id: string;

	/** Stable credential account primary key for idempotent local seeding. */
	accountId: string;

	/** Display name shown in admin and donor-facing local flows. */
	name: string;

	/** Login email for the seeded test account. */
	email: string;

	/** Better Auth admin plugin role value. */
	role: "admin" | "user";
}

/** Local test accounts created by the general seed script. */
export const SeedUsers = [
	{
		id: "seed-admin-user",
		accountId: "seed-admin-account",
		name: "Pakamew Admin",
		email: "admin@pakamew.test",
		role: "admin",
	},
	{
		id: "seed-test-user",
		accountId: "seed-test-user-account",
		name: "Pakamew Test User",
		email: "user@pakamew.test",
		role: "user",
	},
] as const satisfies SeedUser[];
