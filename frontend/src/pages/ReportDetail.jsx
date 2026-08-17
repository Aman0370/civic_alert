import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { StatusBadge, SeverityBadge } from '../components/Badges';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/reports/${id}`).then(({ data }) => setReport(data.report)).catch((err) => setError(err.response?.data?.message || 'Could not load report.'));
  }, [id]);

  if (error) return <div className="max-w-2xl mx-auto px-6 py-16 text-severity-critical">{error}</div>;
  if (!report) return <div className="max-w-2xl mx-auto px-6 py-16 flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="case-id mb-2">CA-{report.id.slice(0, 8).toUpperCase()}</p>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl">{report.title}</h1>
        <div className="flex gap-2 shrink-0 ml-4">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
        </div>
      </div>

      {report.mediaUrl && (
        <div className="mb-6 rounded-lg overflow-hidden border border-ink-border">
          {report.mediaType === 'video' ? (
            <video src={report.mediaUrl} controls className="w-full max-h-96" />
          ) : (
            <img src={report.mediaUrl} alt="evidence" className="w-full max-h-96 object-cover" />
          )}
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div>
          <p className="label mb-1">Description</p>
          <p className="text-sm leading-relaxed">{report.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="label mb-1">Category</p>
            <p className="text-sm capitalize">{report.category.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="label mb-1">Filed on</p>
            <p className="text-sm font-mono">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
        </div>
        {report.reviewNote && (
          <div>
            <p className="label mb-1">Reviewer note</p>
            <p className="text-sm text-text-muted">{report.reviewNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
