import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Camera, Loader2, CircleAlert } from 'lucide-react';
import api from '../api/axios';

const CATEGORIES = [
  { value: 'theft', label: 'Theft' },
  { value: 'assault', label: 'Assault' },
  { value: 'vandalism', label: 'Vandalism' },
  { value: 'suspicious_activity', label: 'Suspicious activity' },
  { value: 'accident', label: 'Accident' },
  { value: 'fire', label: 'Fire' },
  { value: 'public_disturbance', label: 'Public disturbance' },
  { value: 'other', label: 'Other' },
];

export default function SubmitReport() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'other', address: '' });
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const getLocation = () => {
    setLocating(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError('Could not get your location. Please allow location access.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!coords) {
      setError('Please attach your location before submitting.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('lat', coords.lat);
      fd.append('lng', coords.lng);
      if (file) fd.append('media', file);

      const { data } = await api.post('/reports', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/report/${data.report.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="eyebrow mb-2">New case</div>
      <h1 className="font-display font-bold text-3xl mb-2">Report an incident</h1>
      <p className="text-text-muted mb-8">
        This goes to the nearest station for review. False reports can result in account suspension.
      </p>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label">What happened (short title)</label>
          <input className="input" required maxLength={120} value={form.title} onChange={update('title')} placeholder="e.g. Break-in attempt on Ashram Road" />
        </div>

        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={update('category')}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-32" required value={form.description} onChange={update('description')} placeholder="Describe what you saw — time, people involved, anything relevant." />
        </div>

        <div>
          <label className="label">Address / landmark (optional)</label>
          <input className="input" value={form.address} onChange={update('address')} placeholder="Nearest landmark" />
        </div>

        <div>
          <label className="label">Location</label>
          <button type="button" onClick={getLocation} disabled={locating} className="btn-secondary w-full !justify-start">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {coords ? `Location captured (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : 'Use my current location'}
          </button>
        </div>

        <div>
          <label className="label">Photo or video evidence (optional)</label>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={onFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary w-full !justify-start">
            <Camera className="w-4 h-4" /> {file ? file.name : 'Attach media'}
          </button>
          {preview && file?.type.startsWith('image') && (
            <img src={preview} alt="preview" className="mt-3 rounded-md border border-ink-border max-h-48 object-cover" />
          )}
        </div>

        {error && (
          <p className="text-sm text-severity-critical flex items-center gap-2">
            <CircleAlert className="w-4 h-4" /> {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
