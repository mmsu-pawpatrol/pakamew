/**
 * Dispense-attempt data-access procedures.
 *
 * These internal callable procedures expose the current donation MVP's
 * supported dispense-attempt CRUD surface without leaking raw Prisma inputs.
 */

import { os, type } from "@orpc/server";
import { type Prisma } from "../../../../prisma/generated/client";
import { getPrisma } from "../../../prisma";

const prisma = getPrisma();

/**
 * Create one dispense-attempt row.
 *
 * @param input - Dispense-attempt creation payload accepted by Prisma.
 * @param input.data - Scalar dispense-attempt fields to insert.
 */
const create = os
	.input(type<{ data: Prisma.DispenseAttemptUncheckedCreateInput }>())
	.handler(async ({ input }) => await prisma.dispenseAttempt.create({ data: input.data }))
	.callable();

/**
 * Find the latest dispense attempt using explicit filters.
 *
 * @param input - Supported dispense-attempt lookup payload.
 * @param input.where - Explicit filters handled by this repo.
 */
const findFirst = os
	.input(
		type<{
			where: {
				donationId?: string;
				requestId?: string;
			};
		}>(),
	)
	.handler(async ({ input }) => {
		const where: { donationId?: string; requestId?: string } = {};

		if (input.where.donationId) where.donationId = input.where.donationId;
		if (input.where.requestId) where.requestId = input.where.requestId;

		if (Object.keys(where).length === 0) return null;

		return await prisma.dispenseAttempt.findFirst({
			where,
			orderBy: [{ createdAt: "desc" }],
		});
	})
	.callable();

/**
 * Update one dispense-attempt row.
 *
 * @param input - Dispense-attempt update payload.
 * @param input.id - Dispense-attempt ID to update.
 * @param input.data - Scalar dispense-attempt fields to mutate.
 */
const update = os
	.input(type<{ id: string; data: Prisma.DispenseAttemptUncheckedUpdateInput }>())
	.handler(async ({ input }) => await prisma.dispenseAttempt.update({ where: { id: input.id }, data: input.data }))
	.callable();

/** Dispense-attempt repo surface exposed through callable procedures. */
export interface DispenserRepo {
	/** Create one dispense-attempt row. */
	create: typeof create;

	/** Find the latest dispense attempt by supported filters. */
	findFirst: typeof findFirst;

	/** Update one dispense-attempt row. */
	update: typeof update;
}

/** Dispense-attempt repo callable exports. */
export const DispenserRepo: DispenserRepo = {
	create,
	findFirst,
	update,
};
