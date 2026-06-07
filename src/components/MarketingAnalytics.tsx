import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart as RechartsBarChart, 
  Bar 
} from 'recharts';
import { 
  TrendingDown, 
  PieChart as LucidePieChart, 
  BarChart3, 
  Megaphone, 
  BarChart2, 
  Target 
} from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  status: 'Active' | 'Paused';
  budget: number;
  spend: number;
  conversions: number;
}

interface MarketingAnalyticsProps {
  campaigns: Campaign[];
}

export function MarketingAnalytics({ campaigns }: MarketingAnalyticsProps) {
  // 1. Cost-per-conversion trends data (Week 1, 2, 3, 4, 6)
  const lineTrendsData = [
    { week: 'Week 1', cost: 14.50 },
    { week: 'Week 2', cost: 12.00 },
    { week: 'Week 3', cost: 9.80 },
    { week: 'Week 4', cost: 8.50 },
    { week: 'Week 6', cost: 5.80 },
  ];

  // 2. Platform engagement share data
  const engagementData = [
    { name: 'Instagram', value: 4200, color: '#E23E84' },
    { name: 'Facebook', value: 2900, color: '#1877F2' },
    { name: 'X / Twitter', value: 1800, color: '#0F172A' },
    { name: 'TikTok', value: 2100, color: '#10B981' },
  ];

  // 3. Budget vs Spend headroom chart data mapped from campaigns
  const budgetSpendData = campaigns.map(c => {
    const spent = c.spend;
    const headroom = Math.max(0, c.budget - c.spend);
    // Truncate names for clear presentation as shown in images
    const truncatedName = c.name.length > 15 ? c.name.slice(0, 15) + '...' : c.name;
    return {
      name: truncatedName,
      Spent: spent,
      Headroom: headroom,
    };
  });

  // Calculate dynamic stats metrics
  const activeChannelsCount = campaigns.filter(c => c.status === 'Active').length;
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const avgCostPerConversion = totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : '5.78';

  return (
    <div id="marketing-analytics-dashboard-group" className="space-y-6">
      {/* PHOTO 1: The Three Upper Chart Widgets in a Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        
        {/* Card 1: Cost-per-conversion Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1E293B]">Cost-Per-Conversion Trend</h4>
            </div>
            <p className="text-xs text-slate-500 leading-normal mb-6">
              Average customer acquisition cost (CAC) continues to compress due to active AI keyword optimization strategies.
            </p>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineTrendsData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="week" 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickFormatter={(val) => `$${val}`} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 16]}
                  ticks={[0, 4, 8, 12, 16]}
                />
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ fill: '#ffffff', stroke: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Platform Engagement Share */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <LucidePieChart className="w-5 h-5 text-emerald-500" />
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1E293B]">Platform Engagement Share</h4>
            </div>
            <p className="text-xs text-slate-500 leading-normal mb-6">
              Distribution of user clicks and visual impressions relative to connected business accounts.
            </p>
          </div>
          
          <div className="h-36 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  dataKey="value"
                  stroke="none"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} Visitors`, 'Volume']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-4 text-[10px] text-slate-600 font-semibold border-t pt-3 border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E23E84] shrink-0" />
              <span>Instagram: <strong className="text-slate-800 font-bold">4200</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A] shrink-[#0F172A]" />
              <span>X / Twitter: <strong className="text-slate-800 font-bold">1800</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shrink-0" />
              <span>Facebook: <strong className="text-slate-800 font-bold">2900</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
              <span>TikTok: <strong className="text-slate-800 font-bold font-bold">2100</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Budget vs Spend Headroom */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1E293B]">Active Budget vs Spend Headroom</h4>
            </div>
            <p className="text-xs text-slate-500 leading-normal mb-6">
              Compares current spent cash sums against remaining headroom allowances for active local channels.
            </p>
          </div>
          
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={budgetSpendData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickFormatter={(val) => `$${val}`} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 600]}
                  ticks={[0, 150, 300, 450, 600]}
                />
                <Tooltip formatter={(value, name) => [`$${value}`, name]} />
                <Bar dataKey="Spent" stackId="a" fill="#10B981" barSize={34} />
                <Bar dataKey="Headroom" stackId="a" fill="#E2E8F0" barSize={34} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 border-t pt-3 border-slate-100 text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#E2E8F0] rounded-xs" />
              <span>Headroom</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#10B981] rounded-xs" />
              <span>Spent</span>
            </div>
          </div>
        </div>

      </div>

      {/* PHOTO 1 BELOW: The Three horizontal metrics summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        
        {/* Card 1: ACTIVE CHANNELS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
            <Megaphone className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Active Channels</span>
            <span className="text-3xl font-bold font-sans text-slate-800">{activeChannelsCount}</span>
          </div>
        </div>

        {/* Card 2: TOTAL SPENT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
            <BarChart2 className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Spent</span>
            <span className="text-3xl font-bold font-sans text-slate-800">${totalSpent.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 3: AVG COST/CONV */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100 shrink-0">
            <Target className="w-5 h-5 text-[#E23E84]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Avg Cost / Conv</span>
            <span className="text-3xl font-bold font-sans text-slate-800">${avgCostPerConversion}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
