# About Pakamew

## Overview

Pakamew is a real, deployable web application for supporting the feeding of stray animals within a campus environment.

It combines three parts into one product:

1. a public-facing donation experience,
2. live visibility into feeding areas,
3. operational tools for managing feeders, records, and fund use.

The product exists to make campus stray animal support more organized, transparent, and sustainable. Instead of relying on informal, inconsistent feeding by volunteers, Pakamew gives the campus community a structured way to contribute and gives organizers a system they can actually operate.

For now, the product is campus-only. It is not positioned as a general shelter platform or a multi-institution service.

---

## What problem Pakamew solves

On campus, people often want to help stray animals, but support is usually fragmented:

- feeding happens inconsistently,
- donations are hard to coordinate,
- donors cannot easily verify impact,
- organizers lack a clean operational workflow,
- feeding infrastructure is difficult to manage without a system around it.

Pakamew solves this by turning support into a visible and trackable product experience.

A user should be able to understand:

- how to help,
- what their money is for,
- whether a feeding-related action happened,
- how the system is being managed.

---

## What the product is

Pakamew is best understood as a **campus stray animal support platform**.

It is not just an IoT feeder controller, and it is not just a donation page.

It is a product that connects:

- **real currency payments**
- **feeding operations**
- **livestream visibility**
- **administrative oversight**
- **recordkeeping and accountability**

The core value of the platform is trust.

A supporter should feel that their contribution is going into a real system with real outcomes, even when those outcomes are not always immediate or directly visible.

---

## Who it is for

| User type                  | What they need                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Donors and supporters      | A simple way to contribute, confidence that funds are used responsibly, and visibility into the feeding program |
| Guest donors               | The ability to donate without creating an account                                                               |
| Campus organizers / admins | Tools to manage feeders, review transactions, monitor activity, and operate the program reliably                |
| Campus community           | A more organized and transparent way to support stray animals                                                   |
| Stray animals              | More consistent feeding through a managed system                                                                |

---

## Core product behavior

Pakamew supports two kinds of value flow:

### 1. Immediate support

A donation can trigger an immediate food dispense event through a connected feeder.

This is the most visible product behavior. It creates a direct relationship between donation and action.

### 2. Managed support

A donation can also be stored and used later by the organization for operational needs, such as:

- scheduled automated feeding,
- food restocking,
- hosting and infrastructure,
- device maintenance,
- other program costs that are necessary but not always directly visible to end-users.

This matters because the platform is not only a real-time dispense mechanism. It is also a funding and operations system for an ongoing campus feeding program.

---

## Product principles

### Transparency

The product should make it clear what the program does, what donations support, and what records exist.

### Credibility

This should behave like a real production service, not a classroom demo. Reliability, traceability, and operational clarity matter.

### Simplicity

The user-facing flow should stay straightforward. People should be able to understand the platform without training.

### Accountability

Donations, feeding events, and administrative actions should be recorded in a way that supports review and oversight.

### Operational usefulness

Admin tools are part of the product, not an afterthought. The platform must support the people running the feeding program.

---

## High-level product model

| Area                  | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| Public website        | Explains the program, shows livestreams, and accepts donations            |
| Donation/payment flow | Processes real currency payments securely                                 |
| Livestream viewing    | Gives users visibility into feeding areas and reinforces trust            |
| Feeder control        | Allows the platform to issue feeding-related actions to connected devices |
| Records and reports   | Keeps transaction history, feeding logs, and operational records          |
| Admin tools           | Lets organizers manage feeders, monitor activity, and review system state |

---

## User experience

A typical supporter journey looks like this:

1. Open the site
2. View the feeding area or program information
3. Make a donation
4. Receive confirmation that the payment was accepted
5. See either:
   - an immediate feeding-related action, or
   - that the donation has been recorded for program use
6. Trust that the donation is now part of a managed, auditable system

The important point is that Pakamew should not imply that every donation results in an instantly visible action.

The platform should be honest about the difference between:

- donations that trigger immediate dispensing, and
- donations that support the broader feeding operation.

---

## Scope for now

Pakamew is currently scoped to a campus feeding program.

### In scope

- campus stray animal feeding support
- real currency donations
- anonymous or guest donations
- livestream viewing
- automated or admin-managed feeder actions
- donation records
- feeding logs
- admin monitoring and management
- operational use of funds for the feeding program

### Out of scope

- veterinary services
- rescue case management
- adoption workflows
- TNVR or population control operations
- advanced animal recognition
- multi-campus or multi-shelter expansion
- broad nonprofit fundraising features unrelated to campus feeding

---

## What matters most in implementation

Pakamew should be implemented as a product with production assumptions.

That means the system should prioritize:

- stable payment handling,
- clear status messaging,
- accurate records,
- reliable feeder communication,
- graceful handling of failures,
- maintainable admin workflows,
- honest presentation of what donors can and cannot expect.

Technical choices should support those goals, not compete with them.

---

## Business rules

| Rule                                                  | Meaning                                                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Donations are real payments                           | Payments represent real money and must be treated with production-grade care                    |
| Guest donations are allowed                           | A user does not need an account to support the program                                          |
| Not every donation must trigger an immediate dispense | A donation may fund immediate feeding or broader program operations                             |
| Immediate feeding should be explicit                  | If a donation is expected to trigger a dispense event, the product should say so clearly        |
| Use of funds must be understandable                   | The platform should clearly communicate whether funds go to direct feeding, operations, or both |
| Records are required                                  | Donations, feeder actions, and important system events should be logged                         |
| Admin actions matter                                  | Administrative controls should be auditable where appropriate                                   |
| Campus-first scope applies                            | Product decisions should optimize for a single-campus operating model for now                   |

---

## Edge cases and expected behavior

| Case                                                             | Expected product behavior                                                                                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Payment succeeds but immediate dispense is unavailable           | Record the donation, show that the payment succeeded, do not falsely claim feeding occurred, and surface the issue to admins                 |
| Payment fails                                                    | Do not create a successful donation record; show a clear failure state                                                                       |
| Livestream is offline                                            | Donations may still be allowed, but the platform should clearly state that live visibility is temporarily unavailable                        |
| Donor expects an immediate feed but donation was general support | The product should prevent this confusion through clear labeling before payment                                                              |
| Guest donor contributes without creating an account              | The platform should still create a usable transaction record                                                                                 |
| Feeder is out of food or offline                                 | The system should not present the donation as an immediate successful feeding action if the feeder could not perform it                      |
| Funds are used later for restocking or operations                | The system should preserve enough records to explain that the donation still supported the feeding program                                   |
| Admin manually triggers or schedules feeding                     | This should be treated as an operational event and logged accordingly                                                                        |
| Network or device delays occur                                   | The product should prefer accurate status over premature success messages                                                                    |
| A user wants full proof of impact                                | The platform should rely on records, livestream context, and operational transparency rather than overpromising perfect real-time visibility |

---

## Non-goals

Pakamew should not try to solve every animal welfare problem.

It is a focused system for:

- funding feeding,
- managing feeding operations,
- improving transparency,
- supporting a campus-based welfare initiative.

That focus is important. The product becomes weaker if it expands too early into unrelated workflows.

---

## Summary

Pakamew is a campus-only platform for supporting stray animal feeding through real donations, livestream visibility, feeder-connected actions, and administrative oversight.

Its purpose is to turn informal goodwill into a real operating system for a campus feeding program.

The product should feel:

- trustworthy,
- clear,
- operationally grounded,
- transparent about where money goes,
- honest about what is immediate and what is not.

That is the core of the project.
