---
name: timezone-handling
description: "Use when: Writing features related to scheduling, calendar dates, availability calculation, or timezones."
applyTo: "app/api/**/*.ts|lib/time**/*.ts|lib/availability**/*.ts|components/**/*calendar*.tsx"
  
---

# Timezone & Date Handling Strategy

To prevent DST bugs and out-of-sync events across global users:

## 1. Database Storage (Strictly UTC)
- ALL timestamps in Prisma (`DateTime` fields) MUST be stored in UTC. 
- Never store localized times in the database.

## 2. Server-Side Processing
- When computing availability slots, strictly use the **Host's Timezone**. 
- Map recurring rules (e.g., "9 AM every Monday") to UTC *dynamically* on the server based on the specific date being queried, accounting for the host's DST transitions.
- Prefer `date-fns` and `date-fns-tz` for timezone math over native `Date` objects which rely on the server's local OS time.

## 3. Client-Side Rendering
- The API should output arrays of available UTC time strings (e.g., `["2026-03-20T14:00:00.000Z"]`).
- Only convert to the **Attendee's Timezone** exactly when rendering the UI using standard `Intl.DateTimeFormat` or mapping the UTC string into client browser time. 
- Do not let the server attempt to guess the attendee's timezone unless explicitly passed via a query parameter.