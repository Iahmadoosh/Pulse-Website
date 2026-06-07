import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import cron from "node-cron";
import axios from "axios";
import * as cheerio from "cheerio";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// ─── MOCK DATABASES FOR SCRAPER ──────────────────────────────────────────────
// Replace these with your actual database calls (Firebase, MongoDB, etc.) later
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

const scrapedTrendsDB: any[] = []; // Stores the results of the nightly scrape

// ─── SCRAPER ENGINE ──────────────────────────────────────────────────────────
async function scrapeForKeyword(keyword: string) {
  try {
    // Searching HackerNews as a safe, public testing ground
    const searchUrl = `https://news.ycombinator.com/`;

    const { data: html } = await axios.get(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });

    const $ = cheerio.load(html);
    const findings: string[] = [];

    $(".titleline > a").each((index, element) => {
      const text = $(element).text().toLowerCase();
      if (text.includes(keyword.toLowerCase())) {
        findings.push(text);
      }
    });

    return findings;
  } catch (error) {
    console.error(`Error scraping for ${keyword}:`, error);
    return [];
  }
}

async function executeTrendScrape() {
  console.log("🔍 Starting trend scrape...");
  const results = [];

  for (const client of mockScraperSettingsDB) {
    console.log(`Scanning for Client: ${client.businessName}`);
    let dailyResults = [];

    for (const word of client.keywords) {
      const hits = await scrapeForKeyword(word);
      if (hits.length > 0) {
        dailyResults.push({ keyword: word, mentions: hits });
      }
    }

    if (dailyResults.length > 0) {
      const newRecord = {
        clientId: client.clientId,
        businessName: client.businessName,
        date: new Date().toISOString(),
        trends: dailyResults,
      };
      scrapedTrendsDB.push(newRecord);
      results.push(newRecord);
      console.log(`✅ Saved new trends for ${client.businessName}`);
    }
  }
  console.log("🏁 Scrape complete.");
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
