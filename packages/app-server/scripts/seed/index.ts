import { faker } from "@faker-js/faker";
import seedrandom from "seedrandom";
import { initPrismaClient } from "../../src/prisma/client";
import { seedDonations } from "./donations";
import { FakerSeed, SeedLabel, TestPassword } from "./shared/config";
import { SeedUsers } from "./shared/users";
import { seedUsers } from "./users";

const prisma = initPrismaClient();

try {
	faker.seed(FakerSeed);

	const rng = seedrandom(SeedLabel);
	const usersSummary = await seedUsers(prisma);
	const donationsSummary = await seedDonations({ prisma, rng });

	console.info("Seeded Pakamew sample data.", {
		...usersSummary,
		...donationsSummary,
		testAccounts: SeedUsers.map((user) => ({ email: user.email, password: TestPassword, role: user.role })),
	});
} finally {
	await prisma.$disconnect();
}
