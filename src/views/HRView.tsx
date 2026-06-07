import { useState } from 'react';
import { Building, Users, Brain, TrendingUp, CalendarClock, DollarSign, User } from 'lucide-react';
import { DepartmentsView } from './DepartmentsView';
import { EmployeesView } from './EmployeesView';
import { AssessmentsView } from './AssessmentsView';
import { AnalyticsView } from './AnalyticsView';
import { ShiftView } from './ShiftView';
import { PayrollView } from './PayrollView';
import { EmployeePortalView } from './EmployeePortalView';

export function HRView(props: any) {
  const [activeTab, setActiveTab] = useState('departments');

  const TABS = [
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'employees', label: 'Directory & Admin', icon: Users },
    { id: 'assessments', label: 'Assessments', icon: Brain },
    { id: 'analytics', label: 'Trend Analysis', icon: TrendingUp },
    { id: 'shifts', label: 'Schedule', icon: CalendarClock },
    { id: 'payroll', label: 'Payroll & Compensation', icon: DollarSign },
    { id: 'portal', label: 'Employee Portal', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'departments': return <DepartmentsView departments={props.departments} setDepartments={props.setDepartments} />;
      case 'employees': return <EmployeesView employees={props.employees} setEmployees={props.setEmployees} />;
      case 'assessments': return <AssessmentsView employees={props.employees} history={props.assessmentHistory} setHistory={props.setAssessmentHistory} />;
      case 'analytics': return <AnalyticsView employees={props.employees} history={props.trendHistory} setHistory={props.setTrendHistory} />;
      case 'shifts': return <ShiftView employees={props.employees} schedule={props.schedule} setSchedule={props.setSchedule} departments={props.departments} />;
      case 'payroll': return <PayrollView employees={props.employees} history={props.payrollHistory} setHistory={props.setPayrollHistory} preset={props.preset} />;
      case 'portal': return <EmployeePortalView employees={props.employees} setEmployees={props.setEmployees} />;
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Human Resources</h1>
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors border ${
                  isActive 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}
