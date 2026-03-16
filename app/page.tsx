"use client";
import { useState, useEffect } from "react";

type Article = {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  credibility?: "Verified" | "Unverified" | "Likely Fake";
  summary?: string;
  reason?: string;
};

const INTERESTS = [
  { label: "Technology", value: "technology" },
  { label: "Business", value: "business" },
  { label: "Sports", value: "sports" },
  { label: "Health", value: "health" },
  { label: "Science", value: "science" },
  { label: "Entertainment", value: "entertainment" },
  { label: "India", value: "india" },
  { label: "World", value: "world" },
];

export default function Home() {
  const [selected, setSelected] = useState<string>("technology");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  async function fetchNews(topic: string) {
    setLoading(true); setError(""); setArticles([]); setFetched(false);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: [topic] }),
      });
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      setArticles(data.articles || []);
      setFetched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNews("technology"); }, []);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  function getCredibilityData(credibility?: string) {
    if (credibility === "Verified") return { label: "Verified", dot: "#16a34a", bg: "#f0fdf4", text: "#15803d", bar: "#22c55e" };
    if (credibility === "Likely Fake") return { label: "Likely Fake", dot: "#dc2626", bg: "#fef2f2", text: "#b91c1c", bar: "#ef4444" };
    return { label: "Unverified", dot: "#d97706", bg: "#fffbeb", text: "#b45309", bar: "#f59e0b" };
  }

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600&family=Source+Code+Pro:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #fafaf8;
          --surface: #ffffff;
          --ink: #111111;
          --ink2: #444444;
          --ink3: #888888;
          --border: #e5e5e0;
          --border2: #d0d0c8;
          --accent: #1a1a2e;
          --red: #c0392b;
          --sans: 'Source Sans 3', sans-serif;
          --serif: 'Playfair Display', Georgia, serif;
          --mono: 'Source Code Pro', monospace;
        }

        body { background: var(--bg); color: var(--ink); font-family: var(--sans); }

        /* ── TOP BAR ── */
        .topbar {
          background: var(--accent);
          color: #fff;
          padding: 6px 0;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .topbar-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .topbar-left { opacity: 0.6; }
        .topbar-right { display: flex; gap: 20px; opacity: 0.8; }

        /* ── MASTHEAD ── */
        .masthead {
          background: var(--surface);
          border-bottom: 3px double var(--ink);
          padding: 24px 0 16px;
        }
        .masthead-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
        }
        .masthead-logo {
          font-family: var(--serif);
          font-size: clamp(56px, 9vw, 108px);
          font-weight: 700;
          letter-spacing: -4px;
          line-height: 0.88;
          color: var(--ink);
          text-align: center;
          padding: 8px 0;
        }
        .masthead-logo em {
          font-style: italic;
          color: var(--red);
        }
        .masthead-stripe {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border2);
          border-bottom: 1px solid var(--border2);
          margin-top: 12px;
          padding: 6px 0;
          gap: 16px;
        }
        .masthead-date {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 1px;
          color: var(--ink3);
          text-transform: uppercase;
        }
        .masthead-tag {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 1px;
          color: var(--ink3);
          text-transform: uppercase;
          text-align: center;
          font-style: italic;
        }
        .masthead-powered {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 1px;
          color: var(--ink3);
          text-transform: uppercase;
          text-align: right;
        }

        /* ── INTERESTS BAR ── */
        .interests-bar {
          background: var(--surface);
          border-bottom: 2px solid var(--ink);
          padding: 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .interests-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 0 0 24px;
          display: flex; align-items: stretch; gap: 0;
        }
        .topics-scroll {
          display: flex;
          align-items: stretch;
          overflow-x: auto;
          flex: 1;
          min-width: 0;
          scrollbar-width: none;
        }
        .topics-scroll::-webkit-scrollbar { display: none; }
        .section-label-bar {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--ink3);
          padding: 0 16px 0 0;
          display: flex;
          align-items: center;
          border-right: 1px solid var(--border);
          margin-right: 4px;
          white-space: nowrap;
        }
        .topic-btn {
          padding: 12px 14px;
          background: transparent;
          border: none;
          border-right: 1px solid var(--border);
          color: var(--ink2);
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          position: relative;
        }
        .topic-btn::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--ink);
          transform: scaleX(0);
          transition: transform 0.15s;
        }
        .topic-btn:hover { color: var(--ink); background: #f5f5f0; }
        .topic-btn.active { color: var(--ink); font-weight: 600; }
        .topic-btn.active::after { transform: scaleX(1); }
        .analyze-btn {
          padding: 0 24px;
          background: var(--ink);
          color: #fff;
          border: none;
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .analyze-btn:hover { background: #333; }
        .analyze-btn:disabled { background: #aaa; cursor: not-allowed; }

        /* ── MAIN LAYOUT ── */
        .main-wrap { max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px; }

        /* ── LOADER ── */
        .loader {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 100px 20px; gap: 24px;
        }
        .loader-dots {
          display: flex; gap: 8px;
        }
        .loader-dots span {
          width: 8px; height: 8px;
          background: var(--ink);
          border-radius: 50%;
          animation: blink 1.2s infinite both;
        }
        .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loader-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.15; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        .loader-label {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--ink3);
        }

        /* ── ERROR ── */
        .error-bar {
          border-left: 4px solid var(--red);
          background: #fef2f2;
          padding: 12px 16px;
          margin: 24px 0;
          font-family: var(--mono);
          font-size: 12px;
          color: #b91c1c;
        }

        /* ── FEED HEADER ── */
        .feed-hdr {
          display: flex; justify-content: space-between; align-items: baseline;
          border-bottom: 2px solid var(--ink);
          padding-bottom: 8px;
          margin-bottom: 0;
        }
        .feed-hdr-title {
          font-family: var(--serif);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .feed-hdr-count {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--ink3);
          letter-spacing: 1px;
        }

        /* ── GRID ── */
        .news-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-left: 1px solid var(--border);
          border-top: 1px solid var(--border);
        }

        /* ── CARD ── */
        .card {
          background: var(--surface);
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: background 0.12s;
          animation: rise 0.35s ease both;
          cursor: default;
        }
        .card:hover { background: #f8f8f4; }
        @keyframes rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card:nth-child(1){animation-delay:.04s}
        .card:nth-child(2){animation-delay:.08s}
        .card:nth-child(3){animation-delay:.12s}
        .card:nth-child(4){animation-delay:.16s}
        .card:nth-child(5){animation-delay:.20s}
        .card:nth-child(6){animation-delay:.24s}
        .card:nth-child(7){animation-delay:.28s}
        .card:nth-child(8){animation-delay:.32s}
        .card:nth-child(9){animation-delay:.36s}

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .card-source {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--ink3);
        }

        /* ── CREDIBILITY PILL — new design ── */
        .cred-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px 3px 6px;
          border-radius: 20px;
          font-family: var(--mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .cred-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .card-title {
          font-family: var(--serif);
          font-size: 17px;
          font-weight: 600;
          line-height: 1.35;
          color: var(--ink);
          letter-spacing: -0.3px;
        }

        /* ── AI SUMMARY ── */
        .ai-box {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 10px 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .ai-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--mono);
          font-size: 8.5px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--ink3);
        }
        .ai-tag-dot {
          width: 5px; height: 5px;
          background: #6366f1;
          border-radius: 50%;
        }
        .ai-summary-text {
          font-family: var(--sans);
          font-size: 12.5px;
          line-height: 1.65;
          color: var(--ink2);
          font-weight: 300;
        }

        .card-reason {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--ink3);
          line-height: 1.5;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .card-date {
          font-family: var(--mono);
          font-size: 9px;
          color: var(--ink3);
          letter-spacing: 0.5px;
        }
        .read-btn {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--ink);
          text-decoration: none;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--ink);
          padding-bottom: 1px;
          transition: opacity 0.15s;
        }
        .read-btn:hover { opacity: 0.5; }

        /* ── CREDIBILITY BAR ── */
        .cred-bar-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }
        .cred-bar-track {
          flex: 1;
          height: 2px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }
        .cred-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.6s ease;
        }
        .cred-bar-label {
          font-family: var(--mono);
          font-size: 9px;
          color: var(--ink3);
          white-space: nowrap;
        }

        /* ── EMPTY + LANDING ── */
        .landing {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 16px;
          text-align: center;
        }
        .landing-headline {
          font-family: var(--serif);
          font-size: 32px;
          font-weight: 400;
          font-style: italic;
          color: var(--ink);
          max-width: 480px;
          line-height: 1.3;
        }
        .landing-sub {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--ink3);
        }

        /* ── FOOTER ── */
        .site-footer {
          border-top: 3px double var(--ink);
          padding: 20px 0;
          margin-top: 60px;
        }
        .footer-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: flex; justify-content: space-between; align-items: center; gap: 16px;
        }
        .footer-logo {
          font-family: var(--serif);
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -1px;
        }
        .footer-logo em { color: var(--red); font-style: italic; }
        .footer-right {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--ink3);
          text-align: right;
          line-height: 2.2;
        }

        /* ── RESPONSIVE ── */

        @media (max-width: 900px) {
          .news-grid { grid-template-columns: repeat(2, 1fr); }
          .topbar-right { gap: 12px; }
          .main-wrap { padding: 24px 20px 60px; }
        }

        @media (max-width: 640px) {
          /* Topbar */
          .topbar-left { font-size: 9px; letter-spacing: 0.8px; }
          .topbar-right { font-size: 9px; letter-spacing: 0.8px; gap: 10px; }
          .topbar-right span:last-child { display: none; }

          /* Masthead */
          .masthead { padding: 14px 0 10px; }
          .masthead-logo { letter-spacing: -2px; }
          .masthead-stripe { flex-direction: column; gap: 4px; text-align: center; }
          .masthead-tag { display: none; }

          /* Nav */
          .section-label-bar { display: none; }
          .interests-inner { padding: 0; }
          .topic-btn { padding: 12px 12px; font-size: 11px; }
          .analyze-btn { padding: 0 16px; font-size: 10px; }

          /* Grid */
          .news-grid { grid-template-columns: 1fr; }

          /* Cards */
          .card { padding: 14px; gap: 10px; }
          .card-title { font-size: 15px; }
          .ai-summary-text { font-size: 12px; }

          /* Layout */
          .main-wrap { padding: 16px 16px 60px; }
          .landing { padding: 56px 16px; }
          .landing-headline { font-size: 24px; }

          /* Footer */
          .site-footer { margin-top: 40px; }
          .footer-inner { flex-direction: column; align-items: center; gap: 10px; }
          .footer-right { text-align: center; }
          .footer-logo { font-size: 20px; }
        }

        @media (max-width: 400px) {
          .topbar-inner { flex-direction: column; gap: 2px; align-items: flex-start; }
          .topbar-right { opacity: 0.7; }
          .masthead-logo { letter-spacing: -1px; }
          .main-wrap { padding: 12px 12px 60px; }
          .card { padding: 12px; gap: 8px; }
          .card-title { font-size: 14px; }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-inner">
          <span className="topbar-left">Innovate Bharat Hackathon 2026 · Team JustShip · AIIS134</span>
          <div className="topbar-right">
            <span>AI & Intelligent Systems</span>
            <span>SRGC Muzaffarnagar</span>
          </div>
        </div>
      </div>

      {/* MASTHEAD */}
      <header className="masthead">
        <div className="masthead-inner">
          <h1 className="masthead-logo">Zenith<em>Feed</em></h1>
          <div className="masthead-stripe">
            <span className="masthead-date">{today}</span>
            <span className="masthead-tag">AI-Powered · Credibility Detected · India-First</span>
            <span className="masthead-powered">Groq LLaMA3 · GNews API</span>
          </div>
        </div>
      </header>

      {/* INTERESTS NAV */}
      <nav className="interests-bar">
        <div className="interests-inner">
          <div className="topics-scroll">
            <span className="section-label-bar">Topics</span>
            {INTERESTS.map((i) => (
              <button
                key={i.value}
                onClick={() => { setSelected(i.value); fetchNews(i.value); }}
                className={`topic-btn ${selected === i.value ? "active" : ""}`}
                disabled={loading}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="main-wrap">

        {loading && (
          <div className="loader">
            <div className="loader-dots">
              <span /><span /><span />
            </div>
            <p className="loader-label">AI is analyzing credibility</p>
          </div>
        )}

        {error && <div className="error-bar">Error — {error}</div>}

        {!fetched && !loading && !error && (
          <div className="landing">
            <p className="landing-headline">
              The news, verified.<br />Personalized for you.
            </p>
            <p className="landing-sub">Select a topic above to get started</p>
          </div>
        )}

        {fetched && articles.length === 0 && !loading && (
          <div className="landing">
            <p className="landing-headline" style={{ fontSize: "20px" }}>No articles found.</p>
            <p className="landing-sub">Try different interests</p>
          </div>
        )}

        {articles.length > 0 && (
          <>
            <div className="feed-hdr">
              <span className="feed-hdr-title">Today&apos;s Feed</span>
              <span className="feed-hdr-count">{articles.length} articles · AI analyzed</span>
            </div>
            <div className="news-grid">
              {articles.map((article, idx) => {
                const cred = getCredibilityData(article.credibility);
                const barWidth = article.credibility === "Verified" ? "85%" : article.credibility === "Likely Fake" ? "20%" : "50%";
                return (
                  <article key={idx} className="card">
                    <div className="card-meta">
                      <span className="card-source">{article.source?.name || "Unknown"}</span>
                      {article.credibility && (
                        <span
                          className="cred-pill"
                          style={{
                            background: cred.bg,
                            color: cred.text,
                            borderColor: cred.dot + "44",
                          }}
                        >
                          <span
                            className="cred-dot"
                            style={{ background: cred.dot }}
                          />
                          {cred.label}
                        </span>
                      )}
                    </div>

                    <h3 className="card-title">{article.title}</h3>

                    {article.credibility && (
                      <div className="cred-bar-wrap">
                        <div className="cred-bar-track">
                          <div
                            className="cred-bar-fill"
                            style={{ width: barWidth, background: cred.bar }}
                          />
                        </div>
                        <span className="cred-bar-label">
                          {article.credibility === "Verified" ? "High credibility" : article.credibility === "Likely Fake" ? "Low credibility" : "Med credibility"}
                        </span>
                      </div>
                    )}

                    {article.summary && (
                      <div className="ai-box">
                        <div className="ai-tag">
                          <span className="ai-tag-dot" />
                          AI Summary
                        </div>
                        <p className="ai-summary-text">{article.summary}</p>
                      </div>
                    )}

                    {article.reason && (
                      <p className="card-reason">↳ {article.reason}</p>
                    )}

                    <div className="card-footer">
                      <span className="card-date">
                        {article.publishedAt ? formatDate(article.publishedAt) : ""}
                      </span>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-btn"
                      >
                        Read →
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-logo">Zenith<em>Feed</em></div>
          <div className="footer-right">
            <div>Built by Team JustShip</div>
            <div>Ansh Mittal · Vansh Pal · Dhairya Verma</div>
            <div>SRGC Muzaffarnagar · Innovate Bharat 2026</div>
          </div>
        </div>
      </footer>
    </>
  );
}
