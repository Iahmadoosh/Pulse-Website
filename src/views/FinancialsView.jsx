import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calculator, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Sliders, 
  Bot, 
  Play, 
  ArrowRight, 
  Loader2, 
  Info,
  CheckCircle,
  HelpCircle,
  ShoppingBag,
  ShoppingCart,
  Link2,
  Search,
  ArrowRightLeft,
  Database,
  Terminal,
  ShieldCheck,
  RefreshCw,
  X,
  CreditCard,
  Layers,
  Smartphone,
  Sparkle,
  Settings,
  Download,
  Check,
  FileText,
  Boxes,
  Briefcase
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import ReactMarkdown from 'react-markdown';

const HISTORICAL_DATA = [
  { month: 'Jan', revenue: 120000, expenses: 80000 },
  { month: 'Feb', revenue: 125000, expenses: 82000 },
  { month: 'Mar', revenue: 135000, expenses: 85000 },
  { month: 'Apr', revenue: 130000, expenses: 88000 },
  { month: 'May', revenue: 145000, expenses: 87000 },
  { month: 'Jun', revenue: 155000, expenses: 90000 },
  { month: 'Jul', revenue: 150000, expenses: 92000 },
];

const MARKETPLACE_APPS = [
  {
    id: 'square',
    name: 'Square POS Core',
    developer: 'Square Inc.',
    category: 'Operations & POS',
    description: 'Sync counters, food trucks, or gallery items with live register balances. Pulses card transactions, tips, inventory item velocity, and payout times natively.',
    logoBg: 'bg-black',
    logoText: 'text-white',
    rating: '4.8 ★',
    details: 'Exposes location-specific daily transactions, register cash drawers, taxes, and automatic fee deductions.'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    developer: 'Intuit',
    category: 'Accounting & Tax',
    description: 'Keep accounts, automated tax reporting, and client ledger sheets reconciled. Auto-inject bank feeds or generate official Profit & Loss sheets directly.',
    logoBg: 'bg-emerald-600',
    logoText: 'text-white',
    rating: '4.7 ★',
    details: 'Syncs dynamic tax ledger logs daily, maps corporate inventory overhead accounts, and coordinates accounting fields.'
  },
  {
    id: 'xero',
    name: 'Xero Ledger Sync',
    developer: 'Xero Limited',
    category: 'Accounting & Tax',
    description: 'Double-entry cash flows and multi-currency registers. Imports customer bills automatically to balance internal ledger projections.',
    logoBg: 'bg-emerald-500',
    logoText: 'text-white',
    rating: '4.6 ★',
    details: 'Allows seamless synchronization of localized credit indicators, opex offsets, and tax schedules.'
  },
  {
    id: 'shopify',
    name: 'Shopify Checkout',
    developer: 'Shopify Inc.',
    category: 'eCommerce & Retail',
    description: 'Pulls digital cart orders, checkouts, and shipping line taxes instantly into forecasting spreadsheets. Perfect for hybrid online/brick-and-mortar storefronts.',
    logoBg: 'bg-emerald-500',
    logoText: 'text-emerald-950',
    rating: '4.9 ★',
    details: 'Supports automatic webhook broadcasts for incoming custom checkout actions and real-time order pricing indexes.'
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    developer: 'Stripe Inc.',
    category: 'eCommerce & Retail',
    description: 'Synchronize software subscriptions, global checkout portals, and delayed bank payout corridors into cash registers.',
    logoBg: 'bg-emerald-600',
    logoText: 'text-white',
    rating: '4.8 ★',
    details: 'Exposes webhook telemetry on customer refund indicators, rolling reserve variables, and conversion margins.'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp Campaigns',
    developer: 'Intuit',
    category: 'Customers & Marketing',
    description: 'Align newsletters, retail campaigns, promo coupons, and loyalty metrics with real-time financial purchase logs.',
    logoBg: 'bg-yellow-400',
    logoText: 'text-yellow-950',
    rating: '4.5 ★',
    details: 'Syncs campaign list actions, customer click-through weights, and conversion attributions.'
  },
  {
    id: 'hubspot',
    name: 'HubSpot Financial CRM',
    developer: 'HubSpot Inc.',
    category: 'Customers & Marketing',
    description: 'Keeps commercial contracts, enterprise deal runways, customer service logs, and high-value key account transactions synchronized with cash forecasts.',
    logoBg: 'bg-orange-500',
    logoText: 'text-white',
    rating: '4.6 ★',
    details: 'Auto-imports customer deal pipelines, estimated close probability ratios, and historical billing accounts.'
  }
];

const PRODUCT_PERFORMANCE_DATA = [
  { name: 'Ceramic Mug (Oat)', qty: 155, revenue: 4960, category: 'Stoneware', desc: 'Fired Earth Mug', sku: 'CER-ST-402' },
  { name: 'Terracotta Planter (L)', qty: 84, revenue: 4620, category: 'Terracotta', desc: 'Glazed Planter', sku: 'CER-TR-102' },
  { name: 'Porcelain Milk Jug', qty: 95, revenue: 3990, category: 'Porcelain', desc: 'Minimalist Porcelain', sku: 'CER-PR-054' },
  { name: 'Demitasse Teaset', qty: 18, revenue: 3330, category: 'Porcelain', desc: 'Porcelain Coffee Set', sku: 'CER-PR-981' },
  { name: 'Mixing Bowl (Sage)', qty: 21, revenue: 945, category: 'Stoneware', desc: 'Glazed Bowl', sku: 'CER-ST-330' },
  { name: 'Seedling Pot', qty: 50, revenue: 605, category: 'Terracotta', desc: 'Seedling Pot', sku: 'CER-TR-088' }
];

