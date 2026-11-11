## Outcome: won't fix — closed as not planned

After the initial split was accepted, the [course challenge page](https://hq.mega.dev/challenges/what-it-shows)
published its engineering update for **#4471 · closed 05 oct**:

> hint — won't fix — booking-v3 form retired

This issue is closed as **not planned**, because the affected form was retired. The hint was not
fixed. The following scope and initial criteria remain as historical evidence; a closed parent
ticket does not establish that every contained problem was fixed.

## Original problem

Booking-v3 prints **MM/DD/YYYY** beneath the date field for day-first tenants while the form
reads the entered value in the tenant's day-first order. People who follow the hint get dates
swapped. This is separate from the shared parser bug tracked in #1.

## Report count and scope

**33 unique reports** in source ticket **#4471**, across **3 tenants**; received **2026-04-17 → 2026-09-22**.
Affected form tenants: **Alder Physio (12)**, **Copper Studio (11)**, **Pale Harbour (10)**.
These are day-first tenants on booking-v3 and reports on the `form` channel. The same tenants'
app/email reports belong to the parser issue, not this one.

Deduplicate the 427 export rows into 412 unique IDs; filter `mergedInto === 4471`; run the supplied
`causeOf` / `groupByCause` using the tenant directory. These 33 plus #1's 379 account for every report.
Intake tagged 18 as `hint` and 15 as `parser`: neither browser locale nor intake tag is the authority.

## Evidence and reproduction target

- `R-41241`: Alder Physio, form, de-DE / booking-v3: booked 6 August, two people show on 8 June.
- `R-41251`: Pale Harbour, form, pt-PT / booking-v3: 7 January shows as 1 July, intake guessed `parser`.
- For an Alder Physio booking-v3 form, enter `08/06/2026` for 6 August following the MM/DD/YYYY hint.
  Expected: the hint and parser agree on 6 August. The supplied model describes day-first reading,
  yielding 8 June instead. Use this as a production reproduction target; the export is not the form app.

## Initial acceptance criteria (superseded by retirement, not implemented)

- [ ] Make booking-v3's displayed date-order hint match the date format actually accepted for the tenant.
- [ ] Test de-DE, es-ES and pt-PT day-first tenants, and a month-first locale.
- [ ] Verify the displayed hint and submitted date together, with ambiguous day/month values.
- [ ] Retain correct booking-v2 behavior and keep app/email parser coverage under #1.
- [ ] Do not close this solely because the shared parser was changed; confirm the misleading hint is repaired.

## Status and audit

Initially open; now closed as **not planned** on form retirement, with no hint fix claimed.
The old incident's "one issue, one fix queued" does not
account for this second cause. Counts describe the 4 October 2026 export, not a live desk snapshot.

- Logic: `src/lib/kb/causes.ts`, `src/lib/kb/locales.ts`; data: `src/lib/data/`.
- Report IDs and counts: `evidence/analysis.json` (`npm test` regenerates it).
- Signed KB source: `src/routes/kb/incidents/4471-review/+page.svx`.
- Actual rendered page: `rendered/kb/incidents/4471-review/index.html`.
