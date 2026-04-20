# Xendit Session Flow

## Purpose

This document describes a high-level payment flow for **session-based hosted checkout** using **Xendit Payment Sessions**. It is intended as context for architectural decision-making, not as a concrete codebase implementation plan.

For Pakamew, this should be treated as the **primary in-app checkout model** when the app needs to collect amount and donation intent first, then create a checkout instance with strong context.

## Why this flow matters

Xendit positions Payment Sessions as a **secure, stateful object** that manages the lifecycle of a payment flow. Their docs describe a session as representing **one customer checkout context**, tracking status / expiry / completion, and emitting webhooks when state changes.

That makes Payment Sessions a better fit for Pakamew’s context-sensitive donation flows than a single reusable payment link.

## Recommended use

Use this flow when Pakamew needs any of the following:

- donor selects amount inside the app first
- donor selects a donation mode in-app first
- the payment must be tied to a specific feeder, site, or campaign context
- pre-payment eligibility checks matter
- the app needs a per-checkout record before redirecting the donor
- webhook events must map cleanly to a single application-created checkout object

This is the preferred model for:

- immediate-feed eligible donations
- feeder-aware flows
- campaign-specific in-app checkout
- app-driven generalized support when the amount is chosen before redirect

## Core Xendit construct

### Primary construct

- **Payment Session** created from Pakamew’s server

### Mode

- `session_type = PAY`
- `mode = PAYMENT_LINK`

This means Pakamew still redirects the donor to a **Xendit-hosted checkout page**, but the hosted page is backed by a newly created **session object** rather than a long-lived shared link.

## High-level flow

1. The donor starts on a Pakamew page or app route.
2. The donor selects amount and donation intent.
3. Pakamew performs pre-payment validation.
4. Pakamew’s server creates a **new Xendit Payment Session** for that checkout instance.
5. Xendit returns a `payment_link_url`.
6. Pakamew redirects the donor to that hosted checkout URL.
7. The donor completes payment on Xendit.
8. Xendit sends asynchronous webhook updates such as session completion.
9. Pakamew updates internal financial and fulfillment records based on those webhook-confirmed outcomes.

## Why this is the right primary in-app flow for Pakamew

Pakamew has product rules that require more than generic money collection. Examples include:

- distinction between immediate-feed and stored-support donations
- feeder availability and stock checks
- campaign or feeder targeting
- separate tracking of payment state and fulfillment state
- need for strong auditability when a payment exists but dispense fails or is deferred

A Payment Session aligns well with those requirements because it is created only when the donor is actually checking out and can carry application-side context into a single payment object.

## Key Xendit fields to anchor on

When designing this flow, the most relevant Payment Session fields are:

- `reference_id` — Pakamew-generated identifier for correlation and reconciliation
- `session_type` — use `PAY` for one-time payment collection
- `mode` — use `PAYMENT_LINK` for hosted redirect checkout
- `amount` — the amount Pakamew wants to collect
- `currency` — likely `PHP` in the Pakamew context
- `country` — `PH`
- `customer` — donor identity/contact details if collected
- `allowed_payment_channels` — optional restriction of payment methods shown on hosted checkout
- `expires_at` — optional explicit session expiry if Pakamew wants tighter control
- `locale` — hosted checkout language
- `description` — donor-facing summary shown on checkout
- `items` — optional structured context for what the payment is for
- `metadata` — internal correlation data for reporting and reconciliation
- `success_return_url` — where Xendit should return the donor after completion
- `cancel_return_url` — where Xendit should return the donor if they stop the flow

## Important session characteristics

### One checkout context per session

A Payment Session should be treated as **one checkout instance**, not as a reusable evergreen link.

### Short-lived by design

Xendit’s docs state that sessions expire by default after **30 minutes** and recommend creating a session only when the customer is ready to pay. That fits Pakamew’s needs for current, validated checkout context.

### Hosted checkout still applies

Even though this is the richer model, Pakamew is not required to embed payment UI. In `PAYMENT_LINK` mode, Xendit still returns a hosted checkout URL and Pakamew still redirects the donor there.

## Recommended Pakamew product mapping

### Immediate-feed eligible checkout

This is where session flow is strongest.

Before session creation, Pakamew can evaluate:

- selected feeder or site
- feeder online/offline state
- food stock or availability state
- whether immediate-feed is currently allowed
- whether the current camera state changes what the UI should promise

