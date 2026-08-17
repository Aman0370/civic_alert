import { Link } from 'react-router-dom';
import { ShieldCheck, MapPinned, Siren, Lock, ArrowRight, CircleCheck, Radio } from 'lucide-react';

const FEED = [
  { id: 'CA-4471', label: 'Vandalism', severity: 'medium', dist: '0.4km', status: 'verified' },
  { id: 'CA-4472', label: 'Suspicious activity', severity: 'low', dist: '1.2km', status: 'under_review' },
  { id: 'CA-4473', label: 'Theft', severity: 'high', dist: '0.8km', status: 'verified' },
];

const SEV_DOT = {
  low: 'bg-severity-low',
  medium: 'bg-severity-medium',
  high: 'bg-severity-high',
  critical: 'bg-severity-critical',
};

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="eyebrow mb-5">Citizen ↔ Police · Verified Reporting Network</div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl leading-[1.05] tracking-tight">
            See something.
            <br />
            Report it.
            <br />
            <span className="text-verified">Get it verified.</span>
          </h1>
          <p className="mt-6 text-text-muted text-lg leading-relaxed max-w-lg">
            CivicAlert connects registered citizens directly to their nearest police
            station. Every report is reviewed by an officer before anything goes out —
            once confirmed, nearby residents get a live, radius-scaled alert based on
            severity.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/register" className="btn-primary text-base !px-6 !py-3">
              Register as a citizen <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register?role=authority" className="btn-secondary text-base !px-6 !py-3">
              Register a station account
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-text-faint">
            <Lock className="w-3.5 h-3.5" />
            Identity numbers are validated then one-way hashed — we never store the raw ID.
          </div>
        </div>

        {/* Signature element: live dispatch console panel */}
        <div className="card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-verified" />
              <span className="eyebrow">Live incident feed</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-verified">
              <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" /> ACTIVE
            </span>
          </div>

          {/* radar / radius visual */}
          <div className="relative h-40 rounded-md bg-ink border border-ink-border mb-4 overflow-hidden flex items-center justify-center">
            <div className="absolute w-4 h-4 rounded-full bg-severity-high" />
            <div className="absolute w-4 h-4 rounded-full bg-severity-high animate-pulseRing" />
            <div className="absolute w-4 h-4 rounded-full bg-severity-high animate-pulseRing [animation-delay:0.7s]" />
            <div className="absolute w-4 h-4 rounded-full bg-severity-high animate-pulseRing [animation-delay:1.4s]" />
            <div className="absolute bottom-2 right-3 case-id">radius 2.0km · high severity</div>
          </div>

          <div className="space-y-2">
            {FEED.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border border-ink-border bg-ink px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${SEV_DOT[r.severity]}`} />
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="case-id">{r.id} · {r.dist} away</p>
                  </div>
                </div>
                {r.status === 'verified' ? (
                  <span className="flex items-center gap-1 text-[11px] text-verified font-mono">
                    <CircleCheck className="w-3.5 h-3.5" /> verified
                  </span>
                ) : (
                  <span className="text-[11px] text-severity-medium font-mono">under review</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - a real sequence, numbering is earned here */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-ink-border">
        <h2 className="font-display font-bold text-3xl mb-2">How a report becomes an alert</h2>
        <p className="text-text-muted mb-12 max-w-2xl">
          Three steps, always in this order — nothing reaches the public map until an officer signs off.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              n: '01',
              icon: MapPinned,
              title: 'Citizen files a report',
              body: 'Photo, video, or text plus GPS location, routed automatically to the nearest station.',
            },
            {
              n: '02',
              icon: ShieldCheck,
              title: 'Officer verifies it',
              body: 'A duty officer opens the case, marks it under review, and confirms or rejects it with a note.',
            },
            {
              n: '03',
              icon: Siren,
              title: 'Radius alert goes out',
              body: 'Verified reports set an alert radius by severity — 0.5km for low, up to 5km for critical — pushed live to nearby citizens.',
            },
          ].map((s) => (
            <div key={s.n} className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-text-faint">{s.n}</span>
                <s.icon className="w-5 h-5 text-verified" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TWO SIDES */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-ink-border grid md:grid-cols-2 gap-8">
        <div className="card p-8">
          <div className="eyebrow mb-3">For citizens</div>
          <h3 className="font-display font-bold text-2xl mb-4">Know what's happening around you</h3>
          <ul className="space-y-3 text-sm text-text-muted">
            <li className="flex gap-2"><CircleCheck className="w-4 h-4 text-verified shrink-0 mt-0.5" />File a report in under a minute, from anywhere</li>
            <li className="flex gap-2"><CircleCheck className="w-4 h-4 text-verified shrink-0 mt-0.5" />Track your report's status from submitted to verified</li>
            <li className="flex gap-2"><CircleCheck className="w-4 h-4 text-verified shrink-0 mt-0.5" />Get instant alerts for confirmed incidents near you</li>
          </ul>
        </div>
        <div className="card p-8">
          <div className="eyebrow mb-3">For authorities</div>
          <h3 className="font-display font-bold text-2xl mb-4">A verification queue built for triage</h3>
          <ul className="space-y-3 text-sm text-text-muted">
            <li className="flex gap-2"><CircleCheck className="w-4 h-4 text-verified shrink-0 mt-0.5" />Station-scoped queue, sorted oldest-first</li>
            <li className="flex gap-2"><CircleCheck className="w-4 h-4 text-verified shrink-0 mt-0.5" />Set severity on confirmation to auto-size the alert radius</li>
            <li className="flex gap-2"><CircleCheck className="w-4 h-4 text-verified shrink-0 mt-0.5" />Live map of everything active in your jurisdiction</li>
          </ul>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-ink-border text-center">
        <h2 className="font-display font-bold text-3xl mb-4">Your locality is better watched when everyone reports.</h2>
        <Link to="/register" className="btn-primary text-base !px-6 !py-3 inline-flex">
          Create your account <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
