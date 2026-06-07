import { useState, useMemo } from "react";
import { PRESETS, PresetName } from "../presets";
import { renderAppLogo, getBrandButtonColor } from "../views/AppsView";
import { 
  Building, 
  MapPin, 
  Users, 
  Megaphone, 
  LineChart as LineChartIcon, 
  Package, 
  ShoppingBag, 
  Boxes, 
  HelpCircle, 
  LayoutDashboard, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Sparkles,
  Link2,
  Mail,
  Slack,
  Globe
} from "lucide-react";

// Definitions of apps mapped to categories
interface OnboardingApp {
  id: string;
  name: string;
  iconText: string;
  description: string;
  logoBg: string;
  logoColor: string;
  associatedSidebar: string;
}

const ONBOARDING_MARKETPLACE_APPS: OnboardingApp[] = [
  // HR Apps
  {
    id: "adp",
    name: "ADP Workforce",
    iconText: "AD",
    description: "Sync payroll taxes, hours tracking, and direct disbursements.",
    logoBg: "bg-red-600",
    logoColor: "text-white",
    associatedSidebar: "hr"
  },
  {
    id: "workday",
    name: "Workday Human Capital",
    iconText: "WD",
    description: "Manage corporate directory catalogs and user access permissions.",
    logoBg: "bg-blue-600",
    logoColor: "text-white",
    associatedSidebar: "hr"
  },
  {
    id: "slack_hr",
    name: "Slack Team Broadcast",
    iconText: "SL",
    description: "Automate shift notification pings and organization memos.",
    logoBg: "bg-purple-600",
    logoColor: "text-white",
    associatedSidebar: "hr"
  },
  // Marketing Apps
  {
    id: "mailchimp",
    name: "Mailchimp Campaigns",
    iconText: "MC",
    description: "Sync promotional flyers, coupons, and email click audits.",
    logoBg: "bg-amber-400",
    logoColor: "text-slate-900",
    associatedSidebar: "marketing"
  },
  {
    id: "hubspot",
    name: "HubSpot Financial CRM",
    iconText: "HS",
    description: "Link customer purchase deals and forecasting metrics.",
    logoBg: "bg-orange-550 bg-orange-600",
    logoColor: "text-white",
    associatedSidebar: "marketing"
  },
  // Financials Apps
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    iconText: "QB",
    description: "Auto-reconcile balance sheets, cashbooks and tax reporting.",
    logoBg: "bg-emerald-600",
    logoColor: "text-white",
    associatedSidebar: "financials"
  },
  {
    id: "stripe",
    name: "Stripe Payments",
    iconText: "ST",
    description: "Map incoming checkout pipelines and credit refunds history.",
    logoBg: "bg-emerald-600",
    logoColor: "text-white",
    associatedSidebar: "financials"
  },
  {
    id: "xero",
    name: "Xero Ledger Sync",
    iconText: "XE",
    description: "Double-entry opex registries and currency exchange rate syncing.",
    logoBg: "bg-teal-600",
    logoColor: "text-white",
    associatedSidebar: "financials"
  },
  // Supply Chain Apps
  {
    id: "shipstation",
    name: "ShipStation Logistics",
    iconText: "SS",
    description: "Fulfill packaging orders across USPS, DHL, and FedEx fleets.",
    logoBg: "bg-cyan-705 bg-cyan-700",
    logoColor: "text-white",
    associatedSidebar: "supply-chain"
  },
  {
    id: "flexport",
    name: "Flexport Freight",
    iconText: "FP",
    description: "Coordinate maritime shipping manifests and custom clearances.",
    logoBg: "bg-slate-950",
    logoColor: "text-white",
    associatedSidebar: "supply-chain"
  },
  // Products Apps
  {
    id: "shopify",
    name: "Shopify Checkout",
    iconText: "SH",
    description: "Ingest live shopping carts, VAT offsets, and item options.",
    logoBg: "bg-emerald-500",
    logoColor: "text-emerald-950",
    associatedSidebar: "products"
  },
  {
    id: "amazon_seller",
    name: "Amazon Seller Central",
    iconText: "AZ",
    description: "Track FBA inventory, buyer reviews, and restock intervals.",
    logoBg: "bg-amber-500",
    logoColor: "text-white",
    associatedSidebar: "products"
  }
];

