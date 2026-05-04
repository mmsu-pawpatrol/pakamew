/**
 * Shared fixed donation tiers for the public immediate-feed MVP.
 */

/** Fixed donation tiers available to public donors. */
export const DONATION_TIERS = [
	{ amount: 5, openDurationMs: 200, approxCupLabel: "about 1/6 cup" },
	{ amount: 10, openDurationMs: 400, approxCupLabel: "about 1/3 cup" },
	{ amount: 15, openDurationMs: 600, approxCupLabel: "about 1/2 cup" },
	{ amount: 20, openDurationMs: 800, approxCupLabel: "about 2/3 cup" },
	{ amount: 25, openDurationMs: 1000, approxCupLabel: "about 5/6 cup" },
	{ amount: 30, openDurationMs: 1200, approxCupLabel: "about 1 cup" },
] as const;

/** Fixed donation tier metadata used by checkout and dispense flows. */
export type DonationTier = (typeof DONATION_TIERS)[number];
