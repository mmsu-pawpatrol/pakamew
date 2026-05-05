/**
 * Donation data-access procedures.
 *
 * These internal callable procedures keep database access behind explicit
 * repo boundaries without exposing generic Prisma filtering to callers.
 */

import { os, type } from "@orpc/server";
import { type Prisma } from "../../../../prisma/generated/client";
import { getPrisma } from "../../../prisma";

const prisma = getPrisma();

interface DonationXenditWhere {
	referenceId?: string;
	paymentSessionId?: string;
}

/**
 * Create a donation row.
 *
 * @param input - Donation creation payload accepted by Prisma.
 * @param input.data - Scalar donation fields to insert.
 */
const create = os
	.input(type<{ data: Prisma.DonationUncheckedCreateInput }>())
	.handler(async ({ input }) => await prisma.donation.create({ data: input.data }))
	.callable();

/**
 * Find one donation by ID.
 *
 * @param input - Identifier lookup payload.
 * @param input.id - Donation ID generated before checkout creation.
 */
const findById = os
	.input(type<{ id: string }>())
	.handler(async ({ input }) => await prisma.donation.findUnique({ where: { id: input.id } }))
	.callable();

/**
 * Find one donation using explicit Xendit filters.
 *
 * @param input - Supported donation lookup payload.
 * @param input.where - Explicit filter group supported by this repo.
 * @param input.where.xendit - Xendit identifiers accepted for reconciliation.
 */
const findFirst = os
	.input(
		type<{
			where: {
				xendit: DonationXenditWhere;
			};
		}>(),
	)
	.handler(async ({ input }) => {
		const where: { xenditReferenceId?: string; xenditPaymentSessionId?: string } = {};

		if (input.where.xendit.referenceId) where.xenditReferenceId = input.where.xendit.referenceId;
		if (input.where.xendit.paymentSessionId) where.xenditPaymentSessionId = input.where.xendit.paymentSessionId;

		if (Object.keys(where).length === 0) return null;

		return await prisma.donation.findFirst({
			where,
		});
	})
	.callable();

/**
 * Update one donation row.
 *
 * @param input - Donation update payload.
 * @param input.id - Donation ID to update.
 * @param input.data - Scalar donation fields to mutate.
 */
const update = os
	.input(type<{ id: string; data: Prisma.DonationUncheckedUpdateInput }>())
	.handler(async ({ input }) => await prisma.donation.update({ where: { id: input.id }, data: input.data }))
	.callable();

/** Donation repo surface exposed through callable procedures. */
export interface DonationRepo {
	/** Create one donation row. */
	create: typeof create;

	/** Find one donation by ID. */
	findById: typeof findById;

	/** Find one donation by supported filters. */
	findFirst: typeof findFirst;

	/** Update one donation row. */
	update: typeof update;
}

/** Donation repo callable exports. */
export const DonationRepo: DonationRepo = {
	create,
	findById,
	findFirst,
	update,
};
