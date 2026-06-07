import { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Send, 
  BookOpen, 
  MessageSquare, 
  Search, 
  CheckCircle,
  Clock, 
  AlertCircle,
  Hash,
  ChevronRight,
  ChevronDown,
  Info,
  LifeBuoy
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  department: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  message: string;
  createdAt: string;
  response?: string;
}

const GLOSSARY_TERMS = [
  {
    term: 'Campaign Spend Efficiency',
    category: 'Marketing',
    definition: 'The calculated quotient of marketing expenditure divided by total tracked customer acquisitions or actions (Spend / Conversions). It serves as a direct barometer of digital marketing health.',
    usage: 'A lower Campaign Spend Efficiency indicates a more cost-effective campaign, as it costs less capital to secure a customer conversion.'
  },
  {
    term: 'AI Forecasting Quotient',
    category: 'Intelligence',
    definition: 'Predictive analytics reliability index computed from historical standard deviation. It scores our proprietary Machine Learning demand predictions.',
    usage: 'An AI Forecasting Quotient nearing 95%+ indicates extreme reliability, whereas dynamic seasonal spikes may temporarily lower the confidence interval.'
  },
  {
    term: 'EBITDA Margin',
    category: 'Financials',
    definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. Evaluates core operating performance and profitability relative to standard recurring liabilities.',
    usage: 'Used in the Financials Ledger to evaluate overall firm solvency and underlying corporate performance independent of geographic tax jurisdictions.'
  },
  {
    term: 'Departmental Shift Matching',
    category: 'HR & Scheduling',
    definition: 'Automated linear scheduling algorithm linking employee availability constraints, hour thresholds, and seniority credentials to localized departmental shift needs.',
    usage: 'Under Human Resources, executing the Shift Matching algorithm resolves human bottlenecks by allocating optimal labor assets to open schedules.'
  },
  {
    term: 'Supply Chain Lead Time',
    category: 'Supply Chain',
    definition: 'The elapsed time between authorizing a purchasing order and receiving the terminal warehouse registry confirmation.',
    usage: 'We monitor Lead Times on the Supply Chain dashboard to recalculate automated purchase triggers for high-frequency replenishment cycles.'
  },
  {
    term: 'Safety Stock Threshold',
    category: 'Supply Chain',
    definition: 'The buffer inventory quantity calculated to mitigate risk of stockouts during unpredictable fulfillment delays or seasonal demand surges.',
    usage: 'When inventory dips below the Safety Stock Threshold, an automated alerts sequence triggers on the Products ledger.'
  },
  {
    term: 'Conversion Value Quotient',
    category: 'Marketing',
    definition: 'The total yield or immediate sales revenue generated directly from qualified digital marketing conversions.',
    usage: 'Used to benchmark return on ad spend (ROAS) and optimize high-budget targeting parameters.'
  },
  {
    term: 'Tenancy Isolation Index',
    category: 'System Administration',
    definition: 'A real-time security telemetry score measuring the encryption integrity and sandboxing of tenant partition data across our microservices infrastructure.',
    usage: 'Monitored continuously within the System Status indicators to ensure enterprise information isolation protocols remain unbroken.'
  },
  {
    term: 'Accrual Ledger Accounts',
    category: 'Financials',
    definition: 'Accounting structures tracking earned revenues and incurred liabilities before cash transitions occur. This enables GAAP-compliant accrual-basis performance reviews.',
    usage: 'By managing unbilled consulting services and compute liabilities in the Accruals sheet, you can mark assets or liabilities recognized upon settlement.'
  },
  {
    term: 'Cash Runway Survival Index',
    category: 'Financials',
    definition: 'The number of months a business can survive before depleting its current liquid reserves, derived by dividing the cash balance by the net burn rate.',
    usage: 'Using the dynamic Cash Runway Simulator sliders, you can evaluate how a drop in inflows or rise in outflows affects corporate survival timelines.'
  },
  {
    term: 'Budget Allocation Variance',
    category: 'Financials',
    definition: 'The difference between scheduled departmental allocations and real-world cash expenditures. Variances are categorized as Favorable (under budget for cost, or over budget for revenue) or Unfavorable.',
    usage: 'Adjusting budget targets in the Budget vs Actuals ledger provides live insight into target variance parameters.'
  },
  {
    term: 'Compounding Rolling Forecast',
    category: 'Financials',
    definition: 'An adaptive 12-month projections window that compounds monthly growth rate configurations to chart continuous revenue, expense, and cash trends.',
    usage: 'We use the Rolling Forecast graph to simulate long-term working capital outcomes under distinct compound percentage parameters.'
  }
];

