import { useState } from "react";
import { Employee, Note } from "../types";
import { User, Building, Clock, Activity, MessageSquarePlus, ChevronRight, UserPlus, X, Search } from "lucide-react";

export function EmployeesView({ employees, setEmployees }: { employees: Employee[], setEmployees: any }) {
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(employees[0]?.id || null);
  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  
  const [newNote, setNewNote] = useState("");
  const [authorName, setAuthorName] = useState("Admin User");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [editEmpData, setEditEmpData] = useState<Partial<Employee>>({});
  const [newEmp, setNewEmp] = useState({ name: "", title: "", department: "", tenure_years: 0, kpi_score: 50, availability: "Unknown", hourly_wage: 0, vacation_days: 0, sick_days: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedEmp) return;
    
    const note: Note = {
      id: Math.random().toString(),
      author: authorName,
      date: noteDate,
      content: newNote
    };

    setEmployees((prev: Employee[]) => prev.map(emp => {
      if (emp.id === selectedEmp.id) {
        return { ...emp, notes: [...emp.notes, note] };
      }
      return emp;
    }));
    
    setNewNote("");
  };

  const handleCreateEmployee = () => {
    if (!newEmp.name || !newEmp.title) return;
    
    const e: Employee = {
      id: `EMP-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      name: newEmp.name,
      title: newEmp.title,
      department: newEmp.department,
      tenure_years: Number(newEmp.tenure_years),
      kpi_score_out_of_100: Number(newEmp.kpi_score),
      notes: [],
      availability: newEmp.availability,
      hourly_wage: Number(newEmp.hourly_wage),
      vacation_days: Number(newEmp.vacation_days),
      sick_days: Number(newEmp.sick_days)
    };
    
    setEmployees((prev: Employee[]) => [...prev, e]);
    setIsAdding(false);
    setSelectedEmpId(e.id);
    setNewEmp({ name: "", title: "", department: "", tenure_years: 0, kpi_score: 50, availability: "Unknown", hourly_wage: 0, vacation_days: 0, sick_days: 0 });
  };

  const handleStartEdit = () => {
    if (selectedEmp) {
      setEditEmpData(selectedEmp);
      setIsEditingSelected(true);
    }
  };

  const handleSaveEdit = () => {
    setEmployees((prev: Employee[]) => prev.map(emp => {
      if (emp.id === selectedEmpId) {
        return { ...emp, ...editEmpData };
      }
      return emp;
    }));
    setIsEditingSelected(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      {/* Employee List Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight uppercase">Directory</h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 uppercase tracking-widest transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by name or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[600px] overflow-y-auto">
          {filteredEmployees.map(emp => (
            <button 
              key={emp.id}
              onClick={() => { setSelectedEmpId(emp.id); setIsAdding(false); setIsEditingSelected(false); }}
              className={`w-full text-left p-4 flex items-center justify-between border-b border-slate-50 transition-colors ${!isAdding && selectedEmpId === emp.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div>
                <div className="font-semibold text-slate-900">{emp.name}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span className="font-mono">{emp.id}</span>
                  <span>•</span>
                  <span>{emp.title}</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${!isAdding && selectedEmpId === emp.id ? 'text-indigo-600' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {isAdding ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="bg-indigo-600 p-6 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Enroll New Employee
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                  <input type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full text-sm border border-slate-200 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Job Title</label>
                  <input type="text" value={newEmp.title} onChange={e => setNewEmp({...newEmp, title: e.target.value})} className="w-full text-sm border border-slate-200 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Data Analyst" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Department</label>
                  <input type="text" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="w-full text-sm border border-slate-200 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Analytics" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tenure (Years)</label>
                  <input type="number" step="0.5" value={newEmp.tenure_years} onChange={e => setNewEmp({...newEmp, tenure_years: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Initial KPI Score</label>
                  <input type="number" min="0" max="100" value={newEmp.kpi_score} onChange={e => setNewEmp({...newEmp, kpi_score: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Availability</label>
                  <input type="text" value={newEmp.availability} onChange={e => setNewEmp({...newEmp, availability: e.target.value})} className="w-full text-sm border border-slate-200 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Flexible" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Hourly Wage ($)</label>
                  <input type="number" step="0.01" value={newEmp.hourly_wage} onChange={e => setNewEmp({...newEmp, hourly_wage: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Vacation Days</label>
                  <input type="number" value={newEmp.vacation_days} onChange={e => setNewEmp({...newEmp, vacation_days: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Sick Days</label>
                  <input type="number" value={newEmp.sick_days} onChange={e => setNewEmp({...newEmp, sick_days: Number(e.target.value)})} className="w-full text-sm border border-slate-200 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={handleCreateEmployee} className="bg-slate-900 text-white text-xs font-bold py-2 px-6 rounded uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Save Record
              </button>
            </div>
          </div>
        ) : selectedEmp ? (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
              {!isEditingSelected ? (
                <button
                  onClick={handleStartEdit}
                  className="absolute top-6 right-6 flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold py-2 px-4 rounded uppercase tracking-widest hover:bg-indigo-100 transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingSelected(false)}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-bold py-2 px-4 rounded uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold py-2 px-4 rounded uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Save
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-sm shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  {isEditingSelected ? (
                    <div className="flex flex-col gap-2 w-full max-w-sm mb-4">
                      <input type="text" value={editEmpData.name || ""} onChange={e => setEditEmpData({...editEmpData, name: e.target.value})} className="text-2xl font-bold border border-slate-200 rounded px-2 py-1 uppercase tracking-tight" placeholder="Full Name" />
                      <input type="text" value={editEmpData.title || ""} onChange={e => setEditEmpData({...editEmpData, title: e.target.value})} className="text-sm border border-slate-200 rounded px-2 py-1 text-indigo-600 font-semibold" placeholder="Job Title" />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none mb-2">{selectedEmp.name}</h1>
                      <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-2">{selectedEmp.title}</h2>
                    </>
                  )}
                  
                  {isEditingSelected ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                       <label className="flex flex-col text-xs text-slate-500 font-bold uppercase">
                         Department
                         <input type="text" value={editEmpData.department || ""} onChange={e => setEditEmpData({...editEmpData, department: e.target.value})} className="border border-slate-200 rounded p-1 mt-1 font-normal text-slate-800" />
                       </label>
                       <label className="flex flex-col text-xs text-slate-500 font-bold uppercase">
                         Tenure (Yrs)
                         <input type="number" step="0.5" value={editEmpData.tenure_years || 0} onChange={e => setEditEmpData({...editEmpData, tenure_years: Number(e.target.value)})} className="border border-slate-200 rounded p-1 mt-1 font-normal text-slate-800" />
                       </label>
                       <label className="flex flex-col text-xs text-slate-500 font-bold uppercase">
                         KPI (0-100)
                         <input type="number" min="0" max="100" value={editEmpData.kpi_score_out_of_100 || 0} onChange={e => setEditEmpData({...editEmpData, kpi_score_out_of_100: Number(e.target.value)})} className="border border-slate-200 rounded p-1 mt-1 font-normal text-slate-800" />
                       </label>
                       <label className="flex flex-col text-xs text-slate-500 font-bold uppercase">
                         Availability
                         <input type="text" value={editEmpData.availability || ""} onChange={e => setEditEmpData({...editEmpData, availability: e.target.value})} className="border border-slate-200 rounded p-1 mt-1 font-normal text-slate-800" />
                       </label>
                     </div>
                  ) : (
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><Building className="w-4 h-4"/> {selectedEmp.department}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {selectedEmp.tenure_years} Yrs</span>
                      <span className="flex items-center gap-1"><Activity className="w-4 h-4"/> KPI: {selectedEmp.kpi_score_out_of_100}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-6 mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hourly Wage</span>
                      {isEditingSelected ? (
                        <div className="flex items-center bg-white border border-slate-200 rounded px-2 w-24">
                          <span className="text-slate-500 font-bold text-sm">$</span>
                          <input type="number" step="0.5" value={editEmpData.hourly_wage || 0} onChange={e => setEditEmpData({...editEmpData, hourly_wage: Number(e.target.value)})} className="w-full bg-transparent p-1 font-bold text-slate-800 text-sm outline-none" />
                        </div>
                      ) : (
                        <span className="font-bold text-slate-800">${selectedEmp.hourly_wage?.toFixed(2) || '0.00'}/hr</span>
                      )}
                    </div>
                    <div className="hidden md:block w-[1px] h-8 bg-slate-200"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vacation Balance</span>
                      {isEditingSelected ? (
                        <div className="flex items-center bg-white border border-slate-200 rounded px-2 w-20">
                          <input type="number" min="0" value={editEmpData.vacation_days || 0} onChange={e => setEditEmpData({...editEmpData, vacation_days: Number(e.target.value)})} className="w-full bg-transparent p-1 font-bold text-slate-800 text-sm outline-none" />
                        </div>
                      ) : (
                        <span className="font-bold text-slate-800">{selectedEmp.vacation_days || 0} Days</span>
                      )}
                    </div>
                    <div className="hidden md:block w-[1px] h-8 bg-slate-200"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sick Leave</span>
                      {isEditingSelected ? (
                        <div className="flex items-center bg-white border border-slate-200 rounded px-2 w-20">
                          <input type="number" min="0" value={editEmpData.sick_days || 0} onChange={e => setEditEmpData({...editEmpData, sick_days: Number(e.target.value)})} className="w-full bg-transparent p-1 font-bold text-slate-800 text-sm outline-none" />
                        </div>
                      ) : (
                        <span className="font-bold text-slate-800">{selectedEmp.sick_days || 0} Days</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Behavioral Notes & Performance Tracking</h3>
              </div>
              <div className="p-6 space-y-6">
                {selectedEmp.notes.length === 0 ? (
                  <div className="text-slate-400 text-sm italic py-4">No notes recorded yet.</div>
                ) : (
                  <div className="space-y-4">
                    {selectedEmp.notes.map(note => (
                      <div key={note.id} className="bg-slate-50 border border-slate-100 p-4 rounded-lg relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-800 text-sm">{note.author}</span>
                          <span className="text-xs text-slate-400 font-mono">{note.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Add Administrative Note</span>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={authorName} 
                      onChange={e => setAuthorName(e.target.value)}
                      placeholder="Author (e.g. Manager Name)"
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <input 
                      type="date" 
                      value={noteDate} 
                      onChange={e => setNoteDate(e.target.value)}
                      className="w-40 px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-600"
                    />
                  </div>
                  <textarea 
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Record behavioral observations, performance feedback, or HR notes here..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[100px] resize-y"
                  />
                  <button 
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="self-end flex items-center gap-2 bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <MessageSquarePlus className="w-4 h-4"/> Add Note
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
