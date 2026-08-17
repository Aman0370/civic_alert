import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { StatusBadge, SeverityBadge } from '../components/Badges';

export default function CitizenDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/mine').then(({ data }) => setReports(data.reports)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="eyebrow mb-2">Your case history</div>
          <h1 className="font-display font-bold text-3xl">My reports</h1>
        </div>
        <Link to="/report/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New report
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-text-muted mb-4">You haven't filed any reports yet.</p>
          <Link to="/report/new" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> Report an incident
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Link
              key={r.id}
              to={`/report/${r.id}`}
              className="card p-5 flex items-center justify-between hover:border-verified/40 transition-colors"
            >
              <div>
                <p className="case-id mb-1">CA-{r.id.slice(0, 8).toUpperCase()}</p>
                <h3 className="font-display font-semibold">{r.title}</h3>
                <p className="text-sm text-text-muted mt-1 line-clamp-1">{r.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <SeverityBadge severity={r.severity} />
                <StatusBadge status={r.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