const FAQS = [
  {
    question: 'How do I generate an optimized human resources shift schedule?',
    answer: 'Navigate to the Human Resources module, click on the "Schedules & Shifts" sub-tab, and review the current staffing assignments. You can trigger an automated optimization matching department labor quotas to employee availability constraints directly by clicking the optimization button.'
  },
  {
    question: 'How are the marketing campaign performance margins calculated?',
    answer: 'The platform pulls localized multi-platform ads expenditure and maps it to successful conversions. Spend per conversion is calculated as total expenditure divided by logged actions. You can re-allocate budget balances securely across campaigns in the Performance widget.'
  },
  {
    question: 'Where can I export financial ledgers and profit margins sheets?',
    answer: 'Enter the Financials tab to inspect comprehensive analytics, including EBITDA and overhead metrics. You can trigger integration sequences or export historical tables to external spreadsheets via corresponding third-party integrations under the Apps workspace.'
  },
  {
    question: 'Can I connect third-party enterprise tools to my Pulse account?',
    answer: 'Yes. Navigate to the "Apps" section in the primary sidebar navigation. Here, you can toggle active API integrations with major storage providers, cloud calendars, messaging channels, and payment systems seamlessly with OAuth authorization.'
  },
  {
    question: 'How do I edit employee profiles or assign departments?',
    answer: 'In the Human Resources panel, click on the Employees tab. From there, select any worker entry to modify credentials, change hourly wage brackets, or transfer their departmental classification.'
  },
  {
    question: 'How can I record unbilled assets or liabilities using the Accruals Recognition Ledger?',
    answer: 'Navigate to the Financials module and click on the "Accruals" tab. You can use the posting panel to schedule earned revenue (unbilled assets) or accrued expenses (liabilities), input the post date, and click submit. You can also toggle transactions between "Accrued" and "Recognized" directly in the ledger table.'
  },
  {
    question: 'How does the interactive Runway Simulator calculate business survival timelines?',
    answer: 'Navigate to the "Cash Analysis" sub-tab in the Financials workspace. Use the interactive sliders to adjust your current liquid cash balance, monthly inflow, and monthly outflow. The simulator will immediately calculate your net monthly flow and output your survival runway in months, highlighting risk levels dynamically.'
  },
  {
    question: 'Can I adjust the budget targets directly on the Budget vs Actuals interface?',
    answer: 'Yes. In the "Budget vs Actuals" sub-tab of the Financials workspace, locate the budget column in the ledger table. You can type in new budget values directly. The net variance balance and its status (Favorable vs. Unfavorable) will recalculate instantly, updating the comparison bar chart.'
  },
  {
    question: 'How does the 12-Month Rolling Forecast simulate compound business growth?',
    answer: 'Under the "Rolling Forecast" sub-tab in the Financials workspace, you can tune baseline starting conditions (cash, revenue, and expenses) and input projected MoM growth rates for both revenue and costs. The ledger compiles those compounding rates month-by-month for the next 12 months, plotting the trends on an interactive chart.'
  }
];

const SYSTEM_RESPONSES = [
  "Thank you for contacting Pulse Support. We have received your inquiry. One of our system engineers is investigating this telemetry report. We expect to reply within 2 hours.",
  "Your ticket has been logged and assigned to our Engineering squad (L2 support). If we require supplementary screenshots or log entries, we will reach out to this email terminal.",
  "Understood. We are reviewing this operations matrix discrepancy. Your priority classification has been flagged, and a ticket owner will update you directly shortly.",
];

