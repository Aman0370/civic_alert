import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate(data.user.role === 'authority' ? '/authority' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <div className="eyebrow mb-2">Welcome back</div>
      <h1 className="font-display font-bold text-3xl mb-8">Log in</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-severity-critical">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log in'}
        </button>
      </form>
      <p className="text-sm text-text-muted mt-6 text-center">
        New here? <Link to="/register" className="text-verified">Create an account</Link>
      </p>
      <div className="mt-8 p-4 rounded-md border border-ink-border bg-ink-surface">
        <p className="text-xs text-text-faint font-mono leading-relaxed">
          Demo — citizen@demo.com / Password123!<br />
          Demo — officer@demo.com / Password123!
        </p>
      </div>
    </div>
  );
}
