import { useEffect, useState, useCallback } from 'react';
import { Loader2, Play, CircleCheck, CircleX } from 'lucide-react';
import api from '../api/axios';
import { StatusBadge, SeverityBadge } from '../components/Badges';
import { useSocket } from '../context/SocketContext';

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under review' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export default function AuthorityDashboard() {
  const [tab, setTab] = useState('pending');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null); // report being verified
  const [severity, setSeverity] = useState('medium');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const { socket } = useSocket();

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/authority/queue?status=${tab}`).then(({ data }) => setReports(data.reports)).finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => { if (tab === 'pending') load(); };
    socket.on('report:new', onNew);
    return () => socket.off('report:new', onNew);
  }, [socket, tab, load]);

  const startReview = async (id) => {
    await api.patch(`/authority/reports/${id}/start-review`);
    load();
  };

  const confirmVerify = async () => {
    setBusy(true);
    try {
      await api.patch(`/authority/reports/${reviewing.id}/verify`, { severity, note });
      setReviewing(null);
      setNote('');
      load();
    } finally {
      setBusy(false);
    }
  };

  const reject = async (id) => {
    const reason = prompt('Reason for rejecting this report?');
    if (reason === null) return;
    await api.patch(`/authority/reports/${id}/reject`, { reason });
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="eyebrow mb-2">Station verification queue</div>
      <h1 className="font-display font-bold text-3xl mb-8">Case review</h1>

      <div className="flex gap-1 mb-6 border-b border-ink-border">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.value ? 'border-verified text-verified' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center text-text-muted">No reports in this queue.</div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="case-id mb-1">CA-{r.id.slice(0, 8).toUpperCase()} · reported by {r.reporter?.name}</p>
                  <h3 className="font-display font-semibold">{r.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{r.description}</p>
                  <p className="text-xs text-text-faint mt-2 font-mono">
                    {r.lat.toFixed(4)}, {r.lng.toFixed(4)} · {r.category.replace('_', ' ')}
                  </p>
                  {r.mediaUrl && (
                    <div className="mt-3">
                      {r.mediaType === 'video' ? (
                        <video src={r.mediaUrl} controls className="max-h-48 rounded-md border border-ink-border" />
                      ) : (
                        <img src={r.mediaUrl} alt="evidence" className="max-h-48 rounded-md border border-ink-border" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-2">
                    <SeverityBadge severity={r.severity} />
                    <StatusBadge status={r.status} />
                  </div>
                  {r.status === 'pending' && (
                    <button onClick={() => startReview(r.id)} className="btn-secondary !py-1.5 !px-3 text-xs">
                      <Play className="w-3.5 h-3.5" /> Start review
                    </button>
                  )}
                  {(r.status === 'pending' || r.status === 'under_review') && (
                    <div className="flex gap-2">
                      <button onClick={() => setReviewing(r)} className="btn-primary !py-1.5 !px-3 text-xs">
                        <CircleCheck className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button onClick={() => reject(r.id)} className="btn-danger !py-1.5 !px-3 text-xs">
                        <CircleX className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <div className="card p-6 max-w-md w-full">
            <h2 className="font-display font-bold text-xl mb-1">Verify report</h2>
            <p className="text-sm text-text-muted mb-5">{reviewing.title}</p>

            <label className="label">Severity level</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`py-2 rounded-md text-xs font-mono uppercase border transition-colors ${
                    severity === s ? 'border-verified text-verified bg-verified/10' : 'border-ink-border text-text-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-faint mb-4">
              Alert radius scales with severity: low 0.5km · medium 1km · high 2km · critical 5km.
            </p>

            <label className="label">Note (optional)</label>
            <textarea className="input min-h-20 mb-5" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note about this verification" />

            <div className="flex gap-3">
              <button onClick={() => setReviewing(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={confirmVerify} disabled={busy} className="btn-primary flex-1">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
