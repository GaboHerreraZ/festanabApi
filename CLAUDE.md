# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # nodemon + ts-node on server.ts, debugger on port 9229
npm start        # ts-node server.ts (no watch)
npm run build    # tsc -> dist/ (compiles src/** only; server.ts is outside rootDir)
```

Node 22.12.0 (`.nvmrc`). There are no tests and no linter — `npm test` just exits 1, and `npm run load-services` points at `src/commands/servicesData.ts`, which no longer exists. The only automated check is `npm run build` (`strict` + `noImplicitAny` + `noUnusedParameters`); run it after changes.

Env vars (`.env`, `.env.local`; loaded by `import "dotenv/config"` at the top of `src/app.ts`): `DATABASE_URL`, `SUPABSE_API_URL`, `SUPABSE_PUBLIC_API_KEY`, `PORT`. The two Supabase names are misspelled in both the files and `src/config/supabase.ts` — keep the spelling.

## Architecture

Express + TypeScript REST API for an events/catering business: quoting events, tracking employee hours under Colombian labor rules, and settling billing. MongoDB via Mongoose; Supabase only as the auth token issuer. Deployed to Vercel.

**Two entry points, one app.** `server.ts` (local: `connectDB()` + `listen`) and `src/api/index.ts` (Vercel serverless, per `vercel.json`, which routes everything to it). Both call `connectDB()` and re-export `src/app.ts`, where all middleware lives. Anything global (CORS, body parsing, error handler) belongs in `src/app.ts`, never in `server.ts`.

**Routing.** `src/app.ts` mounts `src/routes.ts` at `/api`, which mounts one router per component. Full paths look like `/api/event/get-hours-by-event-id/:eventId`. Endpoint names are verb-ish kebab-case (`add-edit-event`, `delete-hour/:id`), and a single `add-edit-*` POST handles both create and update, branching on whether `_id` is present in the body.

**Component layering** — `src/components/<domain>/`:
- `<domain>.router.ts` — paths + per-route `verifyToken`
- `controller/*.ts` — manual validation, orchestration, HTTP shaping
- `service/*.ts` — all Mongoose queries and aggregation pipelines
- `model/*.ts` — schema + exported `I<Name>` interface

Controllers and services are written as `const` arrow functions with one `export { ... }` block at the bottom. Controllers never touch models directly; services never touch `req`/`res`.

**Conventions that look like bugs but are load-bearing** (an Angular client depends on them):
- Every response is wrapped as `{ data: ... }`.
- Most handlers return **201 even for GETs** (47 occurrences). Don't normalize these without checking the client.
- `errorHandler` emits `{ error: { message, datails } }` — `datails` is misspelled in the wire format.
- The hour field is `auxiliaryTrasport` (misspelled) across model, utils, and API.

**Errors.** Every handler is `try { ... } catch (error) { next(error) }`; `src/middleware/errorHandler.ts` is the only place that formats errors. Validation failures are returned inline from the controller (`res.status(400).json(...); return;`) — note the `return` after `res`, not `return res`, which is the pattern that keeps the `void` handler signature valid. `zod` is in `package.json` but unused; validation is hand-written.

**Auth.** `verifyToken` (`src/middleware/verifyToken.ts`) pulls the Bearer token, calls `supabase.auth.getUser(token)`, and sets `req.user` (`AuthenticatedRequest`). It is applied **per route, not globally**, and several routes are deliberately public — `add-hour`, `delete-hour/:id`, `get-employee-events-by-cc/:cc`, `event-detail/:eventId`, `event-detail/update-status`, `get-totals-by-event`, `get-customer-quote/:id`, `get-employee-billing/...`, `debug-classify-hours`, `util/version`. These back an employee-facing flow with no login (commits "make add-hour endpoint public", "make delete-hour endpoint public"). Check git history before adding `verifyToken` to an unprotected route.

## The hours/payroll pipeline

This is the core domain logic. An `Hour` record stores both the hour count and the money per Colombian labor category: ordinary day/night, overtime day/night, Sunday-or-holiday day/night, and overtime Sunday-or-holiday day/night, plus transport allowance and `total`.

`addNewHour` / `editHour` in `hour.controller.ts` run the same chain:

1. `checkOverlap` → `findOverlappingHour` — rejects with **409** if the range overlaps another record for the same `(eventId, employeeId)`. Only records with a non-null `endTime` are considered.
2. `getSetting()` — the `Setting` collection is a **singleton**; the service creates it with defaults if missing. Its fields are percentage surcharges (e.g. `25` meaning +25%).
3. `buildWorkParams(settings)` (`src/util/build-work-params.util.ts`) — turns those percentages into multipliers (`1 + pct/100`). Shift shape is hard-coded here: `maxDailyHours: 7`, `dayShift` 06:00–19:00, and `workingDays: [0..6]` (all seven, so the "non-working day" branch in the classifier never fires).
4. `classifyWorkedHoursV2` (`src/util/classify-worked-hours-v2.util.ts`) — walks the interval in **15-minute ticks**, resolving each tick's date/weekday/hour in `America/Bogota` via `Intl.DateTimeFormat`. This is what makes overnight and multi-day shifts classify correctly; it is why timestamps must be passed as real `Date`s and not local-time hour numbers. `maxOrdinaryHoursPerShift` is consumed across the whole range, so everything past hour 7 of a shift is overtime regardless of calendar day.
5. `getHolidaysInRange` (`src/util/get-holidays-in-range.util.ts`) — fetches Colombian holidays from the public `date.nager.at` API, cached per year in a module-level `Map`. A holiday is matched by Bogota `YYYY-MM-DD` string. This means hour creation makes an outbound HTTP call (cold on Vercel).
6. `buildRates` (`src/util/build-rates.util.ts`) — multiplies each bucket by `hourPrice × multiplier` and **rounds every value to the nearest 1000** COP.
7. Back in the controller, `auxiliaryTrasport` is recomputed as `settings.auxiliaryTrasport × (number of distinct Bogota days covered)` and `total` is rebuilt on top of it, overriding the single-day allowance `buildRates` applied.

`POST /api/event/debug-classify-hours` runs steps 2–7 on an arbitrary `{startTime, endTime, hourPrice}` without persisting — use it to verify classification changes.

Editing an hour clears approval (`approved`, `approvedBy`, `approvedAt`, `observations`); `PATCH /set-hour-approval/:id` sets it from `req.user.id`.

**Dead code** superseded by the above, kept but unreferenced: `classify-worked-hours.util.ts` (v1, hour-number based, no timezone), `check-if-day-holiday.util.ts`, `get-hour-number.util.ts`, `format-date.util.ts`. Change `-v2` when changing behavior.

## Event data model

`Event` is a thin header (customer, owner, description, location, nit, date, time, `status`: `inQuote | approved | pending | completed`). Everything else hangs off `eventId` in sibling collections:

- **`EventDetail`** — one document per event holding embedded `section[] → items[]` (the quote line items, with `rentalPrice` vs `costPrice` and `owner: Propio | Tercero`). `getEventDetailByEventId` **auto-creates and saves** a seeded default (Spanish "Logistica" and "Administración, Imprevistos y Utilidad" sections) when none exists — so `GET /event-detail/:eventId` has a write side effect. Item edits use positional/`arrayFilters` updates, not read-modify-write.
- **`Hour`**, **`EmployeeService`**, **`Bill`** — per-event cost rows.
- **`EventEmployee`** — assignment join table. Deleting an assignment also deletes that employee's `Hour` records for the event.
- **`CustomerQuote`** — an immutable snapshot of totals + the whole `EventDetail` at one moment, with `utility = totalRentalPrice - totalHourCost - totalBillValue`.
- **`EventBilling`** — an immutable settlement snapshot. `setEventBilling` (exposed as a **GET** that writes) deletes the prior snapshot and rebuilds it from `getEmployeeWithRecords`, a `$unionWith` aggregation that merges employees who have hours with employees who only have services, then totals both per employee.

`getTotalsByEvent` is the live (non-snapshot) rollup: rental/cost from `EventDetail` items, `value` from `Bill`, `total` from `Hour`.

**Cascading deletes are manual.** `deleteEventById` in `event.controller.ts` sequentially deletes the event, hours, detail, customer quotes, and employee services — no transaction, no Mongoose hooks. `EventBilling` and `EventEmployee` are not cleaned up. Any new collection keyed by `eventId` has to be added to that controller by hand.

**Aggregations hard-code collection names.** `$lookup`/`$unionWith` stages reference `"events"`, `"hours"`, `"employeeservices"`, `"eventemployees"` as literals, so renaming a Mongoose model silently breaks dashboard and billing queries.

## Other gotchas

- **Duplicate `"Setting"` model name.** `src/components/setting/model/setting.model.ts` (the payroll settings, in active use) and `src/components/util/model/setting.model.ts` (unused, `{ module }`) both call `mongoose.model("Setting", ...)`. Importing both throws `OverwriteModelError`. The `util` one, `util/service/settings.service.ts` (empty) and `util/controller/setting.controller.ts` (commented out) are vestigial.
- **`cc` type mismatch.** `Employee.cc` is a `Number`; `Hour.cc` and `EmployeeService.cc` are `String`. `getEmployeeEventsByCc` coerces with `Number(cc)` before matching employees.
- **Language.** Domain vocabulary, inline comments, and all client-facing messages are Spanish; identifiers are English (with Spanish abbreviations like `hrsExtDomNoc`). Follow the surrounding file.
