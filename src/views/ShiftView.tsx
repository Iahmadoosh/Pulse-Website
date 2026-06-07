import { useState, useEffect } from "react";
import { Employee, Department } from "../types";
import { Loader2, CalendarClock, Zap, Edit2, Check, Plus, X, Calendar as CalendarIcon, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ShiftAssignment = {
  employee_id: string;
  employee_name: string;
  assigned_shifts: string[];
  reasoning: string;
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ShiftView({ employees, schedule, setSchedule, departments }: { employees: Employee[], schedule: ShiftAssignment[] | null, setSchedule: any, departments?: Department[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDayShifts, setEditDayShifts] = useState<Record<string, string>>({});

  const filteredEmployees = selectedDepartment === "all" 
    ? employees 
    : employees.filter(e => e.department === selectedDepartment);

  const initManualSchedule = () => {
    // Merge into existing schedule or create new empty one if full reset
    const emptySchedule = filteredEmployees.map(e => ({
      employee_id: e.id,
      employee_name: e.name,
      assigned_shifts: [],
      reasoning: "Manual Override"
    }));
    
    if (selectedDepartment === "all") {
       setSchedule(emptySchedule);
    } else {
       // Only clear the filtered employees' schedules
       const otherSchedule = schedule ? schedule.filter(s => {
         return !filteredEmployees.find(fe => fe.id === s.employee_id)
       }) : [];
       setSchedule([...otherSchedule, ...emptySchedule]);
    }
  };

  useEffect(() => {
    if (!schedule) {
      initManualSchedule();
    }
  }, [employees, schedule]);

  const generateShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = filteredEmployees.map(e => ({
        employee_id: e.id,
        name: e.name,
        kpi_score: e.kpi_score_out_of_100,
        availability: e.availability
      }));

      const res = await fetch('/api/generate-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: payload, department: selectedDepartment })
      });
      
      if (!res.ok) throw new Error('Failed to generate shifts');
      
      const data = await res.json();
      
      if (selectedDepartment === "all" || !schedule) {
         setSchedule(data);
      } else {
         const otherSchedule = schedule.filter(s => {
           return !filteredEmployees.find(fe => fe.id === s.employee_id)
         });
         setSchedule([...otherSchedule, ...data]);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (empId: string, currentShifts: string[]) => {
    setEditingId(empId);
    
    // Seed edit state with existing shifts per day
    const initialEditState: Record<string, string> = { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' };
    DAYS.forEach(day => {
      const found = currentShifts.find(s => isShiftForDay(s, day));
      if (found) {
        // Assume shift generated like 'Mon: 9am-5pm'. We take everything after the first match loosely.
        const cleaned = found.split(':').slice(1).join(':').trim() || found;
        initialEditState[day] = cleaned.replace(new RegExp(day, 'i'), '').trim();
      }
    });

    setEditDayShifts(initialEditState);
  };

  const saveEdit = () => {
    if (schedule && editingId) {
      // Re-map day entries to assigned_shifts strings array
      const updatedShifts = DAYS.filter(d => editDayShifts[d]?.trim()).map(d => `${d}: ${editDayShifts[d].trim()}`);
      setSchedule(schedule.map(s => s.employee_id === editingId ? { ...s, assigned_shifts: updatedShifts } : s));
      setEditingId(null);
    }
  };

  const isShiftForDay = (shiftString: string, day: string) => {
    return shiftString.toLowerCase().includes(day.toLowerCase());
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
      
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            Schedule
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Automatically construct the ideal schedule or manage team availability and shifts manually.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center shrink-0">
          {departments && departments.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-2 py-1 shadow-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="text-sm font-semibold text-slate-700 bg-transparent outline-none focus:text-emerald-600"
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={initManualSchedule}
              disabled={loading}
              className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 text-xs font-bold py-3 px-4 rounded uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              title="Reset to manual schedule"
            >
              <Edit2 className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={generateShifts}
              disabled={loading}
              className="group flex items-center gap-2 bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? "Generating..." : "Generate Schedule"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold uppercase tracking-wide">
          {error}
        </motion.div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
          <p className="font-bold uppercase tracking-widest text-sm text-slate-800">Calculating Shift Optimization</p>
          <p className="text-xs mt-2 max-w-xs text-center leading-relaxed">Cross-referencing organizational KPI performance against structural availability matrices...</p>
        </div>
      )}

      <AnimatePresence>
        {schedule && !loading && (
          <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} className="grid gap-6">
            
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold text-slate-800 w-48 shrink-0">Employee</th>
                      {DAYS.map(day => (
                        <th key={day} className="p-4 font-bold text-slate-800 min-w-[120px]">{day}</th>
                      ))}
                      <th className="p-4 font-bold text-slate-800 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((shift, idx) => {
                      const emp = employees.find(e => e.id === shift.employee_id);
                      const isEditing = editingId === shift.employee_id;
                      
                      return (
                        <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="p-4 align-top">
                            <h3 className="text-slate-800 font-bold text-sm tracking-wide">{shift.employee_name}</h3>
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mt-1">KPI: {emp?.kpi_score_out_of_100 || 'N/A'}</span>
                            {!isEditing && shift.reasoning && shift.reasoning !== "Manual Override" && (
                              <div className="mt-3 text-[10px] text-slate-500 leading-relaxed italic border-l-2 border-emerald-200 pl-2">
                                {shift.reasoning}
                              </div>
                            )}
                          </td>
                          
                          {isEditing ? (
                            DAYS.map(day => (
                              <td key={day} className="p-2 align-top border-l border-slate-100 bg-emerald-50/50">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block md:hidden">{day}</span>
                                  <input 
                                    type="text"
                                    value={editDayShifts[day] || ""}
                                    onChange={(e) => setEditDayShifts({...editDayShifts, [day]: e.target.value})}
                                    placeholder="Off"
                                    title={`Shift for ${day}`}
                                    className="w-full min-w-[80px] text-xs border border-emerald-200 rounded px-2 py-2 outline-none focus:border-emerald-500 shadow-sm bg-white"
                                  />
                                </div>
                              </td>
                            ))
                          ) : (
                            DAYS.map(day => {
                              const dayShifts = shift.assigned_shifts.filter(s => isShiftForDay(s, day));
                              // Also catch shifts that don't specify any known day explicitly to display them somewhere, maybe "General" column? 
                              // For now, only show days that match. If we want we could display unmatched in the Mon column if we really wanted to, but this is simpler.
                              return (
                                <td key={day} className="p-4 align-top border-l border-slate-100">
                                  {dayShifts.length > 0 ? (
                                    <div className="space-y-2">
                                      {dayShifts.map((m, i) => (
                                        <div key={i} className="text-xs font-medium bg-emerald-50 text-emerald-700 p-2 rounded border border-emerald-100 shadow-sm">
                                          {m}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-300">-</span>
                                  )}
                                </td>
                              );
                            })
                          )}

                          <td className="p-4 align-top border-l border-slate-100">
                            {isEditing ? (
                              <button onClick={saveEdit} className="flex items-center gap-2 w-full justify-center text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-2 rounded hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm">
                                <Check className="w-4 h-4" /> Save
                              </button>
                            ) : (
                              <button onClick={() => startEdit(shift.employee_id, shift.assigned_shifts)} className="flex items-center gap-2 w-full justify-center text-xs font-bold uppercase tracking-widest text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm">
                                <Edit2 className="w-4 h-4" /> Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

