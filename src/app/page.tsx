import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SepCare — Neonatal Sepsis Monitoring",
  description:
    "SepCare is a clinical-grade neonatal sepsis risk monitoring platform for ASHA workers and caregivers. Coming soon.",
  openGraph: {
    title: "SepCare — Neonatal Sepsis Monitoring",
    description:
      "A clinical-grade neonatal sepsis risk monitoring platform. Coming soon.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="coming-soon-root">
      {/* Animated background blobs */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />

      {/* Grid overlay */}
      <div className="grid-overlay" aria-hidden="true" />

      <div className="coming-soon-content">
        {/* Wordmark */}
        <div className="wordmark-row" aria-label="SepCare">
          <span className="wordmark-sep">Sep</span>
          <span className="wordmark-care">Care</span>
        </div>

        {/* Pulse ring — decorative status indicator */}
        <div className="pulse-ring-container" aria-hidden="true">
          <div className="pulse-ring pulse-ring-3" />
          <div className="pulse-ring pulse-ring-2" />
          <div className="pulse-ring pulse-ring-1" />
          <div className="pulse-dot" />
        </div>

        {/* Badge */}
        <div className="cs-badge">
          <span className="cs-badge-dot" aria-hidden="true" />
          In Development
        </div>

        {/* Headline */}
        <h1 className="cs-headline">
          Clinical neonatal care,
          <br />
          <span className="cs-headline-accent">reimagined.</span>
        </h1>

        {/* Sub-copy */}
        <p className="cs-body">
          SepCare equips ASHA workers and caregivers with real-time sepsis risk
          monitoring — making life-saving insights accessible at the bedside.
        </p>

        {/* CTAs */}
        <div className="cs-actions">
          <Link href="/design-system/docs" className="cs-btn-primary">
            Explore design system
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="https://github.com/vansh-fyi/sepcare"
            target="_blank"
            rel="noopener noreferrer"
            className="cs-btn-secondary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Footer */}
        <footer className="cs-footer">
          <span>Built with care for frontline healthcare workers.</span>
          <span className="cs-footer-sep" aria-hidden="true">·</span>
          <span>© {new Date().getFullYear()} SepCare</span>
        </footer>
      </div>

      <style>{`
        .coming-soon-root {
          min-height: 100dvh;
          background: #050a0e;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 2rem;
          font-family: var(--font-inter, system-ui, sans-serif);
        }

        /* ── Animated blobs ─────────────────────────────── */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          pointer-events: none;
        }
        .blob-1 {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, #08d7bf, #01a18e);
          top: -140px;
          right: -80px;
          animation: blobDrift1 18s ease-in-out infinite;
        }
        .blob-2 {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, #0a2662, #2563eb);
          bottom: -100px;
          left: -60px;
          animation: blobDrift2 22s ease-in-out infinite;
        }
        .blob-3 {
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, #01a18e, #006458);
          bottom: 30%;
          right: 15%;
          opacity: 0.10;
          animation: blobDrift3 14s ease-in-out infinite;
        }

        @keyframes blobDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.08); }
        }
        @keyframes blobDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -20px) scale(1.06); }
        }
        @keyframes blobDrift3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 15px); }
        }

        /* ── Grid overlay ───────────────────────────────── */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(8, 215, 191, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(8, 215, 191, 0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* ── Content card ───────────────────────────────── */
        .coming-soon-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
          max-width: 640px;
          width: 100%;
        }

        /* ── Wordmark ───────────────────────────────────── */
        .wordmark-row {
          font-family: var(--font-plus-jakarta-sans, var(--font-inter, system-ui, sans-serif));
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .wordmark-sep { color: #e2e8f0; }
        .wordmark-care { color: #08d7bf; }

        /* ── Pulse rings ────────────────────────────────── */
        .pulse-ring-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0.5rem 0;
        }
        .pulse-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(8, 215, 191, 0.5);
          animation: pulseRing 4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .pulse-ring-1 { width: 36px; height: 36px; animation-delay: 0s; }
        .pulse-ring-2 { width: 58px; height: 58px; animation-delay: 0.8s; opacity: 0.7; }
        .pulse-ring-3 { width: 80px; height: 80px; animation-delay: 1.6s; opacity: 0.4; }
        .pulse-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #08d7bf;
          box-shadow: 0 0 12px rgba(8, 215, 191, 0.7), 0 0 24px rgba(8, 215, 191, 0.3);
        }

        @keyframes pulseRing {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pulse-ring, .blob { animation: none; }
        }

        /* ── Badge ──────────────────────────────────────── */
        .cs-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.875rem;
          border-radius: 100px;
          border: 1px solid rgba(8, 215, 191, 0.25);
          background: rgba(8, 215, 191, 0.08);
          color: #72d4ca;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .cs-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #08d7bf;
          box-shadow: 0 0 6px rgba(8, 215, 191, 0.8);
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cs-badge-dot { animation: none; }
        }

        /* ── Headline ───────────────────────────────────── */
        .cs-headline {
          font-family: var(--font-plus-jakarta-sans, var(--font-inter, system-ui, sans-serif));
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #e2e8f0;
          margin: 0;
        }
        .cs-headline-accent {
          background: linear-gradient(135deg, #08d7bf 0%, #27e4d0 50%, #72d4ca 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Body copy ──────────────────────────────────── */
        .cs-body {
          font-size: clamp(0.9375rem, 2vw, 1.0625rem);
          color: #94a3b8;
          line-height: 1.7;
          max-width: 480px;
          margin: 0;
        }

        /* ── Action buttons ─────────────────────────────── */
        .cs-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 0.5rem;
        }
        .cs-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 14px;
          background: #08d7bf;
          color: #042521;
          font-weight: 700;
          font-size: 0.9375rem;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(8, 215, 191, 0.35);
        }
        .cs-btn-primary:hover {
          background: #27e4d0;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(8, 215, 191, 0.45);
        }
        .cs-btn-primary:active { transform: translateY(0); }

        .cs-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 14px;
          background: transparent;
          border: 1px solid rgba(226, 232, 240, 0.15);
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.9375rem;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
        }
        .cs-btn-secondary:hover {
          border-color: rgba(226, 232, 240, 0.35);
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-2px);
        }
        .cs-btn-secondary:active { transform: translateY(0); }

        /* ── Footer ─────────────────────────────────────── */
        .cs-footer {
          margin-top: 1rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #475569;
          font-size: 0.8125rem;
        }
        .cs-footer-sep { color: #2d3748; }
      `}</style>
    </main>
  );
}
