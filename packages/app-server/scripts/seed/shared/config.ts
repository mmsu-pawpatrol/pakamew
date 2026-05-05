/** Fixed seed label shared by deterministic random generators. */
export const SeedLabel = "pakamew-general-seed-v1";

/** Fixed Faker seed for deterministic fixture names and generated copy. */
export const FakerSeed = 20260505;

/** Number of complete past days covered by donation fixtures. */
export const DonationWindowDays = 365;

/** Prefix used to identify donation records owned by this seed script. */
export const SeededDonationReferencePrefix = "seed-general-donation";

/** Password assigned to seeded local test accounts. */
export const TestPassword = "PakamewTest123!";

/**
 * Better Auth-compatible password hash for {@link TestPassword}.
 *
 * @remarks
 * Persisting the hash keeps seeded account data deterministic across runs.
 */
export const PersistedTestPasswordHash =
	"6d41f7985b56fbba43ad808b3ab53ba1:08c405bae25666d1971d425eb267c9f0547a764f1373a0a5a2dc01f0209901c5311ffa18f758339508a5468a64a9f85de7959caf423e10879d1d2542182f867a";