// Fallback/General integrations if they chose NO optional sidebar modules
const GENERAL_ONBOARDING_APPS: OnboardingApp[] = [
  {
    id: "square",
    name: "Square POS Hub",
    iconText: "SQ",
    description: "Integrate default store terminals and localized card machines.",
    logoBg: "bg-black",
    logoColor: "text-white",
    associatedSidebar: "general"
  },
  {
    id: "microsoft_excel",
    name: "Microsoft Excel",
    iconText: "XL",
    description: "Sync transactional spreadsheets, budget models, and load analytical workbooks from OneDrive.",
    logoBg: "bg-emerald-700",
    logoColor: "text-white",
    associatedSidebar: "general"
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    iconText: "WS",
    description: "Monitor cloud computing units, S3 objects, and DB instances.",
    logoBg: "bg-amber-600",
    logoColor: "text-white",
    associatedSidebar: "general"
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    iconText: "GC",
    description: "Analyze BigQuery data sets, Kubernetes, and machine learning endpoints.",
    logoBg: "bg-emerald-600",
    logoColor: "text-white",
    associatedSidebar: "general"
  },
  {
    id: "slack",
    name: "Slack Applications",
    iconText: "SL",
    description: "Integrate enterprise Slack workspaces, automated alerts, and channels.",
    logoBg: "bg-purple-600",
    logoColor: "text-white",
    associatedSidebar: "general"
  },
  {
    id: "google_workspace",
    name: "Google Workspace Link",
    iconText: "GW",
    description: "Authorize Calendar scheduling, team Docs, and Gmail triggers.",
    logoBg: "bg-indigo-550 bg-emerald-500",
    logoColor: "text-white",
    associatedSidebar: "general"
  }
];

interface OnboardingSetupProps {
  user: any;
  onComplete: (setupData: {
    businessName: string;
    location: string;
    sidebarOptions: string[];
    connectedApps: string[];
    completed: boolean;
  }) => void;
  preset?: PresetName;
  onSetPreset?: (preset: PresetName) => void;
}

