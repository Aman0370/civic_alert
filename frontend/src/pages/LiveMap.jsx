import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from 'react-leaflet';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { SeverityBadge } from '../components/Badges';

const SEV_COLOR = { low: '#4C8DFF', medium: '#F5A623', high: '#FF7A45', critical: '#E4483C' };
const DEFAULT_CENTER = [23.5204, 87.3119]; // Durgapur, matches seed data

export default function LiveMap() {
  const [alerts, setAlerts] = useState([]);
  const { liveAlerts } = useSocket();

  useEffect(() => {
    api.get('/alerts/public').then(({ data }) => setAlerts(data.alerts)).catch(() => {});
  }, []);

  // merge freshly-broadcast alerts in front, de-duped by id
  const merged = [...liveAlerts, ...alerts].reduce((acc, a) => {
    if (!acc.find((x) => x.id === a.id)) acc.push(a);
    return acc;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="eyebrow mb-2">Public safety map</div>
      <h1 className="font-display font-bold text-3xl mb-1">Live verified alerts</h1>
      <p className="text-text-muted mb-6">Only officer-confirmed incidents appear here, sized by severity radius.</p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="card overflow-hidden h-[560px]">
          <MapContainer center={DEFAULT_CENTER} zoom={12} className="w-full h-full">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {merged.map((a) => (
              <div key={a.id}>
                <Circle
                  center={[a.lat, a.lng]}
                  radius={a.radiusKm * 1000}
                  pathOptions={{ color: SEV_COLOR[a.severity], fillOpacity: 0.12, weight: 1.5 }}
                />
                <CircleMarker center={[a.lat, a.lng]} radius={6} pathOptions={{ color: SEV_COLOR[a.severity], fillColor: SEV_COLOR[a.severity], fillOpacity: 1 }}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{a.headline}</p>
                      <p className="text-xs mt-1">Severity: {a.severity} · Radius: {a.radiusKm}km</p>
                    </div>
                  </Popup>
                </CircleMarker>
              </div>
            ))}
          </MapContainer>
        </div>

        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {merged.length === 0 && <p className="text-sm text-text-faint">No active alerts right now.</p>}
          {merged.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{a.headline}</p>
                <SeverityBadge severity={a.severity} />
              </div>
              <p className="text-xs text-text-faint font-mono">radius {a.radiusKm}km</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
