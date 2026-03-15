import { NextRequest, NextResponse } from "next/server";

// ===== TYPES =====
type GNewsArticle = {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
};

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
};

type AnalyzedArticle = NewsArticle & {
  credibility: "Verified" | "Unverified" | "Likely Fake";
  summary: string;
  reason: string;
};

// ===== FETCH NEWS FROM GNEWS =====
async function fetchArticles(topics: string[]): Promise<NewsArticle[]> {
  const query = topics.join(" OR ");

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=en&country=in&max=9&apikey=${process.env.GNEWS_API_KEY}`;

  console.log("Fetching news from GNews...");
  console.log("GNEWS_API_KEY exists:", !!process.env.GNEWS_API_KEY);
  console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  console.log("GNews total articles:", data.totalArticles);

  if (!data.articles) {
    throw new Error(`GNews error: ${JSON.stringify(data.errors) || "Unknown error"}`);
  }

  return (data.articles || [])
    .filter((a: GNewsArticle) => a.title)
    .map((a: GNewsArticle) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      source: { name: a.source?.name || "Unknown" },
      publishedAt: a.publishedAt,
    }));
}

// ===== ANALYZE ARTICLE WITH GROQ =====
async function analyzeArticle(
  title: string,
  description: string
): Promise<{ summary: string; credibility: string; reason: string }> {
  const prompt = `Analyze this news article for an Indian audience.

Title: "${title}"
Description: "${description || "No description available"}"

Respond with ONLY this JSON, nothing else, no markdown:
{"summary":"write 2 lines about this article","credibility":"Verified","reason":"write one line why"}

Replace "Verified" with "Unverified" or "Likely Fake" based on your analysis.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are a JSON-only response bot. Never use markdown. Always return raw JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.1,
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  console.log("Groq raw response:", text);

  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    console.log("Parse failed for:", text);
    return {
      summary: description?.slice(0, 150) || "Summary not available.",
      credibility: "Unverified",
      reason: "AI analysis unavailable.",
    };
  }
}
// ===== MAIN POST HANDLER =====
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topics: string[] = body.topics || ["india"];

    console.log("Received topics:", topics);

    // Step 1 — Fetch news articles
    const articles = await fetchArticles(topics);
    console.log("Fetched articles count:", articles.length);

    if (articles.length === 0) {
      return NextResponse.json({ articles: [] });
    }

    // Step 2 — Analyze each article with Groq
    const analyzedArticles: AnalyzedArticle[] = await Promise.all(
      articles.map(async (article) => {
        const analysis = await analyzeArticle(
          article.title,
          article.description
        );
        return {
          ...article,
          credibility: analysis.credibility as
            | "Verified"
            | "Unverified"
            | "Likely Fake",
          summary: analysis.summary,
          reason: analysis.reason,
        };
      })
    );

    // Step 3 — Return analyzed articles
    return NextResponse.json({ articles: analyzedArticles });

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("❌ API ERROR:", message);
    console.error("Full error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
