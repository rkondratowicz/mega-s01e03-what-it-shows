# S01E03 — what it shows

## Deliverables

- [Parser issue: 379 reports](https://github.com/rkondratowicz/mega-s01e03-what-it-shows/issues/1).
- [Booking-v3 hint issue: 33 reports](https://github.com/rkondratowicz/mega-s01e03-what-it-shows/issues/2).
- Signed review source: [`src/routes/kb/incidents/4471-review/+page.svx`](src/routes/kb/incidents/4471-review/+page.svx).
- Actual rendered review: [`rendered/kb/incidents/4471-review/index.html`](rendered/kb/incidents/4471-review/index.html).
- Proposed replacement decision: [`src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`](src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx).
- Actual rendered decision: [`rendered/kb/decisions/0002-dedupe-by-cause/index.html`](rendered/kb/decisions/0002-dedupe-by-cause/index.html).
- Recomputed counts and report ID sets: [`evidence/analysis.json`](evidence/analysis.json).

The original 30 files from the 4 October export are preserved byte for byte. Historical accepted
decision 0001 is not rewritten. Decision 0002 proposes a replacement; this repo does not change
the live desk or claim its approval. No production fix is verified.

## Build, test and view

Requires Node.js 24 (the tests import TypeScript directly).

```sh
npm ci --no-audit --no-fund
npm test
npm run build
npm test
python3 -m http.server 4313 --bind 127.0.0.1 --directory rendered
```

Open `http://127.0.0.1:4313/kb/incidents/4471-review/` in a browser. The KB index is `/kb/`.
Serve the directory rather than opening an HTML file directly so stylesheet, script and route
links resolve. No public hosting is required: the full prerendered site is committed to this repo.

SvelteKit + mdsvex compile the `.svx` pages with the original runbook layout and components.
`#lib` aliases and `import.meta.glob` resolve through Vite. Counts, tables, queue charts and desk
refs come from the supplied functions and actual Svelte rendering, not handwritten substitutes.
The generated site includes client assets for the interactive duplicate explorer.

## Evidence limits

The export has 427 rows but 412 unique report IDs. Tenant locale, channel and form determine the
two cause sets; browser locale and intake tags do not. Five unusual timing/one-day reports remain
counted under parser with explicit caveats. Receipt and merge timestamps are separate series;
a merge surge is not an incident onset or a shipped fix. Counts describe the export, not the live desk.

## Updating

For new reports, retain the original evidence, read the current report and tenant facts, re-run
the classification, and reconcile issue counts and rendered pages. Update the reviewed date only
after actually checking the page. Keep unknown tenants unplaced; do not merge on a subject match.

Repository and issue publication was explicitly approved by the student. The repo is public and
can be deleted after course acceptance, but public copies may remain.
