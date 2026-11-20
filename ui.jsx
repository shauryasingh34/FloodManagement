import { STATUSES } from '../constants';

export const slug = (s) => String(s).toLowerCase().replace(/\s+/g, '-');
export const label = (s) => String(s).replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
export const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export const StatusBadge = ({ value }) => <span className={`badge s-${slug(value)}`}>{value}</span>;
export const PriorityBadge = ({ value }) => <span className={`badge p-${slug(value)}`}>{value} priority</span>;
export const SeverityBadge = ({ value }) => <span className={`badge v-${slug(value)}`}>{value}</span>;

// Submitted → Under Review → Assigned → Resolved
export function StatusTrack({ value }) {
  const at = STATUSES.indexOf(value);
  return (
    <ol className="track" aria-label={`Status: ${value}`}>
      {STATUSES.map((s, i) => <li key={s} className={i <= at ? 'on' : ''}>{s}</li>)}
    </ol>
  );
}

// Horizontal bars from [[label, count], ...]
export function Bars({ rows }) {
  if (!rows.length) return <p className="muted">No data yet.</p>;
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <ul className="bars">
      {rows.map(([name, n]) => (
        <li key={name}>
          <span>{name}</span>
          <div className="bar"><i style={{ width: `${(n / max) * 100}%` }} /></div>
          <b>{n}</b>
        </li>
      ))}
    </ul>
  );
}
