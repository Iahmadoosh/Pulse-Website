import { useState } from "react";
import { Employee } from "../types";
import { DollarSign, Clock, Download, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { PRESETS, PresetName } from "../presets";

export function PayrollView({ 
  employees, 
  history, 
  setHistory, 
  preset = 'stark' 
}: { 
  employees: Employee[], 
  history: any[], 
  setHistory: any, 
  preset?: PresetName 
}) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(history[0]?.id || null);

  const selectedRecord = history.find(h => h.id === selectedPeriod) || history[0];

  const styles = PRESETS[preset] || PRESETS.stark;

  const sidebarStyles = {
    stark: {
      active: "bg-slate-100 text-indigo-700 border-l-4 border-indigo-600 font-bold",
      inactive: "text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:text-slate-900",
      textMuted: "text-slate-400 text-[10px]",
      textMutedActive: "text-indigo-500 text-[10px]",
      icon: "text-indigo-600",
      border: "border-slate-200",
    },
    editorial: {
      active: "bg-[#002FA7] text-[#FFFDF9] border-l-[6px] border-l-[#D4FC34] border-b-2 border-[#0E0E0F]",
      inactive: "hover:bg-[#002FA7]/5 text-[#0E0E0F] border-l-[6px] border-l-transparent border-b border-[#0E0E0F]/10",
      textMuted: "text-slate-500",
      textMutedActive: "text-[#D4FC34]",
      icon: "text-[#002FA7]",
      border: "border-[#0E0E0F]",
    },
    cosmic: {
      active: "bg-[#383838] text-[#60CDFF] border-l-4 border-[#60CDFF]",
      inactive: "text-slate-400 hover:bg-[#3d3d3d] border-l-4 border-transparent hover:text-white",
      textMuted: "text-slate-500",
      textMutedActive: "text-sky-400",
      icon: "text-[#60CDFF]",
      border: "border-[#444444]",
    }
  }[preset] || {
    active: "bg-slate-100 text-indigo-700 border-l-4 border-indigo-600 font-bold",
    inactive: "text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:text-slate-900",
    textMuted: "text-slate-400 text-[10px]",
    textMutedActive: "text-indigo-500 text-[10px]",
    icon: "text-indigo-600",
    border: "border-slate-200",
  };

  const barColors = {
    stark: 'bg-indigo-600',
    editorial: 'bg-[#002FA7]',
    cosmic: 'bg-[#60CDFF]',
  }[preset] || 'bg-indigo-600';

  const headerStyles = {
    stark: {
      wrapper: "bg-slate-50 text-slate-800 border-b border-slate-200",
      badge: "text-indigo-600 font-mono text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 inline-block mb-2",
      title: "text-slate-900 font-sans font-bold",
      subtext: "text-slate-500/90",
      button: "bg-slate-900 hover:bg-slate-800 text-white font-sans font-semibold rounded-lg px-4 py-2 transition-colors cursor-pointer"
    },
    editorial: {
      wrapper: "bg-[#0E0E0F] text-[#FFFDF9] border-b-2 border-[#0E0E0F]",
      badge: "text-[#D4FC34] font-mono text-[9px] font-extrabold uppercase bg-[#0E0E0F] border border-[#D4FC34]/30 px-2.5 py-1 inline-block mb-2",
      title: "text-[#FFFDF9] font-mono font-extrabold uppercase tracking-tight",
      subtext: "text-[#FFFDF9]/70",
      button: "bg-[#FFFDF9] hover:bg-[#D4FC34] text-[#0E0E0F] hover:text-[#0E0E0F] font-mono border border-transparent font-bold text-[10px] uppercase tracking-wider px-4 py-2 hover:border-[#0E0E0F] transition-none cursor-pointer"
    },
    cosmic: {
      wrapper: "bg-[#1E293B] text-slate-100 border-b border-slate-700",
      badge: "text-sky-400 font-mono text-[9.5px] font-extrabold uppercase tracking-widest bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 inline-block rounded mb-2",
      title: "text-white font-sans font-bold tracking-tight",
      subtext: "text-slate-400",
      button: "bg-violet-600 hover:bg-violet-500 text-white font-sans font-semibold rounded-lg px-4 py-2 transition-colors cursor-pointer"
    }
  }[preset] || {
    wrapper: "bg-slate-50 text-slate-800 border-b border-slate-200",
    badge: "text-indigo-600 font-mono text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 inline-block mb-2",
    title: "text-slate-900 font-sans font-bold",
    subtext: "text-slate-500/90",
    button: "bg-slate-900 hover:bg-slate-800 text-white font-sans font-semibold rounded-lg px-4 py-2 transition-colors..."
  };

  const tableStyles = {
    stark: {
      tableText: "text-slate-700",
      thead: "bg-slate-50 border-b border-slate-200 text-slate-500 font-sans font-semibold text-[10px]",
      rowHover: "hover:bg-slate-50/40",
      rowBorder: "border-b border-slate-100",
      nameText: "text-slate-900 font-bold",
      titleText: "text-slate-400 font-sans text-[10px]",
      amountText: "text-indigo-600 font-bold"
    },
    editorial: {
      tableText: "text-[#0E0E0F]",
      thead: "bg-[#FFFDF9] border-b-2 border-[#0E0E0F] text-[#0E0E0F] font-mono font-bold text-[10px]",
      rowHover: "hover:bg-[#002FA7]/5",
      rowBorder: "border-b-2 border-[#0E0E0F]/10",
      nameText: "text-[#0E0E0F] font-extrabold",
      titleText: "text-slate-500 font-mono text-[9.5px]",
      amountText: "text-[#002FA7] font-black"
    },
    cosmic: {
      tableText: "text-slate-300",
      thead: "bg-[#252525] border-b border-[#444444] text-slate-400 font-sans font-semibold text-[10px]",
      rowHover: "hover:bg-white/5",
      rowBorder: "border-b border-[#444444]/40",
      nameText: "text-white font-bold",
      titleText: "text-[#60CDFF] font-mono text-[10px]",
      amountText: "text-emerald-400 font-bold"
    }
  }[preset] || {
    tableText: "text-slate-700",
    thead: "bg-slate-50 border-b border-slate-200 text-slate-500 font-sans font-semibold text-[10px]",
    rowHover: "hover:bg-slate-50/40",
    rowBorder: "border-b border-slate-100",
    nameText: "text-slate-900 font-bold",
    titleText: "text-slate-400 font-sans text-[10px]",
    amountText: "text-indigo-600 font-bold"
  };

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
      "Net Pay ($)",
      "Vacation Days",
      "Sick Days"
    ];

    const latestCycle = history && history.length > 0 ? history[0] : null;

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
        netPay.toFixed(2),
        employee.vacation_days,
        employee.sick_days
      ];
    });

    const csvString = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Pulse_Payroll_Comp_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSelectedLedger = () => {
    if (!selectedRecord) return;
    const periodStr = new Date(selectedRecord.periodEnd).toISOString().split('T')[0];
    const headers = [
      "Employee Name",
      "Role",
      "Base Pay ($)",
      "Deductions ($)",
      "Net Pay ($)"
    ];

    const rows = selectedRecord.records.map((rec: any) => {
      const emp = employees.find(e => e.id === rec.employee_id);
      const netPay = rec.basePay + rec.bonus - rec.deductions;
      return [
        `"${(emp?.name || rec.employee_id).replace(/"/g, '""')}"`,
        `"${(emp?.title || '').replace(/"/g, '""')}"`,
        rec.basePay.toFixed(2),
        rec.deductions.toFixed(2),
        netPay.toFixed(2)
      ];
    });

    const csvString = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Pulse_Payroll_Ledger_${periodStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex flex-col gap-8 animate-in fade-in duration-150 max-w-6xl mx-auto pb-12 mt-4 select-none font-sans ${preset === 'cosmic' ? 'text-slate-100' : 'text-[#0E0E0F]'}`}>
      
      {/* Adaptive Section Header */}
      <div className={`${styles.heroCard} flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden transition-all duration-300`}>
        <div className="absolute right-10 bottom-0 md:-bottom-4 w-72 h-44 opacity-[0.06] pointer-events-none text-current">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M5 90 L30 65 L50 75 L85 20 M85 20 L60 20 M85 20 L85 45" />
          </svg>
        </div>

        <div>
          <span className={preset === 'stark' ? styles.badgeGrey : styles.badgeBlue}>
            STATION_NODES // PAYROLL // MANAGEMENT
          </span>
          <h2 className={`text-2xl md:text-3xl font-extrabold ${preset === 'editorial' ? 'font-mono uppercase' : 'tracking-tight'} mt-2 mb-1 flex items-center gap-2`}>
            <DollarSign className={`w-6 h-6 ${preset === 'cosmic' ? 'text-sky-400' : 'text-indigo-600'}`} />
            Payroll & Compensation Matrix
          </h2>
          <p className={`text-xs ${preset === 'stark' ? 'text-slate-500' : preset === 'cosmic' ? 'text-slate-400' : 'text-slate-800'} font-medium mt-1`}>
            Reconcile bi-weekly compensation disbursements, analyze corporate tax overhead write-offs, and broadcast local payroll ledgers.
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className={`flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all shrink-0 ${headerStyles.button}`}
          id="download-payroll-report-btn"
        >
          <Download className="w-4 h-4" /> Download Report Manifest
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className={`flex flex-col h-[580px] shrink-0 transition-all duration-300 ${styles.card}`}>
          <div className={`p-4 border-b flex items-center justify-between font-mono font-bold uppercase text-[10px] ${sidebarStyles.border}`}>
            <span className={preset === 'cosmic' ? 'text-slate-300' : 'text-slate-700'}>HISTORIC CYCLE RUNS</span>
            <Clock className={`w-4 h-4 ${sidebarStyles.icon}`} />
          </div>
          <div className="flex-1 overflow-y-auto w-full divide-y border-t border-transparent divide-slate-100/10">
            {history.map((record) => {
              const isActive = selectedPeriod === record.id;
              return (
                <button 
                  key={record.id}
                  onClick={() => setSelectedPeriod(record.id)}
                  className={`w-full text-left p-4 flex items-center justify-between transition-all border-b ${
                    isActive 
                      ? sidebarStyles.active 
                      : sidebarStyles.inactive
                  } ${sidebarStyles.border}`}
                >
                  <div>
                    <div className="text-xs font-mono font-bold uppercase tracking-wider">
                      {new Date(record.periodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                    </div>
                    <div className={`text-[10px] font-mono mt-1 font-bold ${isActive ? sidebarStyles.textMutedActive : sidebarStyles.textMuted}`}>
                      BI_WEEK_INTERVAL_RUN
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? sidebarStyles.textMutedActive : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Details Display (Main Ledger Sheet) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {selectedRecord && (
            <div 
              className={`relative overflow-hidden transition-all duration-300 ${styles.card}`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${barColors}`} />

              <div className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${headerStyles.wrapper}`}>
                <div>
                  <span className={headerStyles.badge}>COMPENSATION_DISBURSEMENT // SUCCESS</span>
                  <h3 className="text-base font-extrabold font-mono uppercase tracking-tight">
                    PERIOD_END_STAMP: {new Date(selectedRecord.periodEnd).toLocaleDateString()}
                  </h3>
                  <p className={`text-xs mt-1 font-bold ${headerStyles.subtext}`}>
                    Total net overhead: ${(selectedRecord.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </p>
                </div>
                <button 
                  onClick={handleExportSelectedLedger}
                  className={`flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider font-extrabold px-4 py-2 hover:border-[#0E0E0F] transition-none cursor-pointer ${headerStyles.button}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Ledger Sheet
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs uppercase">
                  <thead className={tableStyles.thead}>
                    <tr>
                      <th className="px-6 py-4 font-extrabold uppercase tracking-widest text-[9.5px]">Operator Name // Title</th>
                      <th className="px-6 py-4 font-extrabold uppercase tracking-widest text-[9.5px]">Base Wage</th>
                      <th className="px-6 py-4 font-extrabold uppercase tracking-widest text-[9.5px]">Deductions</th>
                      <th className="px-6 py-4 font-extrabold uppercase tracking-widest text-[9.5px] text-right">Unified Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-bold ${preset === 'stark' ? 'divide-slate-200/50' : preset === 'cosmic' ? 'divide-slate-800' : 'divide-[#0E0E0F]/10'}`}>
                    {selectedRecord.records.map((rec: any, idx: number) => {
                      const emp = employees.find(e => e.id === rec.employee_id);
                      const netPay = rec.basePay + rec.bonus - rec.deductions;
                      
                      return (
                        <tr key={idx} className={`transition-colors duration-150 ${tableStyles.rowHover} ${tableStyles.rowBorder}`}>
                          <td className="px-6 py-4">
                            <div className={`font-extrabold ${tableStyles.nameText}`}>{emp?.name || rec.employee_id}</div>
                            <div className={`text-[9.5px] font-mono mt-1 uppercase tracking-tight ${tableStyles.titleText}`}>{emp?.title || "Staff Operator"}</div>
                          </td>
                          <td className={`px-6 py-4 font-mono font-semibold ${tableStyles.tableText}`}>
                            ${rec.basePay.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-6 py-4 font-mono font-semibold text-rose-500">
                            -${rec.deductions.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className={`px-6 py-4 font-mono text-right font-black ${tableStyles.amountText}`}>
                            ${netPay.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