export function FinancialsView({ onNavigateToApps } = {}) {
  const [activeSubTab, setActiveSubTab] = useState('modeling');
  
  // App marketplace states
  const [connectedAppIds, setConnectedAppIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Square specific sync configs
  const [squareConfig, setSquareConfig] = useState(null);

  // Toggle to incorporate Square sales into the forecasting equation!
  const [incorporateSquare, setIncorporateSquare] = useState(true);

  // State to handle Connecting App Dialog
  const [connectingApp, setConnectingApp] = useState(null);
  const [stepAuth, setStepAuth] = useState(1);
  const [formMerchantId, setFormMerchantId] = useState('ML-89A7B31');
  const [formEnv, setFormEnv] = useState('sandbox');
  const [formToken, setFormToken] = useState('EAAAEO_sq_sandbox_token...');
  const [formLocation, setFormLocation] = useState('West Coast Retail Outlet');
  const [isLinkingInProcess, setIsLinkingInProcess] = useState(false);

  // Syncing States in financials from localStorage on mount
  useEffect(() => {
    try {
      const storedConnected = localStorage.getItem('pulse_connected_apps');
      if (storedConnected) {
        setConnectedAppIds(JSON.parse(storedConnected));
      } else {
        // Hydrate Square connected app by default for an initially functional presentation
        const initial = ['square'];
        setConnectedAppIds(initial);
        localStorage.setItem('pulse_connected_apps', JSON.stringify(initial));
      }

      const storedSquare = localStorage.getItem('pulse_square_config');
      if (storedSquare) {
        setSquareConfig(JSON.parse(storedSquare));
      } else {
        const initialSquare = {
          merchantId: 'ML-89A7B31',
          env: 'sandbox',
          token: 'EAAAEO_sq_sandbox_...',
          locationName: 'West Coast Retail Outlet',
          connectedAt: new Date().toLocaleDateString()
        };
        setSquareConfig(initialSquare);
        localStorage.setItem('pulse_square_config', JSON.stringify(initialSquare));
      }

      const storedInc = localStorage.getItem('pulse_incorporate_square');
      if (storedInc) {
        setIncorporateSquare(storedInc === 'true');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [estimateDate, setEstimateDate] = useState('');
  const [estimateTime, setEstimateTime] = useState('');
  const [estimatedIncome, setEstimatedIncome] = useState(null);

  // ERP Predictive Settings
  const [isAiPredictiveActive, setIsAiPredictiveActive] = useState(true);
  const [revenueMultiplier, setRevenueMultiplier] = useState(1.05); // +5% MRR growth
  const [expenseCoef, setExpenseCoef] = useState(1.02); // +2% expense expansion
  const [growthMode, setGrowthMode] = useState('moderate');

  const [parsedReport, setParsedReport] = useState(null);
  const [completedRecommendations, setCompletedRecommendations] = useState({});
  const [activeReportTab, setActiveReportTab] = useState('directives');
  const [simulationExtraCapital, setSimulationExtraCapital] = useState(0);

  // AI Briefing State
  const [aiReport, setAiReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingSquareReport, setIsGeneratingSquareReport] = useState(false);
  const [squareAiReport, setSquareAiReport] = useState('');

  // --- ACCRUALS VIEW STATE ---
  const [accrualsList, setAccrualsList] = useState([
    { id: 'AC-101', type: 'revenue', name: 'Unbilled Consulting Services', amount: 12500, date: '2026-05-20', status: 'accrued' },
    { id: 'AC-102', type: 'revenue', name: 'Completed Project Phase A', amount: 8000, date: '2026-05-25', status: 'recognized' },
    { id: 'AC-103', type: 'revenue', name: 'Retainer - June Sales Campaign Prep', amount: 4500, date: '2026-05-28', status: 'accrued' },
    { id: 'AC-201', type: 'expense', name: 'Unbilled Core Compute Fees', amount: 2400, date: '2026-05-15', status: 'accrued' },
    { id: 'AC-202', type: 'expense', name: 'Accrued Commissions & Payroll', amount: 5200, date: '2026-05-22', status: 'accrued' },
    { id: 'AC-203', type: 'expense', name: 'Retrospective Corporate Audit Fees', amount: 3500, date: '2026-05-24', status: 'recognized' }
  ]);

  const [newAccrualName, setNewAccrualName] = useState('');
  const [newAccrualAmount, setNewAccrualAmount] = useState('');
  const [newAccrualType, setNewAccrualType] = useState('revenue');
  const [newAccrualDate, setNewAccrualDate] = useState('2026-05-29');

  const handleAddAccrual = (e) => {
    e.preventDefault();
    if (!newAccrualName || !newAccrualAmount) return;
    const amountVal = parseFloat(newAccrualAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newAccrual = {
      id: `AC-${Math.floor(100 + Math.random() * 900)}`,
      type: newAccrualType,
      name: newAccrualName,
      amount: amountVal,
      date: newAccrualDate || new Date().toISOString().split('T')[0],
      status: 'accrued'
    };

    setAccrualsList([newAccrual, ...accrualsList]);
    setNewAccrualName('');
    setNewAccrualAmount('');
  };

  const toggleAccrualStatus = (id) => {
    setAccrualsList(accrualsList.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'accrued' ? 'recognized' : 'accrued' }
        : item
    ));
  };

  const deleteAccrual = (id) => {
    setAccrualsList(accrualsList.filter(item => item.id !== id));
  };

  // --- CASH ANALYSIS VIEW STATE ---
  const [cashBalance, setCashBalance] = useState(245000);
  const [cashInflowRate, setCashInflowRate] = useState(135000);
  const [cashOutflowRate, setCashOutflowRate] = useState(98400);

  const [productSortBy, setProductSortBy] = useState('revenue');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  const [cashHistData] = useState([
    { month: 'Jan', inflow: 110000, outflow: 85000, net: 25000 },
    { month: 'Feb', inflow: 125000, outflow: 82000, net: 43000 },
    { month: 'Mar', inflow: 135000, outflow: 95000, net: 40000 },
    { month: 'Apr', inflow: 120000, outflow: 102000, net: 18000 },
    { month: 'May', inflow: 145000, outflow: 99000, net: 46000 },
    { month: 'Jun', inflow: 155000, outflow: 104000, net: 51000 },
    { month: 'Jul', inflow: 150000, outflow: 105000, net: 45000 },
  ]);

  // --- BUDGET VS ACTUALS STATE ---
  const [budgetVsActuals, setBudgetVsActuals] = useState([
    { id: 'BA-001', category: 'Product Sales Revenue', budget: 130000, actual: 135000 },
    { id: 'BA-002', category: 'Staff Salaries & Perks', budget: 52000, actual: 51000 },
    { id: 'BA-003', category: 'Digital & Growth Marketing', budget: 22000, actual: 25500 },
    { id: 'BA-004', category: 'Professional Advice & Legal', budget: 8000, actual: 7200 },
    { id: 'BA-005', category: 'Server Infrastructure & SaaS', budget: 6000, actual: 6800 },
    { id: 'BA-006', category: 'Corporate Rent & Utilities', budget: 7500, actual: 7500 }
  ]);
  const [searchTermBVA, setSearchTermBVA] = useState('');

  const updateBudgetVal = (id, value) => {
    setBudgetVsActuals(prev => prev.map(item => 
      item.id === id ? { ...item, budget: value } : item
    ));
  };

  // --- ROLLING FORECAST STATE ---
  const [rollingBaselineRev, setRollingBaselineRev] = useState(150000);
  const [rollingBaselineExp, setRollingBaselineExp] = useState(92000);
  const [rollingBaselineCash, setRollingBaselineCash] = useState(250000);
  const [rollingRevGrowth, setRollingRevGrowth] = useState(3.5); // MoM % growth
  const [rollingExpGrowth, setRollingExpGrowth] = useState(1.8); // MoM % growth

  // 1. Calculate Standard Historical KPI with optional Square addition
  const isSquareConnected = connectedAppIds.includes('square');
  const squareGrossSales = 18450;
  const squareFeesExpenses = 535.25;

  const baseRevenue = HISTORICAL_DATA.reduce((sum, item) => sum + item.revenue, 0);
  const baseExpenses = HISTORICAL_DATA.reduce((sum, item) => sum + item.expenses, 0);

  const totalRevenueYtd = (isSquareConnected && incorporateSquare) 
    ? baseRevenue + squareGrossSales 
    : baseRevenue;

  const totalExpensesYtd = (isSquareConnected && incorporateSquare) 
    ? baseExpenses + squareFeesExpenses 
    : baseExpenses;

  const currentProfitMargin = ((totalRevenueYtd - totalExpensesYtd) / totalRevenueYtd) * 100;

  // 2. Compute ERP Forecast
  const generateForecastingData = () => {
    const data = HISTORICAL_DATA.map(item => {
      let r = item.revenue;
      let e = item.expenses;
      if (isSquareConnected && incorporateSquare) {
        r += Math.round(squareGrossSales / HISTORICAL_DATA.length);
        e += Math.round(squareFeesExpenses / HISTORICAL_DATA.length);
      }
      return {
        ...item,
        revenue: r,
        expenses: e,
        predRevenue: item.month === 'Jul' ? r : null,
        predExpenses: item.month === 'Jul' ? e : null,
      };
    });

    if (!isAiPredictiveActive) return data;

    let scaling = 1.0;
    if (growthMode === 'aggressive') scaling = 1.12;
    if (growthMode === 'conservative') scaling = 0.96;

    let currentRev = data[data.length - 1].revenue;
    let currentExp = data[data.length - 1].expenses;

    const months = ['Aug', 'Sep', 'Oct'];
    months.forEach((m) => {
      const nextRev = Math.round(currentRev * (revenueMultiplier - 1 + 1) * scaling);
      const nextExp = Math.round(currentExp * (expenseCoef - 1 + 1));
      
      data.push({
        month: `${m} (F)`,
        predRevenue: nextRev,
        predExpenses: nextExp,
        isForecast: true
      });

      currentRev = nextRev;
      currentExp = nextExp;
    });

    return data;
  };

  const currentChartData = generateForecastingData();

  const predictedThreeMonthRev = isAiPredictiveActive 
    ? (currentChartData[7]?.predRevenue || 0) + (currentChartData[8]?.predRevenue || 0) + (currentChartData[9]?.predRevenue || 0)
    : 0;
  const predictedThreeMonthExp = isAiPredictiveActive 
    ? (currentChartData[7]?.predExpenses || 0) + (currentChartData[8]?.predExpenses || 0) + (currentChartData[9]?.predExpenses || 0)
    : 0;
  
  const predictedMargin = predictedThreeMonthRev 
    ? ((predictedThreeMonthRev - predictedThreeMonthExp) / predictedThreeMonthRev) * 100
    : currentProfitMargin;

  const aiRecommendedCashBuffer = Math.round(predictedThreeMonthExp * 1.25);

  const handleGenerateReport = async (focusArea) => {
    setIsGeneratingReport(true);
    setAiReport('');
    setParsedReport(null);
    setCompletedRecommendations({});

    const query = `Please provide a detailed ERP financial analysis and forecasting report. 
Given:
- YTD Revenue: $${totalRevenueYtd.toLocaleString()} ${isSquareConnected && incorporateSquare ? '(Incorporate Square POS Sales included)' : ''}
- YTD Expenses: $${totalExpensesYtd.toLocaleString()}
- Current Profit Margin: ${currentProfitMargin.toFixed(1)}%
- Scenario Mode: ${growthMode.toUpperCase()} (${growthMode === 'aggressive' ? 'High Traction Expansion' : growthMode === 'conservative' ? 'Fiscal Restraction' : 'Standard Development'})
- Sliders: Revenue compound target=${Math.round((revenueMultiplier-1)*105)}%, Expenses coefficient=${Math.round((expenseCoef-1)*102)}%
- Target focus category for planning: ${focusArea}

You MUST respond strictly with a valid JSON object matching the requested schema.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: query }] })
      });

      if (!res.ok) throw new Error('Failed to get report');
      const data = await res.json();
      const reply = data.reply;
      setAiReport(reply);

      let cleanJson = reply.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      try {
        const parsed = JSON.parse(cleanJson);
        if (parsed?.executiveSummary && Array.isArray(parsed.recommendations)) {
          setParsedReport(parsed);
        }
      } catch (jsonErr) {
        console.warn("Failed standard JSON parsing. Using styled markdown fallback stream.", jsonErr);
      }
    } catch (e) {
      console.error(e);
      setAiReport("Failed to sync with ERP intelligence nodes. Please try running the report simulation again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateSquareReport = async () => {
    setIsGeneratingSquareReport(true);
    setSquareAiReport('');

    const query = `Provide a professional merchant data analysis for this active Square POS terminal.
Information points:
- Active Merchant Location: ${squareConfig?.locationName || 'Main Store'} (Environment: ${squareConfig?.env || 'sandbox'})
- Square YTD Gross POS volume: $18,450.00
- Processing Fees Collected: $535.25 (Net deposited: $17,914.75)
- Number of recorded sales transactions: 530 average ticket $34.80`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: query }] })
      });

      if (!res.ok) throw new Error('Failed to get report');
      const data = await res.json();
      setSquareAiReport(data.reply);
    } catch (e) {
      console.error(e);
      setSquareAiReport("Failed to consult with Square AI nodes. Check API tokens.");
    } finally {
      setIsGeneratingSquareReport(false);
    }
  };

  const handleEstimate = () => {
    if (!estimateDate) return;
    const baseHourly = 2500;
    const baseDaily = 45000;
    const hourVariance = estimateTime ? (parseInt(estimateTime.split(':')[0]) % 12) * 100 : 0;
    const randomVariance = Math.floor(Math.random() * 500);
    
    if (estimateTime) {
      setEstimatedIncome(baseHourly + hourVariance + randomVariance);
    } else {
      setEstimatedIncome(baseDaily + (randomVariance * 12));
    }
  };

  const handleInitiateConnect = (app) => {
    setConnectingApp(app);
    setStepAuth(1);
    setIsLinkingInProcess(false);
    if (app.id === 'square') {
      setFormMerchantId(squareConfig?.merchantId || 'ML-89A7B31');
      setFormEnv(squareConfig?.env || 'sandbox');
      setFormToken(squareConfig?.token || 'EAAAEO_sq_sandbox_token...');
      setFormLocation(squareConfig?.locationName || 'West Coast Retail Outlet');
    } else {
      setFormMerchantId('MERCH-' + Math.floor(1000 + Math.random() * 9000));
      setFormEnv('sandbox');
      setFormToken('AUTH_TOKEN_' + Math.floor(100000 + Math.random() * 900000));
      setFormLocation('Central Warehouse Depot');
    }
  };

  const handleFinishConnect = async () => {
    if (!connectingApp) return;
    setIsLinkingInProcess(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedAppIds = [...connectedAppIds.filter(id => id !== connectingApp.id), connectingApp.id];
    setConnectedAppIds(updatedAppIds);
    localStorage.setItem('pulse_connected_apps', JSON.stringify(updatedAppIds));

    if (connectingApp.id === 'square') {
      const newSquareConfig = {
        merchantId: formMerchantId,
        env: formEnv,
        token: formToken,
        locationName: formLocation,
        connectedAt: new Date().toLocaleDateString()
      };
      setSquareConfig(newSquareConfig);
      localStorage.setItem('pulse_square_config', JSON.stringify(newSquareConfig));
    }

    setIsLinkingInProcess(false);
    setConnectingApp(null);
  };

  const handleDisconnectApp = (appId) => {
    const updated = connectedAppIds.filter(id => id !== appId);
    setConnectedAppIds(updated);
    localStorage.setItem('pulse_connected_apps', JSON.stringify(updated));
    if (appId === 'square') {
      setSquareConfig(null);
      localStorage.removeItem('pulse_square_config');
    }
  };

  const handleToggleSquareIncorporate = (checked) => {
    setIncorporateSquare(checked);
    localStorage.setItem('pulse_incorporate_square', String(checked));
  };

  const MARKETPLACE_CATEGORIES = ['All', 'Accounting & Tax', 'eCommerce & Retail', 'Customers & Marketing', 'Operations & POS'];
  const filteredApps = MARKETPLACE_APPS.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const squareTransactions = [
    { id: 'SQ-TX-901', item: 'Glazed Terracotta Planter (Large)', timestamp: 'Today, 2:14 PM', qty: 2, gross: 110.00, fee: 3.49, net: 106.51, status: 'Settled', method: 'Tap Visa (•••• 9012)' },
    { id: 'SQ-TX-900', item: 'Fired Earth Ceramic Mug (Oat)', timestamp: 'Today, 1:30 PM', qty: 1, gross: 32.00, fee: 1.23, net: 30.77, status: 'Settled', method: 'Apple Pay' },
    { id: 'SQ-TX-899', item: 'Minimalist Porcelain Milk Jug', timestamp: 'Today, 11:45 AM', qty: 1, gross: 42.00, fee: 1.52, net: 40.48, status: 'Settled', method: 'Tap Mastercard (•••• 8821)' },
    { id: 'SQ-TX-898', item: 'Porcelain Demitasse Coffee Teaset', timestamp: 'Yesterday, 4:10 PM', qty: 1, gross: 185.00, fee: 5.67, net: 179.33, status: 'Settled', method: 'Swipe Amex (•••• 1004)' },
    { id: 'SQ-TX-897', item: 'Glazed Mixing Bowl (Sage)', timestamp: 'Yesterday, 2:15 PM', qty: 2, gross: 90.00, fee: 2.91, net: 87.09, status: 'Settled', method: 'Chip Visa (•••• 3311)' },
    { id: 'SQ-TX-896', item: 'Terracotta Seedling Pot', timestamp: 'Yesterday, 10:20 AM', qty: 4, gross: 48.00, fee: 1.69, net: 46.31, status: 'Settled', method: 'Cash' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10 mt-6 select-none" id="financials-main-view">
      
      {/* Header */}
      <div className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3 animate-in fade-in">
            Financials & Directives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Perform statistical operations, configure growth parameters, and trace real-time synced store transaction feeds.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveSubTab('modeling')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap ${
              activeSubTab === 'modeling' 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
            id="tab-btn-modeling"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Projections
          </button>

          <button
            onClick={() => setActiveSubTab('accruals')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap ${
              activeSubTab === 'accruals' 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
            id="tab-btn-accruals"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" /> Accruals
          </button>

          <button
            onClick={() => setActiveSubTab('cash-analysis')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap ${
              activeSubTab === 'cash-analysis' 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
            id="tab-btn-cash-analysis"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Cash Analysis
          </button>

          <button
            onClick={() => setActiveSubTab('budget-vs-actuals')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap ${
              activeSubTab === 'budget-vs-actuals' 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
            id="tab-btn-budget-vs-actuals"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-500" /> Budget vs Actuals
          </button>

          <button
            onClick={() => setActiveSubTab('rolling-forecast')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap ${
              activeSubTab === 'rolling-forecast' 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
            id="tab-btn-rolling-forecast"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-500" /> Rolling Forecast
          </button>
          
          <button
            onClick={() => setActiveSubTab('square-hub')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap ${
              activeSubTab === 'square-hub' 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
            id="tab-btn-sales-feed"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" /> Sales Feed
            {isSquareConnected ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. MODELING TAB */}
      {activeSubTab === 'modeling' && (
        <div className="space-y-6 animate-in fade-in duration-300" id="modeling-content-workspace">
          
          {/* Sub-Header Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Pulse Predictive Financial modeling
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> ERP Core Intelligence
                </span>
                {isSquareConnected && incorporateSquare && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Square POS figures linked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Compounding operational expenses with variable revenue projections to predict Cash runway buffers.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
              <label className="text-xs font-bold text-slate-600 tracking-wider uppercase flex items-center gap-1.5 cursor-pointer select-none">
                <Bot className={`w-4 h-4 ${isAiPredictiveActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                Predictive Forecasting
              </label>
              <button 
                type="button" 
                onClick={() => setIsAiPredictiveActive(!isAiPredictiveActive)} 
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isAiPredictiveActive ? 'bg-emerald-600' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${isAiPredictiveActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Primary Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAiPredictiveActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Combined Revenue</span>
              </div>
              <div>
                <p className="text-3xl font-light text-slate-950">${(totalRevenueYtd / 1000).toFixed(1)}k <span className="text-xs font-semibold text-slate-400">YTD</span></p>
                {isSquareConnected && incorporateSquare && (
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">Includes ${squareGrossSales.toLocaleString()} from Square integration</p>
                )}
                {isAiPredictiveActive && (
                  <div className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1 bg-emerald-50/50 py-1 px-2 rounded-lg w-max select-none">
                    AI Q3 Forecast: +${Math.round(predictedThreeMonthRev / 1000)}k
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAiPredictiveActive ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Combined Expenses</span>
              </div>
              <div>
                <p className="text-3xl font-light text-slate-950">${(totalExpensesYtd / 1000).toFixed(1)}k <span className="text-xs font-semibold text-slate-400">YTD</span></p>
                {isSquareConnected && incorporateSquare && (
                  <p className="text-[10px] text-rose-600/80 font-medium mt-1">Includes ${squareFeesExpenses.toFixed(0)} payment fees</p>
                )}
                {isAiPredictiveActive && (
                  <div className="text-[11px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 bg-rose-50/50 py-1 px-2 rounded-lg w-max select-none">
                    AI Q3 OpEx: +${Math.round(predictedThreeMonthExp / 1000)}k
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-sans font-black">Consolidated Margin</span>
              </div>
              <div>
                <p className="text-3xl font-light text-slate-950 animate-bounce-slow">
                  {isAiPredictiveActive ? predictedMargin.toFixed(1) : currentProfitMargin.toFixed(1)}%
                </p>
                <div className="text-xs text-emerald-600 mt-1.5 font-semibold">
                  {isAiPredictiveActive ? `Reflecting ${growthMode} mode variables` : 'Calculated YTD static historic actuals'}
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Charts and Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col min-h-[360px]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Financial Trends & Projections
                </h3>
                {isAiPredictiveActive && (
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Simulated Forecast Window Engaged
                  </span>
                )}
              </div>

              <div className="h-80 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -2px rgb(0 0 0 / 0.05)', backgroundColor: 'white' }}
                      formatter={(value, name) => {
                        const formattedName = name === 'revenue' ? 'Revenue (Historic)' 
                                            : name === 'expenses' ? 'Expenses (Historic)' 
                                            : name === 'predRevenue' ? 'Modeled Revenue Forecast'
                                            : 'Modeled Expenses Forecast';
                        return [`$${value?.toLocaleString()}`, formattedName];
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} iconType="circle" />
                    
                    {/* Historical Lines */}
                    <Line type="monotone" name="revenue" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
                    <Line type="monotone" name="expenses" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
                    
                    {/* Forecast / Predictive Lines */}
                    {isAiPredictiveActive && (
                      <Line type="monotone" name="predRevenue" dataKey="predRevenue" stroke="#059669" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 1, stroke: '#059669' }} connectNulls />
                    )}
                    {isAiPredictiveActive && (
                      <Line type="monotone" name="predExpenses" dataKey="predExpenses" stroke="#dc2626" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 1, stroke: '#dc2626' }} connectNulls />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Controls Panel */}
            <div className={`bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${isAiPredictiveActive ? 'border-slate-200' : 'opacity-70 border-dashed border-slate-200 pointer-events-none'}`}>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Predictive Control Panel</h3>
                </div>
                
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Dynamically manipulate factors to model business growth. Projections auto-update based on active formulas.
                </p>

                <div className="space-y-5">
                  {/* Growth Velocity Mode Selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                      AI Projection Velocity Mode
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                      {['moderate', 'aggressive', 'conservative'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setGrowthMode(mode)}
                          className={`text-[9.5px] lg:text-[9px] xl:text-[10px] font-bold py-1.5 px-0.5 rounded-lg capitalize tracking-tight transition-colors cursor-pointer truncate ${
                            growthMode === mode 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'text-slate-600 hover:text-slate-800'
                          }`}
                          title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MoM Revenue Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">MoM Revenue Target</span>
                      <span className="font-mono text-emerald-600 font-bold">
                        +{Math.round((revenueMultiplier - 1) * 105)}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0.95" 
                      max="1.30" 
                      step="0.01" 
                      value={revenueMultiplier} 
                      onChange={e => setRevenueMultiplier(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none" 
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                      <span>Decline (-5%)</span>
                      <span>Hypergrowth (+30%)</span>
                    </div>
                  </div>

                  {/* OpEx Expansion Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">OpEx Expansion factor</span>
                      <span className="font-mono text-emerald-600 font-bold">
                        +{Math.round((expenseCoef - 1) * 102)}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0.98" 
                      max="1.15" 
                      step="0.01" 
                      value={expenseCoef} 
                      onChange={e => setExpenseCoef(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none" 
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                      <span>Downsize (-2%)</span>
                      <span>Expansion (+15%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash Buffer Card */}
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">AI Safe Capital Buffer</span>
                  <span className="font-mono font-bold text-slate-800">
                    ${aiRecommendedCashBuffer.toLocaleString()}
                  </span>
                </div>
                <div className="bg-emerald-50/50 p-2 text-[10px] text-indigo-900 leading-tight rounded-lg flex gap-1.5 items-center">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Recommended reserve buffer based on {growthMode} scenario modeling.</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Auditor Advisory Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">ERP AI Auditor & Advisory Report</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Construct critical financial directives by analyzing live variables via Gemini.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  disabled={isGeneratingReport}
                  onClick={() => handleGenerateReport('Capital Conservation')}
                  className="bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors text-slate-700 font-bold px-4 py-2 rounded-lg text-xs uppercase"
                >
                  Conservation
                </button>
                <button 
                  disabled={isGeneratingReport}
                  onClick={() => handleGenerateReport('Aggressive Expansion')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs uppercase transition-colors"
                >
                  Hypergrowth Strategy
                </button>
              </div>
            </div>

            {isGeneratingReport ? (
              <div className="p-8 bg-slate-50 rounded-xl flex flex-col items-center justify-center space-y-3 shadow-inner">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-600 animate-pulse">Pulse AI is assessing balance variables & auditing historical ledgers...</p>
              </div>
            ) : aiReport ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header controls for report */}
                <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-950">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-widest font-sans text-slate-300">Executive Directive Report Generated</span>
                  </div>
                  <button 
                    onClick={() => { setAiReport(''); setParsedReport(null); setCompletedRecommendations({}); }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold px-3 py-1.5 rounded-lg border border-slate-700 uppercase cursor-pointer transition-colors"
                  >
                    Clear Auditor Report
                  </button>
                </div>

                {parsedReport ? (
                  <div className="space-y-6">
                    {/* Executive Summary Card */}
                    <div className="bg-emerald-50/75 border border-emerald-100 p-5 rounded-2xl relative">
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-white rounded-lg px-2.5 py-1 border border-emerald-100 shadow-3xs uppercase">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Audit Dynamic
                      </div>
                      <h4 className="font-extrabold text-[#0D5C3A] text-xs tracking-wider uppercase mb-1 flex items-center gap-1">
                        <Info className="w-4 h-4" /> Chief Auditor Summary
                      </h4>
                      <p className="text-[#0E3D26] text-xs md:text-sm font-medium leading-relaxed max-w-4xl select-text">
                        {parsedReport.executiveSummary}
                      </p>
                    </div>

                    {/* Report Panels Tab Menu */}
                    <div className="flex border-b border-slate-200">
                      <button
                        onClick={() => setActiveReportTab('directives')}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider px-4 transition-colors relative cursor-pointer ${
                          activeReportTab === 'directives' 
                            ? 'text-slate-800 font-black' 
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        📋 Tactical Directives ({parsedReport.recommendations.length})
                        {activeReportTab === 'directives' && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 animate-in duration-200" />}
                      </button>
                      <button
                        onClick={() => setActiveReportTab('risks')}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider px-4 transition-colors relative cursor-pointer ${
                          activeReportTab === 'risks' 
                            ? 'text-slate-800 font-black' 
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        ⚠️ Threat Ledger ({parsedReport.riskFactors?.length || 0})
                        {activeReportTab === 'risks' && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 animate-in duration-200" />}
                      </button>
                    </div>

                    {/* Directives Tab */}
                    {activeReportTab === 'directives' && (
                      <div className="space-y-4">
                        {parsedReport.recommendations.map((rec, idx) => {
                          const completed = completedRecommendations[idx] || false;
                          const isHigh = rec.impact === 'High';
                          const isMed = rec.impact === 'Medium';
                          const themeColor = isHigh ? 'border-l-rose-500 bg-rose-50/5' : isMed ? 'border-l-amber-500 bg-amber-50/5' : 'border-l-indigo-500 bg-indigo-50/5';

                          return (
                            <div 
                              key={idx} 
                              className={`p-5 bg-white border border-slate-200 border-l-4 rounded-xl shadow-2xs hover:border-slate-300 transition-all ${themeColor} ${
                                completed ? 'opacity-65 line-through border-l-slate-400' : ''
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded ${
                                    isHigh ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                    isMed ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }`}>
                                    {rec.impact} Impact
                                  </span>
                                  <span className="text-[8px] bg-slate-100 text-slate-600 border px-2 py-0.5 rounded uppercase font-black tracking-wider">
                                    {rec.category}
                                  </span>
                                  <span className="text-[8px] bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    {rec.timeframe}
                                  </span>
                                </div>

                                <button
                                  onClick={() => setCompletedRecommendations(prev => ({ ...prev, [idx]: !completed }))}
                                  className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 border rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                                    completed 
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200' 
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  {completed ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                                  {completed ? 'Recommendation Active' : 'Mark as Implemented'}
                                </button>
                              </div>

                              <h5 className="font-extrabold text-slate-800 text-sm leading-snug">{rec.title}</h5>
                              <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line select-text font-sans">
                                {rec.details}
                              </p>

                              <div className="mt-4 pt-3.5 border-t border-dashed border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                                <div className="bg-slate-50/75 p-2.5 rounded-lg border border-slate-100">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Interactive Audit Checklist directive</span>
                                  <span className="font-semibold text-slate-700">{rec.actionItem}</span>
                                </div>
                                <div className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
                                  <div>
                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Projected positive friction delta</span>
                                    <span className="font-bold text-emerald-950">{rec.metricProjected}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Threat mitigation ledger */}
                    {activeReportTab === 'risks' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {parsedReport.riskFactors?.map((risk, index) => {
                          const isCrit = risk.threatLevel === 'Critical';
                          return (
                            <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Risk Factor #{index+1}</span>
                                <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded border ${
                                  isCrit ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                                }`}>
                                  {risk.threatLevel} Alert Level
                                </span>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Audited Vulnerability</span>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed select-text">{risk.factor}</p>
                              </div>

                              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg space-y-1">
                                <span className="text-[8px] font-black text-indigo-700 uppercase tracking-wider block">Advisor Recommended Policy Workflow</span>
                                <p className="text-xs text-indigo-950 leading-relaxed select-text font-sans">{risk.mitigation}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback to styled Markdown */
                  <div className="p-6 bg-[#FAFBFB] border border-slate-200 rounded-xl prose prose-sm max-w-none prose-indigo leading-relaxed relative select-text shadow-sm animate-in fade-in duration-300 font-sans">
                    <ReactMarkdown>{aiReport}</ReactMarkdown>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Bot className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-semibold">Select a strategy theme above to request a Live forecast audit from the AI Node.</p>
              </div>
            )}
          </div>

          {/* Probability Estimator Tool */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Historic Lead Probability Estimation Tool
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Calculate expected revenues or sales density parameters for customizable timelines based on local historical velocity indices.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  Target Date
                </label>
                <input 
                  type="date" 
                  value={estimateDate}
                  onChange={(e) => setEstimateDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm font-medium outline-none bg-white focus:border-emerald-500"
                />
              </div>
              
              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Target Hour (Optional)
                </label>
                <input 
                  type="time" 
                  value={estimateTime}
                  onChange={(e) => setEstimateTime(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm font-medium outline-none bg-white focus:border-emerald-500"
                />
              </div>
              
              <div className="w-full md:w-1/3">
                <button 
                  onClick={handleEstimate}
                  disabled={!estimateDate}
                  className="w-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 h-[42px] rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Run Lead Audit
                </button>
              </div>
            </div>

            {estimatedIncome !== null && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between animate-in zoom-in-95 duration-200">
                <div>
                  <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Modeled Target Return Estimate</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Projection for {new Date(estimateDate + 'T00:00:00').toLocaleDateString()} {estimateTime ? `at ${estimateTime}` : '(Daily Avg)'}
                  </p>
                </div>
                <div className="text-2xl font-bold text-indigo-900 font-mono">
                  ${estimatedIncome.toLocaleString()}
                  {estimateTime ? <span className="text-sm font-normal text-emerald-600 ml-1">/ hr</span> : <span className="text-sm font-normal text-emerald-600 ml-1">/ day</span>}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. ACCRUALS TAB */}
      {activeSubTab === 'accruals' && (
        <div className="space-y-6 animate-in fade-in duration-300 shadow-sm" id="accruals-workspace">
          
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Accruals Recognition Ledger
                </h2>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                  Accrual-Basis Accounting
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Record earned revenues and incurred liabilities before cash changes hands to maintain GAAP regulatory balance sheets.
              </p>
            </div>
          </div>

          {/* KPI Summary Cards */}
          {(() => {
            const accruedRev = accrualsList.filter(a => a.type === 'revenue' && a.status === 'accrued').reduce((sum, a) => sum + a.amount, 0);
            const accruedExp = accrualsList.filter(a => a.type === 'expense' && a.status === 'accrued').reduce((sum, a) => sum + a.amount, 0);
            const netWorkingCap = accruedRev - accruedExp;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest block mb-1">Total Accrued Revenue</span>
                  <p className="text-2xl font-mono font-black text-emerald-600">${accruedRev.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Revenues earned but not yet finalized/collected</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest block mb-1">Total Accrued Liabilities</span>
                  <p className="text-2xl font-mono font-black text-rose-600">${accruedExp.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Expenses incurred but not paid yet</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest block mb-1">Net Working Capital Accruals Offset</span>
                  <p className={`text-2xl font-mono font-black ${netWorkingCap >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    ${netWorkingCap.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Balance impact on current quarterly reporting</span>
                </div>
              </div>
            );
          })()}

          {/* Ledger Table & Form Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-700">Accruals Journal Entry Records</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle status to reconcile them into finalized ledger accounts</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Journal Code / Entry</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Value</th>
                      <th className="p-4">Status & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accrualsList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-extrabold text-emerald-700 block text-[10px]">{item.id}</span>
                          <span className="font-bold text-slate-800 mt-0.5 block">{item.name}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            item.type === 'revenue' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="p-4 font-mono font-extrabold text-slate-800">
                          ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 flex items-center gap-2 whitespace-nowrap">
                          <button
                            onClick={() => toggleAccrualStatus(item.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                              item.status === 'accrued' 
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer' 
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer'
                            }`}
                          >
                            {item.status === 'accrued' ? 'Mark Recognized' : 'Accrued Mode'}
                          </button>
                          <button
                            onClick={() => deleteAccrual(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-700 mb-4 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-500" />
                Schedule New Journal Entry
              </h3>
              
              <form onSubmit={handleAddAccrual} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">
                    Entry Description
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccrualName}
                    onChange={e => setNewAccrualName(e.target.value)}
                    className="w-full text-xs p-2.5 border bg-white rounded-lg outline-none font-sans font-bold text-slate-800 focus:border-emerald-500"
                    placeholder="e.g. Unsubmitted Client Retainer Fee"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">
                    Journal Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAccrualType('revenue')}
                      className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-colors border uppercase tracking-wider cursor-pointer ${
                        newAccrualType === 'revenue' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Revenue Asset
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAccrualType('expense')}
                      className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-colors border uppercase tracking-wider cursor-pointer ${
                        newAccrualType === 'expense' 
                          ? 'bg-rose-50 text-rose-700 border-rose-300' 
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Expense Liability
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">
                    Amount Value ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newAccrualAmount}
                    onChange={e => setNewAccrualAmount(e.target.value)}
                    className="w-full text-xs p-2.5 border bg-white rounded-lg outline-none font-mono font-bold text-slate-800 focus:border-emerald-500"
                    placeholder="e.g. 5200"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">
                    Posting Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newAccrualDate}
                    onChange={e => setNewAccrualDate(e.target.value)}
                    className="w-full text-xs p-2.5 border bg-white rounded-lg outline-none font-bold text-slate-800 focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Post Journal Entry Accrual
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. CASH ANALYSIS TAB */}
      {activeSubTab === 'cash-analysis' && (
        <div className="space-y-6 animate-in fade-in duration-300 shadow-sm" id="cash-analysis-workspace">
          
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Cash Flow Runway & Liquidity Analysis
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  Cash-Basis Health
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Evaluate liquid cash buffers, analyze Net burn rate parameters, and calculate financial survival runway indices.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts Inflow vs Outflow */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col min-h-[360px]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Historical Cash Inflow vs Outflow Dynamics
              </h3>

              <div className="h-80 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashHistData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(value) => `$${value / 1000}k`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}
                      formatter={(value, name) => [`$${value?.toLocaleString()}`, name === 'inflow' ? 'Cash Inflow' : 'Cash Outflow']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} iconType="circle" />
                    <Bar dataKey="inflow" fill="#0284c7" name="inflow" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="outflow" fill="#e11d48" name="outflow" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Runway Logic Controls & Simulation */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-4 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-500" />
                  Interactive Runway Simulator
                </h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Calibrate your balance and rate sliders to evaluate business runway indices instantly under stress scenarios.
                </p>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 text-[11px]">Liquid Cash Balance</span>
                      <span className="font-mono text-emerald-600 font-bold">${cashBalance.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min="50000" 
                      max="1000000" 
                      step="10000" 
                      value={cashBalance} 
                      onChange={e => setCashBalance(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none animate-in duration-200" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 text-[11px]">Monthly Cash Inflow</span>
                      <span className="font-mono text-emerald-600 font-bold">${cashInflowRate.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min="10000" 
                      max="300000" 
                      step="5000" 
                      value={cashInflowRate} 
                      onChange={e => setCashInflowRate(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none animate-in duration-200" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 text-[11px]">Monthly Cash Outflow</span>
                      <span className="font-mono text-rose-500 font-bold">${cashOutflowRate.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min="10000" 
                      max="300000" 
                      step="5000" 
                      value={cashOutflowRate} 
                      onChange={e => setCashOutflowRate(parseInt(e.target.value))}
                      className="w-full accent-rose-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none animate-in duration-200" 
                    />
                  </div>
                </div>
              </div>

              {(() => {
                const netMonthlyFlow = cashInflowRate - cashOutflowRate;
                const isPositive = netMonthlyFlow >= 0;
                const burnRate = isPositive ? 0 : Math.abs(netMonthlyFlow);
                const runwayMonths = isPositive ? Infinity : (cashBalance / burnRate);

                return (
                  <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        <span>Net Monthly Flow</span>
                        <span className={isPositive ? 'text-emerald-600' : 'text-rose-500'}>
                          {isPositive ? '+' : '-'}${Math.abs(netMonthlyFlow).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                        <span className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Survival Runway</span>
                        <span className={`text-lg font-mono font-black ${
                          isPositive ? 'text-emerald-600' : runwayMonths >= 12 ? 'text-emerald-600' : runwayMonths >= 6 ? 'text-amber-600' : 'text-rose-500'
                        }`}>
                          {isPositive ? '∞ Infinite' : `${runwayMonths.toFixed(1)} Mos`}
                        </span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg text-[10px] font-medium leading-tight flex gap-2 items-center border ${
                      isPositive ? 'bg-emerald-50 text-indigo-900 border-emerald-100 animate-in' : 'bg-rose-50 text-rose-900 border-rose-100 animate-pulse'
                    }`}>
                      <Info className="w-4 h-4 shrink-0" />
                      <span>
                        {isPositive 
                          ? "Cash flow positive! Your revenues exceed expenditures." 
                          : runwayMonths >= 12 
                          ? "Healthy buffer! Cash runway exceeds 12 months." 
                          : "Immediate Runway Danger! Cash will deplete in under 6 months."}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 4. BUDGET VS ACTUALS TAB */}
      {activeSubTab === 'budget-vs-actuals' && (
        <div className="space-y-6 animate-in fade-in duration-300 shadow-sm" id="budget-vs-actuals-workspace">
          
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  Budget vs Actual Expenditure Audits
                </h2>
              </div>
            </div>
          </div>

          {(() => {
            const totBudget = budgetVsActuals.reduce((sum, item) => sum + item.budget, 0);
            const totActual = budgetVsActuals.reduce((sum, item) => sum + item.actual, 0);
            const netVariance = totBudget - totActual;
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest block mb-1">Budget Limit</span>
                  <p className="text-2xl font-mono font-black text-slate-800">${totBudget.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest block mb-1">Corporate Expenses</span>
                  <p className="text-2xl font-mono font-black text-emerald-950">${totActual.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest block mb-1">Net Variance</span>
                  <p className={`text-2xl font-mono font-black ${netVariance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {netVariance >= 0 ? '+' : '-'}${Math.abs(netVariance).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Category</th>
                  <th className="p-4">Allocated Budget</th>
                  <th className="p-4">Actual Realized</th>
                  <th className="p-4">Variance Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetVsActuals.map((item) => {
                  const isRevenue = item.category.toLowerCase().includes('revenue') || item.category.toLowerCase().includes('sales');
                  const variance = isRevenue ? (item.actual - item.budget) : (item.budget - item.actual);
                  const isFavorable = variance >= 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{item.category}</td>
                      <td className="p-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.budget}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) updateBudgetVal(item.id, val);
                          }}
                          className="w-24 font-mono text-slate-800 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:border-emerald-500 outline-none"
                        />
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">${item.actual.toLocaleString()}</td>
                      <td className="p-4 whitespace-nowrap font-bold">
                        <span className={isFavorable ? 'text-emerald-600' : 'text-rose-500'}>
                          ${Math.abs(variance).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ROLLING FORECAST TAB */}
      {activeSubTab === 'rolling-forecast' && (
        <div className="space-y-6 animate-in fade-in duration-300 shadow-sm" id="rolling-forecast-workspace">
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                12-Month Continuous Rolling Forecast Simulation
              </h2>
            </div>
          </div>

          {(() => {
            let runningRev = rollingBaselineRev;
            let runningExp = rollingBaselineExp;
            let runningCash = rollingBaselineCash;
            
            const months = [
              'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027', 
              'Feb 2027', 'Mar 2027', 'Apr 2027', 'May 2027', 'Jun 2027', 'Jul 2027'
            ];

            const forecastData = months.map(m => {
              runningRev = Math.round(runningRev * (1 + rollingRevGrowth / 100));
              runningExp = Math.round(runningExp * (1 + rollingExpGrowth / 100));
              const netFlow = runningRev - runningExp;
              runningCash += netFlow;
              return {
                month: m,
                revenue: runningRev,
                expenses: runningExp,
                netFlow,
                cumulativeCash: runningCash
              };
            });

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-700">Simulation Controls</h3>
                  
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Starting Cash (${rollingBaselineCash.toLocaleString()})</span>
                    <input 
                      type="range" 
                      min="50000" 
                      max="1000000" 
                      step="10000" 
                      value={rollingBaselineCash} 
                      onChange={e => setRollingBaselineCash(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer" 
                    />
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Baseline Rev (${rollingBaselineRev.toLocaleString()})</span>
                    <input 
                      type="range" 
                      min="50000" 
                      max="500000" 
                      step="5000" 
                      value={rollingBaselineRev} 
                      onChange={e => setRollingBaselineRev(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg" 
                    />
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">MoM Revenue growth (+{rollingRevGrowth}%)</span>
                    <input 
                      type="range" 
                      min="-2" 
                      max="10" 
                      step="0.1" 
                      value={rollingRevGrowth} 
                      onChange={e => setRollingRevGrowth(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg" 
                    />
                  </div>
                </div>

                {/* Table Overview */}
                <div className="lg:col-span-2 bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-105 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="p-3">Schedule Month</th>
                        <th className="p-3">Projected Revenue</th>
                        <th className="p-3">Projected Expense</th>
                        <th className="p-3 text-right">Cumulative Cash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {forecastData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-sans font-bold text-slate-800">{item.month}</td>
                          <td className="p-3 text-emerald-600">${item.revenue.toLocaleString()}</td>
                          <td className="p-3 text-rose-500">${item.expenses.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-slate-800">${item.cumulativeCash.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 6. SQUARE HUB TAB */}
      {activeSubTab === 'square-hub' && (
        <div className="space-y-6 animate-in fade-in duration-300" id="square-hub-content-workspace">
          {!isSquareConnected ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-4">
              <ShoppingBag className="w-8 h-8 text-slate-400" />
              <h3>Sales Feed Offline</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-black text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-mono">
                    {squareConfig?.locationName}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Merchant API Connection Online ({squareConfig?.env})
                  </p>
                </div>
              </div>

              {/* Product Performance Statistics */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="product-performance-stats-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-700 flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-emerald-600 animate-pulse" /> Product Sales & Revenue Contributions
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select 
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="bg-slate-50 border px-2 py-1 rounded-lg text-xs"
                    >
                      <option value="All">All Clays</option>
                      <option value="Porcelain">Porcelain</option>
                      <option value="Terracotta">Terracotta</option>
                      <option value="Stoneware">Stoneware</option>
                    </select>

                    <button
                      onClick={() => setProductSortBy(productSortBy === 'revenue' ? 'qty' : 'revenue')}
                      className="bg-slate-100 hover:bg-slate-200 text-[10px] font-bold px-3 py-1.5 rounded-lg text-slate-705 uppercase"
                    >
                      Sort: {productSortBy === 'revenue' ? 'Revenue' : 'Volume'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Chart Bar */}
                  <div className="lg:col-span-5 bg-slate-50 border p-4 rounded-xl flex flex-col justify-between h-[340px]">
                    <div className="h-60 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[...PRODUCT_PERFORMANCE_DATA]
                            .filter(p => productCategoryFilter === 'All' || p.category === productCategoryFilter)
                            .sort((a, b) => b[productSortBy] - a[productSortBy])
                          }
                          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                          <XAxis type="number" fontSize={9} />
                          <YAxis dataKey="name" type="category" width={100} fontSize={8} />
                          <RechartsTooltip />
                          <Bar dataKey={productSortBy === 'revenue' ? 'revenue' : 'qty'} fill="#059669" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right Rankings List */}
                  <div className="lg:col-span-7 flex flex-col space-y-4 h-[340px] overflow-hidden">
                    <div className="overflow-y-auto pr-1 flex-1">
                      <table className="w-full text-left text-[10px] border-collapse font-sans">
                        <thead>
                          <tr className="bg-slate-50 border-b font-bold text-slate-400 uppercase tracking-widest leading-none">
                            <th className="p-3">Rank / Product</th>
                            <th className="p-3">Clay type</th>
                            <th className="p-3 text-right">Units sold</th>
                            <th className="p-3 text-right">Gross Rev</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[...PRODUCT_PERFORMANCE_DATA]
                            .filter(p => productCategoryFilter === 'All' || p.category === productCategoryFilter)
                            .sort((a, b) => b[productSortBy] - a[productSortBy])
                            .map((p, idx) => {
                              const revenuePct = ((p.revenue / squareGrossSales) * 100).toFixed(1);
                              return (
                                <tr key={p.sku} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                                  <td className="p-3 font-bold text-emerald-800">{p.category}</td>
                                  <td className="p-3 text-right font-bold text-slate-700">{p.qty}</td>
                                  <td className="p-3 text-right font-black text-slate-800">${p.revenue}</td>
                                </tr>
                              );
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONNECT APP HANDSHAKE MODAL */}
      {connectingApp && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden p-6 space-y-5">
            <h3 className="font-bold text-xs uppercase tracking-wider">Link {connectingApp.name} Sync</h3>
            <button
              onClick={() => setConnectingApp(null)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
