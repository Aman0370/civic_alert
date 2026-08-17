import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, code });
      login(data.token, data.user);
      navigate(data.user.role === 'authority' ? '/authority' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError('');
    setInfo('');
    try {
      await api.post('/auth/resend-otp', { email });
      setInfo('A new code has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <div className="eyebrow mb-2">Verify email</div>
      <h1 className="font-display font-bold text-3xl mb-3">Enter your code</h1>
      <p className="text-sm text-text-muted mb-8">
        We sent a 6-digit code to <span className="font-mono text-text-primary">{email || 'your email'}</span>.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <input
          className="input font-mono text-center text-2xl tracking-[0.5em]"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="······"
        />
        {error && <p className="text-sm text-severity-critical">{error}</p>}
        {info && <p className="text-sm text-verified">{info}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & continue'}
        </button>
      </form>
      <button onClick={resend} disabled={resending} className="text-sm text-text-muted hover:text-verified mt-6">
        {resending ? 'Sending…' : "Didn't get a code? Resend"}
      </button>
    </div>
  );
}
