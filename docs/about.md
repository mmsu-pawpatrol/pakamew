# Pakamew

## Overview

Pakamew is a campus-based platform for supporting stray animal feeding through a combination of livestream visibility, digital donations, and connected feeding infrastructure.

At its core, the product turns an informal act of kindness into a coordinated service. Instead of relying on irregular, person-to-person feeding around campus, Pakamew creates a shared system where people can watch designated feeding areas, contribute financially, and trust that those contributions are recorded and connected to real operational outcomes.

The platform is centered on campus stray animals and campus-operated feeding sites. It is public enough for supporters to watch and donate, but operationally bounded to a specific campus environment, a defined set of feeders and cameras, and an administering organization that manages the day-to-day work behind the scenes.

## Why it exists

Campus stray animals are often supported by students, staff, and other compassionate individuals, but those efforts are usually decentralized. Food may be given inconsistently, support is difficult to coordinate, and donors have limited visibility into what happens after they contribute.

Pakamew exists to make that support more organized and more transparent.

It addresses several practical gaps at once:

- feeding should not depend entirely on whoever happens to be present at a given moment
- supporters should have a straightforward way to help without needing to be physically on site
- financial contributions should have a clear operational path
- the organization managing the feeders should have tools to monitor equipment, log activity, and explain how funds are used
- visible feeding events should build trust, but the platform should also support less visible operating needs such as food restocking, scheduled feeding, maintenance, and hosting

The result is not just a donation page and not just a smart feeder. It is a small service platform for a campus animal welfare initiative.

## What the product is

Pakamew is best understood as a web application connected to a real-world feeding setup.

A supporter can open the site, view a livestream from a campus feeding area, and make a donation. Depending on the type of donation and the current operational state of the system, that donation can either:

- trigger an immediate or near-real-time food dispense event, or
- be stored as usable organizational funds for later campus feeding and related operating expenses

In both cases, the donation becomes part of a traceable system record rather than an isolated payment.

This matters because feeding operations are not always fully visible at the exact moment money is received. Some donations may result in an observable dispense event right away. Others may be used later for scheduled automated feeding, food replenishment, equipment upkeep, hosting, or other legitimate expenses needed to keep the service running and the animals supported. The product should make that distinction understandable instead of pretending every peso maps to an instant on-screen moment.

## Product shape at a glance

| Area                      | What it means in practice                                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Public access             | People can discover the platform, watch supported campus feeding areas, and donate without needing deep operational knowledge    |
| Donation flow             | Real money is collected through an integrated payment provider                                                                   |
| Immediate support         | Some donations can create a dispense attempt for a connected feeder                                                              |
| Ongoing support           | Some donations are held and later used for approved feeding and operating needs                                                  |
| Livestream visibility     | Cameras provide real-time context for feeding areas and help reinforce trust                                                     |
| Administrative operations | Staff or authorized organizers manage feeders, monitor system health, review records, and resolve exceptions                     |
| Transparency              | Donations, feeding events, and later operational spending should be recorded in a way that supports reporting and accountability |

## How the service works

### Supporter journey

1. A visitor opens the platform.
2. They view the available campus feeding area or feeder page, typically with a livestream or current status.
3. They choose how they want to support the initiative.
4. They complete payment through the platform's payment flow.
5. The system records the transaction.
6. If the donation is eligible for immediate feeding and the feeder can accept the request, the system sends a dispense command and logs the result.
7. If the donation is not meant for immediate feeding, or immediate fulfillment is not appropriate, the funds are stored for later approved use.
8. The donor receives confirmation appropriate to their mode of donation, and administrators can see the transaction in operational reporting.

### Administrative journey

Administrators run the part of the product that supporters do not see in full. They are responsible for maintaining the operational truth of the platform.

This includes:

- managing feeder and camera status
- checking food stock and device availability
- reviewing donation and feeding records
- resolving failed or incomplete dispense attempts
- categorizing later spending from stored donations
- maintaining public trust through accurate reporting rather than only through live video

## Roles and expected behavior

| Role                | Primary interest                                      | Typical actions                                                                                                        |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Guest donor         | Quick, low-friction support                           | Watch livestream, donate anonymously, receive a confirmation or receipt when contact details are provided              |
| Registered donor    | Repeat participation and visibility into past support | Donate, review relevant history, save profile information, follow the initiative over time                             |
| Administrator       | Operational control and accountability                | Manage feeders, monitor livestream availability, review records, resolve issues, categorize spending, generate reports |
| Campus organization | Sustained welfare operations                          | Use the platform to coordinate feeding support in a more structured way than ad hoc manual efforts                     |

