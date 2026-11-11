import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { causeOf, dayFirst, sameCause, uniqueById } from '../src/lib/kb/causes.ts';
import { DEDUPE_CASES } from '../src/lib/kb/dedupe-cases.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';
import { daysSince, STALE_AFTER_DAYS } from '../src/lib/kb/staleness.ts';
import { review } from '../src/lib/kb/review.ts';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const reports = await readJson('src/lib/data/reports-4471.json');
const notes = await readJson('src/lib/data/desk-notes.json');
const tenants = await Promise.all((await readdir('src/lib/data/tenants')).map((n) => readJson(`src/lib/data/tenants/${n}`)));
const tenantOf = (r) => tenants.find((t) => t.handle === r.tenant);
const result = review(reports, tenantOf);
assert.equal(reports.length, 427);
assert.equal(uniqueById(reports).length, 412);
assert.equal(result.total, 412);
assert.equal(result.duplicateRows, 15);
assert.equal(result.tagDisagreements, 38);
assert.deepEqual(result.groups.map((g) => [g.cause, g.reports.length, g.tenants]), [['parser', 379, 11], ['hint', 33, 3]]);
assert.equal(result.groups.reduce((n, g) => n + g.reports.length, 0), result.total);
const ids = result.groups.flatMap((g) => g.reports.map((r) => r.id));
assert.equal(new Set(ids).size, result.total);
assert(tenants.every((t) => dayFirst(t.locale)));
assert.equal(dayFirst('en-US'), false);
assert.equal(causeOf({ channel: 'form' }, undefined), null);
assert.equal(causeOf({ channel: 'form' }, { ...tenants[0], locale: 'en-US' }), null);
for (const [i, expected] of [true, false, false, true, false].entries()) {
  const { a, b } = DEDUPE_CASES[i];
  assert.equal(sameCause(a, tenantOf(a), b, tenantOf(b)), expected);
}
for (const id of notes.oneDayMove) {
  const report = reports.find((r) => r.id === id);
  assert.equal(causeOf(report, tenantOf(report)), 'parser');
}
assert(daysSince('2024-06-11', new Date('2026-11-11')) > STALE_AFTER_DAYS);
assert.equal(result.monthly[0].merged, 0);
assert.equal(result.monthly.find((m) => m.month === '2026-07').merged, 252);

await mkdir('evidence', { recursive: true });
await writeFile('evidence/analysis.json', JSON.stringify({
  exportDate: '2026-10-04', reviewed: '2026-11-11', ticket: 4471,
  rawRows: reports.length, total: result.total, duplicateRows: result.duplicateRows,
  tagDisagreements: result.tagDisagreements, medianDays: result.medianDays,
  monthly: result.monthly,
  groups: result.groups.map(({ reports, ...g }) => ({ ...g, count: reports.length, ids: reports.map((r) => r.id).sort() })),
  caveatIds: notes.oneDayMove,
}, null, 2) + '\n');

for (const path of ['incidents/4471-review', 'decisions/0002-dedupe-by-cause']) {
  const source = await readFile(`src/routes/kb/${path}/+page.svx`, 'utf8');
  const signature = source.match(/^signature: '(.*)'$/m)[1];
  assert(source.trim().endsWith('<RenderStamp {signature} />'));
  try {
    const html = await readFile(`rendered/kb/${path}/index.html`, 'utf8');
    assert(html.includes(deskRef(signature)), 'The actual RenderStamp must appear in SSR HTML');
    assert(!html.includes('no desk ref:'));
    if (path.includes('4471-review')) {
      assert(html.includes('379'));
      assert(html.includes('33'));
      assert(html.includes('412 unique reports'));
      assert(html.includes('different causes — keep apart'));
      assert(html.includes('reports received and merged'));
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log(`Build not present yet: ${path}; run npm run build, then npm test again.`);
  }
}
console.log(`Verified: ${result.total} unique reports, 379 parser + 33 hint; 38 tag disagreements; all dedupe cases and caveats.`);
