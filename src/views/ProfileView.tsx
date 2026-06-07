import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Mail, 
  Shield, 
  User as UserIcon, 
  Calendar, 
  Briefcase, 
  Activity,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Info,
  Trash2,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Key,
  Building,
  MapPin,
  Sliders,
  Sparkles,
  Link2,
  Loader2,
  LayoutDashboard,
  Boxes,
  HelpCircle,
  Users,
  Megaphone,
  LineChart as LineChartIcon,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { generateRandomSecret, verifyTOTP, generateTOTP } from '../lib/totp';

// Standard integrations mapping for settings
const PROFILE_APPS_MAP = [
  { id: "adp", name: "ADP Workforce", cat: "hr", bg: "bg-red-600", text: "AD" },
  { id: "workday", name: "Workday Capital", cat: "hr", bg: "bg-blue-600", text: "WD" },
  { id: "slack_hr", name: "Slack HR Sync", cat: "hr", bg: "bg-purple-600", text: "SL" },
  { id: "mailchimp", name: "Mailchimp Campaigns", cat: "marketing", bg: "bg-amber-400", text: "MC" },
  { id: "hubspot", name: "HubSpot Financial CRM", cat: "marketing", bg: "bg-orange-600", text: "HS" },
  { id: "quickbooks", name: "QuickBooks Online", cat: "financials", bg: "bg-emerald-600", text: "QB" },
  { id: "stripe", name: "Stripe Payments", cat: "financials", bg: "bg-emerald-600", text: "ST" },
  { id: "xero", name: "Xero Ledger Sync", cat: "financials", bg: "bg-teal-600", text: "XE" },
  { id: "shipstation", name: "ShipStation Logistics", cat: "supply-chain", bg: "bg-cyan-700", text: "SS" },
  { id: "flexport", name: "Flexport Freight", cat: "supply-chain", bg: "bg-slate-950", text: "FP" },
  { id: "shopify", name: "Shopify Checkout", cat: "products", bg: "bg-emerald-500", text: "SH" },
  { id: "amazon_seller", name: "Amazon Seller Central", cat: "products", bg: "bg-amber-500", text: "AZ" },
];

const GENERAL_PROFILE_APPS_MAP = [
  { id: "square", name: "Square POS Hub", cat: "general", bg: "bg-black", text: "SQ" },
  { id: "microsoft_excel", name: "Microsoft Excel", cat: "general", bg: "bg-emerald-700", text: "XL" },
  { id: "aws", name: "Amazon Web Services", cat: "general", bg: "bg-amber-600", text: "WS" },
  { id: "gcp", name: "Google Cloud Platform", cat: "general", bg: "bg-emerald-600", text: "GC" },
  { id: "slack", name: "Slack Applications", cat: "general", bg: "bg-purple-600", text: "SL" },
  { id: "google_workspace", name: "Google Workspace Link", cat: "general", bg: "bg-emerald-500", text: "GW" }
];

