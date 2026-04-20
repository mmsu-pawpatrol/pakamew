# Xendit Program Flow

## Purpose

This document describes a high-level payment flow for **seasonal, timely, or campaign-based fundraising** using **one reusable Xendit Payment Link per program/campaign**. It is intended as context for product design, not as a concrete codebase implementation plan.

In Pakamew terms, this is the flow for **program-specific support** such as semester drives, event booths, emergency replenishment campaigns, posters, or themed funding efforts.

## Recommended use

Use this flow when the campaign itself is the main context:

- seasonal donation drives
- poster / QR-led fundraising around campus
- event booths and awareness campaigns
- “help us restock this month” campaigns
- time-bounded operational pushes
- fundraising around a named program, milestone, or incident

This is a better fit than the general evergreen link when the donation should be attributable to a **specific campaign**, but it still does not require creating a unique checkout per donor.

## Core product decision

This flow should be understood as:

- **one reusable payment link per campaign/program**
- the payment link is stable enough to print, share, and revisit
- the donation is still broad enough that it does not require app-side session creation for each donor

The campaign becomes the main organizing unit.

## When to use this instead of the general support link

Choose the program flow when Pakamew needs a donation stream that is still simple and reusable, but **not generic**.

Examples:

- “Rainy season feeding drive”
- “Midterm week food restock campaign”
- “Campus cat shelter repair fundraiser”
- “Semester opening support drive”

In these cases, the campaign identity matters for reporting, donor messaging, and QR/poster distribution.

## High-level flow

1. Pakamew creates or designates a named campaign/program.
2. Pakamew assigns **one reusable Xendit Payment Link** to that campaign.
3. The campaign link is published on campaign pages, posters, or QR materials.
4. The donor opens the campaign link and completes payment on Xendit’s hosted checkout page.
5. Xendit sends payment status updates asynchronously.
6. Pakamew records the donation against the campaign/program.
7. Pakamew reports campaign progress separately from evergreen general support.

## Xendit construct used

### Primary construct

- **Dashboard-created Payment Link** or equivalent hosted payment link intended for repeated use by a campaign audience

### Why

- stable checkout URL for posters and printed QR codes
- low operational friction during a campaign
- no need to create a new checkout server-side for every donor
- easier campaign-level attribution than a single evergreen support link

## Amount strategy

There are two valid sub-variants.

### Variant A — Blank amount campaign link

Use this when the campaign is framed as open-ended support for a program.

Examples:

- “Help cover this month’s feeding needs.”
- “Support the semester feeding fund.”

This preserves donor flexibility while keeping campaign attribution intact.

### Variant B — Fixed amount campaign link

Use this when the program is built around a clear target contribution level or tightly framed call to action.

Examples:

- fixed pledge-like donation asks
- event booths where the amount should be standardized
- highly constrained poster-based calls to action

### Practical recommendation

For Pakamew, most campaign links should still behave like **stored-support or program-support donations**, unless the campaign is explicitly designed around a different rule. Avoid implying that the campaign link itself triggers a live feeder action unless the downstream product rules actually support that.

## Campaign identity and internal mapping

Each campaign link should have a durable internal mapping in Pakamew, such as:

- internal campaign ID
- display name
- validity window
- allowed donation purpose
- intended public wording
- poster/QR assets tied to it
- campaign status: draft / active / ended / archived

The key point is that the **same hosted link** is reused across many donors, but Pakamew still treats it as a **distinct fundraising stream**.

## Payment status model

Pakamew should treat campaign-link payments the same way it treats other payment flows:

- redirect success is not the financial source of truth
- the return page should not by itself finalize the donation
- Xendit webhook-confirmed status should drive final financial state in Pakamew

This matters even more for printed QR and poster flows, where the donor may never return to the original Pakamew surface after payment.

## Data Pakamew should preserve

At minimum:

- internal donation record ID
- donation mode = `PROGRAM_SUPPORT` or equivalent
- internal campaign/program ID
- Xendit link identity / reference fields as available
- amount paid
- currency
- payment status timeline
- acquisition source if distinguishable (poster code, event code, page route)
- campaign status at the time of donation

If there are multiple posters or channels for the same campaign, Pakamew may also want source-level segmentation such as:

- poster variant
- venue
- event booth
- social asset code
- referral slug

## User-facing language

Recommended framing:

- clearly name the campaign or program
- explain what the funds are intended to support
- explain whether the donation is restricted to the campaign purpose or broadly supportive within that program
- avoid implying immediate on-camera fulfillment unless that is genuinely true

Examples:

- “Support this month’s campus feeding restock.”
- “Help fund shelter repairs and feeder upkeep for this semester.”
- “Your contribution supports this campaign’s stated purpose and related approved operational needs.”

## Operational tradeoffs

### Benefits

- strong fit for poster / QR usage
- reusable and simple checkout
- clearer attribution than an evergreen support link
- better campaign reporting and donor communication
- easy to activate and archive by campaign

### Constraints

- still weaker than session-based checkout for per-donor operational context
- cannot reliably encode live feeder eligibility at the moment of payment unless additional application logic is layered around it
- not ideal for immediate-feed promises
- campaign metadata is campaign-level, not checkout-instance-level

## Recommended scope in Pakamew

Use this flow for:

- timely campaigns
- semester-based programs
- event-led fundraising
- campus poster QR flows
- special appeals that need their own reporting line

Do not use it as the main mechanism for:

- immediate-feed donations tied to live feeder state
- payments that depend on a fresh pre-payment validation against a feeder or site
- highly dynamic checkout logic that changes by user/session

## Lifecycle guidance

Program links should have a deliberate lifecycle:

- **create** when the campaign opens
- **promote** across posters, pages, and QR materials
- **monitor** through webhook-driven reconciliation and campaign reporting
- **close or archive** when the campaign ends
- **avoid reusing old campaign links** for unrelated future campaigns, unless the business meaning truly remains the same

This keeps donor intent and reporting cleaner.

## Integration notes

- The hosted page is a Xendit Payment Link reused by many donors.
- Pakamew should create a **campaign-to-link mapping** in its own records.
- Campaign attribution should not depend solely on loose referrer inference; it should be structurally tied to the specific link used.
- The payment result still needs asynchronous confirmation and reconciliation in Pakamew.
- This flow is especially well-suited for QR/poster-led acquisition because the checkout URL remains stable during the campaign.

## Reference points from Xendit

Useful concepts and docs to anchor this flow:

- Payment Links as shareable hosted checkout
- optional blank amount for donations / multiple payment links
- webhook-driven payment confirmation
- Payment Sessions as the richer alternative when a fresh checkout context is required per donor
