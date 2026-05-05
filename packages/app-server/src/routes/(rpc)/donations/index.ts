/**
 * Donation service router exports.
 *
 * Route-bound procedures are exposed directly as service methods so OpenAPI
 * route metadata remains attached to the methods published by the root router.
 */

import { create } from "./checkout-session";
import { events } from "./events";
import { report } from "./report";
import { status } from "./status";

interface CheckoutSessionService extends Record<string, typeof create> {
	/**
	 * @see {@link create}
	 */
	create: typeof create;
}

const CheckoutSession: CheckoutSessionService = {
	create,
};

type DonationServiceMethod = CheckoutSessionService | typeof events | typeof report | typeof status;

export interface DonationService extends Record<string, DonationServiceMethod> {
	/**
	 * Checkout-session flows for public donations.
	 */
	CheckoutSession: CheckoutSessionService;

	/**
	 * @see {@link events}
	 */
	events: typeof events;

	/**
	 * @see {@link report}
	 */
	report: typeof report;

	/**
	 * @see {@link status}
	 */
	status: typeof status;
}

/** Donation service methods published by the root oRPC router. */
export const DonationService: DonationService = {
	CheckoutSession,
	events,
	report,
	status,
};

/** Donation service router export used by the root router. */
export const donations = DonationService;
