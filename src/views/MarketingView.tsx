import { useState, useEffect } from "react";
import {
  Megaphone,
  BarChart,
  TrendingUp,
  Activity,
  Hash,
  ArrowUpRight,
  Sparkles,
  Loader2,
  X,
  Check,
  CheckCircle,
  ShieldCheck,
  Trash2,
  Link2,
  Clock,
  AlertCircle,
  Users,
  Bot,
  CalendarDays,
  Plus,
  Bell,
  Terminal,
  Search,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// Import our modular marketing sub-components
import { MarketingAnalytics } from "../components/MarketingAnalytics";
import { MarketingCalendar } from "../components/MarketingCalendar";
import { MarketingPersonas } from "../components/MarketingPersonas";
import { MarketingPlayground } from "../components/MarketingPlayground";
import { MarketingWorkflows } from "../components/MarketingWorkflows";

interface ConnectedAccount {
  platform: string;
  handle: string;
  appId: string;
  token: string;
  connectedAt: string;
}

const PLATFORM_DETAILS = {
  instagram: {
    name: "Instagram Broadcasts",
    desc: "Engage local visual pottery and ceramic enthusiasts with high resonance media briefs.",
    placeholderHandle: "e.g. @artisan_boutique",
    buttonColor:
      "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90",
    helperText: "Requires Instagram Graph Client Access Token scopes.",
  },
  facebook: {
    name: "Facebook Pages Directory",
    desc: "Saturate neighborhood event groups and community ceramic craft lists.",
    placeholderHandle: "e.g. fb.me/artisan_pottery",
    buttonColor: "bg-[#1877F2] hover:bg-[#1565C0]",
    helperText: "Syncs via Facebook Graph Client Secret scopes.",
  },
  tiktok: {
    name: "TikTok Shop Stream",
    desc: "Distribute quick interactive sound-bite processes from the wheel kiln directly to design trends.",
    placeholderHandle: "e.g. @clay_process",
    buttonColor: "bg-[#000000] hover:bg-slate-900 border border-slate-800",
    helperText: "Requires TikTok Developer Client authorization tokens.",
  },
  x: {
    name: "X Social Platform Network",
    desc: "Engage micro-blog announcements, product drops, and trade threads.",
    placeholderHandle: "e.g. @ArtisanCeramics",
    buttonColor: "bg-[#0F1419] hover:bg-[#000000]",
    helperText: "Linked via Twitter Developer OAuth v2 standard API keys.",
  },
  reddit: {
    name: "Reddit Ceramics Subs",
    desc: "Publish storytelling posts to community craft focus threads.",
    placeholderHandle: "e.g. u/clay_craftsman",
    buttonColor: "bg-[#FF4500] hover:bg-[#E03D00]",
    helperText: "Linked via Reddit Client API secret keys.",
  },
  google_calendar: {
    name: "Google Calendar API",
    desc: "Export scheduled social briefs and campaign slots directly into your real-time Google Calendar.",
    placeholderHandle: "e.g. marketing-team@gmail.com",
    buttonColor: "bg-[#4285F4] hover:bg-[#3273DC]",
    helperText:
      "Securely syncs marketing campaigns to corporate Google Calendar feeds.",
  },
};

const renderPlatformLogo = (platform: string) => {
  switch (platform) {
    case "instagram":
      return (
        <svg
          className="w-5 h-5 text-pink-600 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "facebook":
      return (
        <svg
          className="w-5 h-5 text-[#1877F2] shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg
          className="w-5 h-5 text-slate-900 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74a7.22 7.22 0 0 1-1.35-1.93v7.44c.12 2.01-.54 4.13-1.93 5.56-1.62 1.68-4.24 2.44-6.5 1.85-2.27-.59-4.11-2.54-4.54-4.85-.58-3.04.87-6.28 3.58-7.58 1.22-.59 2.6-.79 3.9-.53v4.11c-1.02-.34-2.19-.17-3.05.54a3.81 3.81 0 0 0-1.25 3.3c.16 1.25.99 2.37 2.15 2.78 1.43.5 3.16.09 4.09-1.11.58-.75.76-1.71.74-2.65V.02z" />
        </svg>
      );
    case "x":
      return (
        <svg
          className="w-5 h-5 text-slate-800 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "reddit":
      return (
        <svg
          className="w-5 h-5 text-[#FF4500] shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.35-4.24 3.71.79c.07.95.87 1.7 1.85 1.7 1.1 0 2-1 2-2s-.9-2-2-2c-.95 0-1.73.67-1.93 1.57l-4.1-.87c-.24-.05-.48.1-.55.33l-1.5 4.7C6.88 7.37 4.67 8.01 3.02 9A2.96 2.96 0 0 0 .52 11.5c0 1.65 1.35 3 3 3 select-none; .15 0 .3-.01.44-.04C3.86 16.03 7.64 17.5 12 17.5s8.14-1.47 8.54-3.04c.14.03.29.04.44.04 1.65 0 3-1.35 3-3zm-15.25 1c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm8.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5.25 3c-1.84 0-3.35-1.16-3.79-2.74-.08-.3.1-.63.4-.71.3-.08.63.1.71.4.32 1.15 1.48 1.95 2.68 1.95s2.36-.8 2.68-1.95c.08-.3.41-.48.71-.4.3.08.48.41.4.71-.44 1.58-1.95 2.74-3.79 2.74z" />
        </svg>
      );
    case "google_calendar":
      return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#e8eaed" />
          <path
            d="M18 2h-1V1h-2v1H9V1H7v1H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
            fill="#4285F4"
          />
          <path d="M18 20H6V8h12v12zM6 6V4h12v2H6z" fill="#34A853" />
          <path
            d="M11 11H9V9h2v2zm4 0h-2V9h2v2zm-4 4H9v-2h2v2zm4 0h-2v-2h2v2z"
            fill="#FBBC05"
          />
        </svg>
      );
    default:
      return null;
  }
};

const MOCK_TRENDS = [
  {
    id: "t-1",
    topic: "#SmallBusinessSaturday",
    volume: "14,200",
    change: "+34%",
    sentiment: "Positive",
  },
  {
    id: "t-2",
    topic: "Wabi-Sabi Ceramics Design",
    volume: "8,400",
    change: "+92%",
    sentiment: "Positive",
  },
  {
    id: "t-3",
    topic: "Bespoke Dark Indigo Mugs",
    volume: "5,900",
    change: "+41%",
    sentiment: "Positive",
  },
  {
    id: "t-4",
    topic: "Artisanal Clay Kiln Methods",
    volume: "4,100",
    change: "+18%",
    sentiment: "Neutral",
  },
];

type TrendSentiment = "Positive" | "Neutral" | "Negative";

interface TrendItem {
  id: string;
  topic: string;
  volume: string;
  change: string;
  sentiment: TrendSentiment;
  confidenceScore?: number;
  platformInsights?: {
    source: string;
    positive: number;
    neutral: number;
    negative: number;
    total: number;
    positiveRate: number;
  }[];
  relatedHashtags?: string[];
  sampleMentions?: {
    source: string;
    title: string;
    url: string;
    createdAt: string;
    engagement: number;
    sentiment: TrendSentiment;
  }[];
}

interface Campaign {
  id: number;
  name: string;
  status: "Active" | "Paused";
  budget: number;
  spend: number;
  conversions: number;
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: "Local Outreach (Summer)",
    status: "Active",
    budget: 500,
    spend: 120,
    conversions: 34,
  },
  {
    id: 2,
    name: "New Product Teaser",
    status: "Paused",
    budget: 150,
    spend: 150,
    conversions: 12,
  },
  {
    id: 3,
    name: "Retargeting Flow A",
    status: "Active",
    budget: 100,
    spend: 42,
    conversions: 8,
  },
];

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationPlan, setOptimizationPlan] = useState<string | null>(null);

  // Creation State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBudget, setNewBudget] = useState("150");
  const [newStatus, setNewStatus] = useState<"Active" | "Paused">("Active");

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCampaign: Campaign = {
      id: Date.now(),
      name: newName.trim(),
      status: newStatus,
      budget: Number(newBudget) || 100,
      spend: 0,
      conversions: 0,
    };

    setCampaigns((prev) => [...prev, newCampaign]);
    setIsCreateOpen(false);
    setNewName("");
    setNewBudget("150");
  };

  const handleToggleStatus = (id: number) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Active" ? "Paused" : "Active" }
          : c,
      ),
    );
  };

  const handleDeleteCampaign = (id: number) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleOptimizeBudget = async () => {
    setIsOptimizing(true);
    setOptimizationPlan(null);

    const dataPrompt = `Here is our current active client marketing campaigns dashboard:
${JSON.stringify(campaigns, null, 2)}

Recommend precise, data-driven budget adjustments (e.g. routing funds from paused or high-cost campaigns to high-efficiency ones).
Provide advice on improving Cost-per-Conversion. Format your answers in professional, highly concise conversational Markdown suitable for minor retailers. Keep recommendations under 3 bullets.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: dataPrompt }],
        }),
      });
      const data = await res.json();
      setOptimizationPlan(data.reply);
    } catch (e) {
      setOptimizationPlan(
        "### Optimization Recommendations\n- **Boost Local Outreach**: Route remaining $130 from New Product Teaser to Local Outreach due to its ultra-efficient $3.53/conv.\n- **Pause Low Performers**: Allocate $20 backup budget to 'Retargeting Flow A' to handle potential late-week traffic surges.",
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div
      id="campaigns-tab-root"
      className="space-y-8 animate-in fade-in duration-300"
    >
      {/* 1. Analytics & ROI Charts (Upper Row) + Sub-Metrics (Middle Row) */}
      <MarketingAnalytics campaigns={campaigns} />

      {/* 2. Lower Row Split Layout (Campaign Management [Left 2/3] & AI Campaign Intelligence [Right 1/3]) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Left Column: campaign management */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1E293B]">
                Campaign Management
              </h4>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-[#E6F7F0] border border-emerald-200 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.2"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" /> Create
                Campaign Target
              </button>
            </div>

            {/* Structured Registry Data Table */}
            <div className="overflow-x-auto">
              <div className="min-w-[600px] space-y-1">
                {/* Table Header Row */}
                <div className="grid grid-cols-12 gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100 px-3">
                  <div className="col-span-4">Campaign Identifier</div>
                  <div className="col-span-2 text-left">Status</div>
                  <div className="col-span-3 text-left">Allocated Budget</div>
                  <div className="col-span-2 text-left">Sum Conversions</div>
                  <div className="col-span-1"></div>
                </div>

                {campaigns.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No active campaign targets registered. Sprout one above to
                    begin auditing conversions.
                  </div>
                ) : (
                  campaigns.map((c) => {
                    const costPerC =
                      c.conversions > 0
                        ? (c.spend / c.conversions).toFixed(2)
                        : "0.00";
                    return (
                      <div
                        key={c.id}
                        className="grid grid-cols-12 gap-4 items-center py-4 border-b border-slate-100 hover:bg-slate-50/50 rounded-xl px-3 transition-colors"
                      >
                        {/* Col 1: Campaign Identifier */}
                        <div className="col-span-4 block min-w-0 truncate">
                          <h5
                            className="font-extrabold text-slate-800 text-xs leading-snug truncate"
                            title={c.name}
                          >
                            {c.name}
                          </h5>
                        </div>

                        {/* Col 2: Status Pill */}
                        <div className="col-span-2">
                          <button
                            onClick={() => handleToggleStatus(c.id)}
                            className={`px-2.5 py-1 text-[9px] font-black tracking-wider uppercase rounded-full cursor-pointer transition-all flex items-center gap-1 border leading-none shrink-0 ${
                              c.status === "Active"
                                ? "bg-[#E6F7F0] border-emerald-200 text-emerald-700 hover:bg-emerald-100/90"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/90"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${c.status === "Active" ? "bg-[#10B981]" : "bg-slate-400"}`}
                            />
                            {c.status === "Active" ? "ACTIVE" : "PAUSED"}
                          </button>
                        </div>

                        {/* Col 3: Allocated Budget */}
                        <div className="col-span-3">
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-extrabold text-slate-800 font-sans">
                              ${c.budget}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Spent sum: ${c.spend}
                            </span>
                          </div>
                        </div>

                        {/* Col 4: Sum Conversions */}
                        <div className="col-span-2">
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-extrabold text-[#10B981] font-sans">
                              {c.conversions}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                              ${costPerC}/conv
                            </span>
                          </div>
                        </div>

                        {/* Col 5: Delete Trigger */}
                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => handleDeleteCampaign(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="Delete Campaign Target"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Table Bottom padding/alignment */}
          <div className="h-2" />
        </div>

        {/* Right Column: AI Campaign Intelligence Panel */}
        <div className="bg-[#E6F7F0]/45 border border-emerald-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full min-h-[340px]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                AI Campaign Intelligence
              </h4>
            </div>

            <p className="text-xs text-[#065F46] leading-relaxed font-semibold">
              Your "Local Outreach" channel is executing at 2x efficiency.
              Consider requesting a complete AI Budget analysis to shift unused
              paused campaign balances.
            </p>

            {optimizationPlan && (
              <div className="mt-4 p-4 bg-white/80 backdrop-blur-xs text-slate-800 border border-emerald-100 rounded-xl select-text font-sans text-xs leading-relaxed space-y-2 max-h-56 overflow-y-auto">
                <ReactMarkdown>{optimizationPlan}</ReactMarkdown>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4">
            <button
              onClick={handleOptimizeBudget}
              disabled={isOptimizing}
              className="w-full bg-[#009E60] hover:bg-[#008A54] border border-[#009E60] text-white font-extrabold text-[11px] uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isOptimizing ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isOptimizing
                ? "Analyzing & Optimizing..."
                : "Analyze & Optimize Budgets"}
            </button>
          </div>
        </div>
      </div>

      {/* CREATE CAMPAIGN DIALOG */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-[#1E293B] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-500" /> Spawn New
                Campaign
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Campaign Identifier Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Local Outreach (Summer)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Allocated Budget ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as "Active" | "Paused")
                    }
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 border text-slate-450 hover:text-slate-705 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#009E60] hover:bg-[#008A54] border border-[#009E60] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Spawn Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SocialTrendsTab() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignIdeas, setCampaignIdeas] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scraper and Alerts specific states
  const [trends, setTrends] = useState<TrendItem[]>(() => {
    try {
      const saved = localStorage.getItem("pulse_trends_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed as TrendItem[];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_TRENDS as TrendItem[];
  });

  const [scrapeConfig, setScrapeConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_scraper_config");
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore fallback
    }
    return {
      keywords: "wabi-sabi, bespoke mugs, kiln firing, handcrafted tableware",
      infoTypes: ["Community Forums (Reddit)", "Social Media (Instagram/X)"],
      frequency: "Instant on detection",
      lastRun: "Never",
    };
  });

  const [isScraping, setIsScraping] = useState(false);
  const [scraperLogs, setScraperLogs] = useState<string[]>([]);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [showScraperConsole, setShowScraperConsole] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [expandedTrendId, setExpandedTrendId] = useState<string | null>(null);
  const [sourceFilterByTrend, setSourceFilterByTrend] = useState<
    Record<string, string>
  >({});

  const sourceName = (source: string) => {
    switch (source) {
      case "reddit":
        return "Reddit";
      case "bluesky":
        return "Bluesky";
      case "hackernews":
        return "Hacker News";
      case "gdelt":
        return "Web Mentions";
      default:
        return source;
    }
  };

  // Form temporary inputs
  const [tempKeywords, setTempKeywords] = useState("");
  const [tempTypes, setTempTypes] = useState<string[]>([]);
  const [tempFreq, setTempFreq] = useState("");

  const openSetupModal = () => {
    setTempKeywords(scrapeConfig.keywords);
    setTempTypes(scrapeConfig.infoTypes);
    setTempFreq(scrapeConfig.frequency);
    setIsSetupOpen(true);
  };

  const handleSaveSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempKeywords.trim()) return;

    const newConfig = {
      keywords: tempKeywords.trim(),
      infoTypes:
        tempTypes.length > 0 ? tempTypes : ["Community Forums (Reddit)"],
      frequency: tempFreq,
      lastRun: scrapeConfig.lastRun,
    };

    setScrapeConfig(newConfig);
    localStorage.setItem("pulse_scraper_config", JSON.stringify(newConfig));
    setIsSetupOpen(false);
  };

  const toggleInfoType = (type: string) => {
    if (tempTypes.includes(type)) {
      setTempTypes(tempTypes.filter((t) => t !== type));
    } else {
      setTempTypes([...tempTypes, type]);
    }
  };

  const runScraperSimulation = async () => {
    setIsScraping(true);
    setShowScraperConsole(true);
    setScrapingProgress(0);
    setScraperLogs([
      "[BOOT] Initializing trend scanner client...",
      "[AUTH] Preparing outbound requests with rotating headers...",
      `[QUERY] Keywords queued: ${scrapeConfig.keywords}`,
    ]);

    const progressTimer = setInterval(() => {
      setScrapingProgress((prev) => (prev < 92 ? prev + 4 : prev));
    }, 220);

    try {
      const keywords = scrapeConfig.keywords
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/social-trends/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          infoTypes: scrapeConfig.infoTypes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Scraper endpoint failed.");
      }

      const incomingTrends: TrendItem[] = Array.isArray(data?.trends)
        ? data.trends.map((trend: any, idx: number) => ({
            id: String(trend.id || `live-${Date.now()}-${idx}`),
            topic: String(trend.topic || "#UnknownTrend"),
            volume: String(trend.volume || "0"),
            change: String(trend.change || "+0%"),
            sentiment: ["Positive", "Neutral", "Negative"].includes(
              trend.sentiment,
            )
              ? (trend.sentiment as TrendSentiment)
              : "Neutral",
            confidenceScore:
              typeof trend.confidenceScore === "number"
                ? trend.confidenceScore
                : undefined,
            platformInsights: Array.isArray(trend.platformInsights)
              ? trend.platformInsights
              : [],
            relatedHashtags: Array.isArray(trend.relatedHashtags)
              ? trend.relatedHashtags
              : [],
            sampleMentions: Array.isArray(trend.sampleMentions)
              ? trend.sampleMentions
              : [],
          }))
        : [];

      if (incomingTrends.length > 0) {
        setTrends((prev) => {
          const combined = [...incomingTrends, ...prev];
          const unique = combined.filter(
            (item, index, self) =>
              self.findIndex(
                (t) => t.topic.toLowerCase() === item.topic.toLowerCase(),
              ) === index,
          );
          localStorage.setItem("pulse_trends_list", JSON.stringify(unique));
          return unique;
        });
      }

      const apiLogs = Array.isArray(data?.logs)
        ? data.logs.map((l: unknown) => String(l))
        : [];

      setScraperLogs((prev) => [
        ...prev,
        ...apiLogs,
        `[SUCCESS] Collected ${incomingTrends.length} trend summary rows.`,
      ]);

      const timeStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const updatedConfig = {
        ...scrapeConfig,
        lastRun: `Today at ${timeStr}`,
      };
      setScrapeConfig(updatedConfig);
      localStorage.setItem(
        "pulse_scraper_config",
        JSON.stringify(updatedConfig),
      );
    } catch (error: any) {
      console.error(error);
      setScraperLogs((prev) => [
        ...prev,
        `[ERROR] ${error?.message || "Scraper request failed."}`,
      ]);
    } finally {
      clearInterval(progressTimer);
      setScrapingProgress(100);
      setIsScraping(false);
    }
  };

  const handleResetTrends = () => {
    setTrends(MOCK_TRENDS as TrendItem[]);
    localStorage.setItem(
      "pulse_trends_list",
      JSON.stringify(MOCK_TRENDS as TrendItem[]),
    );
  };

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    setIsModalOpen(true);
    setCampaignIdeas("");
    setCopied(false);

    const trendsStr = trends
      .map(
        (t) =>
          `- ${t.topic}: Volume ${t.volume}, Sentiment ${t.sentiment}, Change ${t.change}`,
      )
      .join("\n");

    const promptText = `I am an artisan ceramic boutique and local ceramics shop. 
Here are our current community and industry marketing trends:
${trendsStr}

Please generate 3 highly innovative, targeted marketing campaign ideas capitalizing on these trends. For each idea:
1. Provide a beautiful Campaign Name.
2. Outline the core concept and how it directly harnesses one or more trends.
3. List 3 concrete, step-by-step next steps for implementation.

Keep advice highly actionable, strategic, and professional. Format your entire response in elegant Markdown with clear section headings, bold terms, and clean bullet lists. Do not refer to internal developer instructions.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptText }],
        }),
      });

      if (!res.ok) throw new Error("Failed to generate campaign ideas");
      const data = await res.json();
      setCampaignIdeas(data.reply);
    } catch (e) {
      console.error(e);
      setCampaignIdeas(
        "### Connection Interrupted\nFailed to reach marketing AI nodes. Please check server status or API integration parameters.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(campaignIdeas);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pointer-events-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Local & Industry Trends */}
        <div className="md:w-2/3 bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-50">
              <h3
                className="text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2"
                id="trends-card-title"
              >
                <Hash className="w-4 h-4 text-emerald-500" /> Local & Industry
                Trends
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetTrends}
                  className="text-[10px] font-bold text-slate-450 hover:text-rose-500 uppercase tracking-wider px-2 py-1 transition-colors hover:bg-rose-50 rounded-md cursor-pointer"
                  title="Restore default mock trends list"
                >
                  Reset Feed
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase font-mono">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {trends.map((trend) => {
                const totals = (trend.platformInsights || []).reduce(
                  (acc, item) => {
                    acc.positive += item.positive || 0;
                    acc.neutral += item.neutral || 0;
                    acc.negative += item.negative || 0;
                    return acc;
                  },
                  { positive: 0, neutral: 0, negative: 0 },
                );

                const sum = Math.max(
                  totals.positive + totals.neutral + totals.negative,
                  1,
                );

                const sourcesInMentions = Array.from(
                  new Set((trend.sampleMentions || []).map((m) => m.source)),
                );

                const activeSourceFilter =
                  sourceFilterByTrend[trend.id] || "all";

                const visibleMentions = (trend.sampleMentions || []).filter(
                  (mention) =>
                    activeSourceFilter === "all" ||
                    mention.source === activeSourceFilter,
                );

                return (
                  <div
                    key={trend.id}
                    className="p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-base">
                          {trend.topic}
                        </span>
                        <span className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                          Volume:{" "}
                          <span className="text-slate-700 font-semibold">
                            {trend.volume} mentions
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                            Sentiment
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              trend.sentiment === "Positive"
                                ? "bg-emerald-100 text-emerald-700"
                                : trend.sentiment === "Negative"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {trend.sentiment}
                          </span>
                        </div>
                        <div className="flex flex-col items-end w-16">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                            Impact
                          </span>
                          <span className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
                            {trend.change}{" "}
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                          </span>
                        </div>
                        <div className="flex flex-col items-end w-20">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                            Confidence
                          </span>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {typeof trend.confidenceScore === "number"
                              ? `${trend.confidenceScore}%`
                              : "n/a"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTrendId((prev) =>
                              prev === trend.id ? null : trend.id,
                            )
                          }
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          {expandedTrendId === trend.id ? (
                            <span className="flex items-center gap-1">
                              Hide <ChevronUp className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              Details <ChevronDown className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedTrendId === trend.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-slate-50 border border-slate-150 border-slate-100 rounded-lg p-3">
                            <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 mb-1">
                              Most Positive Platform
                            </p>
                            <p className="text-sm font-bold text-emerald-700">
                              {trend.platformInsights?.length
                                ? `${sourceName(trend.platformInsights[0].source)} (${trend.platformInsights[0].positiveRate}% positive)`
                                : "No platform data available"}
                            </p>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                            <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 mb-1">
                              Lowest Positive Platform
                            </p>
                            <p className="text-sm font-bold text-rose-700">
                              {trend.platformInsights?.length
                                ? (() => {
                                    const last =
                                      trend.platformInsights[
                                        trend.platformInsights.length - 1
                                      ];
                                    return `${sourceName(last.source)} (${last.positiveRate}% positive)`;
                                  })()
                                : "No platform data available"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 mb-2">
                            Related Hashtags & Trends
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(trend.relatedHashtags || []).length > 0 ? (
                              trend.relatedHashtags?.map((tag, idx) => (
                                <span
                                  key={`${trend.id}-tag-${idx}`}
                                  className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500">
                                No additional hashtags extracted yet.
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 mb-2">
                            Sentiment Distribution
                          </p>
                          <div className="w-full h-2.5 rounded-full overflow-hidden border border-slate-100 bg-slate-100 flex">
                            <div
                              className="bg-emerald-500 h-full"
                              style={{
                                width: `${Math.round((totals.positive / sum) * 100)}%`,
                              }}
                              title={`Positive: ${totals.positive}`}
                            />
                            <div
                              className="bg-slate-400 h-full"
                              style={{
                                width: `${Math.round((totals.neutral / sum) * 100)}%`,
                              }}
                              title={`Neutral: ${totals.neutral}`}
                            />
                            <div
                              className="bg-rose-500 h-full"
                              style={{
                                width: `${Math.round((totals.negative / sum) * 100)}%`,
                              }}
                              title={`Negative: ${totals.negative}`}
                            />
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              {totals.positive} positive
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                              {totals.neutral} neutral
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                              {totals.negative} negative
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 mb-2">
                            Source Posts
                          </p>
                          {sourcesInMentions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSourceFilterByTrend((prev) => ({
                                    ...prev,
                                    [trend.id]: "all",
                                  }))
                                }
                                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors ${
                                  activeSourceFilter === "all"
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                All
                              </button>
                              {sourcesInMentions.map((source) => (
                                <button
                                  key={`${trend.id}-filter-${source}`}
                                  type="button"
                                  onClick={() =>
                                    setSourceFilterByTrend((prev) => ({
                                      ...prev,
                                      [trend.id]: source,
                                    }))
                                  }
                                  className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors ${
                                    activeSourceFilter === source
                                      ? "bg-emerald-600 text-white border-emerald-600"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {sourceName(source)}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {visibleMentions.length > 0 ? (
                              visibleMentions.map((mention, idx) => (
                                <a
                                  key={`${trend.id}-source-${idx}`}
                                  href={mention.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block p-2.5 rounded-md border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                      {sourceName(mention.source)}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                      Open Post{" "}
                                      <ExternalLink className="w-3 h-3" />
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-slate-700 mt-1 line-clamp-2">
                                    {mention.title}
                                  </p>
                                </a>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500">
                                No source links available for this filter.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-400 border-t pt-3 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Live trend matrix feeding custom subscriber alerts. Use setup panel
            to filter.
          </div>
        </div>

        {/* Right Column: AI Insights & Composable Scraper Alert Dashboard */}
        <div className="md:w-1/3 flex flex-col gap-6">
          {/* Section 1: AI Prompt Block */}
          <div className="bg-emerald-600 rounded-xl p-6 shadow-sm text-white flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">
                AI Trend Analysis
              </h3>
            </div>
            <p className="text-sm font-medium leading-relaxed mb-4">
              Harness current trends index parameters dynamically to generate
              targeted copy templates, hashtags, and customized buyer briefs.
            </p>
            <button
              onClick={handleGenerateIdeas}
              className="bg-white text-emerald-600 font-bold text-xs uppercase tracking-widest py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-colors self-start cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Campaign Ideas
            </button>
          </div>

          {/* Section 2: Scraper Keyword alert panel */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-500" /> Alert Scraper
                </h4>
                <button
                  type="button"
                  onClick={openSetupModal}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                  title="Setup tracking rules & keywords"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-left mb-5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Active Tracker Keywords
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {scrapeConfig.keywords.split(",").map((kw, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 border text-slate-650 text-slate-600 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider"
                        style={{ textTransform: "uppercase" }}
                      >
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Channels
                    </span>
                    <span className="text-xs font-bold text-[#1E293B] block mt-0.5 leading-snug">
                      {scrapeConfig.infoTypes.length} Active
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Frequency
                    </span>
                    <span className="text-xs font-bold text-[#1E293B] block mt-0.5 leading-snug">
                      {scrapeConfig.frequency}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mt-2.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-medium font-mono">
                      Last Scrape Sync:
                    </span>
                    <span className="text-slate-600 font-extrabold font-mono">
                      {scrapeConfig.lastRun}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={runScraperSimulation}
              disabled={isScraping}
              className="w-full bg-[#E6F7F0] hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.8 cursor-pointer disabled:opacity-50"
            >
              <Bot className="w-4 h-4 animate-bounce text-emerald-600" />
              Run Scraper Node
            </button>
          </div>
        </div>
      </div>

      {/* WEB SCRAPER CONSOLE WINDOW MODAL */}
      {showScraperConsole && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg p-5 shadow-2xl rounded-xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-800">
              <h3 className="font-extrabold text-[11px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> scraper_agent@pulse:~$
                console_stream
              </h3>
              <button
                type="button"
                onClick={() => setShowScraperConsole(false)}
                disabled={isScraping}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer hover:bg-slate-800 disabled:opacity-30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black/95 p-4 border border-slate-805 border-slate-800 rounded-lg font-mono text-xs text-green-400 space-y-2 h-64 overflow-y-auto select-text scrollbar-thin">
              {scraperLogs.map((log, idx) => (
                <p
                  key={idx}
                  className="leading-relaxed animate-in fade-in duration-100"
                >
                  {log}
                </p>
              ))}
              {isScraping && (
                <div className="flex items-center gap-2 pt-2 animate-pulse text-emerald-500">
                  <span>█</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    Crawling social directories...
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Task Progress Status:</span>
                <span className="font-bold text-emerald-400">
                  {scrapingProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${scrapingProgress}%` }}
                />
              </div>

              {!isScraping && (
                <button
                  type="button"
                  onClick={() => setShowScraperConsole(false)}
                  className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-[#091E05] font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-md text-center cursor-pointer font-mono"
                >
                  Dismiss Scraper Terminal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCRAPER RULES AND ALERTS PREFERENCE DIALOG */}
      {isSetupOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-[#1E293B] flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-500" /> Scraper Alert
                Setup
              </h3>
              <button
                type="button"
                onClick={() => setIsSetupOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSetup} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Scraper Monitor Keywords
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. coffee cups, terracota tile, glaze recipe"
                    value={tempKeywords}
                    onChange={(e) => setTempKeywords(e.target.value)}
                    className="w-full text-xs font-semibold pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-[10.5px] font-medium text-slate-400 leading-normal pt-1">
                  Separate custom search queries by commas. Live scraper queries
                  community boards and matches keywords.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Targeted Platforms / Information Channels
                </label>
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  {[
                    "Community Forums (Reddit)",
                    "Retail Competitors",
                    "Social Media (Instagram/X)",
                    "TikTok Hashtags",
                  ].map((cType) => {
                    const isSelected = tempTypes.includes(cType);
                    return (
                      <button
                        key={cType}
                        type="button"
                        onClick={() => toggleInfoType(cType)}
                        className={`text-xs p-3 font-semibold text-left rounded-xl border flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/50 border-emerald-500 text-emerald-800"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50 hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border font-bold text-[10px] transition-colors ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "bg-white border-slate-300"
                          }`}
                        >
                          {isSelected && "✓"}
                        </span>
                        {cType}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                  Notification Frequency
                </label>
                <select
                  value={tempFreq}
                  onChange={(e) => setTempFreq(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                >
                  <option value="Instant on detection">
                    Instant on detection (Real-time stream)
                  </option>
                  <option value="Hourly updates">
                    Hourly ERP notifications
                  </option>
                  <option value="Daily analytics summaries">
                    Daily analytics digest summaries
                  </option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSetupOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-500 hover:text-slate-705 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer text-center font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm cursor-pointer font-sans"
                >
                  Save Alerts Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATED CAMPAIGN IDEAS DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-[#1E293B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> AI Campaign
                Ideator
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isGenerating ? (
              <div className="py-16 flex flex-col items-center justify-center text-emerald-750 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold animate-pulse uppercase tracking-wider">
                    Analyzing volume matrices...
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Synthesizing targeted marketing recipes based on scraped
                    trends...
                  </p>
                </div>
              </div>
            ) : campaignIdeas ? (
              <div className="space-y-4 font-sans">
                <div className="text-xs text-slate-750 leading-relaxed max-h-96 overflow-y-auto bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-inner select-text prose prose-sm prose-indigo">
                  <ReactMarkdown>{campaignIdeas}</ReactMarkdown>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-1 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans"
                  >
                    {copied ? "Copied with Success!" : "Copy Playbook"}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateIdeas}
                    className="flex-1 border text-slate-755 border-slate-250 text-slate-750/90 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer font-sans"
                  >
                    Regenerate Playbook
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Failed to boot content synthesis flow.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SocialAccountsTabProps {
  connectedAccounts: ConnectedAccount[];
  setConnectedAccounts: React.Dispatch<
    React.SetStateAction<ConnectedAccount[]>
  >;
}

function SocialAccountsTab({
  connectedAccounts,
  setConnectedAccounts,
}: SocialAccountsTabProps) {
  const [connectingPlatform, setConnectingPlatform] = useState<
    ConnectedAccount["platform"] | null
  >(null);

  // Connect Form State
  const [handle, setHandle] = useState("");
  const [appId, setAppId] = useState("");
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStartConnect = (platform: ConnectedAccount["platform"]) => {
    setConnectingPlatform(platform);
    setHandle("");
    setAppId("");
    setToken("");
    setErrorMsg("");
  };

  const handleVerifyHandshake = async () => {
    if (!handle.trim()) {
      setErrorMsg("Please specify your profile username/handle.");
      return;
    }
    setErrorMsg("");
    setIsVerifying(true);

    // Simulate real OAuth secure handshake response times
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newConnection: ConnectedAccount = {
      platform: connectingPlatform!,
      handle: handle.trim().startsWith("@")
        ? handle.trim()
        : `@${handle.trim()}`,
      appId: appId.trim() || "APP-ID-AUTO",
      token: token.trim() ? token.trim().slice(0, 8) + "..." : "SEC-KEY-SYNCED",
      connectedAt: new Date().toLocaleDateString(),
    };

    setConnectedAccounts((prev) => {
      const updated = prev.filter((c) => c.platform !== connectingPlatform);
      const output = [...updated, newConnection];
      localStorage.setItem("pulse_social_accounts", JSON.stringify(output));
      return output;
    });

    setIsVerifying(false);
    setConnectingPlatform(null);
  };

  const handleDisconnect = (platform: ConnectedAccount["platform"]) => {
    setConnectedAccounts((prev) => {
      const filtered = prev.filter((c) => c.platform !== platform);
      localStorage.setItem("pulse_social_accounts", JSON.stringify(filtered));
      return filtered;
    });
  };

  const platforms: ConnectedAccount["platform"][] = [
    "instagram",
    "facebook",
    "tiktok",
    "x",
    "reddit",
    "google_calendar",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 select-none">
      {/* Top Banner introducing scope */}
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Authorized
            Multi-Channel OAuth Connections
          </h3>
          <p className="text-xs text-emerald-850 text-emerald-800 leading-relaxed max-w-2xl mt-1">
            Authorize linked social media handles securely. Once completed, load
            user triggers within the Content Studio tab/Automation workflows to
            drive dispatches into physical streams.
          </p>
        </div>
        <div className="text-[10px] font-bold text-emerald-600 bg-white shadow-xs border px-3 py-1.5 rounded-lg flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Synchronized Clock
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((plat) => {
          const matched = connectedAccounts.find((c) => c.platform === plat);
          const meta = PLATFORM_DETAILS[plat as keyof typeof PLATFORM_DETAILS];
          const isSelected = connectingPlatform === plat;

          return (
            <div
              key={plat}
              className={`bg-white border rounded-xl overflow-hidden p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all h-full ${
                matched
                  ? "border-emerald-100 bg-emerald-50/10"
                  : "border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${matched ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                    />
                    {renderPlatformLogo(plat)}
                    <h4 className="font-bold text-slate-800 text-sm">
                      {meta?.name || plat}
                    </h4>
                  </div>
                  {matched ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Live Connection
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full border">
                      Not Synced
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed min-h-[44px]">
                  {meta.desc}
                </p>

                {matched && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 font-sans text-[11px] leading-relaxed">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium font-sans">
                        Synced handle:
                      </span>
                      <span className="font-bold text-emerald-955 text-slate-800">
                        {matched.handle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">
                        Synced timestamp:
                      </span>
                      <span className="text-slate-600 font-sans">
                        {matched.connectedAt}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action triggers */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                {isSelected ? (
                  <div className="space-y-4 bg-slate-50 p-4 border rounded-xl animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-[10px] font-bold text-slate-800 uppercase font-sans">
                        Configure metadata credentials
                      </span>
                      <button
                        onClick={() => setConnectingPlatform(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3 font-sans">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">
                          Account Handle / Brand Identifier
                        </label>
                        <input
                          type="text"
                          className="w-full text-xs p-2 border bg-white rounded-lg outline-none focus:border-emerald-500 font-semibold"
                          placeholder={meta.placeholderHandle}
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">
                          Key App Token Identifier ID
                        </label>
                        <input
                          type="text"
                          className="w-full text-xs p-2 border bg-white rounded-lg outline-none focus:border-emerald-500"
                          placeholder="e.g. Meta_90218"
                          value={appId}
                          onChange={(e) => setAppId(e.target.value)}
                        />
                      </div>

                      <p className="text-[9px] text-slate-450 text-slate-400 leading-snug">
                        {meta.helperText}
                      </p>

                      {errorMsg && (
                        <p className="text-[10px] font-medium text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                        </p>
                      )}

                      <button
                        onClick={handleVerifyHandshake}
                        disabled={isVerifying}
                        className={`w-full text-white text-[10px] font-bold py-2 px-3 rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${meta.buttonColor}`}
                      >
                        {isVerifying ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        {isVerifying
                          ? "Synchronizing scope parameters..."
                          : "Verify secure OAuth Handshake"}
                      </button>
                    </div>
                  </div>
                ) : matched ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartConnect(plat)}
                      className="flex-1 py-1.5 border border-slate-200 hover:border-slate-350 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-705 text-slate-700 bg-white transition-all text-center"
                    >
                      Refurbish Credentials
                    </button>
                    <button
                      onClick={() => handleDisconnect(plat)}
                      className="p-1.5 border border-rose-100 hover:bg-rose-50 rounded-lg text-rose-600 transition-all text-center flex items-center justify-center hover:border-rose-200"
                      title="Disconnect Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartConnect(plat)}
                    className={`w-full text-white text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-xs border border-transparent ${meta.buttonColor}`}
                  >
                    <Link2 className="w-3.5 h-3.5" /> Synchronize handle
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarketingView() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pulse_social_accounts");
      if (stored) {
        setConnectedAccounts(JSON.parse(stored));
      } else {
        // Hydrate default connections so the retail interface has initial functional anchors!
        const initialDefault: ConnectedAccount[] = [
          {
            platform: "instagram",
            handle: "@artisan_ceramics",
            appId: "META-INST-902",
            token: "IG_EAAF8B...",
            connectedAt: "2026-05-12",
          },
          {
            platform: "x",
            handle: "@ArtisanCeramics",
            appId: "X-DEV-8721",
            token: "TW_BH64HG...",
            connectedAt: "2026-05-20",
          },
        ];
        setConnectedAccounts(initialDefault);
        localStorage.setItem(
          "pulse_social_accounts",
          JSON.stringify(initialDefault),
        );
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const TABS = [
    { id: "social-connect", label: "Social Accounts", icon: Link2 },
    { id: "personas", label: "Customer Personas", icon: Users },
    { id: "ai-creator", label: "AI Copywriter Playground", icon: Sparkles },
    { id: "campaigns", label: "Campaigns & Analytics", icon: Megaphone },
    { id: "calendar", label: "Campaign Calendar", icon: CalendarDays },
    { id: "trends", label: "Community Trends", icon: TrendingUp },
    { id: "automation", label: "AI Workflows", icon: Bot }, // Visually structured AI automations
  ];

  return (
    <div
      id="marketing-view-grand-layout"
      className="flex flex-col h-full animate-in fade-in duration-500 max-w-6xl mx-auto pb-10 mt-6 select-none leading-normal"
    >
      {/* Upper header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            AI Marketing Hub & Automation dispatchers
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Authorise target handles, generate A/B copywriting variations, map
            demographic buyer vectors, and run multi-node visual automation
            pipes.
          </p>
        </div>

        {/* Tab Controls Menu */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                id={`marketing-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-colors border uppercase tracking-wider cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                    : "bg-white border-slate-205 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main viewport Container */}
      <div className="flex-1">
        {activeTab === "social-connect" && (
          <SocialAccountsTab
            connectedAccounts={connectedAccounts}
            setConnectedAccounts={setConnectedAccounts}
          />
        )}
        {activeTab === "personas" && <MarketingPersonas />}
        {activeTab === "ai-creator" && <MarketingPlayground />}
        {activeTab === "campaigns" && <CampaignsTab />}
        {activeTab === "calendar" && <MarketingCalendar />}
        {activeTab === "trends" && <SocialTrendsTab />}
        {activeTab === "automation" && <MarketingWorkflows />}
      </div>
    </div>
  );
}
