import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Unlock, HelpCircle, Smartphone, Key, Info, Check, Eye } from 'lucide-react';
import { verifyTOTP, generateTOTP } from '../lib/totp';

interface FinancialsSecurityGateProps {
  tfaConfig: {
    enabled: boolean;
    secret: string;
    provider: 'google' | 'microsoft';
    setupAt: string;
  } | null;
  onUnlock: () => void;
  user: any;
  onNavigateToProfile: () => void;
}

export function FinancialsSecurityGate({ tfaConfig, onUnlock, user, onNavigateToProfile }: FinancialsSecurityGateProps) {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Companion Emulator state to assist fast testing
  const [simulatedCode, setSimulatedCode] = useState('000000');
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const updateSimulatedCode = async () => {
      if (tfaConfig?.enabled && tfaConfig.secret) {
        const pin = await generateTOTP(tfaConfig.secret);
        setSimulatedCode(pin);
      }
      const seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
      setSecondsRemaining(seconds);
    };

    updateSimulatedCode();
    timer = setInterval(updateSimulatedCode, 1000);

    return () => clearInterval(timer);
  }, [tfaConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code || code.length !== 6) {
      setErrorMsg('Verification codes must contain exactly 6 digits.');
      return;
    }

    if (tfaConfig && tfaConfig.enabled) {
      const isValid = await verifyTOTP(code, tfaConfig.secret);
      if (isValid) {
        setIsUnlocked(true);
        setTimeout(() => {
          onUnlock();
        }, 800);
      } else {
        setErrorMsg('Invalid 6-digit confirmation pin. Try copying the dynamic code from the companion widget.');
      }
    }
  };

  // If 2FA is NOT enabled in settings at all
  if (!tfaConfig || !tfaConfig.enabled) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-left animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center gap-4 border-b pb-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Financial Channel Suspended</h2>
            <p className="text-[10px] text-slate-400 font-medium">Under Enterprise Policy PX-41, viewing ledger details requires active 2FA scopes.</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Corporate profit-and-loss balances, tax calculations, and EBITDA sheets represent isolated multi-tenant data. Viewing these reports without Multi-Factor Authentication (MFA) is strictly restricted under Pulse regulations.
          </p>

          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-[11px] text-indigo-900 leading-relaxed font-semibold flex gap-2 items-start">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Configuring Google or Microsoft Authenticator will immediately encrypt your user channel and release financials visualization access credentials.
            </span>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={onNavigateToProfile}
              className="flex-1 bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer text-center"
            >
              Provision 2FA in Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If 2FA IS enabled, prompt them to solve the lock
  return (
    <div className="max-w-2xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-300">
      
      {/* Verification Gate form pane */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left">
        <div>
          <div className="flex items-center gap-3 border-b pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
              {isUnlocked ? (
                <Unlock className="w-5 h-5 text-emerald-500 animate-bounce" />
              ) : (
                <Lock className="w-5 h-5 text-orange-500 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">Financial Ledger Sealed</h2>
              <p className="text-[10px] text-slate-450 text-slate-400 font-medium leading-none mt-1">Multi-factor confirmation required for active session.</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-6">
            Please enter the active 6-digit verification code generated by your {tfaConfig.provider === 'google' ? 'Google' : 'Microsoft'} Authenticator application to view ledger analytics.
          </p>

          {isUnlocked ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] uppercase tracking-wider font-extrabold p-4 rounded-xl flex items-center justify-center gap-2 font-sans animate-pulse">
              <ShieldCheck className="w-5 h-5 text-emerald-600 animate-bounce" />
              Identity Decrypted. Transitioning...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Security Token</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g., 529124"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 text-center text-sm font-black tracking-widest px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors font-mono"
                    id="gate-code-input"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 border border-slate-950 text-white hover:bg-black font-extrabold text-xs uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-sm cursor-pointer"
                    id="gate-submit-btn"
                  >
                    Confirm
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-600 text-[10px] font-semibold leading-relaxed rounded-xl flex items-center gap-1.5 select-text">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </div>

        <div className="pt-6 border-t mt-6 flex justify-between">
          <button
            onClick={onNavigateToProfile}
            className="text-[10px] font-extrabold text-slate-400 hover:text-emerald-600 uppercase tracking-widest cursor-pointer"
          >
            Manage Security Settings
          </button>
        </div>
      </div>

      {/* COMPANION SIMULATOR DRAWER */}
      <div className="lg:col-span-5 bg-slate-950 text-white rounded-3xl p-5 border border-slate-900 shadow-md flex flex-col justify-between text-left">
        <div className="border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Web-Emulator
          </div>
          <span className="bg-emerald-500/10 text-emerald-300 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
            Preview Companion
          </span>
        </div>

        <div className="space-y-4 py-1">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-405 text-slate-400 uppercase tracking-wider block">
              {tfaConfig.provider === 'google' ? 'Google Authenticator' : 'Microsoft Authenticator'}
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold uppercase font-mono block truncate">
              Pulse: {user?.email}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between bg-slate-900 border border-white/5 px-4 rounded-xl">
            <span className="text-2xl font-black tracking-widest text-[#5BC0BE] select-all font-mono">
              {simulatedCode.substring(0, 3)} {simulatedCode.substring(3, 6)}
            </span>
            
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-rose-350 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md text-slate-400 select-none">
              <span className="font-mono text-emerald-400">{secondsRemaining}s</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal font-semibold italic">
            *Tip: Standard HMAC keys are synced with this local emulator widget. Solve the lock immediately by typing this dynamic code or clicking.
          </p>
        </div>

        <button
          onClick={() => setCode(simulatedCode)}
          className="mt-4 bg-slate-800 hover:bg-slate-700 text-emerald-200 text-[9px] font-black uppercase tracking-wider py-2.5 px-3 rounded-xl border border-white/5 transition-colors text-center cursor-pointer flex items-center justify-center gap-1 w-full"
        >
          <Key className="w-3.5 h-3.5 text-emerald-400" /> Autofill Simulator Token
        </button>
      </div>

    </div>
  );
}
