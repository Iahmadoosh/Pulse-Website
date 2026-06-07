import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  Users,
  Brain,
  TrendingUp,
  LayoutDashboard,
  Menu,
  X,
  CalendarClock,
  User,
  Building,
  DollarSign,
  Megaphone,
  LineChart as LineChartIcon,
  Package,
  ShoppingBag,
  Boxes,
  Mail,
  Lock,
  Facebook,
  LogIn,
  HelpCircle,
  Smartphone,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { DashboardView } from "./views/DashboardView";
import { HRView } from "./views/HRView";
import { MarketingView } from "./views/MarketingView";
import { FinancialsView } from "./views/FinancialsView";
import { SupplyChainView } from "./views/SupplyChainView";
import { ProductsView } from "./views/ProductsView";
import { ProfileView } from "./views/ProfileView";
import { AppsView } from "./views/AppsView";
import { HelpView } from "./views/HelpView";
import {
  initAuth,
  googleSignIn,
  facebookSignIn,
  emailSignIn,
  emailSignUp,
  logout,
  auth,
} from "./lib/auth";
import { AssistantChat } from "./components/AssistantChat";
import { FinancialsSecurityGate } from "./components/FinancialsSecurityGate";
import { verifyTOTP, generateTOTP } from "./lib/totp";
import { OnboardingSetup } from "./components/OnboardingSetup";
import { PRESETS, PresetName } from "./presets";

// Use the local mock data definitions
import { INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS } from "./data";
import { Employee, Department } from "./types";

// Let's add the ShiftAssignment type to pass easily
type ShiftAssignment = {
  employee_id: string;
  employee_name: string;
  assigned_shifts: string[];
  reasoning: string;
};