Anonymous or guest donations are a first-class part of the product, not a fallback. Requiring account creation would add friction to a use case that depends on impulse generosity and broad participation.

## Donation model

Pakamew supports two valid donation outcomes.

### 1. Immediate-feed donations

These are donations intended to fund a visible feeding action in the near term. The normal expectation is:

- payment succeeds
- the system validates that the target feeder can act
- a dispense command is issued
- the platform records both the financial event and the feeding event

The key business value is immediacy and visibility. This is the donation mode most closely associated with livestream engagement.

### 2. Stored-support donations

These are donations that enter the organization's usable balance for later campus use. They do not need to create an immediate dispense event.

Stored funds may be used for:

- scheduled automated feeding
- food restocking
- feeder upkeep or replacement
- camera or connectivity costs
- hosting and core system operations
- other legitimate operating expenses that support the service and the animals

This model reflects how real operations work. Not all support can or should be reduced to a one-click instant action. The platform should therefore keep a clean distinction between **money received**, **feeding fulfilled**, and **funds later allocated**.

## Trust and transparency model

The platform's public value depends on trust, but trust should come from structured records as much as from live video.

Livestreaming helps supporters feel connected to the initiative. It provides real-time context and can visually confirm that a feeding area is active. But livestream alone is not a complete accounting system.

Pakamew therefore needs a transparency model built on records such as:

- donation transactions
- payment status changes
- feeder commands and dispense outcomes
- food stock and feeder availability indicators
- administrator actions and overrides
- later spending entries for stored donations
- donor-facing confirmations and internal audit trails

A donor should be able to understand whether their contribution:

- funded an immediate feeding attempt,
- was successfully dispensed,
- is pending operational resolution, or
- has been retained for later approved use.

That clarity is more important than promising that every donation will always be instantly visible on camera.

## Campus scope

Pakamew is intentionally campus-only in its current form.

That means:

- feeders and cameras are installed at approved on-campus locations
- the animals being supported are those within the campus environment the organization is responsible for or actively monitors
- administrators manage a single campus deployment rather than a network of unrelated shelters or cities
- the product is not yet designed as a multi-campus marketplace or a general-purpose animal welfare platform

This scope keeps operations realistic, controllable, and easier to explain to supporters.

## High-level system view

The platform can be thought of as five cooperating parts:

1. **Web application**  
   The public and administrative interface where people watch, donate, and manage operations.

2. **Application server**  
   The core service layer that handles authentication, donation workflows, reporting, feeder orchestration, and operational rules.

3. **Payment provider**  
   The external system that authorizes and confirms real-money transactions.

4. **Livestream service**  
   The video delivery layer connected to cameras installed at campus feeding points.

5. **IoT shelter devices**  
   The actual feeder and camera hardware in the field.

A database sits behind the platform to preserve the state of users, donors, feeders, transactions, reports, and operating records.

From a business perspective, the important point is that Pakamew is not just presenting information. It is coordinating money, hardware, operational status, and public trust in one system.

## What the platform should communicate clearly

A good implementation should make a few product truths obvious to users:

- where support is happening
- whether a donation is intended for immediate feeding or general support
- whether a feeder is currently available
- whether livestream is online
- what happened after payment
- what records exist for the donation
- how later-use funds are categorized when they are spent

The platform should reduce ambiguity. Supporters should not have to infer whether money was received, whether food was dispensed, or whether the donation was stored for later use.

## Business rules and edge cases