export function HelpView() {
  const [activeSubTab, setActiveSubTab] = useState<'faqs' | 'ticket'>('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Ticket Form States
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('General Platform Support');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pulse_help_tickets');
      if (stored) {
        setTickets(JSON.parse(stored));
      } else {
        const initialTickets: Ticket[] = [
          {
            id: 'TKT-7821',
            subject: 'Discrepancy in marketing conversion spend ratio calculation',
            department: 'Marketing & Analytics Module',
            urgency: 'Medium',
            status: 'Resolved',
            message: 'In the Marketing View campaigns tab, the calculation for Cost/Conv appears to evaluate as $0.00 when there are conversion entities, but we corrected this in the last update. Please confirm.',
            createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toLocaleString(),
            response: 'The calculation ratio has been optimized to check for zero conversions and accurately output precise decimal values recursively.'
          }
        ];
        setTickets(initialTickets);
        localStorage.setItem('pulse_help_tickets', JSON.stringify(initialTickets));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveTickets = (newTickets: Ticket[]) => {
    setTickets(newTickets);
    localStorage.setItem('pulse_help_tickets', JSON.stringify(newTickets));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const randomResponse = SYSTEM_RESPONSES[Math.floor(Math.random() * SYSTEM_RESPONSES.length)];
    
    const newTicket: Ticket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject.trim(),
      department,
      urgency,
      status: 'Open',
      message: message.trim(),
      createdAt: new Date().toLocaleString()
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);

    // Simulate an AI/Engineer response shortly
    setTimeout(() => {
      const storedNow = localStorage.getItem('pulse_help_tickets');
      if (storedNow) {
        const currentTickets: Ticket[] = JSON.parse(storedNow);
        const resolvedList = currentTickets.map(t => {
          if (t.id === newTicket.id) {
            return {
              ...t,
              status: 'In Progress' as const,
              response: randomResponse
            };
          }
          return t;
        });
        saveTickets(resolvedList);
      }
    }, 10000);

    // Reset Form
    setSubject('');
    setMessage('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 5000);
  };

  const handleDeleteTicket = (id: string) => {
    const filtered = tickets.filter(t => t.id !== id);
    saveTickets(filtered);
  };

  // Filter terms and FAQs
  const filteredTerms = GLOSSARY_TERMS.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Unit */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-md border border-slate-950 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none">
          <LifeBuoy className="w-96 h-96 animate-spin-slow text-emerald-500" />
        </div>
        <div className="max-w-2xl space-y-3 relative z-10 text-left">
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30">
            PULSE KNOWLEDGE BASE & TICKET DESK
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">How can we assist your business operations?</h2>
          <p className="text-slate-350 text-sm leading-relaxed">
            Search our corporate term glossary, explore visual FAQ metrics, or send an authenticated support ticket directly to our localized platform operations unit.
          </p>
        </div>
      </div>

      {/* Primary Tab Bar Switches */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveSubTab('faqs'); }}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'faqs'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> FAQs & Pulse Glossary
        </button>
        <button
          onClick={() => { setActiveSubTab('ticket'); }}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ticket'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Support & Help Tickets
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeSubTab === 'faqs' ? (
        <div className="space-y-10">
          
          {/* SEARCH BAR PANEL */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            <input
              type="text"
              placeholder="Search platform FAQs, marketing indexes, accounting acronyms, or inventory parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-150 focus:border-emerald-500 transition-all shadow-sm"
              id="help-faq-search"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-4 text-xs font-bold text-indigo-650 hover:text-indigo-850"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT LEG: INTERACTIVE FAQ LIST */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 mb-2 text-left">
                <HelpCircle className="w-5 h-5 text-emerald-500 animate-pulse" />
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-sans">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all text-left"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between font-bold text-sm text-slate-800 gap-4 text-left outline-none cursor-pointer"
                      >
                        <span className="hover:text-indigo-650 transition-colors leading-snug">{faq.question}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 text-slate-600 text-xs leading-relaxed animate-in slide-in-from-top-1">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredFaqs.length === 0 && (
                  <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-250 text-slate-500 text-xs font-medium">
                    No FAQs matched your search term. Use Support Tickets to ping an operations lead.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT LEG: TERMS GLOSSARY */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 mb-2 text-left">
                <Info className="w-5 h-5 text-emerald-500" />
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-sans">Pulse Glossary & Definitions</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-500 text-left font-semibold italic">
                  Pulse utilizes sophisticated algorithms and terminology to handle cross-functional metrics. Explore the definitions below.
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredTerms.map((term, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-250/60 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow text-left space-y-2 border-l-4 border-l-indigo-500"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-800 tracking-wide font-sans">{term.term}</h4>
                        <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-500 tracking-wider px-2 py-0.5 rounded-full">
                          {term.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {term.definition}
                      </p>
                      <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 text-[10px] text-indigo-900 italic font-medium leading-normal flex gap-1 items-start">
                        <span className="font-bold text-emerald-700 leading-none shrink-0 border border-emerald-200/40 bg-emerald-50 px-1 py-0.2 rounded mt-0.5">Usage:</span>
                        <span>"{term.usage}"</span>
                      </div>
                    </div>
                  ))}

                  {filteredTerms.length === 0 && (
                    <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-400 text-xs">
                      No glossary definitions match your search query.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SUBMIT TICKET FORM CONTAINER */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
              <div className="flex items-center gap-2.5 border-b pb-4 mb-6">
                <LifeBuoy className="w-5 h-5 text-emerald-500 animate-spin-slow" />
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest font-sans">Open Support Ticket</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Lodge a secure log file or platform telemetry note.</p>
                </div>
              </div>

              {successMsg && (
                <div className="mb-4 bg-emerald-50 border border-indigo-250/60 text-emerald-800 text-[11px] uppercase tracking-wider font-extrabold p-3.5 rounded-xl flex items-center gap-2 font-sans">
                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce shrink-0" />
                  Your support ticket has been registered safely!
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., EBITDA calculation deviates from custom overhead formula"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                    id="ticket-subject"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Component</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                      id="ticket-department"
                    >
                      <option value="General Platform Info">General Platform Support</option>
                      <option value="HR Module & Schedule Matching">Human Resources Scheduler</option>
                      <option value="Marketing Ledger API & Bids">Marketing Optimizer</option>
                      <option value="Financials Ledger Matrix">Financial Ledger Interface</option>
                      <option value="Supply Chain Lead Time tracker">Supply Chain Pipeline</option>
                      <option value="Products Inventory Catalog">Products Catalog</option>
                      <option value="Oauth Applications Matrix">Integrations & Apps</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Urgency Metrics</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                      id="ticket-urgency"
                    >
                      <option value="Low">Low (General Query)</option>
                      <option value="Medium">Medium (Discrepancy)</option>
                      <option value="High">High (Service Degradation)</option>
                      <option value="Critical">Critical (Halting Operations)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descriptive Details & Logs</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what occurred, including the sequence of views, system status, and specific inputs that led to this result."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors resize-none"
                    id="ticket-message"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-slate-900 border border-slate-950 text-white hover:bg-black font-extrabold text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all w-full flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  id="ticket-submit-btn"
                >
                  <Send className="w-3.5 h-3.5" /> File Secure Support Ticket
                </button>
              </form>
            </div>

            {/* LIVE TICKET STATUS TRACKER LIST */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest font-sans">Active Support Tickets</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Verify progress, chat replies, and resolution indicators.</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100">
                  {tickets.length} Registered
                </span>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {tickets.map((t, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4 select-text relative">
                    
                    {/* Header line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 font-mono bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <Hash className="w-3 h-3 text-slate-400 shrink-0" /> {t.id}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">{t.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-full ${
                          t.urgency === 'Critical' ? 'bg-rose-150 bg-rose-50 border-rose-250 text-rose-700' :
                          t.urgency === 'High' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          t.urgency === 'Medium' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {t.urgency} Urgency
                        </span>

                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 border rounded-lg flex items-center gap-1.5 ${
                          t.status === 'Resolved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          t.status === 'In Progress' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          'bg-slate-100 border-slate-250 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Resolved' ? 'bg-emerald-500' : t.status === 'In Progress' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {t.status}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Subject and Body info */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800 leading-snug">{t.subject}</h4>
                      <p className="text-[11px] text-slate-500/90 font-medium leading-relaxed bg-white border border-slate-150 p-3 rounded-xl shadow-2xs select-text">
                        {t.message}
                      </p>
                      <div className="text-[9px] font-extrabold text-slate-405 text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span>Associated Component:</span>
                        <span className="text-emerald-600 font-semibold">{t.department}</span>
                      </div>
                    </div>

                    {/* Developer/System replies indicator */}
                    {t.response ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-100/60 rounded-xl space-y-2 text-left animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-650 animate-spin-slow" />
                          <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-widest">Platform Node Response (L2 Staff)</span>
                        </div>
                        <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                          {t.response}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-100 border border-slate-200/50 rounded-xl flex items-center gap-2 text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Awaiting response sequence...</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="text-[10px] font-extrabold uppercase tracking-wide text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Close and erase ticket history item"
                      >
                        Cancel Ticket
                      </button>
                    </div>

                  </div>
                ))}

                {tickets.length === 0 && (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs font-medium">
                    No active support tickets logged under this session.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