function renderMiniLogo(appId: string, bg: string, fallbackText: string) {
  switch (appId) {
    case 'square':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black shrink-0">
          <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 text-white fill-none stroke-current" strokeWidth="12">
            <rect x="15" y="15" width="70" height="70" rx="15" />
            <rect x="38" y="38" width="24" height="24" rx="4" fill="currentColor" />
          </svg>
        </div>
      );
    case 'quickbooks':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-600 shrink-0">
          <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 text-white fill-none stroke-current" strokeWidth="8">
            <circle cx="50" cy="50" r="32" />
            <circle cx="50" cy="50" r="14" fill="currentColor" />
            <path d="M50 10v20M50 70v20M10 50h20M70 50h20" />
          </svg>
        </div>
      );
    case 'xero':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-600 shrink-0">
          <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 text-white fill-none stroke-current" strokeWidth="10">
            <circle cx="50" cy="50" r="30" />
            <path d="M35 35l30 30M65 35L35 65" />
          </svg>
        </div>
      );
    case 'shopify':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 shrink-0">
          <svg viewBox="0 0 100 100" className="w-5 h-5 text-emerald-950 fill-current">
            <path d="M30 32h40l6 52H24l6-52z" />
            <path d="M40 32c0-8 4-14 10-14s10 6 10 14" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <text x="50" y="66" fontSize="28" fontWeight="bold" textAnchor="middle" fill="#064e3b">S</text>
          </svg>
        </div>
      );
    case 'stripe':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-600 shrink-0">
          <svg viewBox="0 0 100 100" className="w-5 h-5 text-white fill-current">
            <path d="M53 14c-10 0-18.5 5.5-18.5 15.5 0 18.5 25.5 14 25.5 28.5 0 6-5.5 10.5-12.5 10.5-10.5 0-18-4.5-24.5-10l-6 13.5c7.5 6 19 10 29.5 10 13 0 22-6.5 22-16.5 0-20.5-25.5-15-25.5-28.5 0-5.5 5-9.5 11.5-9.5 9 0 15 3.5 20.5 8l6-13.5c-6.5-5-15-8-22-8z" />
          </svg>
        </div>
      );
    case 'mailchimp':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-400 shrink-0">
          <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 text-yellow-950 fill-current">
            <circle cx="50" cy="50" r="35" />
            <circle cx="40" cy="45" r="5" fill="#eab308" />
            <circle cx="60" cy="45" r="5" fill="#eab308" />
            <path d="M35 60c5 8 25 8 30 0" fill="none" stroke="#eab308" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'hubspot':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500 shrink-0">
          <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 text-white fill-current">
            <circle cx="32" cy="68" r="11" />
            <circle cx="68" cy="68" r="11" />
            <circle cx="50" cy="32" r="14" />
            <path d="M32 68L50 32M68 68L50 32" stroke="currentColor" strokeWidth="8" />
          </svg>
        </div>
      );
    case 'slack':
    case 'slack_hr':
    case 'slack_general':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-600 shrink-0">
          <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 fill-current">
            <rect x="22" y="22" width="22" height="22" rx="7" fill="#e01e5a" />
            <rect x="56" y="22" width="22" height="22" rx="7" fill="#36c5f0" />
            <rect x="22" y="56" width="22" height="22" rx="7" fill="#ecb22e" />
            <rect x="56" y="56" width="22" height="22" rx="7" fill="#2eb67d" />
          </svg>
        </div>
      );
    case 'google_workspace':
    case 'gcp':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 shrink-0 overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 fill-current text-white">
            <path d="M50 20C33.4 20 20 33.4 20 50s13.4 30 30 30c16.6 0 28-10.5 28-28H50v12h16c-1.5 8-8 12.5-16 12.5-10 0-18-8-18-18s8-18 18-18c5 0 9.5 2 13 5l9-9C66 25 59 20 50 20z" fill="#ffffff" />
          </svg>
        </div>
      );
    case 'microsoft_excel':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-700 shrink-0 overflow-hidden bg-emerald-700">
          <svg viewBox="0 0 120 120" className="w-5.5 h-5.5 fill-current text-white">
            <rect x="35" y="20" width="65" height="80" rx="8" fill="#107c41" />
            <rect x="47" y="32" width="41" height="56" fill="white" opacity="0.15" />
            <line x1="47" y1="46" x2="88" y2="46" stroke="white" strokeWidth="3" opacity="0.3" />
            <line x1="47" y1="60" x2="88" y2="60" stroke="white" strokeWidth="3" opacity="0.3" />
            <rect x="18" y="35" width="45" height="50" rx="6" fill="#1f4e37" stroke="#107c41" strokeWidth="3" />
            <text x="40" y="70" fontSize="30" fontWeight="950" fontFamily="sans-serif" textAnchor="middle" fill="white">X</text>
          </svg>
        </div>
      );
    case 'aws':
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-600 shrink-0">
          <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 text-white fill-none stroke-current" strokeWidth="8">
            <path d="M20 55c15-18 45-18 60 0M80 50l3 7-8-1" strokeLinecap="round" strokeLinejoin="round" />
            <text x="50" y="42" fontSize="22" fontWeight="bold" textAnchor="middle" fill="white" fontFamily="monospace">AWS</text>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${bg} text-white text-[11px] shrink-0 uppercase`}>
          {fallbackText}
        </div>
      );
  }
}

interface ProfileViewProps {
  user: any;
  logout: () => void;
  setup: {
    businessName: string;
    location: string;
    sidebarOptions: string[];
    connectedApps: string[];
    completed: boolean;
  } | null;
  onUpdateSetup: (newSetup: any) => void;
}

export function ProfileView({ user, logout, setup, onUpdateSetup }: ProfileViewProps) {
  if (!user) return null;

  // Local Corporate Setup state hooks
  const [bizName, setBizName] = useState(setup?.businessName || "");
  const [bizLoc, setBizLoc] = useState(setup?.location || "");
  const [sidebarOptions, setSidebarOptions] = useState<string[]>(setup?.sidebarOptions || []);
  const [connectedApps, setConnectedApps] = useState<string[]>(setup?.connectedApps || []);
  const [isSaved, setIsSaved] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [appProgressId, setAppProgressId] = useState<string | null>(null);

  // Sync with prop when changed
  useEffect(() => {
    if (setup) {
      setBizName(setup.businessName);
      setBizLoc(setup.location);
      setSidebarOptions(setup.sidebarOptions);
      setConnectedApps(setup.connectedApps);
    }
  }, [setup]);

  const handleUpdateSidebarOption = (optionId: string) => {
    let nextOptions;
    if (sidebarOptions.includes(optionId)) {
      nextOptions = sidebarOptions.filter(id => id !== optionId);
    } else {
      nextOptions = [...sidebarOptions, optionId];
    }
    setSidebarOptions(nextOptions);

    // Live update parent setup
    const updated = {
      businessName: bizName.trim(),
      location: bizLoc.trim(),
      sidebarOptions: nextOptions,
      connectedApps: connectedApps,
      completed: true
    };
    onUpdateSetup(updated);
  };

  const handleToggleLinkedAppInProfile = async (appId: string) => {
    let nextApps;
    if (connectedApps.includes(appId)) {
      nextApps = connectedApps.filter(id => id !== appId);
      setConnectedApps(nextApps);
      // Update parent setup
      onUpdateSetup({
        businessName: bizName.trim(),
        location: bizLoc.trim(),
        sidebarOptions,
        connectedApps: nextApps,
        completed: true
      });
    } else {
      setAppProgressId(appId);
      await new Promise(resolve => setTimeout(resolve, 600));
      nextApps = [...connectedApps, appId];
      setConnectedApps(nextApps);
      setAppProgressId(null);
      // Update parent setup
      onUpdateSetup({
        businessName: bizName.trim(),
        location: bizLoc.trim(),
        sidebarOptions,
        connectedApps: nextApps,
        completed: true
      });
    }
  };

  const handleSaveTextChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage("");
    setIsSaved(false);

    if (!bizName.trim() || !bizLoc.trim()) {
      setErrMessage("Business name and location cannot be empty.");
      return;
    }

    onUpdateSetup({
      businessName: bizName.trim(),
      location: bizLoc.trim(),
      sidebarOptions,
      connectedApps,
      completed: true
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // 2FA Key States
  const storageKey = `pulse_2fa_${user.uid}`;
  const [tfaConfig, setTfaConfig] = useState<{
    enabled: boolean;
    secret: string;
    provider: 'google' | 'microsoft';
    setupAt: string;
  } | null>(null);

  // UI Setup States
  const [setupStep, setSetupStep] = useState<'idle' | 'provider' | 'scan' | 'verify'>('idle');
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'microsoft'>('google');
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Real-time Simulated Code State
  const [simulatedCode, setSimulatedCode] = useState('000000');
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // Load existing configuration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setTfaConfig(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [storageKey]);

  // Simulated Authenticator Code Timer Generator
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const updateSimulatedCode = async () => {
      const secretToUse = generatedSecret || (tfaConfig?.enabled ? tfaConfig.secret : '');
      if (secretToUse) {
        const code = await generateTOTP(secretToUse);
        setSimulatedCode(code);
      }
      
      const seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
      setSecondsRemaining(seconds);
    };

    updateSimulatedCode();
    timer = setInterval(updateSimulatedCode, 1000);

    return () => clearInterval(timer);
  }, [generatedSecret, tfaConfig]);

  const handleStartSetup = () => {
    setSetupStep('provider');
    setErrorMsg('');
  };

  const handleSelectProvider = (prov: 'google' | 'microsoft') => {
    setSelectedProvider(prov);
    const newSecret = generateRandomSecret();
    setGeneratedSecret(newSecret);
    setSetupStep('scan');
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(generatedSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }

    const isValid = await verifyTOTP(verificationCode, generatedSecret);
    if (isValid) {
      // 2FA Activated successfully! Save to localStorage
      const newConfig = {
        enabled: true,
        secret: generatedSecret,
        provider: selectedProvider,
        setupAt: new Date().toLocaleString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
      setTfaConfig(newConfig);
      
      // Update our local device check so we don't ask immediately right after setting up
      let deviceToken = localStorage.getItem('pulse_device_token');
      if (!deviceToken) {
        deviceToken = 'dev_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('pulse_device_token', deviceToken);
      }
      localStorage.setItem(`pulse_device_auth_${user.uid}_${deviceToken}`, Date.now().toString());

      setSetupStep('idle');
      setGeneratedSecret('');
      setVerificationCode('');
    } else {
      setErrorMsg('Verification code did not match. Please verify your system clock or copy code from simulator.');
    }
  };

  const handleDisable2FA = () => {
    if (window.confirm("WARNING: Disabling Two-Factor Authentication relaxes enterprise isolation security. Are you sure you want to proceed?")) {
      localStorage.removeItem(storageKey);
      setTfaConfig(null);
      setSetupStep('idle');
    }
  };

  // OTP Auth Link for actual scanners
  const otpAuthUrl = `otpauth://totp/Pulse:${user.email}?secret=${generatedSecret}&issuer=Pulse&algorithm=SHA1&digits=6&period=30`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpAuthUrl)}`;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10 mt-6 select-none">
      
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <UserIcon className="w-64 h-64 text-emerald-600" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="flex-shrink-0">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile photo" 
                className="w-32 h-32 rounded-2xl shadow-lg border-4 border-white object-cover" 
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-5xl font-bold text-emerald-800">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-1">{user.displayName || 'Enterprise User'}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-slate-550 font-semibold mb-6">
              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs">
                <Mail className="w-4 h-4 text-slate-400" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs border border-indigo-150">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Account Verified
              </span>
            </div>
            
            <div className="flex gap-4 justify-center md:justify-start pt-2">
              <button 
                onClick={logout}
                className="bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-6 py-2 rounded-xl transition-colors border border-rose-100 text-xs uppercase tracking-wider cursor-pointer"
              >
                Sign Out / Terminate Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ENTERPRISE WORKSPACE & DIVISION SETTINGS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm text-left space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Sliders className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Enterprise Profile & Sidebar divisions</h2>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">Configure company identifiers, custom menus, and synchronization keys.</p>
          </div>
        </div>

        {/* Text form for business name and location */}
        <form onSubmit={handleSaveTextChanges} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Business / Company Name</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={bizName}
                onChange={e => setBizName(e.target.value)}
                className="w-full text-xs font-semibold pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                placeholder="Business Name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Headquarters Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={bizLoc}
                onChange={e => setBizLoc(e.target.value)}
                className="w-full text-xs font-semibold pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                placeholder="e.g. Seattle, WA"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            {errMessage && (
              <span className="text-rose-600 text-[10.5px] font-semibold">{errMessage}</span>
            )}
            {isSaved && (
              <span className="text-emerald-600 text-[10.5px] font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Company profiles updated. Live menu optimized!
              </span>
            )}
            {!errMessage && !isSaved && <div />}
            <button
              type="submit"
              className="bg-slate-900 border border-slate-950 text-white hover:bg-black font-extrabold text-[10px] uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-sm ml-auto"
            >
              Update Corporate Profile
            </button>
          </div>
        </form>

        {/* Sidebar Menu Divisions Configuration checklist */}
        <div className="border-t pt-5 space-y-3">
          <div>
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Active Workspace Modules</h3>
            <p className="text-[10px] text-slate-400 font-medium my-1">Select divisions you want present on your left-hand side corporate menus.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-500">
            <span className="font-bold text-slate-700">Mandatory / Core Divisions:</span>
            <span className="bg-white border rounded px-1.5 py-0.5 text-[10px] font-bold text-indigo-605 text-emerald-600 flex items-center gap-1 select-none">
              <LayoutDashboard className="w-3 h-3" /> Dashboard
            </span>
            <span className="bg-white border rounded px-1.5 py-0.5 text-[10px] font-bold text-indigo-605 text-emerald-600 flex items-center gap-1 select-none">
              <Boxes className="w-3 h-3" /> Apps Market
            </span>
            <span className="bg-white border rounded px-1.5 py-0.5 text-[10px] font-bold text-indigo-605 text-emerald-600 flex items-center gap-1 select-none">
              <HelpCircle className="w-3 h-3" /> Help and FAQs
            </span>
          </div>

          {/* Checklist widgets for optional divisions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            {[
              { id: "hr", label: "Human Resources", icon: Users },
              { id: "marketing", label: "Marketing Suite", icon: Megaphone },
              { id: "financials", label: "Financials Ledger", icon: LineChartIcon },
              { id: "supply-chain", label: "Supply Chain", icon: Package },
              { id: "products", label: "Products & Demand", icon: ShoppingBag }
            ].map((module) => {
              const isChecked = sidebarOptions.includes(module.id);
              const IconComp = module.icon;
              return (
                <button
                  type="button"
                  key={module.id}
                  onClick={() => handleUpdateSidebarOption(module.id)}
                  className={`p-3.5 border rounded-xl flex flex-col items-start gap-2.5 text-left transition-all cursor-pointer ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-50/15 text-indigo-850 font-semibold shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 hover:border-slate-350 text-slate-600'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isChecked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] font-bold block leading-tight">{module.label}</span>
                    <span className="text-[8px] uppercase tracking-wider block font-bold text-slate-400">
                      {isChecked ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Division Integrations Panel */}
        <div className="border-t pt-5 space-y-3">
          <div>
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Configure division integrations</h3>
            <p className="text-[10px] text-slate-400 font-medium">Link custom software feeds corresponding to your enabled divisions above.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ...GENERAL_PROFILE_APPS_MAP,
              ...PROFILE_APPS_MAP.filter(app => sidebarOptions.includes(app.cat))
            ].map((app) => {
              const isConnected = connectedApps.includes(app.id);
              const isCurLinking = appProgressId === app.id;
              return (
                <div
                  key={app.id}
                  className={`p-3 border rounded-xl flex items-center justify-between text-xs transition-colors ${
                    isConnected ? 'border-blue-400 bg-emerald-50/5' : 'border-slate-150 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {renderMiniLogo(app.id, app.bg, app.text)}
                    <div>
                      <span className="font-bold text-slate-850 block leading-tight text-[11px]">{app.name}</span>
                      <span className="text-[8px] uppercase font-bold text-slate-400">{app.cat} integration</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleLinkedAppInProfile(app.id)}
                    disabled={isCurLinking}
                    className={`px-2 py-1 text-[8.5px] font-black uppercase tracking-wider rounded border transition-all cursor-pointer ${
                      isConnected
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                        : 'bg-slate-900 hover:bg-black text-white border-slate-950'
                    }`}
                  >
                    {isCurLinking ? "Linking..." : isConnected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TWO-FACTOR AUTHENTICATION INTERFACE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Two-Factor Authentication (2FA) Security</h2>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">Multi-factor security layers for banking, payroll and financial tables.</p>
            </div>
          </div>

          <div>
            {tfaConfig?.enabled ? (
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-250 flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Activated
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Locked & Idle
              </span>
            )}
          </div>
        </div>

        {/* 2FA Main Layout Switches */}
        {setupStep === 'idle' && (
          <div className="text-left space-y-6">
            {tfaConfig?.enabled ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm">Active MFA via {tfaConfig.provider === 'google' ? 'Google Authenticator' : 'Microsoft Authenticator'}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Security status optimal. Code requests triggered on login from unrecognized terminals, every 7 days, or when visualizing ledger balance operations inside Financials.
                  </p>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-2">
                    MFA Provisioned Time: <span className="font-bold text-slate-600">{tfaConfig.setupAt}</span>
                  </div>
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <button
                    onClick={handleDisable2FA}
                    className="w-full md:w-auto bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> De-authorize 2FA
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 font-bold">
                    <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                    <span className="text-sm font-extrabold uppercase tracking-wide">Multi-Factor Unprovisioned</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Securing your platform with an authenticator app blocks raw brute force credentials thefts. Linking your workspace with <span className="font-bold text-emerald-600">Google Authenticator</span> or <span className="font-bold text-emerald-600">Microsoft Authenticator</span> provides an immutable cryptographic fence.
                  </p>
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <button
                    onClick={handleStartSetup}
                    className="w-full bg-slate-900 border border-slate-950 text-white hover:bg-black font-extrabold text-xs uppercase tracking-widest py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                  >
                    <Key className="w-4 h-4 text-emerald-400" /> Set Up Authenticator
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: SELECT AUTH PROTOCOL */}
        {setupStep === 'provider' && (
          <div className="text-left space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">Select Authenticator Ecosystem</h3>
              <p className="text-xs text-slate-500 font-medium">Choose whichever authenticator service you run inside your mobile smartphone or desktop.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSelectProvider('google')}
                className="p-6 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition-all relative overflow-hidden group cursor-pointer"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100">
                  <Smartphone className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Google Authenticator</h4>
                <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                  Support offline secure 2FA generation with standard 30-sec algorithmic time-windows on Google Cloud.
                </p>
                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                  Ecosystem-Ready
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectProvider('microsoft')}
                className="p-6 border border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50/20 text-left transition-all relative overflow-hidden group cursor-pointer"
              >
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100">
                  <Smartphone className="w-6 h-6 text-teal-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Microsoft Authenticator</h4>
                <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                  Excellent enterprise credentials syncing, support notification alerts and passwordless validation.
                </p>
                <div className="absolute top-4 right-4 bg-teal-100 text-teal-700 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                  Ecosystem-Ready
                </div>
              </button>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={() => setSetupStep('idle')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 cursor-pointer"
              >
                Cancel Setup
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCAN QR / COPY CODE / SIMULATOR DISPLAY */}
        {(setupStep === 'scan' || setupStep === 'verify') && (
          <div className="text-left animate-in fade-in slide-in-from-bottom-3 space-y-6">
            
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-indigo-650 uppercase">
              <span>Linking Setup</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-450" />
              <span className="text-slate-700">{selectedProvider === 'google' ? 'Google Authenticator' : 'Microsoft Authenticator'}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Scan Section */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                
                {/* QR Display */}
                <div className="sm:col-span-5 bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
                  <img 
                    src={qrCodeUrl} 
                    alt="Authenticator QR String scan" 
                    referrerPolicy="no-referrer"
                    className="w-40 h-40 object-contain rounded border-4 border-white shadow-xs" 
                  />
                  <span className="text-[9px] font-bold text-slate-400 mt-3 text-center uppercase tracking-wider block">
                    Scan with Mobile Camera
                  </span>
                </div>

                {/* Key Instructions block */}
                <div className="sm:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800">Scan QR Code or Enter Secret Key Manual</h3>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      Open your camera within {selectedProvider === 'google' ? 'Google' : 'Microsoft'} Authenticator app, scan this QR code, or paste the manual key listed below:
                    </p>
                  </div>

                  {/* Manual Key Input Copy bar */}
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-center justify-between shadow-2xs select-text">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Manual Secret Key</span>
                      <span className="text-xs font-black tracking-widest text-slate-700 select-all font-mono">{generatedSecret}</span>
                    </div>
                    <button
                      onClick={handleCopySecret}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Copy manually secret code"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl leading-normal text-[10.5px] text-indigo-900 font-semibold flex items-start gap-2 select-text">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Adding this profile creates an OTP link synchronized with server epoch clock frequencies.
                    </span>
                  </div>
                </div>

              </div>

              {/* INTEGRATED AUTHENTICATOR APP SIMULATOR WIDGET */}
              <div className="lg:col-span-4 bg-slate-900/98 text-white rounded-2xl p-5 border border-slate-950 shadow-lg relative flex flex-col justify-between">
                
                {/* Header Simulator UI */}
                <div className="border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Web-Simulator Device
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                    Failproof Companion
                  </span>
                </div>

                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      {selectedProvider === 'google' ? 'Google Authenticator App' : 'Microsoft Authenticator'}
                    </span>
                    <span className="text-[10px] text-emerald-300 font-semibold uppercase font-mono block truncate">
                      Pulse: {user.email}
                    </span>
                  </div>

                  {/* Simulated Output dynamic code */}
                  <div className="py-2.5 flex items-center justify-between bg-slate-800/80 border border-white/10 px-4 rounded-xl">
                    <span className="text-2xl font-black tracking-widest text-[#5BC0BE] select-all font-mono">
                      {simulatedCode.substring(0, 3)} {simulatedCode.substring(3, 6)}
                    </span>
                    
                    {/* Timer wheel element */}
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-rose-350 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md text-slate-400 select-none">
                      <span className="font-mono text-emerald-400">{secondsRemaining}s</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold italic text-slate-400">
                    *Tip: Copy these 6 digits directly to verify, or use your real phone scanner. The codes are perfectly identical!
                  </p>
                </div>
              </div>

            </div>

            {/* CONFIRMATION INPUT PANEL */}
            <form onSubmit={handleVerifyAndActivate} className="pt-6 border-t border-slate-100 max-w-lg space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Verify 2FA Registration code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit confirmation code code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 text-xs font-black px-4 py-3 bg-slate-50 border border-slate-205 border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors tracking-widest text-center font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-650 bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-widest py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Confirm Registration
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-[10.5px] font-semibold leading-relaxed rounded-xl flex items-center gap-2 select-text">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                  {errorMsg}
                </div>
              )}
            </form>

            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => {
                  setSetupStep('idle');
                  setGeneratedSecret('');
                  setErrorMsg('');
                  setVerificationCode('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
              >
                Go Back to security settings
              </button>
            </div>

          </div>
        )}

      </div>
      
      {/* ACCOUNT SETTINGS & STATS GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-left">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-6 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-500" /> Account Settings
          </h2>
          <div className="space-y-4">
            <div className="p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors text-left animate-in fade-in">
              <div className="font-semibold text-slate-800">Workspace Integrations</div>
              <p className="text-xs text-slate-500 mt-1">
                {connectedApps.length > 0 
                  ? `${connectedApps.map(id => id.toUpperCase()).join(', ')} currently active.` 
                  : "No custom integrations active. Link them above."}
              </p>
            </div>
            <div className="p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors text-left">
              <div className="font-semibold text-slate-800">Language & Region</div>
              <p className="text-sm text-slate-500 mt-1">English (United States), Timezone: Pacific/Los Angeles.</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors text-left">
              <div className="font-semibold text-slate-800">Notification Preferences</div>
              <p className="text-sm text-slate-500 mt-1">Email recaps and push notifications enabled.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-left">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Security Status & Logs
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-800">Logged in from new IP</div>
                <p className="text-xs text-slate-400 mt-1">Today, at {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-800">Granted standard enterprise access scope</div>
                <p className="text-xs text-slate-400 mt-1">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
