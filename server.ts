import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import cron from "node-cron";
import axios from "axios";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// ─── SCRAPER ENGINE ──────────────────────────────────────────────────────────
type TrendSource = "reddit" | "bluesky" | "hackernews" | "gdelt";

type ChannelLabel =
  | "Community Forums (Reddit)"
  | "Retail Competitors"
  | "Social Media (Instagram/X)"
  | "TikTok Hashtags";

interface RawMention {
  source: TrendSource;
  title: string;
  url: string;
  createdAt: string;
  engagement: number;
  sentiment: "Positive" | "Neutral" | "Negative";
}

interface PlatformInsight {
  source: TrendSource;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positiveRate: number;
}

interface TrendResult {
  id: string;
  topic: string;
  volume: string;
  change: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  sources: TrendSource[];
  sampleMentions: RawMention[];
  platformInsights: PlatformInsight[];
  relatedHashtags: string[];
  confidenceScore: number;
}

const mockScraperSettingsDB = [
  {
    clientId: "user_01",
    businessName: "Local Bakery",
    keywords: ["sourdough", "croissants"],
  },
  {
    clientId: "user_02",
    businessName: "Tech Startup",
    keywords: ["SaaS", "React"],
  },
];

const scrapedTrendsDB: any[] = [];

const POSITIVE_WORDS = [
  "love",
  "great",
  "best",
  "amazing",
  "excellent",
  "recommend",
  "quality",
  "helpful",
  "growth",
  "win",
  "excited",
  "improved",
  "success",
];

const NEGATIVE_WORDS = [
  "bad",
  "worst",
  "hate",
  "issue",
  "problem",
  "bug",
  "decline",
  "drop",
  "complaint",
  "frustrating",
  "broken",
  "fail",
  "scam",
];

function normalizeKeywords(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((k) => String(k).trim())
      .filter(Boolean)
      .slice(0, 15);
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 15);
  }

  return [];
}

function resolveSources(infoTypes: unknown): TrendSource[] {
  const channels = Array.isArray(infoTypes)
    ? infoTypes.map((x) => String(x))
    : [];

  const sources = new Set<TrendSource>();

  if (channels.includes("Community Forums (Reddit)" as ChannelLabel)) {
    sources.add("reddit");
    sources.add("hackernews");
  }

  if (channels.includes("Social Media (Instagram/X)" as ChannelLabel)) {
    sources.add("reddit");
    sources.add("bluesky");
  }

  if (channels.includes("TikTok Hashtags" as ChannelLabel)) {
    sources.add("gdelt");
    sources.add("bluesky");
  }

  if (channels.includes("Retail Competitors" as ChannelLabel)) {
    sources.add("gdelt");
  }

  if (sources.size === 0) {
    sources.add("reddit");
    sources.add("bluesky");
    sources.add("hackernews");
    sources.add("gdelt");
  }

  return Array.from(sources);
}

function scoreSentiment(text: string): number {
  const normalized = text.toLowerCase();
  let score = 0;

  for (const term of POSITIVE_WORDS) {
    if (normalized.includes(term)) score += 1;
  }

  for (const term of NEGATIVE_WORDS) {
    if (normalized.includes(term)) score -= 1;
  }

  return score;
}

function classifySentiment(score: number): "Positive" | "Neutral" | "Negative" {
  if (score > 0) return "Positive";
  if (score < 0) return "Negative";
  return "Neutral";
}

function formatTopic(keyword: string): string {
  if (keyword.startsWith("#")) return keyword;
  const compact = keyword.replace(/\s+/g, "");
  return `#${compact.charAt(0).toUpperCase()}${compact.slice(1)}`;
}

