import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Check,
  ChevronRight,
  FileStack,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "../lib/router";
import { Brand } from "../components/Brand";

export function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <Brand inverse />
        <nav aria-label="Landing navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#trust">Trust & safety</a>
          <Link className="button button-ghost-light button-small" to="/auth">
            Sign in
          </Link>
          <Link className="button button-light button-small" to="/patients">
            Open demo <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      <main id="main-content">
        <section className="hero">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="hero-copy">
            <div className="hero-kicker">
              <Sparkles size={14} />
              Evidence-linked record intelligence
            </div>
            <h1>
              Every record in view.
              <br />
              <em>Every claim anchored.</em>
            </h1>
            <p>
              MedTrace AI brings prescriptions, lab reports, and clinical notes into one
              navigable timeline—then shows the exact source behind every finding.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary button-large" to="/patients">
                Explore the synthetic case <ArrowRight size={18} />
              </Link>
              <a className="button button-ghost-light button-large" href="#how-it-works">
                See how it works
              </a>
            </div>
            <div className="hero-trust-row">
              <span>
                <ShieldCheck size={16} /> Privacy-ready architecture
              </span>
              <span>
                <BookOpenCheck size={16} /> Page-level evidence
              </span>
              <span>
                <BadgeCheck size={16} /> Confidence explained
              </span>
            </div>
          </div>

          <div className="hero-product" role="img" aria-label="Product preview">
            <div className="preview-chrome">
              <span />
              <span />
              <span />
              <small>Record overview · Maya Fernando</small>
            </div>
            <div className="preview-body">
              <div className="preview-sidebar">
                <div className="preview-logo" />
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="preview-nav-line" />
                ))}
              </div>
              <div className="preview-main">
                <div className="preview-title-row">
                  <div>
                    <span className="preview-eyebrow" />
                    <span className="preview-title" />
                  </div>
                  <span className="preview-button" />
                </div>
                <div className="preview-metrics">
                  <div>
                    <strong>12</strong>
                    <span>Documents</span>
                  </div>
                  <div>
                    <strong>6</strong>
                    <span>Visits</span>
                  </div>
                  <div>
                    <strong>4</strong>
                    <span>Review items</span>
                  </div>
                </div>
                <div className="preview-grid">
                  <div className="preview-timeline">
                    <p>Record timeline</p>
                    {[["2019", "Allergy documented"], ["2023", "Medication change"], ["2025", "Lab trend"]].map(
                      ([year, label]) => (
                        <div className="preview-event" key={year}>
                          <span>{year}</span>
                          <i />
                          <div>
                            <strong>{label}</strong>
                            <small>Evidence verified</small>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="preview-finding">
                    <span className="preview-risk">High-risk review</span>
                    <h3>Earlier allergy and later prescription</h3>
                    <p>Two record pages may contain a contradiction.</p>
                    <div className="preview-evidence">
                      <Check size={13} /> 2 source pages anchored
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-proof">
          <p>Designed for fragmented, multi-provider records</p>
          <div>
            <span>Prescriptions</span>
            <span>Laboratory reports</span>
            <span>Discharge summaries</span>
            <span>Clinical notes</span>
          </div>
        </section>

        <section id="how-it-works" className="landing-section">
          <div className="landing-section-heading">
            <p className="eyebrow">One evidence chain</p>
            <h2>From scattered pages to a record you can navigate</h2>
            <p>
              Structured extraction, deterministic checks, and a separate evidence-verification
              step keep the experience useful without pretending to replace clinical judgment.
            </p>
          </div>
          <div className="feature-grid">
            <article>
              <span className="feature-number">01</span>
              <FileStack />
              <h3>Bring the record together</h3>
              <p>Upload multiple PDFs or images and follow each document through processing.</p>
            </article>
            <article>
              <span className="feature-number">02</span>
              <BarChart3 />
              <h3>See change over time</h3>
              <p>Review medications, events, and compatible lab values in one chronology.</p>
            </article>
            <article>
              <span className="feature-number">03</span>
              <MessageSquareText />
              <h3>Ask, then inspect the proof</h3>
              <p>Grounded answers cite the exact document and page—or say evidence is insufficient.</p>
            </article>
          </div>
        </section>

        <section id="trust" className="safety-band">
          <div>
            <p className="eyebrow">Built for careful review</p>
            <h2>Risk is not confidence.</h2>
            <p>
              MedTrace presents the potential importance of a finding separately from how
              strongly the uploaded evidence supports it.
            </p>
          </div>
          <Link className="text-link-light" to="/patients">
            View the trust model <ChevronRight size={17} />
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <Brand inverse />
        <p>
          This application does not provide a diagnosis. Do not start, stop, or change medication
          based on this result.
        </p>
        <span>Competition prototype · 2026</span>
      </footer>
    </div>
  );
}