If the checkout is eligible, Pakamew creates a session with the relevant context attached in its own records and, where appropriate, in session metadata.

### Stored-support checkout created in-app

Even for non-immediate donations, session flow is useful when Pakamew wants the amount to be selected in-app and wants the checkout tied to a specific page, campaign, or donor journey.

## Payment state and fulfillment state must remain separate

This is a core Pakamew rule.

The Xendit session primarily gives Pakamew the **payment state**. Pakamew must still maintain its own fulfillment model for things like:

- dispense requested
- dispense queued
- dispense succeeded
- dispense failed
- stored for later support
- later allocated to an approved expense

The payment becoming successful does **not** automatically mean the feeder action succeeded.

## Return URLs vs webhook truth

The return URLs are navigation aids, not the authoritative financial result.

Pakamew should use:

- `success_return_url` to bring donors back to a post-checkout page
- `cancel_return_url` to recover from user abandonment or cancellation

But Pakamew should treat **webhook-confirmed session/payment state** as the authoritative source for:

- whether the payment actually completed
- whether the donation should be marked financially successful
- whether downstream fulfillment logic should proceed

## Data Pakamew should preserve

At a minimum:

- internal checkout ID
- internal donation ID
- donation mode
- selected feeder/site/campaign context if applicable
- selected amount
- Xendit `reference_id`
- Xendit session ID
- returned `payment_link_url`
- session status timeline
- resulting payment identifiers from webhook payloads
- donor identity/contact details if collected
- fulfillment state timeline maintained separately by Pakamew

## Metadata guidance

This is a strong place to carry application context that helps reconciliation later.

Examples of metadata Pakamew may want conceptually:

- internal donation ID
- donor type (guest / registered)
- selected donation mode
- campaign ID
- feeder ID or site ID
- acquisition source
- environment or deployment scope

The point is not to overload Xendit metadata with business logic, but to provide enough correlation detail for auditability and webhook processing.

## Allowed payment channels

Payment Sessions support an optional `allowed_payment_channels` list. This can be useful if Pakamew later decides that certain flows should expose only a subset of channels, but it is not required for the high-level design.

This is mainly a product-control lever, not the core reason to choose sessions.

## Operational benefits

### Benefits

- best fit for in-app amount selection
- strongest per-checkout context
- better reconciliation using Pakamew-created `reference_id` and session records
- better pre-payment validation opportunities
- clean separation between payment object and later fulfillment logic
- easier to support both immediate-feed and stored-support flows from the same general integration pattern

### Constraints

- more server-side integration work than a reusable shared link
- session creation must happen close to checkout time
- redirect-based hosted checkout still means donors leave Pakamew’s domain for payment

## Recommended scope in Pakamew

Use this flow as the primary design for:

- in-app preset amount + custom amount donation UI
- donor journeys that need feeder or campaign context
- any flow that makes promises about immediate eligibility before payment
- app-led checkout that should create an internal pending record before redirect

## Integration notes

- Pakamew creates the session **server-side**.
- The secret API key stays server-side.
- The client should receive only the hosted `payment_link_url` or other safe session details needed for redirect.
- A new session should be created when the donor is ready to pay; it should not be reused as a permanent public link.
- Pakamew should rely on asynchronous webhook updates for authoritative payment result handling.
- The return page should display donor-friendly status, but the app should still reconcile against webhook-confirmed outcomes.
- Immediate-feed execution, if applicable, should be downstream from successful payment confirmation and Pakamew’s own fulfillment rules.

## Minimal Xendit request shape to keep in mind

A high-level session creation payload will generally include:

- `reference_id`
- `session_type: PAY`
- `mode: PAYMENT_LINK`
- `amount`
- `currency`
- `country`
- `customer` details as available
- optional `items`
- optional `metadata`
- `success_return_url`
- `cancel_return_url`

The response will include a hosted checkout URL (`payment_link_url`) and session state such as `ACTIVE`, which Pakamew uses to redirect and then monitor.

## Reference points from Xendit

Useful concepts and docs to anchor this flow:

- Payment Session overview
- session = one customer checkout context
- hosted `PAYMENT_LINK` mode returns `payment_link_url`
- sessions are short-lived and default to 30-minute expiry
- webhook-driven completion and payment reconciliation
