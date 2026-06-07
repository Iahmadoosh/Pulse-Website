import { useState, useEffect } from "react";
import { Employee } from "../types";
import { Activity, Brain, CheckCircle, Clock, Loader2, ShieldAlert, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type AssessmentInsight = {
  employee_id: string;
  behavioral_assessment: string;
  flight_risk: string;
  recommended_action: string;
  reasoning: string;
};

export function AssessmentsView({ employees, history, setHistory }: { employees: Employee[], history: any[], setHistory: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommendations = history.length > 0 ? history[0] : null;

  useEffect(() => {
    if (history.length === 0 && !loading && !error) {
      runAnalysis();
    }
  }, []); // Run once on mount

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map robust Employee model to the simplified backend expected format
      const payload = employees.map(e => ({
        employee_id: e.id,
        current_role: e.title,
        tenure_years: e.tenure_years,
        kpi_score_out_of_100: e.kpi_score_out_of_100,
        behavioral_notes: e.notes.map(n => n.content).join(" ") || "No notes available."
      }));

      const res = await fetch('/api/analyze-hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employees: payload })
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await res.json();
      setHistory((prev: any[]) => [{ date: new Date().toISOString(), data }, ...prev]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk.toLowerCase()) {
      case 'high': return 'text-rose-700 bg-rose-100 border-none';
      case 'medium': return 'text-amber-700 bg-amber-100 border-none';
      case 'low': return 'text-emerald-700 bg-emerald-100 border-none';
      default: return 'text-slate-700 bg-slate-100 border-none';
    }
  };

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('promote')) return <motion.div whileHover={{y:-2, scale: 1.1}}><CheckCircle className="w-5 h-5 text-emerald-500" /></motion.div>;
    if (act.includes('plan') || act.includes('intervention')) return <ShieldAlert className="w-5 h-5 text-amber-500" />;
    return <Clock className="w-5 h-5 text-emerald-500" />;
  };

  const latestRecord = history.length > 0 ? history[0] : null;
  const latestData = latestRecord ? latestRecord.data : [];

  const totalAssessed = latestData.length;
  const highRiskCount = latestData.filter((rec: any) => rec.flight_risk?.toLowerCase() === 'high').length;
  const actionRequiredCount = latestData.filter((rec: any) => {
    const act = rec.recommended_action?.toLowerCase() || '';
    return act.includes('promote') || act.includes('intervention') || act.includes('retention') || act.includes('plan');
  }).length;

  const assessedKpis = latestData.map((rec: any) => {
    const emp = employees.find(e => e.id === rec.employee_id);
    return emp ? emp.kpi_score_out_of_100 : null;
  }).filter((k): k is number => k !== null);
  
  const avgAssessedKpi = assessedKpis.length 
    ? Math.round(assessedKpis.reduce((acc, val) => acc + val, 0) / assessedKpis.length) 
    : 0;

  return (
    <div id="hr-assessments-dashboard-root" className="space-y-6 animate-in fade-in duration-500">
      
      {/* Upper row: HR Dashboard Metrics Cards with Framer Motion layout animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        
        {/* Card 1: TOTAL ASSESSED */}
        <motion.div 
          layout
          id="hr-metric-total-assessed"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-shadow hover:shadow-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Assessed</span>
          </div>
          <div className="flex items-baseline gap-1.5 overflow-hidden h-10">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={totalAssessed}
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="text-3xl font-black text-slate-800"
              >
                {totalAssessed}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs font-semibold text-slate-500">Employees</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-none">
            Active workforce in current cohort
          </p>
        </motion.div>

        {/* Card 2: HIGH FLIGHT RISK */}
        <motion.div 
          layout
          id="hr-metric-high-risk"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-shadow hover:shadow-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Flight Risk</span>
          </div>
          <div className="flex items-baseline gap-1.5 overflow-hidden h-10">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={highRiskCount}
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`text-3xl font-black ${highRiskCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}
              >
                {highRiskCount}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs font-semibold text-slate-500">Critical cases</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-none">
            Require urgent retention strategies
          </p>
        </motion.div>

        {/* Card 3: RETENTION ACTIONS */}
        <motion.div 
          layout
          id="hr-metric-actions-needed"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-shadow hover:shadow-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Brain className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retention Actions</span>
          </div>
          <div className="flex items-baseline gap-1.5 overflow-hidden h-10">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={actionRequiredCount}
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`text-3xl font-black ${actionRequiredCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}
              >
                {actionRequiredCount}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs font-semibold text-slate-500">Pending tasks</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-none">
            Interventions or promotion plans
          </p>
        </motion.div>

        {/* Card 4: AVERAGE KPI */}
        <motion.div 
          layout
          id="hr-metric-cohort-kpi"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-shadow hover:shadow-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Assessed KPI</span>
          </div>
          <div className="flex items-baseline gap-1.5 overflow-hidden h-10">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={avgAssessedKpi}
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="text-3xl font-black text-slate-800"
              >
                {avgAssessedKpi > 0 ? `${avgAssessedKpi}%` : 'N/A'}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs font-semibold text-slate-500">Score</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-none">
            KPI weight of analyzed group
          </p>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* Employee Data Selection Table */}
      <section className="xl:col-span-7 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h2 className="text-slate-800 font-bold text-sm uppercase tracking-wide">Target Employees</h2>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="group flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
        <div className="overflow-x-auto flex-1 h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-3">ID / Role</th>
                <th className="px-6 py-3">Metrics</th>
                <th className="px-6 py-3 border-l border-slate-50">Notes Check</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {employees.map(emp => (
                <tr 
                  key={emp.id} 
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-default"
                >
                  <td className="py-4 px-6 align-top whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900">{emp.id}</div>
                    <div className="text-slate-500 text-xs mt-1">{emp.title}</div>
                  </td>
                  <td className="py-4 px-6 align-top whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${emp.kpi_score_out_of_100 >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {emp.kpi_score_out_of_100}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KPI</span>
                    </div>
                    <div className="text-slate-500 text-xs mt-1 border-t border-slate-100 pt-1 mt-1">{emp.tenure_years} yrs tenure</div>
                  </td>
                  <td className="py-4 px-6 align-top border-l border-slate-50">
                    <p className="text-slate-600 text-xs leading-relaxed max-w-[280px]">
                      {emp.notes.length} note(s) logged. <br/>
                      <span className="text-[10px] text-slate-400">(Sent to context window)</span>
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Insights Window */}
      <section className="xl:col-span-5 flex flex-col gap-6">
        {error && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold uppercase tracking-wide">
            {error}
          </motion.div>
        )}

        {!recommendations && !loading && !error && (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center border border-slate-200 rounded-xl bg-white shadow-sm min-h-[400px]">
            <Brain className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-bold text-slate-800 uppercase tracking-widest text-sm">Analysis Pending</p>
            <p className="text-xs text-slate-500 mt-2 max-w-[240px]">Initiate assessment to evaluate the selected cohort for structural retention actions.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-white border border-slate-200 shadow-sm min-h-[400px]">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
            <p className="font-bold text-slate-800 uppercase tracking-widest text-sm">Reasoning Engine Running</p>
            <p className="text-xs text-slate-500 mt-2 max-w-[220px]">Analyzing structural heuristics against LLM behavioral context.</p>
          </div>
        )}

        <AnimatePresence>
          {history.length > 0 && !loading && (
            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 pb-8">
              {history.map((record, historyIdx) => (
                <div key={historyIdx} className="space-y-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center bg-white px-4 py-2 rounded border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">
                      Assessment Track: {new Date(record.date).toLocaleString()}
                    </span>
                  </div>
                  {record.data.map((rec: any, i: number) => {
                    const emp = employees.find(e => e.id === rec.employee_id);
                    return (
                    <motion.div 
                      key={rec.employee_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col"
                    >
                      <div className="bg-emerald-600 p-4 flex justify-between items-center">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wide">Insight: {emp ? `${emp.name} (${emp.title})` : rec.employee_id}</h3>
                        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${getRiskColor(rec.flight_risk)}`}>
                          {rec.flight_risk} Risk
                        </span>
                      </div>
                      <div className="p-6 space-y-6">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Behavioral Assessment</span>
                          <p className="text-slate-600 text-sm leading-relaxed italic border-l-2 border-emerald-200 pl-3 py-1">
                            "{rec.behavioral_assessment}"
                          </p>
                        </div>
                        <div className="h-[1px] bg-slate-100 w-full"></div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Strategic Recommendation</span>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              {getActionIcon(rec.recommended_action)}
                              <span className="text-slate-800 font-bold text-xs uppercase">{rec.recommended_action}</span>
                            </div>
                            <p className="text-slate-600 text-xs mt-1 leading-normal">
                              {rec.reasoning}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>
      </div>
    </div>
  );
}
