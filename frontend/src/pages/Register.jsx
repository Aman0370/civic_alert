import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, User, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function Register() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(params.get('role') === 'authority' ? 'authority' : 'citizen');
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    govId: '',
    badgeNumber: '',
    stationId: '',
    authorityCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'authority') {
      api.get('/stations').then(({ data }) => setStations(data.stations)).catch(() => {});
    }
  }, [role]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, role };
      const { data } = await api.post('/auth/register', payload);
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="eyebrow mb-2">Create account</div>
      <h1 className="font-display font-bold text-3xl mb-8">Join CivicAlert</h1>

      <div className="flex rounded-md border border-ink-border overflow-hidden mb-8">
        <button
          type="button"
          onClick={() => setRole('citizen')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            role === 'citizen' ? 'bg-verified text-ink' : 'bg-ink-surface text-text-muted hover:text-text-primary'
          }`}
        >
          <User className="w-4 h-4" /> Citizen
        </button>
        <button
          type="button"
          onClick={() => setRole('authority')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            role === 'authority' ? 'bg-verified text-ink' : 'bg-ink-surface text-text-muted hover:text-text-primary'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Authority
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" required value={form.name} onChange={update('name')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" required value={form.email} onChange={update('email')} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input" required minLength={8} value={form.password} onChange={update('password')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={update('phone')} />
        </div>
        <div>
          <label className="label">Government ID number (Aadhaar)</label>
          <input
            className="input font-mono"
            required
            placeholder="12-digit number"
            maxLength={12}
            value={form.govId}
            onChange={update('govId')}
          />
          <p className="text-[11px] text-text-faint mt-1.5">
            Validated by format only, then one-way hashed. The raw number is never stored.
          </p>
        </div>

        {role === 'authority' && (
          <>
            <div>
              <label className="label">Badge number</label>
              <input className="input" required value={form.badgeNumber} onChange={update('badgeNumber')} />
            </div>
            <div>
              <label className="label">Station</label>
              <select className="input" required value={form.stationId} onChange={update('stationId')}>
                <option value="">Select a station</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Authority registration code</label>
              <input className="input" required value={form.authorityCode} onChange={update('authorityCode')} />
              <p className="text-[11px] text-text-faint mt-1.5">Provided by your station admin.</p>
            </div>
          </>
        )}

        {error && <p className="text-sm text-severity-critical">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-text-muted mt-6 text-center">
        Already have an account? <Link to="/login" className="text-verified">Log in</Link>
      </p>
    </div>
  );
}
