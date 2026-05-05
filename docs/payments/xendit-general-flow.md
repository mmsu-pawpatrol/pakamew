# Xendit General Flow

## Purpose

This document describes a high-level payment flow for **generalized support** using **one reusable Xendit Payment Link**. It is intended as context for product and integration work, not as a concrete codebase implementation plan.

In Pakamew terms, this flow is for **general support / stored-support donations**, not for feeder-triggered or site-specific immediate actions.

## Recommended use

Use this flow when the goal is to collect broad support with the lowest operational and engineering friction:

- evergreen “Support Pakamew” donations
- generic donation CTAs on the website
- shareable donation links for social posts, bios, or community messages
- fallback donation entry when there is no need to attach the payment to a specific feeder/session context

This flow is **not** the best primary flow for immediate-feed donations or for payment experiences that depend on live feeder state.

## Why this flow exists

Xendit supports **dashboard-created Payment Links** as a no-code flow. Their docs explicitly state that the amount can be left blank for **donations or multiple payment link** use cases. This makes a single evergreen support link viable for generalized fundraising.

The tradeoff is that the checkout is intentionally generic. The payment page is hosted by Xendit and is not created from a fresh application-side checkout context.

## Core product decision

For Pakamew, this flow should map to:

- **donation mode:** stored support / general support
- **fulfillment expectation:** no promise of immediate dispense
- **public framing:** “support ongoing feeding and operations”

This is the right place for donations that may later fund:

- food restocking
- scheduled feeding
- device upkeep
- connectivity or camera costs
- hosting and platform operations
- other approved campus support costs

## High-level flow

1. Pakamew exposes a “General Support” CTA.
2. The user is sent to a **single reusable Xendit Payment Link**.
3. The user enters or confirms the donation amount on the Xendit-hosted page.
4. The user completes payment using an available payment channel.
5. Xendit sends payment status updates through webhook / reporting channels.
6. Pakamew records the donation as a financial event and categorizes it as **general support**.
7. Later operational spending is tracked separately in Pakamew’s own records.

## Xendit construct used

### Primary construct

- **Dashboard-created Payment Link**

### Why

- supports a low-code, shareable hosted checkout
- can be reused across many donors
- suitable for blank-amount donation collection
- easy to turn into a QR code or public URL

### Important nuance

Xendit’s newer direction is toward **Payment Sessions** for server-created, stateful checkout flows. This reusable Payment Link flow is still useful, but it should be treated as the simpler, more generic support channel rather than the most context-rich checkout model.

## Integration boundary

This flow can be implemented with minimal app-side orchestration compared with session-based checkout.

### Pakamew must still own

- the public labeling of the donation purpose
- internal donation records
- webhook ingestion and reconciliation
- donor confirmation logic
- later-use fund categorization and reporting

### Xendit owns

- the hosted payment page
- payment channel UI
- payment authorization / collection
- payment result signaling to the configured webhook

## Amount strategy

### Recommended for generalized support

Use a **blank-amount donation link** so the donor can enter the amount on Xendit.

### Why this is acceptable here

Because this flow is intentionally generic and not attached to a feeder or a campaign-specific operational rule. The product promise is broad support, not a tightly scoped transaction outcome.

### Product implication

Pakamew should make clear before redirecting that:

- this is a **general support** payment
- the money may be used later for approved campus feeding and operations
- it does **not** guarantee an immediate visible dispense action

## Payment status model

Pakamew should treat the payment lifecycle conservatively:

- a payment is **not successful** just because the donor reached Xendit
- a payment is **not successful** just because the donor returns to the app
- the system should rely on **webhook-confirmed payment state** as the financial source of truth

The browser return is only a user navigation event. The authoritative financial update comes from Xendit’s asynchronous notifications and subsequent reconciliation.

## Data Pakamew should preserve

At a minimum, the system should preserve:

- internal donation record ID
- donation mode = `GENERAL_SUPPORT`
- Xendit product type = reusable payment link
- Xendit payment/invoice/reference identifiers as available
- donation amount actually paid
- currency
- payment status timeline
- donor contact details if collected / available
- attribution fields such as source page, QR poster code, or referral tag
- later allocation records when the funds are spent

## Attribution and tracking

Because many people may use the same public payment link, Pakamew should expect less checkout-specific context than in a per-session flow.

If campaign attribution is needed, it should be derived from one or more of:

- the link’s intended purpose
- the page or route the donor came from
- UTM or referrer tracking
- app-side source tagging before redirect
- internal reconciliation rules after payment

This is still workable for general support, but weaker than a freshly created session tied to a single checkout instance.

## User-facing language

The language on Pakamew’s side should set expectations clearly.

Recommended framing:

- “Support ongoing campus feeding and operations.”
- “Your donation may fund food, scheduled feeding, maintenance, connectivity, and other approved support costs.”
- “This payment is not tied to an immediate feeder action.”

Avoid copy that implies:

- immediate dispense
- live on-camera fulfillment
- feeder-specific action
- campaign-specific restricted use unless the link is actually meant for that

## Operational tradeoffs

### Benefits

- simplest donor experience for generic support
- stable link for reuse across channels
- easy to turn into posters and QR codes
- low engineering complexity
- useful as a fallback donation path

### Constraints

- weaker linkage between payment and an in-app operational context
- less precise pre-payment validation
- not suited to feeder availability checks
- not suited to immediate-feed promises
- campaign attribution is weaker unless managed outside the checkout object itself

## Recommended scope in Pakamew

Use this flow for:

- website-wide “Support Pakamew” buttons
- public donation QR codes
- profile / footer donation links
- emergency fallback when richer checkout flows are unavailable

Do not use this as the primary flow for:

- immediate-feed donations
- feeder-specific donations
- donation flows that require a pre-payment eligibility check
- flows where the app must attach detailed operational metadata to the payment object

## Integration notes

- The checkout is **hosted by Xendit**.
- The link is **reusable**, not created per donor.
- The amount may be **blank** for donation collection.
- Pakamew should ingest **payment result webhooks** and update its own records.
- The general-support ledger and later-spending ledger should remain separate from feeder fulfillment records.
- Any donor-facing success page should still be treated as informational; the authoritative status comes from webhook-confirmed payment state.

## Reference points from Xendit

Useful concepts and docs to anchor this flow:

- Payment Links: no-code, shareable hosted checkout
- optional blank amount for donations / multiple payment links
- Payment Link webhook-based payment confirmation
- Xendit’s newer recommendation toward Payment Sessions for stateful server-created checkout
