import { useState, useMemo, useEffect } from "react";
import { Employee } from "../types";
import { Loader2, TrendingUp, GitMerge, AlertCircle, ArrowRight, LineChart as LineChartIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type TrendResponse = {
  trendSummary: string;
  markovStates: { state: string; probability: string }[];
  keyInsights: string[];
};

export function AnalyticsView({ employees, history, setHistory }: { employees: Employee[], history: any[], setHistory: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [compareMode, setCompareMode] = useState(false);
  const trends = history.length > 0 ? history[0] : null;

  // Generate mock time-series data for Trend and Quality based on current headcount
  const timeSeriesData = useMemo(() => {
    const baseKpi = employees.reduce((acc, eq) => acc + eq.kpi_score_out_of_100, 0) / (employees.length || 1);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => {
      // Create some fluctuation
      const trendOscillation = Math.sin(i) * 5;
      const qualityOscillation = Math.cos(i) * 4;
      return {
        month: m,
        Trend: Math.max(0, Math.min(100, baseKpi + trendOscillation + (i * 0.5))),
        Quality: Math.max(0, Math.min(100, baseKpi - 10 + qualityOscillation + (i * 0.8)))
      };
    });
  }, [employees]);

  useEffect(() => {
    if (history.length === 0 && !loading && !error) {
      runTrends();
    }
  }, []); // Run once on mount

  const runTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = employees.map(e => ({
        current_role: e.title,
        tenure_years: e.tenure_years,
        kpi_score_out_of_100: e.kpi_score_out_of_100,
        notes_count: e.notes.length
      }));

      const res = await fetch('/api/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: payload })
      });
      
      if (!res.ok) throw new Error('Failed to fetch trend analysis');
      
      const data = await res.json();
      
      // Prepend to history with a timestamp
      setHistory((prev: any[]) => [{ date: new Date().toISOString(), data }, ...prev]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Macro Trends & Quality Analysis
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Run predictive behavioral modeling on current headcount to anticipate turn-over and promotion probability.
          </p>
        </div>
        <button
          onClick={runTrends}
          disabled={loading}
          className="group flex items-center gap-2 bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          {loading ? "Generating..." : "Generate Insights"}
        </button>
      </div>

      {error && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold uppercase tracking-wide">
          {error}
        </motion.div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="font-bold uppercase tracking-widest text-sm text-slate-800">Processing Workforce Trajectories</p>
          <p className="text-xs mt-2 max-w-xs text-center leading-relaxed">Running quality analysis and analyzing historical patterns across roles...</p>
        </div>
      )}

      <AnimatePresence>
        {trends && !loading && (
          <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* Time Series Chart View */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-indigo-600 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-white" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wide">Trend & Quality Over Time</h3>
                </div>
                <label className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity">
                  <input 
                    type="checkbox" 
                    checked={compareMode}
                    onChange={(e) => setCompareMode(e.target.checked)}
                    className="accent-indigo-400 w-4 h-4 cursor-pointer"
                  />
                  Compare Both
                </label>
              </div>
              <div className="p-8 h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} domain={[0, 100]} />
                    <Tooltip 
                      cursor={{stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '4 4'}}
                      contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="Trend" 
                      stroke="#6366F1" 
                      strokeWidth={3}
                      dot={{r: 4, strokeWidth: 2}}
                      activeDot={{r: 6}}
                    />
                    {(compareMode) && (
                      <Line 
                        type="monotone" 
                        dataKey="Quality" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{r: 4, strokeWidth: 2}}
                        activeDot={{r: 6}}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Analysis History</h3>
            </div>

            {history.map((record, historyIdx) => (
              <div key={historyIdx} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                <div className="md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                    Generated: {new Date(record.date).toLocaleString()}
                  </span>
                </div>

                {/* Quality State View */}
                <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                   <div className="bg-indigo-600 p-5 flex items-center gap-2">
                     <GitMerge className="w-5 h-5 text-white" />
                     <h3 className="text-white font-bold text-sm uppercase tracking-wide">Stochastic Force Probabilities (12-Mo Horizon)</h3>
                   </div>
                   <div className="p-8">
                     <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                        {record.data.markovStates.map((state: any, i: number) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col items-center min-w-[160px] relative overflow-hidden group hover:border-indigo-300 transition-colors">
                              <div className="text-3xl font-light text-slate-900 mb-2">{state.probability}</div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">{state.state}</div>
                              <div className="absolute top-0 w-full h-1 bg-indigo-500 transform -translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            </div>
                            {i < record.data.markovStates.length - 1 && (
                              <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block" />
                            )}
                          </div>
                        ))}
                     </div>
                   </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Executive Summary</span>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    {record.data.trendSummary}
                  </p>
                </div>

                {/* Key Insights */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Key Drivers</span>
                  <ul className="space-y-4">
                    {record.data.keyInsights.map((insight: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5"><AlertCircle className="w-4 h-4 text-indigo-500" /></div>
                        <span className="text-sm text-slate-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
