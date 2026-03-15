"use client";
import { useState } from "react";

// ===== TYPES =====
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

// ===== INTERESTS DATA =====
const INTERESTS = [
  { label: "💻 Technology", value: "technology" },
  { label: "💼 Business", value: "business" },
  { label: "🏏 Sports", value: "sports" },
  { label: "🏥 Health", value: "health" },
  { label: "🔬 Science", value: "science" },
  { label: "🎬 Entertainment", value: "entertainment" },
  { label: "🇮🇳 India", value: "india" },
  { label: "🌍 World", value: "world" },
];

export default function Home() {
  const [selected, setSelected] = useState<string[]>(["technology"]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  // ===== TOGGLE INTEREST =====
  function toggleInterest(value: string) {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  }

  // ===== FETCH NEWS =====
  async function fetchNews() {
    if (selected.length === 0) {
      alert("Please select at least one interest!");
      return;
    }

    setLoading(true);
    setError("");
    setArticles([]);
    setFetched(false);

    try {
      // Call Ansh's backend API route
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: selected }),
      });

      if (!res.ok) throw new Error("Failed to fetch news");

      const data = await res.json();
      setArticles(data.articles || []);
      setFetched(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ===== BADGE STYLES =====
  function getBadgeStyle(credibility: string) {
    if (credibility === "Verified")
      return "bg-green-900/30 text-green-400 border border-green-500";
    if (credibility === "Likely Fake")
      return "bg-red-900/30 text-red-400 border border-red-500";
    return "bg-yellow-900/30 text-yellow-400 border border-yellow-500";
  }

  function getBadgeIcon(credibility: string) {
    if (credibility === "Verified") return "✅ Verified";
    if (credibility === "Likely Fake") return "❌ Likely Fake";
    return "⚠️ Unverified";
  }

  // ===== FORMAT DATE =====
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white">

      {/* ===== HEADER ===== */}
      <header className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b-2 border-purple-600 py-8 px-4 text-center">
        <h1 className="text-5xl font-black tracking-widest text-white">
          ⚡ Zenith<span className="text-purple-500">Feed</span>
        </h1>
        <p className="text-purple-300 mt-2 text-sm tracking-widest uppercase">
          AI-Powered Personalized News · Credibility Detection
        </p>
      </header>

      {/* ===== INTEREST SELECTOR ===== */}
      <section className="max-w-3xl mx-auto mt-12 px-4 text-center">
        <h2 className="text-xl font-semibold text-purple-300 mb-6 tracking-wide uppercase">
          Select Your Interests
        </h2>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {INTERESTS.map((interest) => (
            <button
              key={interest.value}
              onClick={() => toggleInterest(interest.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200
                ${
                  selected.includes(interest.value)
                    ? "bg-purple-600 border-purple-500 text-white scale-105"
                    : "bg-[#1a1a2e] border-[#3a3a5c] text-gray-400 hover:border-purple-500 hover:text-white"
                }`}
            >
              {interest.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchNews}
          disabled={loading}
          className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full text-lg tracking-wide hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "🔍 Get My Feed"}
        </button>
      </section>

      {/* ===== LOADER ===== */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 border-4 border-[#3a3a5c] border-t-purple-500 rounded-full animate-spin" />
          <p className="text-purple-300 text-sm tracking-widest uppercase">
            ZenithFeed AI is analyzing your news...
          </p>
        </div>
      )}

      {/* ===== ERROR ===== */}
      {error && (
        <div className="max-w-3xl mx-auto mt-8 px-4">
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center text-red-400">
            ❌ {error}
          </div>
        </div>
      )}

      {/* ===== NEWS FEED ===== */}
      {fetched && articles.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-20">
          No articles found. Try different interests.
        </div>
      )}

      <section className="max-w-3xl mx-auto mt-8 px-4 pb-20 flex flex-col gap-6">
        {articles.map((article, index) => (
          <div
            key={index}
            className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-6 hover:border-purple-600 hover:-translate-y-1 transition-all duration-200"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start gap-4 mb-4">
              <h3 className="text-white font-bold text-base leading-snug flex-1">
                {article.title}
              </h3>
              {article.credibility && (
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${getBadgeStyle(
                    article.credibility
                  )}`}
                >
                  {getBadgeIcon(article.credibility)}
                </span>
              )}
            </div>

            {/* AI Summary */}
            {article.summary && (
              <div className="bg-purple-900/10 border-l-4 border-purple-500 rounded-r-xl px-4 py-3 mb-3">
                <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">
                  ⚡ AI Summary
                </p>
                <p className="text-purple-200 text-sm leading-relaxed">
                  {article.summary}
                </p>
              </div>
            )}

            {/* Credibility Reason */}
            {article.reason && (
              <p className="text-xs text-gray-500 italic mb-4">
                🔍 {article.reason}
              </p>
            )}

            {/* Card Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-[#2a2a4a]">
              <span className="text-xs text-gray-600">
                📰 {article.source?.name || "Unknown"} &nbsp;|&nbsp; 🕒{" "}
                {article.publishedAt ? formatDate(article.publishedAt) : ""}
              </span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 text-sm font-semibold hover:text-blue-400 transition-colors"
              >
                Read Full →
              </a>
            </div>
          </div>
        ))}
      </section>

    </main>
  );
}