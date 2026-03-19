<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may differ from older Next.js patterns. Check current Next.js 16 docs for any framework behavior you touch and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Guidelines

## Code Style
- Next.js 16 (App Router) + React 19 rules apply. Prefer server components. 
- Use TypeScript strictly. Use the `@/*` alias for workspace imports.
- Utilize Tailwind CSS v4 and shadcn/Radix UI primitives.
- Do not edit generated Prisma client files natively, they output to `app/generated/prisma`.

## Build and Test
- Package manager: **Bun**. All scripts must use Bun (e.g., `bun run dev`, `bun install`).
- Database: Prisma 7.5 + PostgreSQL. Run `bun run db:migrate` and `bun run db:generate`.

## Conventions
- **Timezone Safety**: Store all times in UTC. Compute availability strictly in the Host's timezone.
- **Concurrency**: Use database unique constraints or transaction-level row locks (`SELECT ... FOR UPDATE`) to prevent double bookings.

---

## Plan: Cal-Style Scheduling MVP Plus Integrations

Build in phased increments: first harden the scheduling domain model and booking consistency, then deliver host and public booking flows, then add integrations (calendar/video/email/payments) and team scheduling. This reduces risk from race conditions and timezone complexity while still reaching your requested feature set.

**Steps**
1. Phase 0: Align product scope and release boundaries into three milestones. Milestone A: single-host scheduling core. Milestone B: integrations and payments. Milestone C: team scheduling. This avoids a risky all-at-once launch.
2. Phase 1: Redesign data model in Prisma (depends on 1). Extend User and Booking, add EventType, AvailabilityRule, Attendee, CalendarConnection, PaymentIntent/Order, NotificationLog, Team, TeamMember, TeamEventRouting. Keep timestamps and status enums explicit for auditability.
3. Phase 1: Add booking integrity constraints (depends on 2). Add unique and index constraints to prevent host-slot collisions, enforce event-type ownership, and speed availability lookups.
4. Phase 1: Migration and seed workflow (depends on 2). Create migration files, add dev seed data for host/event types/availability, and document rollback strategy.
5. Phase 2: Build timezone-safe slot engine (depends on 2, parallel with 6). Implement recurring weekly rules, per-event duration, buffers, min notice, max advance window, and daily caps. Keep all persistence UTC; compute in host timezone and render in viewer timezone.
6. Phase 2: Booking lifecycle API (depends on 2, parallel with 5). Implement create, cancel, reschedule endpoints with transaction-safe conflict checks and idempotent request handling.
7. Phase 2: Public booking UX and host dashboard (depends on 5 and 6). Add event-type public page, date/time selection, attendee form, booking confirmation, and host management pages for event types and availability.
8. Phase 3: Calendar and video integrations (depends on 6). Add provider OAuth and token refresh, write busy-time sync adapter, and generate meeting links (Google Meet/Zoom abstraction layer).
9. Phase 3: Email and reminder system (depends on 6, parallel with 8). Add transactional emails for booking confirmation, reschedule, cancel, and reminders with retry and delivery logging.
10. Phase 3: Payments (depends on 6, parallel with 8 and 9). Add paid event types, checkout flow, webhook-based confirmation, refund/cancel policy handling, and booking unlock only after successful payment state.
11. Phase 3: Team scheduling (depends on 5 and 6, after 8 preferred). Add team ownership, host pools, round-robin/collective selection strategy, and fairness plus capacity rules.
12. Phase 4: Hardening and observability (depends on 7-11). Add structured logs, anti-double-booking stress tests, DST regression tests, and operational dashboards.
13. Phase 4: Security and compliance checks (depends on 7-11). Validate authZ boundaries for host/team data, secure webhook verification, and protect provider tokens.
14. Release incrementally by milestone with feature flags (depends on 12 and 13).

**Relevant files**
- d:/coding/cal-clone/prisma/schema.prisma — Extend and normalize scheduling entities, enums, and constraints.
- d:/coding/cal-clone/prisma/migrations — Add phased migrations for domain evolution.
- d:/coding/cal-clone/prisma.config.ts — Keep datasource/runtime config aligned with migration flow.
- d:/coding/cal-clone/package.json — Add scripts for seeding, webhook testing, and integration test tasks.
- d:/coding/cal-clone/app/layout.tsx — Reuse app shell patterns for host and public scheduling pages.
- d:/coding/cal-clone/app/page.tsx — Replace placeholder landing with scheduling entry points.
- d:/coding/cal-clone/components/ui/button.tsx — Reuse existing shadcn/radix style primitives.
- d:/coding/cal-clone/lib/utils.ts — Reuse utility conventions; add domain helpers in lib folder.
- d:/coding/cal-clone/app — Add route handlers and page routes for booking, host settings, teams, and checkout.
- d:/coding/cal-clone/components — Add forms/calendars/cards using current UI conventions.
- d:/coding/cal-clone/lib — Add scheduling engine, timezone, payment, email, and integration adapters.

**Verification**
1. Schema validation: run bun run db:generate and bun run db:migrate on a clean database and verify zero migration drift.
2. Concurrency validation: run parallel booking attempts for same host/startTime and confirm exactly one booking succeeds.
3. Timezone validation: test cross-timezone booking around DST transitions (spring and fall) and confirm slot correctness in both host and attendee views.
4. Lifecycle validation: test create, reschedule, cancel flows and ensure attendee notifications are emitted exactly once per event.
5. Integration validation: mock and real-sandbox tests for calendar sync, meeting-link generation, payment webhook, and email retry behavior.
6. Team scheduling validation: verify round-robin fairness and collective availability intersection under partial host unavailability.
7. Quality gates: run bun run lint and targeted API/component tests before each milestone release.

**Decisions**
- Included scope: MVP scheduling plus payments, email notifications, calendar/video integrations, and team scheduling.
- Delivery strategy: milestone-based rollout (A core, B monetization/integrations, C teams) to reduce risk.
- Availability strategy: generate slots on demand first; reevaluate pre-generation only if scale requires it.
- Out of initial scope: advanced Cal.com features like workflow automation builder, routing forms, advanced analytics, marketplace, and enterprise SSO.

**Further Considerations**
1. Payment provider choice recommendation: Option A Stripe (best ecosystem), Option B Razorpay (regional fit), Option C hybrid by locale.
2. Calendar sync model recommendation: Option A read busy-only with external write-back, Option B full two-way sync, Option C one-way first then upgrade.
3. Team scheduling launch recommendation: Option A round-robin first, Option B collective first, Option C both behind feature flags.









