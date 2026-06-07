import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Award, 
  Package, 
  DollarSign, 
  Megaphone, 
  Sparkles,
  Activity,
  Lightbulb,
  Download,
  CheckCircle2,
  BrainCircuit,
  Settings,
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Employee, Department } from "../types";
import { PRESETS, PresetName } from "../presets";

export function DashboardView({ 
  employees, 
  departments, 
  payrollHistory,
  preset = 'stark' 
}: { 
  employees: Employee[]; 
  departments: Department[]; 
  payrollHistory: any[]; 
  preset?: PresetName;
}) {
  const styles = PRESETS[preset] || PRESETS.stark;
  
  const avgKpi = employees.length 
    ? Math.round(employees.reduce((acc, e) => acc + e.kpi_score_out_of_100, 0) / employees.length) 
    : 84;
  
  // Stats
  const activeCampaigns = 2;
  const currentRevenue = 150000;
  
  // Payroll latest
  const latestPayroll = payrollHistory && payrollHistory.length > 0 
    ? payrollHistory[0].totalAmount 
    : 17200;

  const handleDownloadCSV = () => {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Title",
      "Department",
      "Tenure (Years)",
      "KPI Score (out of 100)",
      "Hourly Wage ($)",
      "Latest Period Base Pay ($)",
      "Deductions ($)",
      "Net Pay ($)"
    ];

    const latestCycle = payrollHistory && payrollHistory.length > 0 ? payrollHistory[0] : null;

    const rows = employees.map(employee => {
      const payrollRecord = latestCycle?.records?.find((r: any) => r.employee_id === employee.id);
      const basePay = payrollRecord ? payrollRecord.basePay : (employee.hourly_wage || 25) * 80;
      const deductions = payrollRecord ? payrollRecord.deductions : basePay * 0.2;
      const netPay = basePay - deductions;

      return [
        employee.id,
        `"${employee.name.replace(/"/g, '""')}"`,
        `"${employee.title.replace(/"/g, '""')}"`,
        `"${employee.department.replace(/"/g, '""')}"`,
        employee.tenure_years,
        employee.kpi_score_out_of_100,
        employee.hourly_wage,
        basePay,
        deductions.toFixed(2),
        netPay.toFixed(2)
      ];
    });

    const csvString = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Pulse_ERP_Metrics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto pb-12 mt-2 select-none ${preset === 'cosmic' ? 'text-slate-100' : 'text-[#0E0E0F]'}`}>
      
      {/* 1. HERO BANNER: Welcome to Pulse Enterprise */}
      <div className={`${styles.heroCard} relative overflow-hidden transition-all duration-300`}>
        {/* Soft watermark trending line */}
        <div className={`absolute right-10 bottom-0 md:-bottom-4 w-72 h-44 opacity-[0.06] pointer-events-none ${preset === 'cosmic' ? 'text-violet-400 opacity-[0.12]' : 'text-[#0E0E0F]'}`}>
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M5 90 L30 65 L50 75 L85 20 M85 20 L60 20 M85 20 L85 45" />
          </svg>
        </div>
        
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className={preset === 'stark' ? styles.badgeGrey : styles.badgeBlue}>
            <Sparkles className="w-3.5 h-3.5 inline mr-1" />
            PREDICTIVE ERP SUITE V3.2
          </span>
        </div>

        {/* Content Row */}
        <div className={`flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-6 ${styles.divider} mb-4`}>
          <div className="max-w-3xl">
            <h1 className={`text-4xl md:text-5xl font-extrabold ${preset === 'editorial' ? 'uppercase font-mono' : 'tracking-tight'} mb-3`}>
              Welcome to Pulse Enterprise
            </h1>
            <p className={`text-sm leading-relaxed ${preset === 'stark' ? 'text-slate-500' : preset === 'cosmic' ? 'text-slate-400' : 'text-slate-800'} font-medium`}>
              A highly integrated cognitive operations dashboard. Move between sections to adjust real-time Predictive models, explore automatic replenishment loops, and query generative advice.
            </p>
          </div>
        </div>

        {/* Hero Footer line */}
        <div className="flex flex-wrap gap-4 items-center justify-between text-xs font-mono font-bold uppercase">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
            preset === 'cosmic' 
              ? 'bg-[#1E293B] border-slate-700 text-slate-300' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="font-sans font-semibold tracking-tight text-[11px]">Next shift & Q3 supply risks calculated</span>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY GRID OF STATS (EXACTLY MATCHING THE SCREENSHOT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: HR SUMMARY */}
        <motion.div 
          layout
          id="dashboard-metric-hr-summary"
          className={`${styles.card} p-5 flex flex-col justify-between min-h-[160px] relative transition-transform duration-200`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                preset === 'cosmic' ? 'bg-[#1E293B]' : 'bg-[#F1F3F5]'
              }`}>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <span className={`text-[10px] font-sans font-bold tracking-wider uppercase ${
                preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                HR SUMMARY
              </span>
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={employees.length}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="text-4xl font-extrabold tracking-tight"
                >
                  {employees.length}
                </motion.span>
              </AnimatePresence>
              <span className={`text-[11px] font-sans font-medium ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>Employees</span>
            </div>
            <div className={`text-xs mt-1 ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
              Across {departments.length} active departments
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t ${styles.divider} flex items-center justify-between text-[11px] font-sans font-semibold`}>
            <span className="text-slate-400 uppercase tracking-tight">AVG KPI</span>
            <span className="text-emerald-500 font-bold">{avgKpi}/100</span>
          </div>
        </motion.div>

        {/* Card 2: FINANCIALS */}
        <motion.div 
          layout
          id="dashboard-metric-financials"
          className={`${styles.card} p-5 flex flex-col justify-between min-h-[160px] relative transition-transform duration-200`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                preset === 'cosmic' ? 'bg-[#1E293B]' : 'bg-[#F1F3F5]'
              }`}>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <span className={`text-[10px] font-sans font-bold tracking-wider uppercase ${
                preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                FINANCIALS
              </span>
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentRevenue}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="text-4xl font-extrabold tracking-tight"
                >
                  ${(currentRevenue / 1000).toFixed(0)}k
                </motion.span>
              </AnimatePresence>
              <span className={`text-[11px] font-sans font-medium ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>MRR</span>
            </div>
            <div className={`text-xs mt-1 ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
              Last Payroll: ${latestPayroll.toLocaleString()}
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t ${styles.divider} flex items-center justify-between text-[11px] font-sans font-semibold`}>
            <span className="text-slate-400 uppercase tracking-tight">PREDICTIVE CASH FLOW</span>
            <span className="text-[#002FA7] dark:text-violet-400 font-bold">Ready</span>
          </div>
        </motion.div>

        {/* Card 3: MARKETING */}
        <motion.div 
          layout
          id="dashboard-metric-marketing"
          className={`${styles.card} p-5 flex flex-col justify-between min-h-[160px] relative transition-transform duration-200`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                preset === 'cosmic' ? 'bg-[#1E293B]' : 'bg-[#F1F3F5]'
              }`}>
                <Megaphone className="w-4 h-4 text-rose-500" />
              </div>
              <span className={`text-[10px] font-sans font-bold tracking-wider uppercase ${
                preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                MARKETING
              </span>
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={activeCampaigns}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="text-4xl font-extrabold tracking-tight"
                >
                  {activeCampaigns}
                </motion.span>
              </AnimatePresence>
              <span className={`text-[11px] font-sans font-medium ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>Active</span>
            </div>
            <div className={`text-xs mt-1 ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
              Local Lead Gen Campaigns
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t ${styles.divider} flex items-center justify-between text-[11px] font-sans font-semibold`}>
            <span className="text-slate-400 uppercase tracking-tight">AI STUDIO COPY</span>
            <span className="text-rose-500 font-bold">Online</span>
          </div>
        </motion.div>

        {/* Card 4: SUPPLY CHAIN */}
        <motion.div 
          layout
          id="dashboard-metric-supply"
          className={`${styles.card} p-5 flex flex-col justify-between min-h-[160px] relative transition-transform duration-200`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                preset === 'cosmic' ? 'bg-[#1E293B]' : 'bg-[#F1F3F5]'
              }`}>
                <Package className="w-4 h-4 text-amber-500" />
              </div>
              <span className={`text-[10px] font-sans font-bold tracking-wider uppercase ${
                preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                SUPPLY CHAIN
              </span>
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10 overflow-hidden">
              <span className="text-4xl font-extrabold tracking-tight">1</span>
              <span className={`text-[11px] font-sans font-medium ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>Alert</span>
            </div>
            <div className="text-xs mt-1 text-[#D62518] font-bold tracking-tight uppercase truncate">
              Assembly Component ...
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t ${styles.divider} flex items-center justify-between text-[11px] font-sans font-semibold`}>
            <span className="text-slate-400 uppercase tracking-tight">AUTO-REORDERS</span>
            <span className="text-emerald-500 font-bold">Configured</span>
          </div>
        </motion.div>

      </div>

      {/* 3. QUICKSTART / CONTROL FLOW WORKFLOWS SECTION */}
      <div className={`${styles.card} p-6 space-y-6 md:p-8 transition-all duration-300`}>
        <div className="flex items-center justify-between border-b pb-4 border-slate-200/60 dark:border-slate-800">
          <h3 className="text-base font-extrabold uppercase tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500 animate-bounce" /> 
            INSTALLED AI_PREDICTIVE SYSTEMS WORKFLOW QUICKSTART
          </h3>
          <span className="text-xs font-mono font-bold uppercase py-1 px-2.5 bg-emerald-50 dark:bg-[#1E293B] border border-emerald-100 dark:border-slate-800 rounded-lg text-[#008060] dark:text-emerald-400">
            v3.2.0 Core Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Box 1 */}
          <div className={`p-5 border transition-all duration-300 hover:scale-[1.01] ${
            preset === 'cosmic' 
              ? 'bg-[#1E222B] border-slate-800 hover:bg-[#212630]' 
              : 'bg-slate-50/50 hover:bg-slate-50/90 border-slate-200/80'
          } rounded-xl flex flex-col justify-between h-[180px]`}>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block mb-1.5 uppercase font-bold tracking-wider">// SYSTEM_CORE_LEVEL_01</span>
              <h4 className="text-sm font-extrabold uppercase mb-2">Financial Trajectories</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                Recalibrate live macroeconomic inflation indices and dynamically project balanced spreadsheet lines directly on our secure analytics ledger.
              </p>
            </div>
            <div className="text-[11px] font-sans font-bold text-[#008060] dark:text-emerald-400 flex items-center gap-1">
              Configure ledger options <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Box 2 */}
          <div className={`p-5 border transition-all duration-300 hover:scale-[1.01] ${
            preset === 'cosmic' 
              ? 'bg-[#1E222B] border-slate-800 hover:bg-[#212630]' 
              : 'bg-slate-50/50 hover:bg-slate-50/90 border-slate-200/80'
          } rounded-xl flex flex-col justify-between h-[180px]`}>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block mb-1.5 uppercase font-bold tracking-wider">// REPLENISH_BOT_LEVEL_02</span>
              <h4 className="text-sm font-extrabold uppercase mb-2">Replenishment Engine</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                Monitor stock levels, calculate supply and freight lead times dynamically, and deploy automated purchase orders to shield factory lanes.
              </p>
            </div>
            <div className="text-[11px] font-sans font-bold text-[#008060] dark:text-emerald-400 flex items-center gap-1">
              Adjust alert limits <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Box 3 */}
          <div className={`p-5 border transition-all duration-300 hover:scale-[1.01] ${
            preset === 'cosmic' 
              ? 'bg-[#1E222B] border-slate-800 hover:bg-[#212630]' 
              : 'bg-slate-50/50 hover:bg-slate-50/90 border-slate-200/80'
          } rounded-xl flex flex-col justify-between h-[180px]`}>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block mb-1.5 uppercase font-bold tracking-wider">// SECURE_FEED_LEVEL_03</span>
              <h4 className="text-sm font-extrabold uppercase mb-2">Cognitive SKU Analytics</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                Query enterprise intelligence matrices utilizing server-side Gemini API. Feed historic performance signals to design custom B2B playbooks.
              </p>
            </div>
            <div className="text-[11px] font-sans font-bold text-[#008060] dark:text-emerald-400 flex items-center gap-1">
              Calibrate models <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
