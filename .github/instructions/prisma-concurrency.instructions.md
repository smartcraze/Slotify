
---
name: prisma-concurrency
description: "Use when: Writing data mutation, booking creation, payment webhooks, or any Prisma creation queries."
applyTo:
  - "app/api/bookings/**/*.ts"
  - "lib/db/**/*.ts"
---

# Prisma Concurrency & Race Condition Rules

A scheduling app faces high risk of concurrent booking conflicts. Always apply these patterns when creating or modifying bookings:

## 1. Relational Integrity over Application Logic
- Do not rely on sequential `await prisma.booking.findFirst()` followed by `await prisma.booking.create()`. This leaves a race condition window.
- Rely on unique constraints (e.g., `@@unique([userId, startTime, status])`) to let the database enforce uniqueness.

## 2. Handling the P2002 Error
- If a constraint check fails during concurrent requests, Prisma throws a `P2002` error (`PrismaClientKnownRequestError`).
- Always wrap booking creations in a `try/catch`, specifically checking for `P2002` to return a clean "This slot was just booked by someone else" `409 Conflict` error to the client, rather than a `500`.

## 3. Financial/Idempotency Safety
- For payment webhooks (Stripe/Razorpay) or external state changes, write idempotent functions. 
- Lock rows using `$queryRaw` with `SELECT ... FOR UPDATE` when checking a booking's status prior to writing a confirmation, ensuring parallel webhooks don't emit duplicate confirmation emails or double-credit accounts.