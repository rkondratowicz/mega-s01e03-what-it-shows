import { groupByCause, uniqueById, type Report, type Tenant } from './causes.ts';

export const problemIssues: Record<string, string> = {
  parser: 'https://github.com/rkondratowicz/mega-s01e03-what-it-shows/issues/1',
  hint: 'https://github.com/rkondratowicz/mega-s01e03-what-it-shows/issues/2',
};

export function review(reports: Report[], tenantOf: (r: Report) => Tenant | undefined, ticket = 4471) {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const months = [...new Set(merged.map((r) => r.receivedAt.slice(0, 7)))].sort();
  const monthly = months.map((month) => ({
    month,
    received: merged.filter((r) => r.receivedAt.startsWith(month)).length,
    merged: merged.filter((r) => r.mergedAt?.startsWith(month)).length,
  }));
  const delays = merged.filter((r) => r.mergedAt).map((r) =>
    (Date.parse(r.mergedAt!) - Date.parse(r.receivedAt)) / 86_400_000,
  ).sort((a, b) => a - b);
  const mid = Math.floor(delays.length / 2);
  const medianDays = delays.length ? (delays.length % 2 ? delays[mid] : (delays[mid - 1] + delays[mid]) / 2) : null;
  return {
    total: merged.length,
    duplicateRows: reports.length - uniqueById(reports).length,
    groups,
    monthly,
    medianDays,
    tagDisagreements: groups.reduce((n, g) => n + g.reports.filter((r) => r.meta.intakeTag !== g.cause).length, 0),
  };
}