export function OnboardingSetup({ 
  user, 
  onComplete,
  preset = 'stark',
  onSetPreset
}: OnboardingSetupProps) {
  const styles = PRESETS[preset] || PRESETS.stark;
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  
  // Sidebar options selection (only the optional ones)
  const [selectedSidebarOptions, setSelectedSidebarOptions] = useState<string[]>([
    "hr",
    "marketing",
    "financials"
  ]);

  // Connected apps (keep track of live statuses)
  const [tempConnectedApps, setTempConnectedApps] = useState<string[]>(["square"]);
  const [loadingAppId, setLoadingAppId] = useState<string | null>(null);

  // Configuration credentials states for Step 3
  const [configuringAppId, setConfiguringAppId] = useState<string | null>(null);
  const [appCredentialHandle, setAppCredentialHandle] = useState("");
  const [appCredentialToken, setAppCredentialToken] = useState("");
  const [appCredentials, setAppCredentials] = useState<Record<string, { handle: string; token: string }>>({
    square: { handle: "square_terminal_7", token: "SQ_ACCESS_TOKEN_LIVE" }
  });

  // Definitions of modules
  const OPTIONAL_MODULES = [
    {
      id: "hr",
      label: "Human Resources",
      description: "Manage staff directories, view KPI ratios, leave tracking, and create rosters.",
      icon: Users,
      badge: "Team Directory"
    },
    {
      id: "marketing",
      label: "Marketing Suite",
      description: "Draft promotion strategies with AI advice, track campaigns, and edit calendars.",
      icon: Megaphone,
      badge: "Campaigns"
    },
    {
      id: "financials",
      label: "Financials Ledger",
      description: "Review double-entry ledgers, income balances, and secure cash schedules.",
      icon: LineChartIcon,
      badge: "Secure Access"
    },
    {
      id: "supply-chain",
      label: "Supply Chain",
      description: "Monitor multi-tenant supply loops, shipping freights, and restock parameters.",
      icon: Package,
      badge: "Replenishment"
    },
    {
      id: "products",
      label: "Products & Demand",
      description: "Track inventory indexes, customer checkout counts, and sales velocity charts.",
      icon: ShoppingBag,
      badge: "Inventory"
    }
  ];

  // Dynamically filter apps based on chosen optional modules
  const visibleAppsToConnect = useMemo(() => {
    const specificApps = ONBOARDING_MARKETPLACE_APPS.filter(app => 
      selectedSidebarOptions.includes(app.associatedSidebar)
    );
    // Combine specific division-level apps and general-purpose core apps so they are always connectable
    return [...specificApps, ...GENERAL_ONBOARDING_APPS];
  }, [selectedSidebarOptions]);

  const handleToggleSidebarOption = (optionId: string) => {
    if (selectedSidebarOptions.includes(optionId)) {
      setSelectedSidebarOptions(selectedSidebarOptions.filter(id => id !== optionId));
    } else {
      setSelectedSidebarOptions([...selectedSidebarOptions, optionId]);
    }
  };

  const handleToggleConnectApp = (appId: string) => {
    if (tempConnectedApps.includes(appId)) {
      // Disconnect immediately
      setTempConnectedApps(tempConnectedApps.filter(id => id !== appId));
      setAppCredentials(prev => {
        const copy = { ...prev };
        delete copy[appId];
        return copy;
      });
    }
  };

  const handleAuthorizeApp = async (appId: string) => {
    if (!appCredentialHandle.trim() || !appCredentialToken.trim()) {
      alert("Please enter the required account setup credentials to synchronize this app.");
      return;
    }
    setLoadingAppId(appId);
    await new Promise(resolve => setTimeout(resolve, 950));
    setTempConnectedApps([...tempConnectedApps, appId]);
    setAppCredentials(prev => ({
      ...prev,
      [appId]: {
        handle: appCredentialHandle.trim(),
        token: appCredentialToken.trim()
      }
    }));
    setLoadingAppId(null);
    setConfiguringAppId(null);
    setAppCredentialHandle("");
    setAppCredentialToken("");
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!businessName.trim() || !location.trim()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBackStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleFinish = () => {
    // Collect all final configurations
    const finalSidebarOptions = [...selectedSidebarOptions];
    
    // Always pre-populate standard tabs as active in backend
    onComplete({
      businessName: businessName.trim(),
      location: location.trim(),
      sidebarOptions: finalSidebarOptions,
      connectedApps: tempConnectedApps,
      completed: true
    });
  };

  return (
    <div className={`min-h-screen ${styles.canvas} flex flex-col justify-center items-center p-4 selection:bg-[#D4FC34]/40 select-none transition-colors duration-300 relative`}>
      
      {/* Preset Selector at top right for visual onboarding guidance */}
      {onSetPreset && (
        <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
          <select
            value={preset}
            onChange={e => onSetPreset(e.target.value as any)}
            className={`text-[10px] font-sans font-bold pr-8 pl-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer appearance-none ${
              preset === 'stark'
                ? 'bg-white border-slate-200 text-slate-800 hover:bg-[#F8FAFC] shadow-sm'
                : preset === 'cosmic'
                ? 'bg-[#1E293B] border-slate-700 text-slate-200 hover:bg-[#111215]'
                : 'bg-[#FFFDF9] border-2 border-[#0E0E0F] text-[#0E0E0F] hover:bg-[#D4FC34]'
            }`}
            style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M19 9l-7 7-7-7' stroke-linecap='round' stroke-linejoin='round'></path></svg>")`, backgroundPosition: 'right 8px center', backgroundSize: '12px', backgroundRepeat: 'no-repeat' }}
          >
            <option value="stark">🎨 Theme: Stark</option>
            <option value="editorial">🎨 Theme: Swiss Editorial</option>
            <option value="cosmic">🎨 Theme: Cosmic Slate</option>
          </select>
        </div>
      )}

      {/* Central Card Container */}
      <div className={`max-w-3xl w-full ${styles.card} overflow-hidden text-left flex flex-col animate-in fade-in duration-300`}>
        
        {/* Step Indicator Header Banner */}
        <div className={`${
          preset === 'stark' ? 'bg-slate-900 border-slate-800' : 
          preset === 'cosmic' ? 'bg-[#1E293B] border-slate-800' : 
          'bg-[#0E0E0F] border-[#0E0E0F]'
        } px-8 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between border-b gap-4`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${
              preset === 'stark' ? 'bg-slate-800 text-emerald-400' :
              preset === 'cosmic' ? 'bg-[#111215] text-violet-400' :
              'bg-[#D4FC34] text-[#0E0E0F]'
            } rounded-xl flex items-center justify-center shadow-md`}>
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white">System Optimization Wizard</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Configure personalized enterprise divisions and accounts</p>
            </div>
          </div>
          
          {/* Step circles */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  currentStep === stepNum
                    ? preset === 'cosmic'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-emerald-600 text-white shadow-md'
                    : currentStep > stepNum
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-450 border border-slate-700'
                }`}>
                  {currentStep > stepNum ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-6 h-0.5 ${currentStep > stepNum ? 'bg-emerald-600' : 'bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Main Panel Body */}
        <div className="p-8 flex-1 min-h-[380px]">
          
          {/* STEP 1: BUSINESS FIELD INPUTS */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-left">
                <h2 className={`text-xl font-bold tracking-tight ${preset === 'cosmic' ? 'text-white' : 'text-slate-800'}`}>Tell us about your Company</h2>
                <p className={`text-xs mt-1 ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500 font-semibold mt-1'}`}>
                  We customize the analytical defaults, reporting layouts, and location metrics based on these variables.
                </p>
              </div>

              <div className="space-y-4 max-w-xl">
                {/* Business Name Field */}
                <div className="space-y-1.5">
                  <label htmlFor="setup-biz-name" className={`text-[10px] font-bold uppercase tracking-wider block ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Corporate / Business Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      id="setup-biz-name"
                      required
                      placeholder="e.g. Starbucks Trading Co. or ACME Corp."
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={`w-full text-xs font-semibold pl-11 pr-4 py-3 outline-none transition-all ${
                        preset === 'stark'
                          ? 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-slate-800'
                          : preset === 'cosmic'
                          ? 'bg-[#16171B] border border-[#27272A] focus:border-violet-500 focus:bg-[#111215] rounded-xl text-slate-200'
                          : 'bg-[#FFFDF9] border-2 border-[#0E0E0F] focus:bg-[#D4FC34]/15 focus:border-[#002FA7] rounded-none text-[#0E0E0F]'
                      }`}
                    />
                  </div>
                </div>

                {/* Corporate Location Field */}
                <div className="space-y-1.5">
                  <label htmlFor="setup-location" className={`text-[10px] font-bold uppercase tracking-wider block ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Operations Location / Headquarters
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      id="setup-location"
                      required
                      placeholder="e.g. Seattle, WA or London, United Kingdom"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={`w-full text-xs font-semibold pl-11 pr-4 py-3 outline-none transition-all ${
                        preset === 'stark'
                          ? 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-slate-800'
                          : preset === 'cosmic'
                          ? 'bg-[#16171B] border border-[#27272A] focus:border-violet-500 focus:bg-[#111215] rounded-xl text-slate-200'
                          : 'bg-[#FFFDF9] border-2 border-[#0E0E0F] focus:bg-[#D4FC34]/15 focus:border-[#002FA7] rounded-none text-[#0E0E0F]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className={`p-4 border leading-relaxed text-xs font-semibold max-w-xl ${
                preset === 'stark'
                  ? 'bg-slate-50 border-slate-200 rounded-2xl text-slate-700'
                  : preset === 'cosmic'
                  ? 'bg-[#1A1C23] border-[#27272A] rounded-2xl text-slate-300'
                  : 'bg-[#FFFDF9]/10 border-2 border-[#0E0E0F] rounded-none text-[#0E0E0F]'
              }`}>
                <span className={`block font-bold uppercase tracking-widest text-[9px] mb-1 ${
                  preset === 'cosmic' ? 'text-violet-400' : preset === 'stark' ? 'text-slate-900' : 'text-[#002FA7]'
                }`}>PRO-TIP FOR INTEGRATION</span>
                You can fully synchronize multiple outlets, register desks, or store coordinates later in settings. This configures your initial default terminal.
              </div>
            </div>
          )}

          {/* STEP 2: SIDEBAR DIVISION OPTIONS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className={`text-xl font-bold tracking-tight ${preset === 'cosmic' ? 'text-white' : 'text-slate-805 text-slate-800'}`}>Select Sidebar Divisions</h2>
                <p className={`text-xs mt-1 ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500 mt-1'}`}>
                  Customize your workspace modules. Choose which custom screens you want present on your main sidebar menu.
                </p>
              </div>

              {/* Preselected list notification */}
              <div className={`flex flex-wrap items-center gap-2 p-3.5 border text-xs font-medium ${
                preset === 'stark'
                  ? 'bg-slate-50 border-slate-200 rounded-xl text-slate-500'
                  : preset === 'cosmic'
                  ? 'bg-[#16171B] border-[#27272A] rounded-xl text-slate-300'
                  : 'bg-[#FFFDF9] border-2 border-[#0E0E0F] text-[#0E0E0F]'
              }`}>
                <span className={`font-bold ${preset === 'cosmic' ? 'text-slate-200' : 'text-slate-705'}`}>Pre-enabled Core Sections:</span>
                <span className={`border rounded px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                  preset === 'cosmic' ? 'bg-[#1E293B] border-slate-700 text-violet-400' : 'bg-white border text-emerald-600'
                }`}>
                  <LayoutDashboard className="w-3 h-3" /> Dashboard
                </span>
                <span className={`border rounded px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                  preset === 'cosmic' ? 'bg-[#1E293B] border-slate-700 text-violet-400' : 'bg-white border text-emerald-600'
                }`}>
                  <Boxes className="w-3 h-3" /> Apps Market
                </span>
                <span className={`border rounded px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                  preset === 'cosmic' ? 'bg-[#1E293B] border-slate-700 text-violet-400' : 'bg-white border text-emerald-600'
                }`}>
                  <HelpCircle className="w-3 h-3" /> Help & Support
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-auto">always present</span>
              </div>

              {/* Checklist Cards Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {OPTIONAL_MODULES.map((module) => {
                  const isChecked = selectedSidebarOptions.includes(module.id);
                  const IconComp = module.icon;
                  return (
                    <div
                      key={module.id}
                      onClick={() => handleToggleSidebarOption(module.id)}
                      className={`p-4 border cursor-pointer transition-all flex flex-col justify-between text-left group ${
                        isChecked
                          ? preset === 'stark'
                            ? 'border-emerald-500 bg-emerald-50/10 shadow-md shadow-emerald-50/30'
                            : preset === 'cosmic'
                            ? 'border-violet-500 bg-[#3B0764]/10'
                            : 'border-2 border-[#0E0E0F] bg-[#D4FC34]/15 shadow-[3px_3px_0px_0px_#0E0E0F]'
                          : preset === 'stark'
                          ? 'border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                          : preset === 'cosmic'
                          ? 'border-slate-800 hover:border-slate-700 hover:bg-[#1E293B]/20 border-[#27272A]'
                          : 'border-[#0E0E0F]/20 hover:border-[#0E0E0F]'
                      } ${preset !== 'editorial' ? 'rounded-2xl' : 'rounded-none border-[3px]'}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isChecked
                              ? preset === 'cosmic' ? 'bg-violet-900/40 text-violet-400' : 'bg-emerald-100 text-emerald-700'
                              : preset === 'cosmic' ? 'bg-slate-800 text-slate-350' : 'bg-slate-100 text-slate-505 text-slate-500'
                          }`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          
                          {/* Circle Checkbox UI */}
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isChecked
                              ? preset === 'cosmic' ? 'bg-violet-500 border-violet-500 text-white' : 'bg-[#008060] border-emerald-600 text-white'
                              : preset === 'cosmic' ? 'border-slate-705' : 'border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <h4 className={`font-bold text-xs tracking-tight ${preset === 'cosmic' ? 'text-slate-100' : 'text-slate-805'}`}>{module.label}</h4>
                        <p className={`text-[10.5px] leading-normal mt-1 font-semibold ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {module.description}
                        </p>
                      </div>

                      <div className="mt-4 flex">
                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          isChecked
                            ? preset === 'cosmic' ? 'bg-violet-950/40 text-violet-400' : 'bg-emerald-105 bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {module.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: ASSOCIATED THIRD-PARTY INTEGRATIONS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className={`text-xl font-bold tracking-tight ${preset === 'cosmic' ? 'text-white' : 'text-slate-800'}`}>Connect Workspace Integrations</h2>
                <p className={`text-xs mt-1 ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>
                  Authorize direct synchronization feeds for chosen enterprise modules. You can skip or toggle connections anytime.
                </p>
              </div>

              {/* Dynamic Grid of connectable apps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
                {visibleAppsToConnect.map((app) => {
                  const isConnected = tempConnectedApps.includes(app.id);
                  const isCurLoading = loadingAppId === app.id;
                  const isConfiguring = configuringAppId === app.id;
                  return (
                    <div
                      key={app.id}
                      className={`p-4 border flex flex-col gap-3 transition-all relative ${
                        isConnected
                          ? preset === 'stark'
                            ? 'border-emerald-500 bg-emerald-50/10'
                            : preset === 'cosmic'
                            ? 'border-violet-500 bg-violet-950/10'
                            : 'border-2 border-[#0E0E0F] bg-[#D4FC34]/15 shadow-[3px_3px_0px_0px_#0E0E0F]'
                          : preset === 'stark'
                          ? 'border-slate-200 bg-white'
                          : preset === 'cosmic'
                          ? 'border-slate-800 bg-[#16171B]'
                          : 'border-[#0E0E0F]/20 bg-white'
                      } ${preset !== 'editorial' ? 'rounded-2xl' : 'rounded-none border-[3px]'}`}
                    >
                      <div className="flex items-start gap-3">
                        {renderAppLogo(app.id, "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm shadow-sm border border-slate-200/50 bg-white overflow-hidden")}

                        <div className="space-y-1 text-left flex-1 select-text">
                          <div className="flex items-center justify-between pr-12">
                            <h4 className={`font-bold text-xs flex items-center gap-1 ${preset === 'cosmic' ? 'text-slate-100' : 'text-slate-800'}`}>
                              {app.name}
                            </h4>
                          </div>
                          <p className={`text-[10px] pr-2 ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500 font-semibold'} leading-snug`}>
                            {app.description}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Credential Collector Drawer */}
                      {isConfiguring ? (
                        <div className={`p-3 rounded-xl border text-left space-y-2 animate-in slide-in-from-top-1 duration-200 ${
                          preset === 'cosmic' ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <p className={`font-black text-[8.5px] uppercase tracking-wider ${preset === 'cosmic' ? 'text-violet-400' : 'text-slate-700'}`}>
                            🔒 SETUP SECURE CREDENTIAL FEED
                          </p>
                          <div className="space-y-1">
                            <label className={`block text-[8px] font-bold uppercase ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>
                              Account Handle / Developer ID ID
                            </label>
                            <input
                              type="text"
                              required
                              value={appCredentialHandle}
                              onChange={(e) => setAppCredentialHandle(e.target.value)}
                              placeholder="e.g. artisan_admin_sec"
                              className={`w-full text-xs p-1.5 border rounded-lg outline-none focus:border-indigo-500 ${
                                preset === 'cosmic' ? 'bg-slate-950 text-white border-slate-750' : 'bg-white text-slate-800'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={`block text-[8px] font-bold uppercase ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>
                              Private Developer Access Token
                            </label>
                            <input
                              type="password"
                              required
                              value={appCredentialToken}
                              onChange={(e) => setAppCredentialToken(e.target.value)}
                              placeholder="••••••••••••••••"
                              className={`w-full text-xs p-1.5 border rounded-lg outline-none focus:border-indigo-500 ${
                                preset === 'cosmic' ? 'bg-slate-950 text-white border-slate-750' : 'bg-white text-slate-800'
                              }`}
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleAuthorizeApp(app.id)}
                              disabled={isCurLoading}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold uppercase py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {isCurLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Link Secure Feed"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfiguringAppId(null);
                                setAppCredentialHandle("");
                                setAppCredentialToken("");
                              }}
                              className={`px-2 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                                preset === 'cosmic' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : isConnected ? (
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 border-t pt-2 border-slate-100 select-text">
                          <div className="font-semibold text-[9.5px]">
                            Synced: <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">{appCredentials[app.id]?.handle || "square_terminal_7"}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleConnectApp(app.id)}
                            className="text-rose-500 hover:text-rose-700 font-bold uppercase tracking-widest text-[8.5px] cursor-pointer"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-100/55 flex justify-between items-center">
                          <button
                            type="button"
                            onClick={() => {
                              setConfiguringAppId(app.id);
                              setAppCredentialHandle("");
                              setAppCredentialToken("");
                            }}
                            className={`px-3.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${getBrandButtonColor(app.id)}`}
                          >
                            <Link2 className="w-3 h-3" /> Connect Feed
                          </button>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex items-center justify-end">
                        <span className={`text-[7px] font-bold px-1 py-0.2 rounded uppercase border shrink-0 ${
                          preset === 'cosmic' ? 'bg-[#1E293B] border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          {app.associatedSidebar}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* No apps warning */}
              {visibleAppsToConnect.length === 0 && (
                <div className={`text-center py-8 border ${
                  preset === 'stark'
                    ? 'bg-[#F8FAFC] border-slate-200 text-slate-500 rounded-2xl'
                    : preset === 'cosmic'
                    ? 'bg-[#16171B] border-[#27272A] text-slate-400 rounded-2xl'
                    : 'bg-white border-2 border-dashed border-[#0E0E0F] text-[#0E0E0F]'
                }`}>
                  <p className="text-xs font-semibold">No integration categories requested. Click Complete below to initiate clean workspace.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Wizard Footer Navigation Controls */}
        <div className={`px-8 py-5 border-t flex items-center justify-between ${
          preset === 'stark' ? 'bg-[#F8FAFC] border-slate-150' :
          preset === 'cosmic' ? 'bg-[#111215] border-[#27272A]' :
          'bg-slate-50 border-[#0E0E0F]/20'
        }`}>
          <button
            onClick={handleBackStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider py-2.5 px-4 disabled:opacity-0 disabled:pointer-events-none transition-all cursor-pointer ${
              preset === 'stark'
                ? 'rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-550 text-slate-505 text-slate-508 text-slate-500'
                : preset === 'cosmic'
                ? 'rounded-xl border border-slate-800 bg-[#1e293b] hover:bg-[#0f172a] text-slate-300'
                : 'rounded-none border-2 border-[#0E0E0F] bg-white hover:bg-[#D4FC34]/15 text-[#0E0E0F]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={currentStep === 1 && (!businessName.trim() || !location.trim())}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider py-2.5 px-5 transition-all disabled:opacity-40 select-none cursor-pointer ${
                preset === 'stark'
                  ? 'bg-slate-900 border border-slate-950 text-white rounded-xl hover:bg-black shadow-sm'
                  : preset === 'cosmic'
                  ? 'bg-violet-600 border border-violet-755 text-white rounded-xl hover:bg-violet-500 shadow-sm'
                  : 'bg-[#0E0E0F] border-2 border-[#0E0E0F] text-white rounded-none hover:bg-[#D4FC34] hover:text-[#0E0E0F] shadow-[3px_3px_0px_0px_#002FA7]'
              }`}
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest py-2.5 px-5 transition-all select-none cursor-pointer ${
                preset === 'stark'
                  ? 'bg-emerald-600 border border-emerald-700 text-white rounded-xl hover:bg-emerald-700 shadow-sm'
                  : preset === 'cosmic'
                  ? 'bg-violet-600 border border-violet-755 text-white rounded-xl hover:bg-violet-500 shadow-sm'
                  : 'bg-[#D4FC34] border-2 border-[#0E0E0F] text-[#0E0E0F] rounded-none hover:bg-black hover:text-[#D4FC34] shadow-[3px_3px_0px_0px_#D4FC34]'
              }`}
            >
              Complete Setup <Check className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
