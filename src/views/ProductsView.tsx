import { useState } from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Activity, 
  Package, 
  Globe, 
  Sparkles, 
  Sliders, 
  Download, 
  Bot, 
  Info,
  ChevronRight,
  Loader2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import ReactMarkdown from 'react-markdown';

const PRODUCTS_DATA = [
  { 
    id: 1, 
    name: 'Industrial Widget A', 
    sku: 'WID-A-001', 
    price: 25.50, 
    stock: 450, 
    location: 'West Coast Dist.', 
    demandTrend: '+14%', 
    demandLevel: 'High', 
    revenueGenerated: 114750, 
    internetMentions: '45.2K',
    sentiment: 'Positive',
    baseDemandScore: 78
  },
  { 
    id: 2, 
    name: 'Processing Unit B', 
    sku: 'PU-B-002', 
    price: 150.00, 
    stock: 12, 
    location: 'Central Warehouse', 
    demandTrend: '+5%', 
    demandLevel: 'Medium', 
    revenueGenerated: 85000, 
    internetMentions: '12.1K',
    sentiment: 'Neutral',
    baseDemandScore: 55
  },
  { 
    id: 3, 
    name: 'Assembly Component C', 
    sku: 'COM-C-003', 
    price: 5.75, 
    stock: 0, 
    location: 'Shanghai Hub', 
    demandTrend: '+32%', 
    demandLevel: 'Critical', 
    revenueGenerated: 24500, 
    internetMentions: '189K',
    sentiment: 'High Anticipation',
    baseDemandScore: 92
  },
  { 
    id: 4, 
    name: 'Heat Sink Arrays', 
    sku: 'HSA-005', 
    price: 12.00, 
    stock: 85, 
    location: 'East Coast Dist.', 
    demandTrend: '-8%', 
    demandLevel: 'Low', 
    revenueGenerated: 15240, 
    internetMentions: '4.3K',
    sentiment: 'Declining',
    baseDemandScore: 32
  },
];

