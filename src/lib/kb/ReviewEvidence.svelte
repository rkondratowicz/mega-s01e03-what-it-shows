<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report, readAs } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { review, problemIssues } from '#lib/kb/review';

  const result = $derived(review(reports as Report[], tenantOf));
</script>

<p><strong>{result.total} unique reports</strong> in #4471; {result.duplicateRows} overlapping export rows removed.
  <strong>{result.groups.length} causes</strong> under the supplied tenant-and-form rule.
  {result.tagDisagreements} reports disagree with their intake tag.</p>

<table>
  <caption>Computed from the export, not the browser locale or subject line.</caption>
  <thead><tr><th>Problem and ticket</th><th>Reports</th><th>Tenants</th><th>First → last received</th><th>Intake tags</th></tr></thead>
  <tbody>
    {#each result.groups as group (group.cause)}
      <tr>
        <td><a href={problemIssues[group.cause]}>{group.cause}</a></td>
        <td>{group.reports.length}</td><td>{group.tenants}</td>
        <td>{group.firstSeen} → {group.lastSeen}</td>
        <td>{Object.entries(group.taggedAs).map(([tag, n]) => `${tag}: ${n}`).join(' · ')}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each result.groups as group (group.cause)}
  {#if readAs(group, notes.oneDayMove)}
    <p>{readAs(group, notes.oneDayMove)} reports flagged by the desk as one-day moves remain counted under
      <code>{group.cause}</code>. Their wording is not proof of a separate cause.</p>
  {/if}
{/each}

<details>
  <summary>Report IDs for each problem (audit trail)</summary>
  {#each result.groups as group (group.cause)}
    <h3>{group.cause}</h3>
    <p>{group.reports.map((r) => r.id).sort().join(', ')}</p>
  {/each}
</details>

<h3>Received is not merged</h3>
<table>
  <thead><tr><th>Month</th><th>Received</th><th>Merged</th></tr></thead>
  <tbody>
    {#each result.monthly as row (row.month)}
      <tr><td>{row.month}</td><td>{row.received}</td><td>{row.merged}</td></tr>
    {/each}
  </tbody>
</table>
<p>Median receipt-to-merge delay: {result.medianDays?.toFixed(1)} days. These are desk processing times,
  not repair times or a measure of how long a customer was affected.</p>
