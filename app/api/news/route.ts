import { NextRequest, NextResponse } from 'next/server';

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
	summary: string;
	credibility: 'Verified' | 'Unverified' | 'Likely Fake';
	reason: string;
};

const GNEWS_API = 'https://gnews.io/api/v4/search';
const GNEWS_KEY = process.env.GNEWS_API_KEY;

// small delay to avoid Groq rate limits
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ================= AI ANALYSIS =================
async function analyzeArticle(
	title: string,
	description: string
): Promise<{ summary: string; credibility: string; reason: string }> {
	try {
		const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.GROK_API_KEY}`
			},
			body: JSON.stringify({
				model: 'llama-3.1-8b-instant', // ✅ UPDATED MODEL
				messages: [
					{
						role: 'system',
						content:
							'You are a JSON API. Only return valid JSON. Never explain. Never use markdown.'
					},
					{
						role: 'user',
						content: `Analyze this news article.

Return ONLY this JSON:

{"summary":"two sentence summary","credibility":"Verified","reason":"one sentence reason"}

Credibility must be one of:
Verified
Unverified
Likely Fake

Title: ${title}
Description: ${description || 'No description'}
`
					}
				],
				temperature: 0.1,
				max_tokens: 200
			})
		});

		const data = await res.json();

		if (data.error) {
			console.log('GROQ ERROR:', data.error);
			throw new Error('Groq API error');
		}

		const raw = data?.choices?.[0]?.message?.content || '';

		console.log('GROQ RAW:', raw);

		const start = raw.indexOf('{');
		const end = raw.lastIndexOf('}') + 1;

		if (start === -1 || end === 0) throw new Error('No JSON found');

		const jsonStr = raw.slice(start, end);
		const parsed = JSON.parse(jsonStr);

		return {
			summary: parsed.summary || description?.slice(0, 150) || 'No summary available.',
			credibility:
				['Verified', 'Unverified', 'Likely Fake'].includes(parsed.credibility) ?
					parsed.credibility
				:	'Unverified',
			reason: parsed.reason || 'No reason provided.'
		};
	} catch (err) {
		console.log('AI ANALYSIS FAILED');

		return {
			summary: description?.slice(0, 150) || 'No summary available.',
			credibility: 'Unverified',
			reason: 'AI analysis unavailable.'
		};
	}
}

// ================= ROUTE =================
export async function POST(req: NextRequest) {
	try {
		const { topics } = await req.json();

		const query = topics.join(' OR ');

		const url = `${GNEWS_API}?q=${query}&lang=en&country=in&max=9&apikey=${GNEWS_KEY}`;

		const response = await fetch(url);
		const data = await response.json();

		const articles: GNewsArticle[] = data.articles || [];

		const results: NewsArticle[] = [];

		for (let i = 0; i < articles.length; i++) {
			const article = articles[i];

			let ai = {
				summary: article.description?.slice(0, 150) || 'No summary available.',
				credibility: 'Unverified',
				reason: 'AI not run for this article.'
			};

			// run AI only for first 3 articles (prevents rate limit)
			if (i < 9) {
				ai = await analyzeArticle(article.title, article.description);

				await sleep(800);
			}

			results.push({
				...article,
				summary: ai.summary,
				credibility: ai.credibility as 'Verified' | 'Unverified' | 'Likely Fake',
				reason: ai.reason
			});
		}

		return NextResponse.json({ articles: results });
	} catch (error) {
		console.error('SERVER ERROR:', error);

		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
