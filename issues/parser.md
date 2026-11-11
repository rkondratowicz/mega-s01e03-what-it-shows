## Problem

The shared parser reads all date text month first. Day-first tenants therefore get swapped
day/month values in invitations and bookings. This is the parser problem in the #4471 export,
not the separate booking-v3 hint defect tracked in #2.

## Report count and scope

**379 unique reports** in source ticket **#4471**, across **11 tenants**; received **2026-04-01 → 2026-10-04**.
The export has 427 rows but 412 unique report IDs. Deduplicate by ID, filter `mergedInto === 4471`,
then run the supplied `causeOf` / `groupByCause` against the tenant directory. The other 33 reports
belong to #2. The two sets do not overlap and sum to 412.

Parser intake tags: 356 `parser`, 23 `hint`. Tags and browser locales are guesses, not the cause.
Use the tenant locale and deployed form. A day-first tenant uses this cause unless the report
arrived through a booking-v3 form (which belongs to the separate hint cause).

## Evidence and reproduction target

- `R-41203`: Lantern Row, app, cs-CZ / booking-v2: 2 December becomes 12 February.
- `R-41205`: Morrow Tax, app, fr-FR / booking-v2: 3 October becomes 10 March; intake guessed `hint`.
- Given a day-first tenant, pass `02/12/2026` through the shared parser. Expected: 2 December.
  The supplied cause model describes month-first interpretation: 12 February.
- This is an evidence-based reproduction target; the export contains no production parser to execute.

## Acceptance criteria

- [ ] Define and enforce the date contract at the parser boundary; do not silently assume month-first.
- [ ] Cover ambiguous valid dates, day > 12, invalid dates and tenant locale in regression tests.
- [ ] Exercise app/email and booking-v2 paths; do not regress genuinely month-first input.
- [ ] Verify the booking-v3 hint separately under #2 rather than closing both for one fix.
- [ ] Recompute counts when new reports arrive and confirm raw inputs for the caveats below.

## Caveats

`R-41202`, `R-41209`, `R-41236`, `R-41344` and `R-41620` were read by the desk as one-day moves.
All five remain in this 379 under the supplied tenant-and-channel classification. Their wording
does not prove a third timezone bug. Request raw inputs, timestamps and zones before reclassifying.
No fix or affected-user total is verified. Receipt time is not merge time or deployment time.

## Reproducible audit

- Logic: `src/lib/kb/causes.ts`, `src/lib/kb/locales.ts`; data: `src/lib/data/`.
- Report IDs and counts: `evidence/analysis.json` (`npm test` regenerates it).
- Signed KB source: `src/routes/kb/incidents/4471-review/+page.svx`.
- Actual rendered page: `rendered/kb/incidents/4471-review/index.html`.
