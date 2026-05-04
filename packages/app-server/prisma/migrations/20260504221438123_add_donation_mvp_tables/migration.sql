CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

CREATE TYPE "DispenseStatus" AS ENUM (
	'NOT_STARTED',
	'QUEUED',
	'DISPENSING',
	'DISPENSED',
	'DISPENSE_TIMEOUT',
	'DISPENSE_FAILED'
);

CREATE TABLE "Donation" (
	"id" TEXT NOT NULL,
	"userId" TEXT,
	"name" TEXT,
	"amount" INTEGER NOT NULL,
	"currency" TEXT NOT NULL DEFAULT 'PHP',
	"status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
	"dispenseStatus" "DispenseStatus" NOT NULL DEFAULT 'NOT_STARTED',
	"xenditReferenceId" TEXT NOT NULL,
	"xenditPaymentSessionId" TEXT,
	"xenditPaymentRequestId" TEXT,
	"xenditPaymentId" TEXT,
	"paymentLinkUrl" TEXT,
	"expiresAt" TIMESTAMP(3),
	"paidAt" TIMESTAMP(3),
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DispenseAttempt" (
	"id" TEXT NOT NULL,
	"donationId" TEXT NOT NULL,
	"requestId" TEXT NOT NULL,
	"openDurationMs" INTEGER NOT NULL,
	"result" TEXT NOT NULL,
	"acknowledgementState" TEXT,
	"message" TEXT,
	"requestedAt" TIMESTAMP(3) NOT NULL,
	"respondedAt" TIMESTAMP(3),
	"completedAt" TIMESTAMP(3),
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "DispenseAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Donation_xenditReferenceId_key" ON "Donation"("xenditReferenceId");
CREATE UNIQUE INDEX "Donation_xenditPaymentSessionId_key" ON "Donation"("xenditPaymentSessionId");
CREATE INDEX "Donation_status_dispenseStatus_idx" ON "Donation"("status", "dispenseStatus");
CREATE INDEX "Donation_userId_createdAt_idx" ON "Donation"("userId", "createdAt");

CREATE UNIQUE INDEX "DispenseAttempt_requestId_key" ON "DispenseAttempt"("requestId");
CREATE INDEX "DispenseAttempt_donationId_createdAt_idx" ON "DispenseAttempt"("donationId", "createdAt");

ALTER TABLE "DispenseAttempt"
ADD CONSTRAINT "DispenseAttempt_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Donation"
ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