function toIso(value: unknown): string {
  const date = value ? new Date(value as any) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function computeMomentum(mentions: RawMention[]): number {
  const now = Date.now();
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  const recent = mentions.filter(
    (m) => now - new Date(m.createdAt).getTime() <= twoDays,
  ).length;
  const older = Math.max(mentions.length - recent, 0);

  const delta = ((recent + 1) / (older + 1) - 1) * 100;
  return Math.max(-95, Math.min(180, Math.round(delta)));
}

function extractRelatedHashtags(
  keyword: string,
  mentions: RawMention[],
): string[] {
  const fromText = new Set<string>();
  const stopWords = new Set([
    "the",
    "and",
    "with",
    "from",
    "this",
    "that",
    "your",
    "have",
    "about",
    "into",
    "for",
    "you",
    "new",
    "best",
  ]);

  for (const mention of mentions) {
    const explicitTags = mention.title.match(/#[A-Za-z0-9_]+/g) || [];
    for (const tag of explicitTags) {
      fromText.add(tag);
    }

    const words = mention.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .filter((w) => w.length >= 5 && !stopWords.has(w));

    for (const word of words) {
      fromText.add(`#${word}`);
      if (fromText.size >= 12) break;
    }
    if (fromText.size >= 12) break;
  }

  const keywordTag = formatTopic(keyword);
  return [
    keywordTag,
    ...Array.from(fromText).filter((t) => t !== keywordTag),
  ].slice(0, 8);
}

async function fetchRedditMentions(
  keyword: string,
  limit: number,
): Promise<RawMention[]> {
  const { data } = await axios.get("https://www.reddit.com/search.json", {
    params: { q: keyword, sort: "new", t: "week", limit },
    headers: { "User-Agent": "PulseTrendScanner/1.0" },
    timeout: 12000,
  });

  const children = data?.data?.children || [];
  return children
    .map((entry: any) => {
      const d = entry?.data;
      return {
        source: "reddit" as const,
        title: String(d?.title || "Untitled Reddit post"),
        url: d?.permalink
          ? `https://www.reddit.com${d.permalink}`
          : "https://www.reddit.com",
        createdAt: toIso((d?.created_utc || 0) * 1000),
        engagement: Number(d?.score || 0) + Number(d?.num_comments || 0),
        sentiment: classifySentiment(scoreSentiment(String(d?.title || ""))),
      };
    })
    .filter((m: RawMention) => m.title);
}

async function fetchBlueskyMentions(
  keyword: string,
  limit: number,
): Promise<RawMention[]> {
  const { data } = await axios.get(
    "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts",
    {
      params: { q: keyword, limit: Math.min(limit, 50) },
      timeout: 12000,
    },
  );

  const posts = data?.posts || [];
  return posts
    .map((post: any) => {
      const uri = String(post?.uri || "");
      const postId = uri.split("/").pop() || "";
      const handle = String(post?.author?.handle || "");
      const profileLink =
        handle && postId
          ? `https://bsky.app/profile/${handle}/post/${postId}`
          : "https://bsky.app";

      return {
        source: "bluesky" as const,
        title: String(post?.record?.text || "Bluesky post"),
        url: profileLink,
        createdAt: toIso(post?.indexedAt),
        engagement:
          Number(post?.likeCount || 0) +
          Number(post?.repostCount || 0) +
          Number(post?.replyCount || 0),
        sentiment: classifySentiment(
          scoreSentiment(String(post?.record?.text || "")),
        ),
      };
    })
    .filter((m: RawMention) => m.title);
}

async function fetchHnMentions(
  keyword: string,
  limit: number,
): Promise<RawMention[]> {
  const { data } = await axios.get("https://hn.algolia.com/api/v1/search", {
    params: {
      query: keyword,
      tags: "story",
      hitsPerPage: Math.min(limit, 50),
    },
    timeout: 12000,
  });

  const hits = data?.hits || [];
  return hits
    .map((hit: any) => ({
      source: "hackernews" as const,
      title: String(hit?.title || hit?.story_title || "HN story"),
      url:
        hit?.url ||
        `https://news.ycombinator.com/item?id=${String(hit?.objectID || "")}`,
      createdAt: toIso(hit?.created_at),
      engagement: Number(hit?.points || 0) + Number(hit?.num_comments || 0),
      sentiment: classifySentiment(
        scoreSentiment(String(hit?.title || hit?.story_title || "")),
      ),
    }))
    .filter((m: RawMention) => m.title);
}

async function fetchGdeltMentions(
  keyword: string,
  limit: number,
): Promise<RawMention[]> {
  const query = `"${keyword}"`;
  const { data } = await axios.get(
    "https://api.gdeltproject.org/api/v2/doc/doc",
    {
      params: {
        query,
        mode: "ArtList",
        format: "json",
        maxrecords: Math.min(limit, 50),
        sort: "DateDesc",
      },
      timeout: 12000,
    },
  );

  const articles = data?.articles || [];
  return articles
    .map((article: any) => ({
      source: "gdelt" as const,
      title: String(article?.title || "Web mention"),
      url: String(article?.url || "https://www.gdeltproject.org"),
      createdAt: toIso(article?.seendate),
      engagement: 1,
      sentiment: classifySentiment(
        scoreSentiment(String(article?.title || "")),
      ),
    }))
    .filter((m: RawMention) => m.title);
}

async function fetchMentionsBySource(
  source: TrendSource,
  keyword: string,
  limit: number,
): Promise<RawMention[]> {
  switch (source) {
    case "reddit":
      return fetchRedditMentions(keyword, limit);
    case "bluesky":
      return fetchBlueskyMentions(keyword, limit);
    case "hackernews":
      return fetchHnMentions(keyword, limit);
    case "gdelt":
      return fetchGdeltMentions(keyword, limit);
    default:
      return [];
  }
}

function buildTrend(keyword: string, mentions: RawMention[]): TrendResult {
  const sentimentScore = mentions.reduce(
    (acc, m) => acc + scoreSentiment(m.title),
    0,
  );
  const momentum = computeMomentum(mentions);

  const sources = Array.from(new Set(mentions.map((m) => m.source)));
  const platformRollup = new Map<TrendSource, PlatformInsight>();

  for (const mention of mentions) {
    if (!platformRollup.has(mention.source)) {
      platformRollup.set(mention.source, {
        source: mention.source,
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0,
        positiveRate: 0,
      });
    }

    const stat = platformRollup.get(mention.source)!;
    stat.total += 1;
    if (mention.sentiment === "Positive") stat.positive += 1;
    else if (mention.sentiment === "Negative") stat.negative += 1;
    else stat.neutral += 1;
  }

  const platformInsights = Array.from(platformRollup.values())
    .map((row) => ({
      ...row,
      positiveRate: row.total
        ? Math.round((row.positive / row.total) * 100)
        : 0,
    }))
    .sort((a, b) => b.positiveRate - a.positiveRate);

  const confidenceScore = Math.min(
    100,
    Math.round(sources.length * 22 + Math.min(mentions.length, 30) * 2),
  );

  const sortedMentions = mentions
    .sort((a, b) => {
      const timeDiff =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.engagement - a.engagement;
    })
    .slice(0, 8);

  return {
    id: `t-live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    topic: formatTopic(keyword),
    volume: mentions.length.toLocaleString(),
    change: `${momentum >= 0 ? "+" : ""}${momentum}%`,
    sentiment: classifySentiment(sentimentScore),
    sources,
    sampleMentions: sortedMentions,
    platformInsights,
    relatedHashtags: extractRelatedHashtags(keyword, mentions),
    confidenceScore,
  };
}

async function scanKeywords(
  keywordsInput: unknown,
  infoTypesInput: unknown,
  maxPerSource = 20,
) {
  const keywords = normalizeKeywords(keywordsInput);
  const sources = resolveSources(infoTypesInput);
  const logs: string[] = [];
  const trends: TrendResult[] = [];

  logs.push(
    `[INIT] Booting scan pipeline for ${keywords.length} keyword(s) across ${sources.length} source adapters...`,
  );

  for (const keyword of keywords) {
    logs.push(`[SCAN] Keyword '${keyword}': starting multi-source lookup...`);
    const allMentions: RawMention[] = [];

    for (const source of sources) {
      try {
        const mentions = await fetchMentionsBySource(
          source,
          keyword,
          maxPerSource,
        );
        allMentions.push(...mentions);
        logs.push(
          `[OK] ${source}: ${mentions.length} mention(s) collected for '${keyword}'.`,
        );
      } catch (error: any) {
        logs.push(
          `[WARN] ${source}: failed for '${keyword}' (${error?.message || "unknown error"}).`,
        );
      }
    }

    const deduped = allMentions.filter(
      (item, idx, arr) =>
        arr.findIndex(
          (x) =>
            x.url.toLowerCase() === item.url.toLowerCase() ||
            x.title.toLowerCase() === item.title.toLowerCase(),
        ) === idx,
    );

    if (deduped.length > 0) {
      trends.push(buildTrend(keyword, deduped));
      logs.push(
        `[AGGREGATE] '${keyword}' summarized with ${deduped.length} deduplicated mention(s).`,
      );
    } else {
      logs.push(`[EMPTY] No matching mentions found for '${keyword}'.`);
    }
  }

  logs.push(
    `[DONE] Scan complete. ${trends.length} trend record(s) generated.`,
  );

  return { trends, logs, sources };
}

async function executeTrendScrape() {
  console.log("Starting nightly trend scrape...");
  const results = [];

  for (const client of mockScraperSettingsDB) {
    const { trends } = await scanKeywords(
      client.keywords,
      ["Community Forums (Reddit)", "Social Media (Instagram/X)"],
      12,
    );

    const newRecord = {
      clientId: client.clientId,
      businessName: client.businessName,
      date: new Date().toISOString(),
      trends,
    };

    scrapedTrendsDB.push(newRecord);
    results.push(newRecord);
  }

  console.log("Nightly trend scrape complete.");
  return results;
}

// ─── SYSTEM PROMPTS ──────────────────────────────────────────────────────────
const hr_system_prompt = `
You are an expert, unbiased Human Resources Analytical Engine. 
Your job is to analyze anonymized employee data (KPI scores, tenure, and behavioral notes).
Based on the data, you must assess each employee and recommend a structural decision 
(e.g., Promote, Retain, or Action Plan).

Rules:
1. Base your decisions strictly on the provided data.
2. Balance structural performance (KPIs) with behavioral traits (teamwork, communication).
3. Do NOT make assumptions outside the provided text.
`;

const trend_system_prompt = `
You are an expert HR Analyst Engine. Analyze the provided employee data to calculate structural trends and a quality analysis model for workforce planning.
Rules:
1. Output MUST be valid JSON.
2. Provide a short 3-sentence summary of overall performance and retention.
3. Provide a simple quality state matrix with state transition probabilities over the next 12 months (e.g. Retained -> Retained, Retained -> Promoted, Retained -> Exited).
4. Provide exactly 3 actionable insights based on the trends.
`;

const shift_system_prompt = `
You are an expert HR Shift Scheduler Engine.
Based on the provided list of employees, their KPI scores, and their availability, generate a weekly shift schedule.
Rules:
1. Output MUST be valid JSON.
2. Give more shifts or preferred shifts to employees with higher KPI scores.
3. Respect their availability constraints strictly.
4. Output an array of objects with keys: "employee_id", "employee_name", "assigned_shifts" (array of strings, e.g., ["Monday 9am-5pm"]), and "reasoning" (brief explanation of why they received these shifts based on KPIs and availability).
`;

// ─── SERVER SETUP ────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // --- BACKGROUND CRON JOB (The Night Shift) ---
  cron.schedule("0 2 * * *", async () => {
    console.log("🌙 Waking up for 2:00 AM nightly scrape...");
    await executeTrendScrape();
  });

  // --- NEW SCRAPER API ROUTES ---
  app.post("/api/scrape-now", async (req, res) => {
    try {
      const results = await executeTrendScrape();
      res.json({ message: "Manual scrape complete", results });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to execute manual scrape." });
    }
  });

  app.get("/api/trends", (req, res) => {
    // Allows your frontend to fetch the data the scraper gathered
    res.json(scrapedTrendsDB);
  });

  app.post("/api/social-trends/scrape", async (req, res) => {
    try {
      const keywords = normalizeKeywords(req.body?.keywords);
      const infoTypes = Array.isArray(req.body?.infoTypes)
        ? req.body.infoTypes
        : [];

      if (!keywords.length) {
        return res
          .status(400)
          .json({ error: "Please provide at least one keyword." });
      }

      const { trends, logs, sources } = await scanKeywords(keywords, infoTypes);

      res.json({
        trends,
        logs,
        sources,
        generatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Social trends scrape failed:", error);
      res.status(500).json({
        error: error?.message || "Failed to scrape social trends.",
      });
    }
  });

  // --- EXISTING HR API ROUTES ---
  app.post("/api/analyze-hr", async (req, res) => {
    try {
      const { employees } = req.body;
      if (!Array.isArray(employees)) {
        return res.status(400).json({
          error: "Invalid data format. Expected an array of employees.",
        });
      }

      const prompt = `Analyze the following employee dataset:\n${JSON.stringify(employees, null, 2)}`;

      const doGenerate = async (attempt = 0): Promise<any> => {
        const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
        const modelToUse = models[attempt % models.length];
        try {
          return await ai.models.generateContent({
            model: modelToUse,
            contents: prompt,
            config: {
              systemInstruction: hr_system_prompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    employee_id: {
                      type: Type.STRING,
                      description: "The ID of the employee",
                    },
                    behavioral_assessment: {
                      type: Type.STRING,
                      description: "1 sentence summary of their behavior",
                    },
                    flight_risk: {
                      type: Type.STRING,
                      description: "'Low', 'Medium', or 'High'",
                    },
                    recommended_action: {
                      type: Type.STRING,
                      description: "e.g., 'Promote', 'Retain', 'Action Plan'",
                    },
                    reasoning: {
                      type: Type.STRING,
                      description: "Brief explanation of your decision",
                    },
                  },
                  required: [
                    "employee_id",
                    "behavioral_assessment",
                    "flight_risk",
                    "recommended_action",
                    "reasoning",
                  ],
                },
              },
            },
          });
        } catch (err: any) {
          if (
            attempt < 4 &&
            (err?.message?.includes("503") ||
              err?.status === 502 ||
              err?.message?.includes("502") ||
              err?.status === 429 ||
              err?.message?.includes("429") ||
              err?.message?.includes("quota") ||
              err?.message?.includes("high demand") ||
              err?.message?.includes("UNAVAILABLE"))
          ) {
            console.log(
              `[Attempt ${attempt + 1}] Model ${modelToUse} unavailable or rate-limited, retrying in ${5000 * (attempt + 1)}ms...`,
            );
            await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
            return doGenerate(attempt + 1);
          }
          throw err;
        }
      };

      const response = await doGenerate();
      const recommendationsStr = response.text;
      if (!recommendationsStr)
        throw new Error("No response generated from Gemini.");
      res.json(JSON.parse(recommendationsStr));
    } catch (error: any) {
      console.error("Error analyzing HR data:", error);
      res
        .status(
          error?.status === 429 || error?.message?.includes("429") ? 429 : 500,
        )
        .json({ error: error?.message || "Failed to analyze HR data." });
    }
  });

  app.post("/api/analyze-trends", async (req, res) => {
    try {
      const { employees } = req.body;
      if (!Array.isArray(employees)) {
        return res.status(400).json({ error: "Invalid data format." });
      }

      const prompt = `Analyze the following employee dataset for trends and quality analysis probabilities:\n${JSON.stringify(employees, null, 2)}`;

      const doGenerate = async (attempt = 0): Promise<any> => {
        const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
        const modelToUse = models[attempt % models.length];
        try {
          return await ai.models.generateContent({
            model: modelToUse,
            contents: prompt,
            config: {
              systemInstruction: trend_system_prompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  trendSummary: {
                    type: Type.STRING,
                    description: "3 sentence summary of trends",
                  },
                  markovStates: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        state: { type: Type.STRING },
                        probability: {
                          type: Type.STRING,
                          description: "e.g., '70%'",
                        },
                      },
                      required: ["state", "probability"],
                    },
                  },
                  keyInsights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["trendSummary", "markovStates", "keyInsights"],
              },
            },
          });
        } catch (err: any) {
          if (
            attempt < 4 &&
            (err?.message?.includes("503") ||
              err?.status === 502 ||
              err?.message?.includes("502") ||
              err?.status === 429 ||
              err?.message?.includes("429") ||
              err?.message?.includes("quota") ||
              err?.message?.includes("high demand") ||
              err?.message?.includes("UNAVAILABLE"))
          ) {
            console.log(
              `[Attempt ${attempt + 1}] Model ${modelToUse} unavailable or rate-limited, retrying in ${5000 * (attempt + 1)}ms...`,
            );
            await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
            return doGenerate(attempt + 1);
          }
          throw err;
        }
      };

      const response = await doGenerate();
      const output = response.text;
      if (!output) throw new Error("No response generated.");
      res.json(JSON.parse(output));
    } catch (error: any) {
      console.error("Error analyzing trends:", error);
      res
        .status(
          error?.status === 429 || error?.message?.includes("429") ? 429 : 500,
        )
        .json({ error: error?.message || "Failed to analyze trends." });
    }
  });

  app.post("/api/generate-shifts", async (req, res) => {
    try {
      const { employees, department } = req.body;
      if (!Array.isArray(employees)) {
        return res.status(400).json({ error: "Invalid data format." });
      }

      const prompt = `Generate a shift schedule based on KPIs and availability for:\n${JSON.stringify(employees, null, 2)}\n\n${department && department !== "all" ? `IMPORTANT: This schedule is specific to the ${department} department. Only generate shifts appropriate for this department's operational hours and needs.` : ""}`;

      const doGenerate = async (attempt = 0): Promise<any> => {
        const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
        const modelToUse = models[attempt % models.length];
        try {
          return await ai.models.generateContent({
            model: modelToUse,
            contents: prompt,
            config: {
              systemInstruction: shift_system_prompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    employee_id: { type: Type.STRING },
                    employee_name: { type: Type.STRING },
                    assigned_shifts: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    reasoning: { type: Type.STRING },
                  },
                  required: [
                    "employee_id",
                    "employee_name",
                    "assigned_shifts",
                    "reasoning",
                  ],
                },
              },
            },
          });
        } catch (err: any) {
          if (
            attempt < 4 &&
            (err?.message?.includes("503") ||
              err?.status === 502 ||
              err?.message?.includes("502") ||
              err?.status === 429 ||
              err?.message?.includes("429") ||
              err?.message?.includes("quota") ||
              err?.message?.includes("high demand") ||
              err?.message?.includes("UNAVAILABLE"))
          ) {
            console.log(
              `[Attempt ${attempt + 1}] Model ${modelToUse} unavailable or rate-limited, retrying in ${5000 * (attempt + 1)}ms...`,
            );
            await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
            return doGenerate(attempt + 1);
          }
          throw err;
        }
      };

      const response = await doGenerate();
      const output = response.text;
      if (!output) throw new Error("No response generated.");
      res.json(JSON.parse(output));
    } catch (error: any) {
      console.error("Error generating shifts:", error);
      res
        .status(
          error?.status === 429 || error?.message?.includes("429") ? 429 : 500,
        )
        .json({ error: error?.message || "Failed to generate shifts." });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!Array.isArray(messages)) {
        return res.status(400).json({
          error: "Invalid data format. Expected an array of messages.",
        });
      }

      const prompt =
        messages
          .map(
            (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`,
          )
          .join("\n") + "\nAssistant:";

      const doGenerate = async (attempt = 0): Promise<any> => {
        const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
        const modelToUse = models[attempt % models.length];
        try {
          return await ai.models.generateContent({
            model: modelToUse,
            contents: prompt,
            config: {
              systemInstruction:
                "You are Pulse Assistant, a helpful AI integrated into an Enterprise Intelligence Platform. Provide concise, helpful answers regarding Human Resources, Marketing, Financials, and Supply Chain functionalities of this app.",
            },
          });
        } catch (err: any) {
          if (
            attempt < 4 &&
            (err?.message?.includes("503") ||
              err?.status === 502 ||
              err?.message?.includes("502") ||
              err?.status === 429 ||
              err?.message?.includes("429") ||
              err?.message?.includes("quota") ||
              err?.message?.includes("high demand") ||
              err?.message?.includes("UNAVAILABLE"))
          ) {
            console.log(
              `[Attempt ${attempt + 1}] Model ${modelToUse} unavailable or rate-limited, retrying in ${5000 * (attempt + 1)}ms...`,
            );
            await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
            return doGenerate(attempt + 1);
          }
          throw err;
        }
      };

      const response = await doGenerate();
      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Error generating chat:", error);
      res
        .status(
          error?.status === 429 || error?.message?.includes("429") ? 429 : 500,
        )
        .json({ error: error?.message || "Failed to generate chat." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
