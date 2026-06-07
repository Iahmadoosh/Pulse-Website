import { useState } from "react";
import { Department } from "../types";
import { Building, Users, Briefcase, Plus, X, Pencil, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function DepartmentsView({ departments, setDepartments }: { departments: Department[], setDepartments: any }) {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(departments[0]?.id || null);
  const selectedDept = departments.find(d => d.id === selectedDeptId);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", manager: "", description: "" });

  const handleCreateDepartment = () => {
    if (!formData.name || !formData.manager) return;
    
    const newDept: Department = {
      id: `DEP-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      name: formData.name,
      manager: formData.manager,
      description: formData.description
    };
    
    setDepartments((prev: Department[]) => [...prev, newDept]);
    setIsAdding(false);
    setSelectedDeptId(newDept.id);
    setFormData({ name: "", manager: "", description: "" });
  };

  const handleUpdateDepartment = () => {
    if (!selectedDept || !formData.name || !formData.manager) return;

    setDepartments((prev: Department[]) => prev.map(d => {
      if (d.id === selectedDept.id) {
        return { ...d, name: formData.name, manager: formData.manager, description: formData.description };
      }
      return d;
    }));
    
    setIsEditing(false);
  };

  const startEdit = () => {
    if (selectedDept) {
      setFormData({ name: selectedDept.name, manager: selectedDept.manager, description: selectedDept.description });
      setIsEditing(true);
      setIsAdding(false);
    }
  };

  const startAdd = () => {
    setFormData({ name: "", manager: "", description: "" });
    setIsAdding(true);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      {/* Sidebar List */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight uppercase">Departments</h2>
          <button 
            onClick={startAdd}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 uppercase tracking-widest transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px] overflow-y-auto">
          {departments.map(dept => (
             <button 
                key={dept.id}
                onClick={() => { setSelectedDeptId(dept.id); setIsAdding(false); setIsEditing(false); }}
                className={`w-full text-left p-5 border-b border-slate-100 transition-colors flex flex-col gap-1 ${(!isAdding && selectedDeptId === dept.id) ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'}`}
             >
                <div className="flex items-center gap-2">
                    <Building className={`w-4 h-4 ${(!isAdding && selectedDeptId === dept.id) ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-slate-900 text-base">{dept.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 ml-6 uppercase tracking-widest font-bold">
                    <span>{dept.id}</span>
                </div>
             </button>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {isAdding || isEditing ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="bg-indigo-600 p-6 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
                {isAdding ? <><Plus className="w-5 h-5"/> Add Department</> : <><Pencil className="w-5 h-5"/> Edit Department</>}
              </h3>
              <button onClick={() => { setIsAdding(false); setIsEditing(false); }} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Department Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Finance" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Department Manager</label>
                  <input type="text" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-colors min-h-[100px] resize-y" placeholder="Brief overview of the department's role..." />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={isAdding ? handleCreateDepartment : handleUpdateDepartment} 
                className="bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {isAdding ? "Create" : "Update"}
              </button>
            </div>
          </div>
        ) : selectedDept ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col animate-in fade-in duration-300">
            <div className="bg-white p-8 border-b border-slate-100 flex justify-between items-start">
               <div>
                 <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
                    <Building className="w-8 h-8" />
                 </div>
                 <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none mb-2">{selectedDept.name}</h1>
                 <span className="text-xs uppercase tracking-widest font-bold text-slate-400">{selectedDept.id}</span>
               </div>
               <button onClick={startEdit} className="text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 uppercase tracking-widest transition-colors flex items-center gap-2">
                 <Pencil className="w-3 h-3" /> Edit Profile
               </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department Manager</span>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                           <Users className="w-5 h-5"/>
                        </div>
                        <span className="text-slate-800 font-semibold">{selectedDept.manager}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">About this Department</span>
                     <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                         {selectedDept.description || "No description provided."}
                     </p>
                </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-slate-400 h-full min-h-[400px]">
             <Building className="w-12 h-12 mb-4 text-slate-200" />
             <p className="uppercase tracking-widest text-sm font-bold text-slate-500">Select a Department</p>
             <p className="text-xs mt-2 max-w-xs text-center leading-relaxed">Choose a department from the directory to view its profile or add a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
