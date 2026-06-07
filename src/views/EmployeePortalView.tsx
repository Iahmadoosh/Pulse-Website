import { useState } from "react";
import { Employee } from "../types";
import { User, Calendar, Save, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export function EmployeePortalView({ employees, setEmployees }: { employees: Employee[], setEmployees: any }) {
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(employees[0]?.id || null);
  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const [availability, setAvailability] = useState(selectedEmp?.availability || "");
  const [saved, setSaved] = useState(false);

  // Sync state when employee changes
  const handleSelectEmployee = (id: string) => {
    setSelectedEmpId(id);
    const emp = employees.find(e => e.id === id);
    setAvailability(emp?.availability || "");
    setSaved(false);
  };

  const handleSave = () => {
    if (!selectedEmp) return;
    setEmployees((prev: Employee[]) => prev.map(emp => {
      if (emp.id === selectedEmp.id) {
        return { ...emp, availability };
      }
      return emp;
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-emerald-600 rounded-xl p-8 shadow-sm relative overflow-hidden text-white">
        <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <User className="w-6 h-6" /> Employee Portal
        </h2>
        <p className="text-[#008060] max-w-xl leading-relaxed text-sm">
          Select your profile to view your details and update your shift availability. 
          The scheduling engine will prioritize your preferences combined with performance metrics.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Select Profile (Demo Simulator)</label>
          <select 
            value={selectedEmpId || ""} 
            onChange={(e) => handleSelectEmployee(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-emerald-500 transition-colors"
          >
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.title})</option>
            ))}
          </select>
        </div>

        {selectedEmp && (
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1 block">
                <Calendar className="w-3 h-3" /> Update Your Availability
              </label>
              <input 
                type="text"
                value={availability}
                onChange={e => { setAvailability(e.target.value); setSaved(false); }}
                placeholder="e.g., Monday-Friday 9 AM - 5 PM, Not available weekends."
                className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-xs text-slate-500 mt-2">
                Your availability naturally assists the generation engine in providing best matching shifts.
              </p>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold py-3 px-6 rounded uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> Save Availability
              </button>
              {saved && (
                <motion.span initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Availability updated!
                </motion.span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