export function ProductsView() {
  const [selectedSku, setSelectedSku] = useState('WID-A-001');
  const [isPredictingLifecycle, setIsPredictingLifecycle] = useState(false);
  const [lifecycleReport, setLifecycleReport] = useState('');
  
  // Simulation Multipliers for active demand forecasting
  const [digitalSpendMult, setDigitalSpendMult] = useState(1.0);  // 1x base
  const [competitorActivity, setCompetitorActivity] = useState(0.5); // 0.5 middle multiplier
  const [seasonalityFactor, setSeasonalityFactor] = useState(1.1);  // Q3 Seasonal bump

  const runSentimentPrediction = async (productSku: string) => {
    setIsPredictingLifecycle(true);
    setLifecycleReport('');
    
    const targetProduct = PRODUCTS_DATA.find(p => p.sku === productSku);
    if (!targetProduct) return;

    const query = `Analyze the consumer product demand and lifecycle profile for:
- Product Name: ${targetProduct.name}
- SKU: ${targetProduct.sku}
- Price point: $${targetProduct.price}
- Current Stock Level: ${targetProduct.stock} units
- Internet Mentions: ${targetProduct.internetMentions}
- Sentiment Status: ${targetProduct.sentiment}
- Base Demand Score: ${targetProduct.baseDemandScore}/100

Simulation multipliers applied:
- Digital Ads Spend Multiplier: ${digitalSpendMult}x
- Competitor Pressure: ${competitorActivity * 100}%
- Seasonal weight adjustment: ${seasonalityFactor}x

Please act as a Chief Growth Officer and provide a professional, structured 3-month predictive lifecycle report. Outline:
1. Product Obsolescence / Saturation Risk.
2. Estimated customer demographics shift (e.g. B2B enterprise vs local custom operations).
3. Strategic marketing campaign advice to secure additional demand volume.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: query }] })
      });

      if (!res.ok) throw new Error('Api fail');
      const data = await res.json();
      setLifecycleReport(data.reply);
    } catch (e) {
      console.error(e);
      setLifecycleReport("Failed to sync demand prediction records with ERP nodes. Try triggering analysis again.");
    } finally {
      setIsPredictingLifecycle(false);
    }
  };

  // Compute modeled demand scores for graph depiction
  const getForecastedDemandSeries = () => {
    return PRODUCTS_DATA.map(p => {
      // Compounded formula modeling demand levels
      const base = p.baseDemandScore;
      const boost = (digitalSpendMult - 1.0) * 15;
      const pressure = competitorActivity * 12;
      const seasonal = (seasonalityFactor - 1.0) * 20;
      
      const score = Math.min(100, Math.max(5, Math.round((base + boost - pressure + seasonal))));
      return {
        name: p.name,
        sku: p.sku,
        baselineScore: p.baseDemandScore,
        modeledForecastScore: score,
      };
    });
  };

  const demandSeriesData = getForecastedDemandSeries();

  const selectedProductDetail = PRODUCTS_DATA.find(p => p.sku === selectedSku) || PRODUCTS_DATA[0];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10 mt-6 select-none">
      
      {/* Title block */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600 animate-pulse" />
              Pulse Intelligent Products & Demand Core
            </h2>
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white" /> COGNITIVE FORECASTER ACTIVE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Correlate stock depletion risks, digital advertising budgets, and active internet sentiment vectors to map SKU product lifecycles.
          </p>
        </div>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-4 flex gap-3 text-indigo-900 text-xs items-start leading-relaxed animate-in slide-in-from-top duration-300">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">ERP Demand Predictor Loop online:</span> Custom parameters defined in the left sidebar will compound in real-time to simulate relative market popularity and product viability charts.
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Highest Potential Demand</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">Assembly Component C</p>
          <div className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +32% internet search volume trend (Critical)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Revenue Anchor SKU</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">Industrial Widget A</p>
          <div className="text-xs text-slate-500 font-semibold mt-1">
            Generated $114,750 Capital Reserve YTD
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Vulnerability Flag</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">Processing Unit B</p>
          <div className="text-xs text-amber-600 font-semibold flex items-center gap-1 mt-1">
            Only 12 items available in central stores
          </div>
        </div>
      </div>

      {/* Main interactive segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Parameters sliders */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Demand Model Variables</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Adjust variables and marketing assumptions below to immediately output Q3 simulated demand curve shifts on the target graph.
            </p>

            <div className="space-y-6">
              {/* Slider 1: Digital Media Ads Allocation */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700">Ad Campaign Spend Intensity</span>
                  <span className="text-emerald-600 font-mono font-bold">{digitalSpendMult.toFixed(1)}x</span>
                </div>
                <input 
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={digitalSpendMult}
                  onChange={e => setDigitalSpendMult(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>Ad Cutback (0.5x)</span>
                  <span>Ad Surge (2.5x)</span>
                </div>
              </div>

              {/* Slider 2: Competitor pressure level */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700">Competitor Aggression Index</span>
                  <span className="text-emerald-600 font-mono font-bold">{Math.round(competitorActivity * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={competitorActivity}
                  onChange={e => setCompetitorActivity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>Zero Pressure</span>
                  <span>Saturated Market</span>
                </div>
              </div>

              {/* Slider 3: Q3 Seasonality Bumps */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700">Holiday & Cyclical weight</span>
                  <span className="text-emerald-600 font-mono font-bold">{seasonalityFactor.toFixed(1)}x</span>
                </div>
                <input 
                  type="range"
                  min="0.8"
                  max="1.6"
                  step="0.05"
                  value={seasonalityFactor}
                  onChange={e => setSeasonalityFactor(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>Off-season (0.8x)</span>
                  <span>Peak Demand (1.6x)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl text-xs text-slate-600 leading-relaxed scale-95 origin-bottom">
            <span className="font-bold text-emerald-950 block mb-1">Mathematical Engine Note:</span>
            Modeled Score = Baseline score + Ad factors - competitor factors + Seasonality calculations.
          </div>
        </div>

        {/* Right Side: Recharts demand analysis graphic */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-emerald-500 animate-pulse" />
              Baseline vs Modeled Demand forecasting Score (Out of 100)
            </h3>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demandSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 8px 16px -2px rgb(0 0 0 / 0.05)', backgroundColor: 'white' }}
                  />
                  <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Target Optimal', fill: '#94a3b8', fontSize: 10, position: 'insideTopLeft' }} />
                  <Bar name="Static Baseline Popularity" dataKey="baselineScore" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar name="Simulated Q3 Projected Curve KPI" dataKey="modeledForecastScore" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-slate-100 text-slate-500">
            <span>Graph correlates multi-variable coefficients in real-time.</span>
            <span className="text-emerald-600 font-bold">&#9679; Modeled Q3 Forecast Score</span>
          </div>
        </div>

      </div>

      {/* Product Correlation Grid & live predictive lifecycle analyzer */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Comprehensive Product Correlation & Smart SKU Management
          </h3>
        </div>
        
        <div className="overflow-x-auto whitespace-nowrap">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">SKU Code & Product</th>
                <th className="p-4">Unit Pricing & YTD Revenue</th>
                <th className="p-4">Store Location & Stock Alerts</th>
                <th className="p-4">Global Internet Mentions</th>
                <th className="p-4 text-right">Lifecycle Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PRODUCTS_DATA.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 text-sm">{product.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800 text-sm">${product.price.toFixed(2)} unit</div>
                    <div className="text-xs text-emerald-600 font-medium mt-0.5">Rev generated: ${product.revenueGenerated.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 text-sm">
                      <span className={`w-2 h-2 rounded-full ${product.stock === 0 ? 'bg-rose-500' : product.stock < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {product.stock} items remaining
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {product.location}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest
                          ${product.demandLevel === 'Critical' ? 'bg-rose-100 text-rose-700' : product.demandLevel === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {product.demandLevel} Demand
                        </span>
                        <span className="text-xs font-bold text-emerald-600">{product.demandTrend}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" /> {product.internetMentions} Mentions ({product.sentiment})
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSku(product.sku);
                        runSentimentPrediction(product.sku);
                      }}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-[10px] uppercase text-slate-700 py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors ml-auto shadow-sm"
                    >
                      Audit Shelf Cycle <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predictive Lifecycle advice panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Gemini Cognitive SKU Lifecycle Forecaster</h3>
              <p className="text-xs text-slate-500">Select any SKU above to request a target forecast report for: <span className="font-bold underline text-emerald-950">{selectedProductDetail.name}</span></p>
            </div>
          </div>
        </div>

        {isPredictingLifecycle ? (
          <div className="p-8 bg-slate-50 rounded-xl flex flex-col items-center justify-center space-y-3 shadow-inner">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600 animate-pulse">Pulse AI is assessing competitor pricing models & charting digital saturation curves...</p>
          </div>
        ) : lifecycleReport ? (
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl shadow-inner prose prose-sm max-w-none prose-indigo select-text relative animate-in fade-in duration-300">
            <button
              onClick={() => setLifecycleReport('')}
              className="absolute top-4 right-4 text-xs font-bold font-mono text-slate-400 hover:text-slate-600 uppercase"
            >
              Close Forecast
            </button>
            <ReactMarkdown>{lifecycleReport}</ReactMarkdown>
          </div>
        ) : (
          <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Bot className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-semibold">Ready to model. Click "Audit Shelf Cycle" on any SKU to launch the AI Forecaster.</p>
          </div>
        )}
      </div>

    </div>
  );
}
