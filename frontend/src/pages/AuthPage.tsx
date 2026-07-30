import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "../lib/router";
import { Brand } from "../components/Brand";

export function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <main id="main-content" className="auth-page">
      <section className="auth-brand-panel">
        <Link to="/" className="auth-back">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <Brand inverse />
        <div className="auth-brand-copy">
          <p className="eyebrow">A calmer way through the record</p>
          <h1>See the full story behind every finding.</h1>
          <p>
            One secure workspace for medical documents, timelines, trends, and anchored answers.
          </p>
          <div className="auth-benefits">
            <span>
              <Check /> Exact document and page citations
            </span>
            <span>
              <Check /> Separate risk and evidence confidence
            </span>
            <span>
              <Check /> Cautious answers when evidence is missing
            </span>
          </div>
        </div>
        <p className="auth-panel-foot">
          <ShieldCheck size={16} /> Demo mode stores workspace state only in this browser.
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-icon">
            <LockKeyhole size={22} />
          </div>
          <p className="eyebrow">Welcome</p>
          <h2>Sign in to your workspace</h2>
          <p className="auth-intro">Use a secure email link, or open the cached judging demo.</p>

          {sent ? (
            <div className="auth-success" role="status">
              <span>
                <Mail size={19} />
              </span>
              <div>
                <strong>Check your inbox</strong>
                <p>A secure sign-in link was prepared for {email}. In demo mode, no email is sent.</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <label htmlFor="email">Email address</label>
              <div className="input-with-icon">
                <Mail size={17} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <button className="button button-primary button-full" type="submit">
                Continue with secure link <ArrowRight size={17} />
              </button>
            </form>
          )}

          <div className="auth-divider">
            <span>or</span>
          </div>
          <button type="button"
            className="button button-secondary button-full"
            onClick={() => navigate("/patients")}
          >
            Open synthetic judging walkthrough
          </button>
          <p className="demo-disclosure">
            Uses clearly labeled synthetic clinical examples. No cloud credentials or patient data
            are required.
          </p>
        </div>
      </section>
    </main>
  );
}