export default function App() {
  const [preset, setPreset] = useState<PresetName>(() => {
    return (
      (localStorage.getItem("pulse_theme_preset") as PresetName) || "stark"
    );
  });

  const styles = PRESETS[preset] || PRESETS.stark;

  const handleSetPreset = (newPreset: PresetName) => {
    setPreset(newPreset);
    localStorage.setItem("pulse_theme_preset", newPreset);
  };

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "hr"
    | "marketing"
    | "financials"
    | "supply-chain"
    | "products"
    | "apps"
    | "profile"
    | "help"
  >("dashboard");
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [departments, setDepartments] =
    useState<Department[]>(INITIAL_DEPARTMENTS);
  const [schedule, setSchedule] = useState<ShiftAssignment[] | null>(null);
  const [trendHistory, setTrendHistory] = useState<any[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);

  const [user, setUser] = useState<any | null>(() => {
    try {
      const cached = localStorage.getItem("pulse_cached_user");
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.error("Failed to parse cached user:", e);
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("pulse_cached_token");
    } catch {
      return null;
    }
  });

  const [needsAuth, setNeedsAuth] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem("pulse_cached_user");
      return !cached;
    } catch {
      return true;
    }
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [caslConsent, setCaslConsent] = useState(false);
  const [canadianLegalModal, setCanadianLegalModal] = useState<
    "privacy" | "terms" | null
  >(null);

  // Onboarding/Setup configuration state
  const [setup, setSetup] = useState<{
    businessName: string;
    location: string;
    sidebarOptions: string[];
    connectedApps: string[];
    completed: boolean;
  } | null>(null);

  // Load existing setup configuration from local storage
  useEffect(() => {
    if (user) {
      const storageKey = `pulse_setup_${user.uid}`;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setSetup(JSON.parse(stored));
        } else {
          setSetup(null);
        }
      } catch (e) {
        console.error("Failed to load onboarding configurations:", e);
        setSetup(null);
      }
    } else {
      setSetup(null);
    }
  }, [user]);

  // Email, password and Facebook auth state variables
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // 2FA login verification state
  const [is2FAPromptActive, setIs2FAPromptActive] = useState(false);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaError, setTfaError] = useState("");
  const [tfaConfig, setTfaConfig] = useState<{
    enabled: boolean;
    secret: string;
    provider: "google" | "microsoft";
    setupAt: string;
  } | null>(null);

  const [isFinancialsUnlocked, setIsFinancialsUnlocked] = useState(false);

  const [loginSimCode, setLoginSimCode] = useState("000000");
  const [loginSecondsLeft, setLoginSecondsLeft] = useState(30);

  // 2FA state resolution effect
  useEffect(() => {
    if (user) {
      const storageKey = `pulse_2fa_${user.uid}`;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const config = JSON.parse(stored);
          if (config && config.enabled) {
            setTfaConfig(config);

            // Check device and 7-day session window
            let deviceToken = localStorage.getItem("pulse_device_token");
            if (!deviceToken) {
              deviceToken =
                "dev_" + Math.random().toString(36).substring(2, 11);
              localStorage.setItem("pulse_device_token", deviceToken);
            }

            const lastAuthTimeStr = localStorage.getItem(
              `pulse_device_auth_${user.uid}_${deviceToken}`,
            );
            const isFresh =
              lastAuthTimeStr &&
              Date.now() - parseInt(lastAuthTimeStr, 10) <
                7 * 24 * 60 * 60 * 1000; // 7 days

            if (isFresh) {
              setIs2FAPromptActive(false);
            } else {
              setIs2FAPromptActive(true);
            }
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
      setIs2FAPromptActive(false);
      setTfaConfig(null);
    } else {
      setIs2FAPromptActive(false);
      setTfaConfig(null);
      setIsFinancialsUnlocked(false);
    }
  }, [user]);

  // Dynamic code simulator for sign-in page
  useEffect(() => {
    if (!is2FAPromptActive || !tfaConfig || !tfaConfig.secret) return;

    let timer: NodeJS.Timeout;
    const updateSim = async () => {
      const code = await generateTOTP(tfaConfig.secret);
      setLoginSimCode(code);
      setLoginSecondsLeft(30 - (Math.floor(Date.now() / 1000) % 30));
    };

    updateSim();
    timer = setInterval(updateSim, 1000);
    return () => clearInterval(timer);
  }, [is2FAPromptActive, tfaConfig]);

  // Tab change locks Financials View again
  useEffect(() => {
    if (activeTab !== "financials") {
      setIsFinancialsUnlocked(false);
    }
  }, [activeTab]);

  const handleVerify2FALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTfaError("");

    if (!tfaCode || tfaCode.length !== 6) {
      setTfaError("Verification pin must be exactly 6 digits.");
      return;
    }

    if (tfaConfig && tfaConfig.enabled) {
      const isValid = await verifyTOTP(tfaCode, tfaConfig.secret);
      if (isValid) {
        let deviceToken = localStorage.getItem("pulse_device_token");
        if (!deviceToken) {
          deviceToken = "dev_" + Math.random().toString(36).substring(2, 11);
          localStorage.setItem("pulse_device_token", deviceToken);
        }
        localStorage.setItem(
          `pulse_device_auth_${user.uid}_${deviceToken}`,
          Date.now().toString(),
        );

        setIs2FAPromptActive(false);
        setTfaCode("");
      } else {
        setTfaError(
          "Incorrect verification pin. Verify your authenticator credentials or use the dynamic companion widget.",
        );
      }
    }
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!agreed) {
      setAuthError(
        "You must agree to the Terms of Service and Privacy Policy to continue.",
      );
      return;
    }
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error("Google Sign-in failed:", err);
      setAuthError(err.message || "Google authentication failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFacebookSignIn = async () => {
    if (!agreed) {
      setAuthError(
        "You must agree to the Terms of Service and Privacy Policy to continue.",
      );
      return;
    }
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await facebookSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error("Facebook Sign-in failed:", err);
      setAuthError(
        err.message ||
          "Facebook authentication failed. Make sure browser popups are allowed.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setAuthError(
        "You must agree to the Terms of Service and Privacy Policy to continue.",
      );
      return;
    }
    if (!email || !password) {
      setAuthError("Please fill in both email and password.");
      return;
    }
    if (authMode === "signup" && !displayName) {
      setAuthError("Please specify a displaying name.");
      return;
    }

    setIsLoggingIn(true);
    setAuthError(null);
    try {
      let result;
      if (authMode === "signup") {
        result = await emailSignUp(email, password, displayName);
      } else {
        result = await emailSignIn(email, password);
      }

      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error("Email Authentication failed:", err);
      let message = err.message || "Authentication failed.";
      const errCode = err.code || "";

      if (
        errCode === "auth/operation-not-allowed" ||
        message.includes("auth/operation-not-allowed") ||
        message.includes("operation-not-allowed")
      ) {
        message =
          'Email & Password authentication is not enabled in your Firebase project. To fix this:\n\n1. Go to the Firebase Console.\n2. Navigate to "Authentication" > "Sign-in method" tab.\n3. Click "Add new provider" (or Edit), choose "Email/Password", enable it, and click Save.\n\nOnce done, you can sign up or sign in successfully.';
      } else if (
        errCode === "auth/invalid-credential" ||
        message.includes("auth/invalid-credential") ||
        message.includes("invalid-credential")
      ) {
        message = "Incorrect email address or password. Please try again.";
      } else if (
        errCode === "auth/email-already-in-use" ||
        message.includes("email-already-in-use")
      ) {
        message =
          "This email address is already in use by another user account.";
      } else if (
        errCode === "auth/weak-password" ||
        message.includes("weak-password")
      ) {
        message = "The password must be at least 6 characters.";
      } else if (
        errCode === "auth/invalid-email" ||
        message.includes("invalid-email")
      ) {
        message = "Please enter a valid format email address.";
      } else if (
        errCode === "auth/user-not-found" ||
        message.includes("user-not-found")
      ) {
        message = "No account exists with this email address.";
      }
      setAuthError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoSignIn = () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const demoUserObj = {
        uid: "demo_user_id",
        email: "demo@pulse-erp.ca",
        displayName: "Demo Operator",
        photoURL: null,
      };
      const demoSetup = {
        businessName: "Pulse Demo Corp",
        location: "Toronto, Canada",
        sidebarOptions: [
          "dashboard",
          "hr",
          "marketing",
          "financials",
          "apps",
          "supply-chain",
          "products",
          "help",
        ],
        connectedApps: ["sheets", "calendar"],
        completed: true,
      };

      // Store in localStorage to cache the demo user and setup
      localStorage.setItem("pulse_cached_user", JSON.stringify(demoUserObj));
      localStorage.setItem("pulse_cached_token", "demo-token");
      localStorage.setItem(
        "pulse_setup_demo_user_id",
        JSON.stringify(demoSetup),
      );
      localStorage.setItem(
        "pulse_connected_apps",
        JSON.stringify(demoSetup.connectedApps),
      );
      localStorage.removeItem("pulse_2fa_demo_user_id");

      // Update state to trigger rendering main screen immediately
      setToken("demo-token");
      setUser(demoUserObj);
      setSetup(demoSetup);
      setNeedsAuth(false);
      setIs2FAPromptActive(false);
    } catch (err: any) {
      console.error("Demo Sign-in failed:", err);
      setAuthError("Demo Sign-in failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Generating 1 year of bi-weekly payroll history (26 periods)

  const initialPayrollHistory = useMemo(() => {
    const history = [];
    let currentDate = new Date();
    for (let i = 0; i < 26; i++) {
      history.push({
        id: `pr-${26 - i}`,
        periodEnd: new Date(currentDate).toISOString(),
        totalAmount: employees.reduce(
          (sum, e) => sum + (e.hourly_wage || 25) * 80,
          0,
        ),
        records: employees.map((e) => ({
          employee_id: e.id,
          basePay: (e.hourly_wage || 25) * 80,
          bonus: 0,
          deductions: (e.hourly_wage || 25) * 80 * 0.2, // 20% mock deductions
        })),
      });
      currentDate.setDate(currentDate.getDate() - 14); // Subtract 2 weeks
    }
    return history;
  }, [employees]);

  const [payrollHistory, setPayrollHistory] = useState(initialPayrollHistory);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "hr", label: "Human Resources", icon: Users },
    { id: "marketing", label: "Marketing", icon: Megaphone },
    { id: "financials", label: "Financials", icon: LineChartIcon },
    { id: "apps", label: "Apps", icon: Boxes },
    { id: "supply-chain", label: "Supply Chain", icon: Package },
    { id: "products", label: "Products & Demand", icon: ShoppingBag },
    { id: "help", label: "Help & FAQs", icon: HelpCircle },
  ] as const;

  const visibleTabs = useMemo(() => {
    if (setup && setup.completed) {
      return TABS.filter((tab) => {
        if (tab.id === "dashboard" || tab.id === "apps" || tab.id === "help") {
          return true;
        }
        return setup.sidebarOptions.includes(tab.id);
      });
    }
    return TABS;
  }, [setup]);

  // If activeTab is disabled/hidden from setup choices, automatically redirect to dashboard
  useEffect(() => {
    if (setup && setup.completed) {
      const isVisible = visibleTabs.some((t) => t.id === activeTab);
      if (!isVisible && activeTab !== "profile") {
        setActiveTab("dashboard");
      }
    }
  }, [setup, visibleTabs, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            employees={employees}
            departments={departments}
            payrollHistory={payrollHistory}
            preset={preset}
          />
        );
      case "hr":
        return (
          <HRView
            employees={employees}
            setEmployees={setEmployees}
            departments={departments}
            setDepartments={setDepartments}
            schedule={schedule}
            setSchedule={setSchedule}
            trendHistory={trendHistory}
            setTrendHistory={setTrendHistory}
            assessmentHistory={assessmentHistory}
            setAssessmentHistory={setAssessmentHistory}
            payrollHistory={payrollHistory}
            setPayrollHistory={setPayrollHistory}
            preset={preset}
          />
        );
      case "marketing":
        return <MarketingView />;
      case "financials":
        const activeTfaStored = localStorage.getItem(`pulse_2fa_${user?.uid}`);
        const activeTfa = activeTfaStored ? JSON.parse(activeTfaStored) : null;
        if (activeTfa && activeTfa.enabled && !isFinancialsUnlocked) {
          return (
            <FinancialsSecurityGate
              tfaConfig={activeTfa}
              onUnlock={() => setIsFinancialsUnlocked(true)}
              user={user}
              onNavigateToProfile={() => setActiveTab("profile")}
            />
          );
        }
        return <FinancialsView onNavigateToApps={() => setActiveTab("apps")} />;
      case "apps":
        return <AppsView preset={preset} />;
      case "supply-chain":
        return <SupplyChainView />;
      case "products":
        return <ProductsView />;
      case "profile":
        return (
          <ProfileView
            user={user}
            logout={logout}
            preset={preset}
            onSetPreset={handleSetPreset}
            setup={setup}
            onUpdateSetup={(newSetup) => {
              if (user) {
                const storageKey = `pulse_setup_${user.uid}`;
                localStorage.setItem(storageKey, JSON.stringify(newSetup));
                localStorage.setItem(
                  "pulse_connected_apps",
                  JSON.stringify(newSetup.connectedApps),
                );
                setSetup(newSetup);
              }
            }}
          />
        );
      case "help":
        return <HelpView />;
    }
  };

  const currentTabLabel = TABS.find((t) => t.id === activeTab)?.label;

  if (needsAuth) {
    return (
      <div
        className={`min-h-screen ${styles.canvas} flex flex-col justify-center items-center p-4 selection:bg-[#D4FC34] selection:text-[#0E0E0F] font-sans transition-colors duration-300 relative`}
      >
        <div
          className={`max-w-md w-full ${styles.card} p-8 relative animate-in fade-in duration-100`}
        >
          {/* Top Decorative Swiss Monospace Banner */}
          {preset === "editorial" && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#002FA7]" />
          )}

          {/* Logo & Header */}
          <div className="text-left mb-6">
            <h1
              className={`text-4xl font-extrabold tracking-tight uppercase flex items-center gap-3.5 ${preset === "cosmic" ? "text-[#FFFDF9]" : "text-[#201F1E]"}`}
            >
              <div className="w-7 h-7 shrink-0 text-emerald-500 animate-pulse flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              PULSE
            </h1>
          </div>

          {/* Quick Demo Access Bypass Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className={`w-full font-bold text-xs uppercase tracking-widest py-3.5 transition-all shadow-md active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer ${
                preset === "stark"
                  ? "bg-emerald-600 border border-emerald-700 hover:bg-emerald-500 text-white rounded-xl"
                  : preset === "cosmic"
                    ? "bg-indigo-600 border border-indigo-700 hover:bg-indigo-500 text-white rounded-xl"
                    : "bg-[#D4FC34] border-2 border-[#0E0E0F] text-[#0E0E0F] hover:bg-[#FFFDF9] shadow-[4px_4px_0px_0px_#0E0E0F] rounded-none"
              }`}
              id="auth-demo-btn"
            >
              <Users className="w-4.5 h-4.5" />
              Sign in with Demo Account
            </button>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 text-center mt-2.5 uppercase font-medium">
              ⚡ Instant access (Bypass Terms, 2FA & Onboarding)
            </p>
          </div>

          {/* Form Action Toggles */}
          <div
            className={`grid grid-cols-2 p-0.5 gap-0.5 mb-6 ${
              preset === "stark"
                ? "bg-slate-100 rounded-xl"
                : preset === "cosmic"
                  ? "bg-[#111215] rounded-xl"
                  : "border-[2px] border-[#0E0E0F] bg-[#0E0E0F]"
            }`}
          >
            <button
              onClick={() => {
                setAuthMode("signin");
                setAuthError(null);
              }}
              type="button"
              className={`py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                preset === "stark"
                  ? authMode === "signin"
                    ? "bg-white text-slate-800 rounded-xl shadow-sm"
                    : "bg-transparent text-slate-500 hover:text-slate-800"
                  : preset === "cosmic"
                    ? authMode === "signin"
                      ? "bg-[#1E293B] text-white rounded-xl"
                      : "bg-transparent text-slate-400 hover:text-white"
                    : authMode === "signin"
                      ? "bg-[#D4FC34] text-[#0E0E0F] rounded-none"
                      : "bg-[#FFFDF9] text-[#0E0E0F] hover:bg-[#FFFDF9]/80 rounded-none"
              }`}
              id="auth-tab-signin"
            >
              [ Sign In ]
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setAuthError(null);
              }}
              type="button"
              className={`py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                preset === "stark"
                  ? authMode === "signup"
                    ? "bg-white text-slate-800 rounded-xl shadow-sm"
                    : "bg-transparent text-slate-500 hover:text-slate-800"
                  : preset === "cosmic"
                    ? authMode === "signup"
                      ? "bg-[#1E293B] text-white rounded-xl"
                      : "bg-transparent text-slate-400 hover:text-white"
                    : authMode === "signup"
                      ? "bg-[#D4FC34] text-[#0E0E0F] rounded-none"
                      : "bg-[#FFFDF9] text-[#0E0E0F] hover:bg-[#FFFDF9]/80 rounded-none"
              }`}
              id="auth-tab-signup"
            >
              [ Create ]
            </button>
          </div>

          {/* Error Message Panel */}
          {authError && (
            <div
              className={`mb-4 p-3 text-xs font-mono font-bold leading-relaxed text-left whitespace-pre-line border ${
                preset === "stark"
                  ? "bg-rose-50 border-rose-150 text-rose-700 rounded-xl"
                  : preset === "cosmic"
                    ? "bg-[#D62518]/10 border-[#D62518]/30 text-rose-400 rounded-xl"
                    : "bg-[#FFFDF9] border-2 border-[#0E0E0F] text-rose-700 shadow-[3px_3px_0px_0px_#0E0E0F] rounded-none"
              }`}
            >
              !! WARNING: {authError}
            </div>
          )}

          {/* Core Auth Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div className="space-y-1.5 text-left">
                <label
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${preset === "cosmic" ? "text-slate-400" : "text-[#0E0E0F]"}`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="E.g., Dr. Jane Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full text-xs font-semibold px-3 py-2.5 outline-none transition-all ${
                      preset === "stark"
                        ? "bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-slate-800"
                        : preset === "cosmic"
                          ? "bg-[#16171B] border border-[#27272A] focus:border-violet-500 rounded-xl text-slate-200"
                          : "bg-[#FFFDF9] border-2 border-[#0E0E0F] focus:bg-[#D4FC34]/10 focus:border-[#002FA7] rounded-none text-[#0E0E0F]"
                    }`}
                    id="auth-name-input"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label
                className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${preset === "cosmic" ? "text-slate-400" : "text-[#0E0E0F]"}`}
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full text-xs font-semibold px-3 py-2.5 outline-none transition-all ${
                    preset === "stark"
                      ? "bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-slate-800"
                      : preset === "cosmic"
                        ? "bg-[#16171B] border border-[#27272A] focus:border-violet-500 rounded-xl text-slate-200"
                        : "bg-[#FFFDF9] border-2 border-[#0E0E0F] focus:bg-[#D4FC34]/10 focus:border-[#002FA7] rounded-none text-[#0E0E0F]"
                  }`}
                  id="auth-email-input"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label
                className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${preset === "cosmic" ? "text-slate-400" : "text-[#0E0E0F]"}`}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full text-xs font-semibold px-3 py-2.5 outline-none transition-all ${
                    preset === "stark"
                      ? "bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-slate-800"
                      : preset === "cosmic"
                        ? "bg-[#16171B] border border-[#27272A] focus:border-violet-500 rounded-xl text-slate-200"
                        : "bg-[#FFFDF9] border-2 border-[#0E0E0F] focus:bg-[#D4FC34]/10 focus:border-[#002FA7] rounded-none text-[#0E0E0F]"
                  }`}
                  id="auth-password-input"
                />
              </div>
            </div>

            {/* Terms and Privacy policy agreement box */}
            <div className="space-y-3">
              <div
                className={`flex items-start gap-2.5 py-2.5 px-3 select-none text-left border ${
                  preset === "stark"
                    ? "bg-slate-50 border-slate-200 rounded-xl text-slate-650"
                    : preset === "cosmic"
                      ? "bg-[#111215] border-[#27272A] rounded-xl text-slate-300"
                      : "bg-[#FFFDF9] border-2 border-[#0E0E0F] text-[#0E0E0F] rounded-none"
                }`}
              >
                <input
                  type="checkbox"
                  id="terms-agreement-checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className={`mt-0.5 h-4 w-4 transition-all cursor-pointer accent-[#D4FC34] shrink-0 ${
                    preset === "editorial"
                      ? "rounded-none border-2 border-[#0E0E0F]"
                      : "rounded border-slate-300"
                  }`}
                />
                <label
                  htmlFor="terms-agreement-checkbox"
                  className={`text-[10.5px] leading-normal cursor-pointer font-bold uppercase tracking-tight ${preset === "cosmic" ? "text-slate-350" : "text-[#0E0E0F]"}`}
                >
                  Authorize connection and agree to Canadian compliant{" "}
                  <button
                    type="button"
                    onClick={() => setCanadianLegalModal("terms")}
                    className="underline hover:text-indigo-400 font-bold bg-transparent border-none p-0 inline cursor-pointer outline-none"
                  >
                    Terms of Use
                  </button>{" "}
                  &{" "}
                  <button
                    type="button"
                    onClick={() => setCanadianLegalModal("privacy")}
                    className="underline hover:text-indigo-400 font-bold bg-transparent border-none p-0 inline cursor-pointer outline-none"
                  >
                    Privacy Policy
                  </button>{" "}
                  (PIPEDA & Law 25).
                </label>
              </div>

              {authMode === "signup" && (
                <div
                  className={`flex items-start gap-2.5 py-2.5 px-3 select-none text-left border ${
                    preset === "stark"
                      ? "bg-slate-50 border-slate-200 rounded-xl text-slate-650"
                      : preset === "cosmic"
                        ? "bg-[#111215] border-[#27272A] rounded-xl text-slate-300"
                        : "bg-[#FFFDF9] border-2 border-[#0E0E0F] text-[#0E0E0F] rounded-none"
                  }`}
                >
                  <input
                    type="checkbox"
                    id="casl-agreement-checkbox"
                    checked={caslConsent}
                    onChange={(e) => setCaslConsent(e.target.checked)}
                    className={`mt-0.5 h-4 w-4 transition-all cursor-pointer accent-[#D4FC34] shrink-0 ${
                      preset === "editorial"
                        ? "rounded-none border-2 border-[#0E0E0F]"
                        : "rounded border-slate-300"
                    }`}
                  />
                  <label
                    htmlFor="casl-agreement-checkbox"
                    className={`text-[10.1px] leading-normal cursor-pointer font-medium tracking-tight ${preset === "cosmic" ? "text-slate-400" : "text-slate-600"}`}
                  >
                    <span className="font-bold uppercase tracking-widest text-indigo-600 dark:text-sky-400 block mb-0.5">
                      [Optional CASL Opt-In]
                    </span>
                    I consent to receive commercial electronic messages
                    (updates, newsletters, optimization analytics) from Pulse
                    ERP. I can unsubscribe or manage notifications at any time.
                  </label>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full font-bold text-xs uppercase tracking-widest py-3.5 transition-all shadow-md active:translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${
                preset === "stark"
                  ? "bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 rounded-xl"
                  : preset === "cosmic"
                    ? "bg-violet-600 border border-violet-700 text-white hover:bg-violet-500 rounded-xl"
                    : "bg-[#0E0E0F] border-2 border-[#0E0E0F] text-[#FFFDF9] hover:bg-[#D4FC34] hover:text-[#0E0E0F] shadow-[4px_4px_0px_0px_#002FA7] hover:shadow-[4px_4px_0px_0px_#0E0E0F] rounded-none"
              }`}
              id="auth-submit-btn"
            >
              <LogIn className="w-4 h-4" />
              {isLoggingIn
                ? "Establishing..."
                : authMode === "signup"
                  ? "Deploy Credentials"
                  : "Sign in"}
            </button>
          </form>

          {/* Social Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className={`w-full border-t ${preset === "stark" ? "border-slate-205 border-slate-200" : preset === "cosmic" ? "border-slate-800" : "border-t-2 border-[#0E0E0F]"}`}
              ></div>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className={`flex items-center justify-center gap-2 font-mono font-bold text-[10px] uppercase py-2.5 px-2 transition-all cursor-pointer border ${
                preset === "stark"
                  ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm"
                  : preset === "cosmic"
                    ? "bg-[#1F2937] border border-[#2E3139] hover:bg-slate-850 text-slate-300 rounded-xl"
                    : "bg-[#FFFDF9] border-2 border-[#0E0E0F] hover:bg-[#D4FC34] hover:text-[#0E0E0F] text-[#0E0E0F] shadow-[3px_3px_0px_0px_#0E0E0F] rounded-none"
              }`}
              id="auth-google-btn"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 12-4.52z"
                />
              </svg>
              Google Sign-In
            </button>

            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={isLoggingIn}
              className={`flex items-center justify-center gap-2 font-mono font-bold text-[10px] uppercase py-2.5 px-2 transition-all cursor-pointer border ${
                preset === "stark"
                  ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm"
                  : preset === "cosmic"
                    ? "bg-[#1F2937] border border-[#2E3139] hover:bg-[#2E3139] text-violet-400 rounded-xl"
                    : "bg-[#FFFDF9] border-2 border-[#0E0E0F] hover:bg-[#002FA7] hover:text-white text-[#0E0E0F] shadow-[3px_3px_0px_0px_#0E0E0F] rounded-none"
              }`}
              id="auth-facebook-btn"
            >
              <svg
                className="w-4 h-4 shrink-0 text-[#1877F2]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook Sign-In
            </button>
          </div>

          <div
            className={`text-center mt-6 pt-4 border-t border-dashed ${preset === "stark" ? "border-slate-100" : preset === "cosmic" ? "border-slate-800" : "border-slate-300"}`}
          >
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tight leading-normal max-w-[320px] mx-auto">
              Secure multi-tenant enterprise protocol. Unauthorized telemetry
              intercepts are archived and logged.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (is2FAPromptActive) {
    return (
      <div
        className={`min-h-screen ${styles.canvas} flex flex-col justify-center items-center p-4 selection:bg-[#D4FC34] selection:text-[#0E0E0F] select-none font-sans transition-colors duration-300 relative`}
      >
        <div
          className={`max-w-md w-full ${styles.card} p-8 relative animate-in fade-in duration-75 text-left`}
        >
          {preset === "editorial" && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#002FA7]" />
          )}

          <div
            className={`border-b ${preset === "stark" ? "border-slate-100" : preset === "cosmic" ? "border-[#3b3b3b]" : "border-[#EDEBE9]"} pb-3 mb-6`}
          >
            <h1
              className={`text-2xl font-black tracking-tight uppercase flex items-center gap-3.5 ${preset === "cosmic" ? "text-white" : "text-[#201F1E]"}`}
            >
              <div className="w-[22px] h-[22px] shrink-0 text-emerald-500 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[22px] h-[22px]"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              SECURITY VERIFICATION
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wide mt-1">
              Active Session Guard // Unrecognized Terminal Detected
            </p>
          </div>

          <p
            className={`text-xs leading-relaxed font-bold mb-6 ${preset === "cosmic" ? "text-slate-300" : "text-[#0E0E0F]"}`}
          >
            Input the active 6-digit cryptographic PIN displayed inside your{" "}
            <span className="underline">
              {tfaConfig?.provider === "google" ? "Google" : "Microsoft"}{" "}
              Authenticator
            </span>{" "}
            smartphone application:
          </p>

          <form onSubmit={handleVerify2FALogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label
                className={`text-[10px] font-mono font-bold uppercase tracking-wider block text-center ${preset === "cosmic" ? "text-slate-400" : "text-[#0E0E0F]"}`}
              >
                Cryptographic Security Input
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000 000"
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ""))}
                className={`w-full text-2xl font-black px-4 py-3 outline-none text-center tracking-widest font-mono ${
                  preset === "stark"
                    ? "bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-slate-800"
                    : preset === "cosmic"
                      ? "bg-[#16171B] border-2 border-[#27272A] focus:border-violet-500 rounded-xl text-slate-200"
                      : "bg-[#FFFDF9] border-[3px] border-[#0E0E0F] focus:bg-[#D4FC34]/15 text-[#0E0E0F]"
                }`}
                id="login-tfa-input"
              />
            </div>

            {tfaError && (
              <div
                className={`p-3.5 border-2 font-mono text-[10.5px] font-black leading-relaxed flex items-center gap-1.5 text-left ${
                  preset === "stark"
                    ? "bg-rose-50 border-rose-220 border-rose-200 text-rose-700 rounded-xl"
                    : preset === "cosmic"
                      ? "bg-[#D62518]/10 border-[#D62518]/30 text-rose-400 rounded-xl"
                      : "bg-[#FFFDF9] border-[#0E0E0F] text-rose-700"
                }`}
              >
                [X] FAIL: {tfaError}
              </div>
            )}

            <button
              type="submit"
              className={`w-full font-bold text-xs uppercase tracking-widest py-3.5 active:translate-y-0.5 cursor-pointer border shadow-sm ${
                preset === "stark"
                  ? "bg-slate-900 border-slate-950 text-white hover:bg-slate-850 rounded-xl"
                  : preset === "cosmic"
                    ? "bg-violet-600 border-violet-700 text-white hover:bg-violet-500 rounded-xl shadow-lg"
                    : "bg-[#0E0E0F] border-2 border-[#0E0E0F] text-[#FFFDF9] hover:bg-[#D4FC34] hover:text-[#0E0E0F] shadow-[4px_4px_0px_0px_#002FA7] hover:shadow-[4px_4px_0px_0px_#0E0E0F] rounded-none"
              }`}
              id="login-tfa-submit-btn"
            >
              Verify Security Token
            </button>
          </form>

          {/* SIMULATOR COMPANION WIDGET ON SIGN IN */}
          <div
            className={`mt-8 pt-6 border-t-2 border-dashed ${preset === "stark" ? "border-slate-200" : preset === "cosmic" ? "border-slate-800" : "border-[#0E0E0F]"} space-y-4`}
          >
            <div
              className={`p-4 flex flex-col justify-between text-left border ${
                preset === "stark"
                  ? "bg-[#F8FAFC] border-slate-200 rounded-xl text-slate-800 shadow-sm"
                  : preset === "cosmic"
                    ? "bg-[#16171B] border-[#27272A] rounded-xl text-slate-300"
                    : "bg-[#0E0E0F] text-[#FFFDF9] border-[3.5px] border-[#0E0E0F] shadow-[4px_4px_0px_0px_#D4FC34]"
              }`}
            >
              <div
                className={`border-b pb-2 mb-3 flex items-center justify-between ${preset === "cosmic" ? "border-white/10" : "border-[#0E0E0F]/10"}`}
              >
                <div
                  className={`flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-mono font-bold ${preset === "cosmic" ? "text-violet-400" : "text-[#008060]"}`}
                >
                  ● ACTIVE HARDWARE GENERATOR
                </div>
                <button
                  type="button"
                  onClick={() => setTfaCode(loginSimCode)}
                  className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 cursor-pointer ${
                    preset === "stark"
                      ? "bg-slate-200 hover:bg-slate-300 text-slate-800 rounded"
                      : preset === "cosmic"
                        ? "bg-violet-600/80 hover:bg-violet-600 text-white rounded"
                        : "bg-[#D4FC34] text-[#0E0E0F] hover:bg-[#FFFDF9]"
                  }`}
                >
                  Autofill Token
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`text-[7.5px] font-mono font-bold uppercase block leading-none mb-1 ${preset === "cosmic" ? "text-slate-450 text-slate-400" : "text-slate-500"}`}
                  >
                    {tfaConfig?.provider === "google" ? "Google" : "Microsoft"}{" "}
                    SecToken Feed
                  </span>
                  <span
                    className={`text-2xl font-black tracking-widest font-mono block ${preset === "cosmic" ? "text-violet-400" : "text-slate-800"}`}
                  >
                    {loginSimCode.substring(0, 3)}{" "}
                    {loginSimCode.substring(3, 6)}
                  </span>
                </div>
                <div
                  className={`border px-2 py-1 text-[8px] font-extrabold font-mono rounded ${
                    preset === "stark"
                      ? "bg-slate-100 border-slate-205 text-slate-700"
                      : preset === "cosmic"
                        ? "bg-slate-800 border-slate-700 text-slate-300"
                        : "bg-[#FFFDF9]/15 border-white/10 text-white"
                  }`}
                >
                  CYCLE:{" "}
                  <span
                    className={
                      preset === "cosmic"
                        ? "text-violet-450 text-violet-400"
                        : preset === "editorial"
                          ? "text-[#D4FC34]"
                          : "text-[#008060] font-bold"
                    }
                  >
                    {loginSecondsLeft}S
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={logout}
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-600 hover:underline cursor-pointer"
              >
                [ TERMINATE SECURE COUPLING ]
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && (!setup || !setup.completed)) {
    return (
      <OnboardingSetup
        user={user}
        preset={preset}
        onSetPreset={handleSetPreset}
        onComplete={(setupData) => {
          localStorage.setItem(
            `pulse_setup_${user.uid}`,
            JSON.stringify(setupData),
          );
          localStorage.setItem(
            "pulse_connected_apps",
            JSON.stringify(setupData.connectedApps),
          );
          setSetup(setupData);
        }}
      />
    );
  }

  return (
    <div
      className={`h-screen w-full flex font-sans overflow-hidden selection:bg-[#D4FC34] selection:text-[#0E0E0F] ${styles.canvas} transition-colors duration-300`}
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-[#0E0E0F]/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Nav */}
      <motion.nav
        initial={isMobile ? { x: "-100%" } : { x: 0 }}
        animate={isMobile ? { x: sidebarOpen ? 0 : "-100%" } : { x: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 225, mass: 0.8 }}
        className={`fixed md:static inset-y-0 left-0 z-50 w-68 flex flex-col justify-between ${styles.sidebar} shrink-0`}
      >
        <div>
          {/* Brand Header */}
          <div
            className={`p-5 flex items-center justify-between border-b ${preset === "stark" ? "border-slate-100" : "border-white/10"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${
                  preset === "cosmic"
                    ? "bg-[#2D2D2D] border-slate-700"
                    : "bg-[#FFFFFF] border-[#E0DEDC]"
                }`}
              >
                <div className="w-[18px] h-[18px] text-emerald-500 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[18px] h-[18px]"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1">
                  <span
                    className={`font-extrabold text-[13px] tracking-tight uppercase leading-none ${
                      preset === "stark" ? "text-slate-800" : "text-white"
                    }`}
                  >
                    Pulse Admin
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
                </div>
                <span
                  className={`text-[9.5px] ${preset === "stark" ? "text-slate-400" : "text-slate-500"} font-semibold tracking-wide leading-none mt-1`}
                >
                  Global Operations
                </span>
              </div>
            </div>
            <button
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Sidebar Navigation */}
          <div className="mt-5 space-y-5 px-3 overflow-y-auto max-h-[calc(100vh-220px)]">
            {/* Group 1: CORE ANALYTICS */}
            <div className="space-y-1">
              <div
                className={`px-4 text-[9px] font-mono font-bold tracking-wider ${
                  preset === "stark" ? "text-slate-400" : "text-[#FFFDF9]/40"
                } uppercase`}
              >
                CORE ANALYTICS
              </div>
              <ul className="space-y-0.5">
                {visibleTabs
                  .filter((t) =>
                    ["dashboard", "products", "supply-chain"].includes(t.id),
                  )
                  .map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => {
                            setActiveTab(tab.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full px-4 py-2 flex items-center gap-3 transition-all font-semibold uppercase tracking-wide text-xs ${
                            isActive ? styles.tabActive : styles.tabInactive
                          }`}
                        >
                          <tab.icon
                            className={`w-4.5 h-4.5 ${isActive ? "text-emerald-600 dark:text-violet-400" : "text-slate-400"}`}
                          />
                          <span className="font-sans leading-none">
                            {tab.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>

            {/* Group 2: OPERATIONS */}
            <div className="space-y-1">
              <div
                className={`px-4 text-[9px] font-mono font-bold tracking-wider ${
                  preset === "stark" ? "text-slate-400" : "text-[#FFFDF9]/40"
                } uppercase`}
              >
                OPERATIONS
              </div>
              <ul className="space-y-0.5">
                {visibleTabs
                  .filter((t) =>
                    ["financials", "hr", "marketing"].includes(t.id),
                  )
                  .map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => {
                            setActiveTab(tab.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full px-4 py-2 flex items-center gap-3 transition-all font-semibold uppercase tracking-wide text-xs ${
                            isActive ? styles.tabActive : styles.tabInactive
                          }`}
                        >
                          <tab.icon
                            className={`w-4.5 h-4.5 ${isActive ? "text-emerald-600 dark:text-violet-400" : "text-slate-400"}`}
                          />
                          <span className="font-sans leading-none">
                            {tab.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>

            {/* Group 3: ADMIN & APPS */}
            <div className="space-y-1">
              <div
                className={`px-4 text-[9px] font-mono font-bold tracking-wider ${
                  preset === "stark" ? "text-slate-400" : "text-[#FFFDF9]/40"
                } uppercase`}
              >
                ADMIN & APPS
              </div>
              <ul className="space-y-0.5">
                {visibleTabs
                  .filter((t) => ["apps", "help"].includes(t.id))
                  .map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => {
                            setActiveTab(tab.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full px-4 py-2 flex items-center gap-3 transition-all font-semibold uppercase tracking-wide text-xs ${
                            isActive ? styles.tabActive : styles.tabInactive
                          }`}
                        >
                          <tab.icon
                            className={`w-4.5 h-4.5 ${isActive ? "text-emerald-600 dark:text-violet-400" : "text-slate-400"}`}
                          />
                          <span className="font-sans leading-none">
                            {tab.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>

        {/* User profile details at the bottom of sidebar */}
        <div
          className={`p-4 border-t ${preset === "stark" ? "border-slate-100 bg-[#F8FAFC]" : "border-white/10 bg-white/5"} flex flex-col gap-2`}
        >
          <button
            onClick={() => {
              setActiveTab("profile");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all text-left ${
              preset === "stark" ? "hover:bg-slate-200/50" : "hover:bg-white/10"
            }`}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-rose-400 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold block">
                  {user?.displayName?.charAt(0) || "U"}
                </span>
              </div>
            )}
            <div className="flex flex-col overflow-hidden max-w-[130px]">
              <span
                className={`text-[11px] font-bold truncate block tracking-wide ${
                  preset === "stark" ? "text-slate-800" : "text-white"
                } uppercase`}
              >
                {user?.displayName || "OPERATOR"}
              </span>
              <span className="text-slate-400 font-mono text-[8.5px] truncate block font-medium">
                {user?.email || "zone28069@gmail.com"}
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              logout();
              setNeedsAuth(true);
            }}
            className="w-full text-left px-2 py-1 text-[9.5px] font-mono font-bold uppercase tracking-wider text-rose-500 hover:text-rose-700 transition-all text-center border border-dashed border-rose-500/20 rounded-lg hover:bg-rose-500/5"
          >
            → SIGN OUT TERMINAL
          </button>
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar */}
        <header
          className={`h-20 flex items-center justify-between px-6 md:px-10 shrink-0 relative ${styles.header} transition-colors duration-300`}
        >
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-[#0E0E0F] hover:bg-[#D4FC34] p-1.5 border border-slate-200 rounded-lg bg-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span
                className={`font-extrabold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded ${
                  preset === "stark"
                    ? "bg-[#F1F3F5] text-[#0E0E0F]"
                    : preset === "cosmic"
                      ? "bg-[#1E293B] text-slate-200"
                      : "bg-[#D4FC34] text-[#0E0E0F] border border-[#0E0E0F]"
                }`}
              >
                {currentTabLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={preset}
              onChange={(e) => handleSetPreset(e.target.value as PresetName)}
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                preset === "stark"
                  ? "bg-white border-slate-200 text-slate-700"
                  : preset === "cosmic"
                    ? "bg-[#1E293B] border-slate-700 text-slate-200"
                    : preset === "mist"
                      ? "bg-white border-[#DDE3EE] text-[#1E293B]"
                      : "bg-[#FFFDF9] border-2 border-[#0E0E0F] text-[#0E0E0F]"
              }`}
              aria-label="Select website theme"
              id="header-theme-select"
            >
              <option value="stark">Stark</option>
              <option value="editorial">Editorial</option>
              <option value="cosmic">Cosmic</option>
              <option value="mist">Mist</option>
            </select>

            {/* Config settings button */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border ${
                preset === "stark"
                  ? "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                  : preset === "cosmic"
                    ? "bg-[#1E293B] border-slate-700 hover:bg-[#2A3547] text-slate-200"
                    : "bg-[#FFFDF9] border-2 border-[#0E0E0F] hover:bg-[#D4FC34] text-[#0E0E0F]"
              } transition-all`}
              title="Settings & Profile"
              id="header-settings-btn"
            >
              <Settings className="w-5.5 h-5.5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div
          className={`flex-1 overflow-y-auto p-6 md:p-10 relative z-10 transition-colors duration-300 ${styles.canvas}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AssistantChat />

      {/* CANADIAN LEGAL COMPLIANCE MODAL */}
      {canadianLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
          <div
            className={`w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative ${
              preset === "stark"
                ? "bg-white border border-slate-200 rounded-2xl text-slate-800"
                : preset === "cosmic"
                  ? "bg-[#18181B] border border-[#27272A] rounded-2xl text-slate-200"
                  : "bg-[#FFFDF9] border-4 border-[#0E0E0F] text-[#0E0E0F] rounded-none"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-6 border-b flex items-center justify-between ${
                preset === "stark"
                  ? "border-slate-100 bg-slate-50"
                  : preset === "cosmic"
                    ? "border-zinc-800 bg-zinc-900/50"
                    : "border-[#0E0E0F] bg-[#D4FC34]/10"
              }`}
            >
              <div>
                <span
                  className={`text-[9px] font-mono font-bold uppercase tracking-widest ${
                    preset === "cosmic" ? "text-violet-400" : "text-indigo-600"
                  }`}
                >
                  CANADIAN_LEGAL_COMPLIANCE_MATRIX
                </span>
                <h3
                  className={`text-base font-extrabold ${preset === "editorial" ? "font-mono uppercase" : "tracking-tight"} mt-1`}
                >
                  {canadianLegalModal === "terms"
                    ? "Canadian Terms of Use"
                    : "Canadian Privacy Protection Standard (PIPEDA & Quebec Law 25 compliant)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCanadianLegalModal(null)}
                className={`p-1.5 rounded-lg border ${
                  preset === "stark"
                    ? "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    : preset === "cosmic"
                      ? "bg-[#1E293B] border-slate-700 text-[#60CDFF] hover:bg-[#2A3547]"
                      : "bg-[#FFFDF9] border-2 border-[#0E0E0F] text-[#0E0E0F] hover:bg-[#D4FC34]"
                } font-mono text-[10px] font-bold cursor-pointer transition-colors`}
              >
                [ CLOSE ]
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed max-h-[60vh] select-text">
              {canadianLegalModal === "terms" ? (
                <>
                  <p className="font-semibold text-sm">
                    Welcome to Pulse ERP. These Terms of Use constitute a
                    binding legal agreement governing operations within Canada
                    and international corporate regions.
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-500">
                      1. Canadian Regulatory Jurisdiction
                    </h4>
                    <p>
                      This application, service structure, and database
                      instances comply strictly with federal laws of Canada,
                      including PIPEDA and provincial commerce statutes of all
                      Canadian provinces and territories. Any disputes,
                      arbitrations, or operational reviews will fall under the
                      exclusive jurisdiction of the courts of the relevant
                      Canadian region selected inside your profile matrix.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-500">
                      2. Prohibited & Unlawful Uses
                    </h4>
                    <p>
                      Pulse ERP mandates that all services and connected
                      accounts be deployed solely for verified business
                      intelligence operations. Users must not utilize system
                      algorithms for unauthorized data mining, fraud, tax
                      manipulation, or anti-competitive actions prohibited under
                      the Competition Act of Canada.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-500">
                      3. CASL (Canada’s Anti-Spam Legislation) Integrity
                    </h4>
                    <p>
                      All administrative reports, transaction invoices, and
                      mission-critical operation notifications sent to users via
                      e-mail constitute transactional updates, which are
                      necessary for service fulfillment under Canadian law.
                      Users can configure optional marketing newsletters or
                      promotion insights separately, in full accordance with the
                      Express Consent requirements established under CASL
                      guidelines.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-500">
                      4. Limitation of Liability
                    </h4>
                    <p>
                      Pulse ERP represents a predictive ERP matrix. While its
                      predictive suite and automated algorithms boast up to 99%
                      operational precision, Pulse is not liable for direct,
                      indirect, incidental, or consequential losses in corporate
                      profit arising from automatic dispatching, shifting
                      schedules, or predictive financials models.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-500">
                      5. Amendments to Terms
                    </h4>
                    <p>
                      We reserves the right, at our sole discretion, to update,
                      alter, or replace any portion of these Terms. In
                      compliance with Canadian standards, we will publish a
                      banner announcement on the dashboard or notify active
                      operators of major revisions, providing 30 days of advance
                      notice.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm font-sans">
                    Pulse ERP is fully committed to upholding our users’ privacy
                    rights in accordance with the Personal Information
                    Protection and Electronic Documents Act (PIPEDA), Quebec’s
                    Law 25, and provincial privacy regulations.
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-500 font-mono">
                      I. The 10 PIPEDA Fair Information Principles
                    </h4>
                    <ul className="list-decimal list-inside space-y-1.5 pl-2">
                      <li>
                        <strong>Accountability:</strong> We have designated a
                        dedicated Privacy Officer (reachable at{" "}
                        <strong>privacy@pulse-erp.ca</strong>) responsible for
                        validating server-side compliance across all database
                        nodes.
                      </li>
                      <li>
                        <strong>Identifying Purposes:</strong> We collect
                        business identifier details, emails, and financial
                        inputs purely to build your ERP suite, track employee
                        metrics, and output analytics.
                      </li>
                      <li>
                        <strong>Consent:</strong> Explicit opt-in consent is
                        requested during registration. Pre-selected
                        communication checkboxes are fully disabled for
                        marketing.
                      </li>
                      <li>
                        <strong>Limiting Collection:</strong> We do not log
                        location or microphone feeds unless specifically
                        authorized in the application settings under your active
                        permission tree.
                      </li>
                      <li>
                        <strong>
                          Limiting Use, Disclosure, and Retention:
                        </strong>{" "}
                        Personal details are never distributed, sold, or shared
                        with third parties for promotional purposes. Databases
                        are purged upon account deletion.
                      </li>
                      <li>
                        <strong>Accuracy:</strong> All profiles can be updated
                        instantly inside the Settings & Profile dashboard tab.
                      </li>
                      <li>
                        <strong>Safeguards:</strong> Multi-factor security
                        (TOTP) and TLS 1.3 encryption protect administrative
                        tables, logs, and financial pipelines from unauthorized
                        breaches.
                      </li>
                      <li>
                        <strong>Openness:</strong> Our data practices are openly
                        defined, with immediate access to logs available on user
                        demand.
                      </li>
                      <li>
                        <strong>Individual Access:</strong> You possess the
                        absolute right to request download manifests of all
                        files, employee registry sheets, and audit trails.
                      </li>
                      <li>
                        <strong>Challenging Compliance:</strong> Users can file
                        issues directly with the Office of the Privacy
                        Commissioner of Canada if they believe security
                        protocols have been compromised.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 border-t pt-4 border-slate-100/50">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-500 font-mono">
                      II. Quebec Law 25 Protections
                    </h4>
                    <p>
                      Pulse ERP provides deep coverage for Quebec-based entities
                      under Law 25 parameters:
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>
                        <strong>Designated Officer:</strong> Pulse’s compliance
                        matrix identifies our Chief Technology Officer as the
                        lead for privacy response.
                      </li>
                      <li>
                        <strong>
                          Right to erasure (right to be forgotten):
                        </strong>{" "}
                        Users can instantly initiate absolute account purging to
                        wipe profile references, emails, and database records
                        from active tables.
                      </li>
                      <li>
                        <strong>Data Portability:</strong> Users can export
                        dynamic CSV reports for employee rosters, payroll
                        budgets, and marketing structures to ensure fully fluid
                        cross-platform transfers.
                      </li>
                      <li>
                        <strong>Privacy by Default:</strong> High-security
                        parameters, data-minimization settings, and 2FA features
                        are readily deployed to protect sensitive files from
                        standard network sweeps.
                      </li>
                      <li>
                        <strong>Incidents Registry:</strong> Confidentiality
                        breaches are automatically logged inside our secure
                        firestore registers, with mandatory notifications sent
                        to the Commission d'accès à l'information within 72
                        hours if high-risk incidents arise.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 border-t pt-4 border-slate-100/50 flex flex-col gap-1">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-500 font-mono">
                      III. CASL Unsubscribe Integrity
                    </h4>
                    <p>
                      Pulse ERP enforces a zero-tolerance policy for unsolicited
                      automated electronic messages. Every marketing email,
                      optimization alert, or newsletter sent features a visible
                      one-click Unsubscribe button. All list purge requests are
                      executed within 10 legislative business days.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`p-6 border-t flex items-center justify-end gap-3 ${
                preset === "stark"
                  ? "border-slate-100 bg-slate-50"
                  : preset === "cosmic"
                    ? "border-zinc-800 bg-zinc-900/50"
                    : "border-[#0E0E0F] bg-[#FFFDF9]"
              }`}
            >
              {canadianLegalModal === "terms" && (
                <span className="text-[9.5px] font-mono font-semibold text-slate-500 mr-auto uppercase">
                  Jurisdiction: Court of Canada
                </span>
              )}
              {canadianLegalModal === "privacy" && (
                <span className="text-[9.5px] font-mono font-semibold text-slate-500 mr-auto uppercase">
                  Contact: privacy@pulse-erp.ca
                </span>
              )}
              <button
                type="button"
                onClick={() => setCanadianLegalModal(null)}
                className={`text-xs font-bold uppercase tracking-wider px-6 py-2.5 shadow-sm active:translate-y-0.5 transition-all cursor-pointer ${
                  preset === "stark"
                    ? "bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                    : preset === "cosmic"
                      ? "bg-violet-600 text-white hover:bg-violet-500 rounded-xl"
                      : "bg-[#0E0E0F] border-2 border-[#0E0E0F] text-[#FFFDF9] hover:bg-[#D4FC34] hover:text-[#0E0E0F] rounded-none"
                }`}
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
