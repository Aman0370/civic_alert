const SEVERITY_STYLES = {
  low: 'bg-severity-low/10 text-severity-low border-severity-low/30',
  medium: 'bg-severity-medium/10 text-severity-medium border-severity-medium/30',
  high: 'bg-severity-high/10 text-severity-high border-severity-high/30',
  critical: 'bg-severity-critical/10 text-severity-critical border-severity-critical/30',
};

export function SeverityBadge({ severity }) {
  if (!severity) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wide ${SEVERITY_STYLES[severity] || ''}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}

const STATUS_STYLES = {
  pending: 'bg-text-faint/10 text-text-muted border-text-faint/30',
  under_review: 'bg-severity-medium/10 text-severity-medium border-severity-medium/30',
  verified: 'bg-verified/10 text-verified border-verified/30',
  rejected: 'bg-severity-critical/10 text-severity-critical border-severity-critical/30',
};

const STATUS_LABELS = {
  pending: 'Pending',
  under_review: 'Under review',
  verified: 'Verified',
  rejected: 'Not verified',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wide ${STATUS_STYLES[status] || ''}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