| Topic                              | Rule or expected handling                                                                                                                                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campus boundary                    | All operational resources, feeders, cameras, and spending categories belong to the campus deployment. The product should not behave like a multi-tenant charity network.                                                                                        |
| Guest donations                    | Users may donate without creating an account. Guest checkout should collect only the information needed for payment, compliance, and optional receipt delivery.                                                                                                 |
| Payment authority                  | A donation is only treated as financially successful after confirmed status from the payment provider. Pending, expired, abandoned, or failed payments must not create a successful donation record.                                                            |
| Idempotency                        | Duplicate callbacks, refreshes, or retries from the payment provider must not create duplicate donations, duplicate receipts, or duplicate dispense events.                                                                                                     |
| Donation mode                      | The system must distinguish between donations intended for immediate feeding and donations intended for later organizational use. These are different fulfillment paths and should remain visible in records and reporting.                                     |
| Immediate dispense eligibility     | Immediate-feed actions should only be offered when the selected feeder or campus site is in a state that can reasonably fulfill the request.                                                                                                                    |
| Feeder unavailable before payment  | If a feeder is offline, jammed, disabled, or out of stock, the immediate-feed option should be unavailable or clearly marked as unavailable before checkout.                                                                                                    |
| Feeder failure after payment       | If payment succeeds but the feeder cannot complete the action, the donation still exists financially, but the fulfillment state becomes an exception case. The system should record the failure, notify admins, and avoid silent loss or duplicate fulfillment. |
| Camera offline                     | A camera outage should not corrupt donation accounting. Donations may still proceed based on product policy, but the interface should not imply live visual confirmation when the stream is unavailable.                                                        |
| Low stock                          | Food inventory should influence whether immediate feeding can be offered. Low-stock states should trigger admin attention before donors continue assuming instant fulfillment is possible.                                                                      |
| Stored-fund usage                  | Donations stored for later use may fund scheduled feeding, restocking, maintenance, hosting, and similar approved expenses. Each outgoing use should be categorized and logged.                                                                                 |
| Ledger separation                  | Payment status, dispense status, and later spending status are separate concerns. A single donation may be financially complete while feeding remains unresolved or while funds remain unspent.                                                                 |
| Manual admin actions               | Manual dispensing, stock correction, incident resolution, or record edits by admins should always create an audit trail with actor, timestamp, and reason.                                                                                                      |
| Refunds and reversals              | Refunds, chargebacks, or payment reversals should update financial records without erasing historical operational events. Financial truth and event history should remain auditable.                                                                            |
| Anonymous donor history            | If a guest donor has no account, any donor-facing follow-up should rely on receipt delivery, a transaction reference, or another limited retrieval mechanism rather than a full user dashboard.                                                                 |
| Reporting access                   | Public users may see livestreams and public-facing transparency summaries, while personal donation history and full operational records require appropriate access controls.                                                                                    |
| Command expiry                     | Delayed or duplicated device messages should not cause accidental late dispensing. Feeder commands should have a validity window and clear execution status.                                                                                                    |
| Multiple feeders                   | When there are multiple campus feeders, each immediate-feed donation should resolve to a specific target feeder or an explicitly logged routing decision.                                                                                                       |
| Safe defaults                      | When device state is uncertain, the system should prefer holding, flagging, or escalating rather than pretending fulfillment succeeded.                                                                                                                         |
| Donation limits and abuse controls | The platform may enforce minimum amounts, rate limits, and other safeguards where needed to protect payment operations, feeder hardware, and service stability.                                                                                                 |

## Reporting and records

Reporting in Pakamew is not only an admin convenience. It is part of the product promise.

At minimum, the platform should preserve usable records for:

- donation transaction history
- feeder activity history
- dispense successes and failures
- later spending against stored funds
- basic feeder status and stock-related events
- administrator interventions
- summary views that can support transparency for donors and organizers

The goal is not to turn the product into a full nonprofit ERP system. The goal is to ensure that money, actions, and outcomes can be explained coherently.

## What this product is not

To keep the scope clear, Pakamew is not currently trying to solve every part of campus animal welfare.

It is not primarily:

- a veterinary care platform
- a rescue dispatch system
- a stray population control system
- a broad public adoption marketplace
- a mobile-first super app
- an advanced animal recognition or analytics platform
- a multi-campus or city-wide deployment framework

Those areas may become adjacent opportunities later, but they are not required for the product to be meaningful or credible now.

## What success looks like

A successful Pakamew deployment would make the campus feeding initiative feel organized, trustworthy, and operationally real.

That means:

- supporters can contribute quickly and confidently
- feeding infrastructure is observable and manageable
- donations are not ambiguous after payment
- immediate-feed events work when promised and are logged when they do not
- stored funds remain visible as funds with a legitimate future purpose
- administrators can explain what happened without reconstructing events manually
- the platform strengthens goodwill by showing that compassion can be supported by a dependable system

## Closing perspective

Pakamew is a focused product with a straightforward social purpose: make it easier for a campus community and its supporters to care for stray animals in a structured, transparent, and sustainable way.

Its distinctiveness does not come from any one feature by itself. The value comes from the combination of livestream presence, donation handling, feeder control, and traceable operations. Together, these pieces turn isolated acts of support into a service that people can understand, participate in, and trust.
