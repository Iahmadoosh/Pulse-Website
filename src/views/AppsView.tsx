import { useState, useEffect } from 'react';
import { 
  Boxes, 
  ShoppingBag, 
  Link2, 
  Search, 
  ShieldCheck, 
  X, 
  Check, 
  ArrowRight, 
  Loader2, 
  Smartphone, 
  ArrowRightLeft, 
  CreditCard, 
  Info, 
  Bot, 
  Terminal,
  Database
} from 'lucide-react';
import { PRESETS, PresetName } from "../presets";

export interface ConnectedApp {
  id: string;
  name: string;
  developer: string;
  category: string;
  description: string;
  logoBg: string;
  logoText: string;
  rating: string;
  details: string;
}

export function renderAppLogo(appId: string, customClasses?: string) {
  const containerClass = customClasses || "w-12 h-12 flex items-center justify-center shrink-0 border-2 border-[#0E0E0F]";
  switch (appId) {
    case 'square':
      return (
        <div className={`${containerClass} bg-[#0E0E0F]`}>
          <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#FFFDF9] fill-none stroke-current" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
            <rect x="15" y="15" width="70" height="70" rx="10" />
            <rect x="38" y="38" width="24" height="24" rx="2" fill="currentColor" />
          </svg>
        </div>
      );
    case 'quickbooks':
      return (
        <div className={`${containerClass} bg-[#4F46E5]`}>
          <svg viewBox="0 0 100 100" className="w-7 h-7 text-white fill-none stroke-current" strokeWidth="10">
            <circle cx="50" cy="50" r="32" stroke="#FFFDF9" strokeWidth="12" />
            <circle cx="50" cy="50" r="12" fill="#FFFDF9" />
          </svg>
        </div>
      );
    case 'xero':
      return (
        <div className={`${containerClass} bg-[#13b5ea]`}>
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-white fill-none stroke-current" strokeWidth="10" strokeLinecap="round">
            <circle cx="50" cy="50" r="32" stroke="white" strokeWidth="10" />
            <path d="M36 36l28 28M64 36L36 64" stroke="white" strokeWidth="10" />
          </svg>
        </div>
      );
    case 'shopify':
      return (
        <div className={`${containerClass} bg-[#95BF47]`}>
          <svg viewBox="0 0 100 100" className="w-7 h-7 text-[#0E0E0F] fill-current">
            <path d="M32 26h36l5 56H27l5-56z" fill="#FFFDF9" stroke="#0E0E0F" strokeWidth="4" />
            <path d="M42 26c0-7 3-12 8-12s8 5 8 12" fill="none" stroke="#0E0E0F" strokeWidth="8" strokeLinecap="round" />
            <path d="M50 40c-6 0-10 4-10 10s4 10 10 10s10-4 10-10s-4-10-10-10z" fill="#95BF47" stroke="#0E0E0F" strokeWidth="4" />
          </svg>
        </div>
      );
    case 'stripe':
      return (
        <div className={`${containerClass} bg-[#635BFF]`}>
          <svg viewBox="0 0 100 100" className="w-7 h-7 text-white fill-current">
            <path d="M54 12c-11 0-19 6-19 16 0 19 26 15 26 29 0 6-6 11-13 11-11 0-19-5-25-11l-6 13c8 6 20 10 31 10 13 0 23-7 23-17 0-21-26-16-26-29 0-6 5-10 12-10 10 0 16 4 21 8l6-13c-7-5-16-8-23-8z" />
          </svg>
        </div>
      );
    case 'mailchimp':
      return (
        <div className={`${containerClass} bg-[#FFE01B]`}>
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-black fill-current shrink-0">
            <path d="M11.267 0C6.791-.015-1.82 10.246 1.397 12.964l.79.669a3.88 3.88 0 0 0-.22 1.792c.084.84.518 1.644 1.22 2.266.666.59 1.542.964 2.392.964 1.406 3.24 4.62 5.228 8.386 5.34 4.04.12 7.433-1.776 8.854-5.182.093-.24.488-1.316.488-2.267 0-.956-.54-1.352-.885-1.352-.01-.037-.078-.286-.172-.586-.093-.3-.19-.51-.19-.51.375-.563.382-1.065.332-1.35-.053-.353-.2-.653-.496-.964-.296-.311-.902-.63-1.753-.868l-.446-.124c-.002-.019-.024-1.053-.043-1.497-.014-.32-.042-.822-.197-1.315-.186-.668-.508-1.253-.911-1.627 1.112-1.152 1.806-2.422 1.804-3.511-.003-2.095-2.576-2.729-5.746-1.416l-.672.285A678.22 678.22 0 0 0 12.7.504C12.304.159 11.817.002 11.267 0zm.073.873c.166 0 .322.019.465.058.297.084 1.28 1.224 1.28 1.224s-1.826 1.013-3.52 2.426c-2.28 1.757-4.005 4.311-5.037 7.082-.811.158-1.526.618-1.963 1.253-.261-.218-.748-.64-.834-.804-.698-1.326.761-3.902 1.781-5.357C5.834 3.44 9.37.867 11.34.873zm3.286 3.273c.04-.002.06.05.028.074-.143.11-.299.26-.413.414a.04.04 0 0 0 .031.064c.659.004 1.587.235 2.192.574.041.023.012.103-.034.092-.915-.21-2.414-.369-3.97.01-1.39.34-2.45.863-3.224 1.426-.04.028-.086-.023-.055-.06.896-1.035 1.999-1.935 2.987-2.44.034-.018.07.019.052.052-.079.143-.23.447-.278.678-.007.035.032.063.062.042.615-.42 1.684-.868 2.622-.926zm3.023 3.205l.056.001a.896.896 0 0 1 .456.146c.534.355.61 1.216.638 1.845.015.36.059 1.229.074 1.478.034.571.184.651.487.751.17.057.33.098.563.164.706.198 1.125.4 1.39.658.157.162.23.333.253.497.083.608-.472 1.36-1.942 2.041-1.607.746-3.557.935-4.904.785l-.471-.053c-1.078-.145-1.693 1.247-1.046 2.201.417.615 1.552 1.015 2.688 1.015 2.604 0 4.605-1.111 5.35-2.072a.987.987 0 0 0 .06-.085c.036-.055.006-.085-.04-.054-.608.416-3.31 2.069-6.2 1.571 0 0-.351-.057-.672-.182-.255-.1-.788-.344-.853-.891 2.333.72 3.801.039 3.801.039a.072.072 0 0 0 .042-.072.067.067 0 0 0-.074-.06s-1.911.283-3.718-.378c.197-.64.72-.408 1.51-.345a11.045 11.045 0 0 0 3.647-.394c.818-.234 1.892-.697 2.727-1.356.281.618.38 1.299.38 1.299s.219-.04.4.073c.173.106.299.326.213.895-.176 1.063-.628 1.926-1.387 2.72a5.714 5.714 0 0 1-1.666 1.244c-.34.18-.704.334-1.087.46-2.863.935-5.794-.093-6.739-2.3a3.545 3.545 0 0 1-.189-.522c-.403-1.455-.06-3.2 1.008-4.299.065-.07.132-.153.132-.256 0-.087-.055-.179-.102-.243-.374-.543-1.669-1.466-1.409-3.254.187-1.284 1.31-2.189 2.357-2.135.089.004.177.01.266.015.453.027.85.085 1.223.1.625.028 1.187-.063 1.853-.618.225-.187.405-.35.71-.401.028-.005.092-.028.215-.028zm.022 2.18a.42.42 0 0 0-.06.005c-.335.054-.347.468-.228 1.04.068.32.187.595.32.765.175-.02.343-.022.498 0 .089-.205.104-.557.024-.942-.112-.535-.261-.872-.554-.868zm-3.66 1.546a1.724 1.724 0 0 0-1.016.326c-.16.117-.311.28-.29.378.008.032.031.056.088.063.131.015.592-.217 1.122-.25.374-.023.684.094.923.2.239.104.386.173.443.113.037-.038.026-.11-.031-.204-.118-.192-.36-.387-.618-.497a1.601 1.601 0 0 0-.621-.129zm4.082.81c-.171-.003-.313.186-.317.42-.004.236.131.43.303.432.172.003.314-.185.318-.42.004-.236-.132-.429-.304-.432zm-3.58.172c-.05 0-.102.002-.155.008-.311.05-.483.152-.593.247-.094.082-.152.173-.152.237a.075.075 0 0 0 .075.076c.07 0 .228-.063.228-.063a1.98 1.98 0 0 1 1.001-.104c.157.018.23.027.265-.026.01-.016.022-.049-.01-.1-.063-.103-.311-.269-.66-.275zm2.26.4c-.127 0-.235.051-.283.148-.075.154.035.363.246.466.21.104.443.063.52-.09.075-.155-.035-.364-.246-.467a.542.542 0 0 0-.237-.058zm-11.635.024c.048 0 .098 0 .149.003.73.04 1.806.6 2.052 2.19.217 1.41-.128 2.843-1.449 3.069-.123.02-.248.029-.374.026-1.22-.033-2.539-1.132-2.67-2.435-.145-1.44.591-2.548 1.894-2.811.117-.024.252-.04.398-.042zm-.07.927a1.144 1.144 0 0 0-.847.364c-.38.418-.439.988-.366 1.19.027.073.07.094.1.098.064.008.16-.039.22-.2a1.2 1.2 0 0 0 .017-.052 1.58 1.58 0 0 1 .157-.37.689.689 0 0 1 .955-.199c.266.174.369.5.255.81-.058.161-.154.469-.133.721.043.511.357.717.64.738.274.01.466-.143.515-.256.029-.067.005-.107-.011-.125-.043-.053-.113-.037-.18-.021a.638.638 0 0 1-.16.022.347.347 0 0 1-.294-.148c-.078-.12-.073-.3.013-.504.011-.028.025-.058.04-.092.138-.308.368-.825.11-1.317-.195-.37-.513-.602-.894-.65a1.135 1.135 0 0 0-.138-.01z" />
          </svg>
        </div>
      );
    case 'hubspot':
      return (
        <div className={`${containerClass} bg-[#FF7A59]`}>
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-white fill-current">
            <circle cx="30" cy="70" r="12" />
            <circle cx="70" cy="70" r="12" />
            <circle cx="50" cy="30" r="15" />
            <line x1="30" y1="70" x2="50" y2="30" stroke="white" strokeWidth="10" />
            <line x1="70" y1="70" x2="50" y2="30" stroke="white" strokeWidth="10" />
          </svg>
        </div>
      );
    case 'adp':
      return (
        <div className={`${containerClass} bg-[#D62518]`}>
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-white fill-current">
            <path d="M12 25h18l18 50H30l-4-12H18l-4 12H2zm10 26h4l-2-6-2 6zm34-26h22c10 0 16 5 16 13s-6 13-16 13H56zm14 18h6c4 0 6-2 6-5s-2-5-6-5h-6zM34 25h12l8 15 8-15h12L56 50v25H44V50z" />
          </svg>
        </div>
      );
    case 'workday':
      return (
        <div className={`${containerClass} bg-[#0875E1]`}>
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-white fill-none stroke-current" strokeWidth="10">
            <path d="M15 65c5-18 18-30 35-30s30 12 35 30" strokeLinecap="round" />
            <circle cx="50" cy="58" r="12" fill="currentColor" stroke="white" strokeWidth="4" />
          </svg>
        </div>
      );
    case 'slack':
    case 'slack_hr':
    case 'slack_general':
      return (
        <div className={`${containerClass} bg-[#4A154B]`}>
          <svg viewBox="0 0 100 100" className="w-8 h-8">
            <circle cx="35" cy="35" r="12" fill="#36C5F0" />
            <circle cx="65" cy="35" r="12" fill="#2EB67D" />
            <circle cx="35" cy="65" r="12" fill="#E01E5A" />
            <circle cx="65" cy="65" r="12" fill="#ECB22E" />
            <rect x="42" y="30" width="16" height="40" rx="4" fill="white" transform="rotate(45 50 50)" />
          </svg>
        </div>
      );
    case 'shipstation':
      return (
        <div className={`${containerClass} bg-[#002C47]`}>
          <svg viewBox="0 0 120 120" className="w-8 h-8 text-[#00b2e3] fill-current">
            <path d="M60 10L10 35v50l50 25l50-25V35L60 10zm-5 82.5l-33-16.5V47.2l33 16.5v28.8zm5-33.5L27 42.5l33-16.5l33 16.5l-33 16.5zm38 17l-33 16.5V63.7l33-16.5v28.8z" />
          </svg>
        </div>
      );
    case 'flexport':
      return (
        <div className={`${containerClass} bg-[#101827]`}>
          <svg viewBox="0 0 100 100" className="w-7 h-7 text-[#00d4fc] fill-current">
            <path d="M15 20h30v60H15zm40 0h30v25H55zm0 35h30v25H55z" />
          </svg>
        </div>
      );
    case 'amazon_seller':
      return (
        <div className={`${containerClass} bg-[#232F3E]`}>
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#FF9900]">
            <path d="M18 35h64" stroke="#FFFDF9" strokeWidth="10" strokeLinecap="round" />
            <path d="M30 55c10 14 30 14 40 0" fill="none" stroke="#FF9900" strokeWidth="12" strokeLinecap="round" />
            <path d="M66 56l7-1l-3 8" fill="#FF9900" stroke="#FF9900" strokeWidth="4" />
          </svg>
        </div>
      );
    case 'google_workspace':
    case 'gcp':
      return (
        <div className={`${containerClass} bg-[#FFFDF9]`}>
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        </div>
      );
    case 'outlook_calendar':
      return (
        <div className={`${containerClass} bg-[#107C41]`}>
          <svg className="w-7 h-7 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
          </svg>
        </div>
      );
    case 'microsoft_excel':
      return (
        <div className={`${containerClass} bg-[#107c41]`}>
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-white fill-current">
            <rect x="35" y="20" width="50" height="60" rx="4" fill="white" opacity="0.3" />
            <path d="M15 30h40v40H15z" fill="#1f4e37" stroke="#107c41" strokeWidth="4" />
            <text x="35" y="58" fontSize="26" fontWeight="950" fill="white" textAnchor="middle" fontFamily="monospace">X</text>
          </svg>
        </div>
      );
    case 'aws':
      return (
        <div className={`${containerClass} bg-[#FF9900]`}>
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-white fill-current">
            <text x="50" y="45" fontSize="22" fontWeight="950" textAnchor="middle" fontFamily="sans-serif">AWS</text>
            <path d="M25 60c15 10 35 10 50 0" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${containerClass} bg-[#002FA7] text-[#FFFDF9] font-black uppercase text-lg font-mono`}>
          {appId.slice(0, 2)}
        </div>
      );
  }
}

export function getBrandButtonColor(appId: string): string {
  switch (appId) {
    case 'outlook_calendar':
      return 'bg-[#107C41] hover:bg-[#0B5A30] text-white border-transparent';
    case 'square':
      return 'bg-[#0E0E0F] hover:bg-black text-white border-transparent';
    case 'quickbooks':
      return 'bg-[#4F46E5] hover:bg-[#4338CA] text-white border-transparent';
    case 'xero':
      return 'bg-[#13b5ea] hover:bg-[#109cc9] text-white border-transparent';
    case 'shopify':
      return 'bg-[#95BF47] hover:bg-[#7ea23c] text-[#0E0E0F] border-transparent font-extrabold';
    case 'stripe':
      return 'bg-[#635BFF] hover:bg-[#5249E0] text-white border-transparent';
    case 'mailchimp':
      return 'bg-[#FFE01B] hover:bg-[#ecd018] text-black border-transparent font-extrabold';
    case 'hubspot':
      return 'bg-[#FF7A59] hover:bg-[#e26241] text-white border-transparent';
    case 'adp':
      return 'bg-[#D62518] hover:bg-[#b51f14] text-white border-transparent';
    case 'workday':
      return 'bg-[#0875E1] hover:bg-[#065baf] text-white border-transparent';
    case 'slack':
    case 'slack_hr':
    case 'slack_general':
      return 'bg-[#4A154B] hover:bg-[#3b113c] text-white border-transparent';
    case 'shipstation':
      return 'bg-[#002C47] hover:bg-[#001f33] text-white border-transparent';
    case 'flexport':
      return 'bg-[#101827] hover:bg-[#030712] text-white border-transparent';
    case 'amazon_seller':
      return 'bg-[#232F3E] hover:bg-[#141b24] text-[#FF9900] border-transparent font-extrabold';
    case 'google_workspace':
    case 'gcp':
      return 'bg-[#4285F4] hover:bg-[#3572DE] text-white border-transparent';
    case 'microsoft_excel':
      return 'bg-[#107C41] hover:bg-[#0B5A30] text-white border-transparent';
    case 'aws':
      return 'bg-[#FF9900] hover:bg-[#e08600] text-white border-transparent';
    default:
      return 'bg-slate-800 hover:bg-slate-900 text-white border-transparent';
  }
}

const MARKETPLACE_APPS: ConnectedApp[] = [
  {
    id: 'outlook_calendar',
    name: 'Outlook Calendar Sync',
    developer: 'Microsoft Corporation',
    category: 'Operations & POS',
    description: 'Synchronize corporate shift schedules, editorial timelines, client reminders, and local team events directly with Outlook & Microsoft 365 Calendar.',
    logoBg: 'bg-[#107C41]',
    logoText: 'text-white',
    rating: '4.8 ★',
    details: 'Leverages secure Microsoft Graph API OAuth 2.0 to safely access user calendar feeds, write shift periods, and notify stakeholders of updates.'
  },
  {
    id: 'square',
    name: 'Square POS Core',
    developer: 'Square Inc.',
    category: 'Operations & POS',
    description: 'Sync customer counters, dynamic registers, or custom items with live balance parameters. Stream card payouts, cash velocities, and tips directly.',
    logoBg: 'bg-black',
    logoText: 'text-white',
    rating: '4.8 ★',
    details: 'Exposes register cash configurations, historical tax deductions, and localized transactions telemetry.'
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
    logoBg: 'bg-teal-600',
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
  },
  {
    id: 'adp',
    name: 'ADP Workforce',
    developer: 'ADP LLC',
    category: 'Human Resources',
    description: 'Sync payroll taxes, hours tracking, and direct disbursements. Integrates salary payments and employee forms directly into your reporting dashboard.',
    logoBg: 'bg-red-600',
    logoText: 'text-white',
    rating: '4.7 ★',
    details: 'Bridges tax deduction indices, automatic wage calculations, and direct-deposit histories securely.'
  },
  {
    id: 'workday',
    name: 'Workday Human Capital',
    developer: 'Workday Inc.',
    category: 'Human Resources',
    description: 'Manage corporate directory catalogs, user access permissions, and staff organizational structures with standard rosters.',
    logoBg: 'bg-blue-600',
    logoText: 'text-white',
    rating: '4.8 ★',
    details: 'Unlocks directory indexes, role-based authorization scopes, and internal leave ledgers.'
  },
  {
    id: 'slack_hr',
    name: 'Slack Team Broadcast',
    developer: 'Slack Technologies',
    category: 'Operations & POS',
    description: 'Automate shift notification pings and organization memos directly to team members. Bridges communication logs with active staff logs.',
    logoBg: 'bg-purple-600',
    logoText: 'text-white',
    rating: '4.5 ★',
    details: 'Fosters instant notifications on schedule updates and corporate broad announcements.'
  },
  {
    id: 'shipstation',
    name: 'ShipStation Logistics',
    developer: 'Auctane',
    category: 'Supply Chain',
    description: 'Fulfill packaging orders across USPS, DHL, and FedEx fleets. Keep delivery metrics, packages tracking, and courier rates balanced in real-time.',
    logoBg: 'bg-cyan-700',
    logoText: 'text-white',
    rating: '4.6 ★',
    details: 'Automates courier cost audits, multi-carrier shipment options, and parcel routing queues.'
  },
  {
    id: 'flexport',
    name: 'Flexport Freight',
    developer: 'Flexport Inc.',
    category: 'Supply Chain',
    description: 'Coordinate maritime shipping manifests, global air cargo routing, and custom clearances. Track freight timelines on visual maps.',
    logoBg: 'bg-slate-950',
    logoText: 'text-white',
    rating: '4.7 ★',
    details: 'Integrates customs tariffs tracking, oceanic bills of lading, and port demurrage logs.'
  },
  {
    id: 'amazon_seller',
    name: 'Amazon Seller Central',
    developer: 'Amazon Inc.',
    category: 'eCommerce & Retail',
    description: 'Track Fulfilled by Amazon (FBA) inventory, buyer reviews, and restock intervals instantly inside reporting dashboards.',
    logoBg: 'bg-[#232F3E]',
    logoText: 'text-white',
    rating: '4.8 ★',
    details: 'Syncs restock notification triggers, FBA fulfillment indicators, and buyer feedback catalogs.'
  },
  {
    id: 'slack_general',
    name: 'Slack Support Sync',
    developer: 'Slack Technologies',
    category: 'Operations & POS',
    description: 'Relay customer support tickets and emergency triage pings instantly into Slack channels to accelerate resolution times.',
    logoBg: 'bg-[#4A154B]',
    logoText: 'text-white',
    rating: '4.6 ★',
    details: 'Broadsheets support SLA notifications, customer query links, and team response status.'
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace Link',
    developer: 'Google LLC',
    category: 'Operations & POS',
    description: 'Authorize Calendar scheduling, team Docs, and Gmail triggers to power smart automated workflows.',
    logoBg: 'bg-emerald-500',
    logoText: 'text-white',
    rating: '4.9 ★',
    details: 'Directly coordinates Calendar shift scheduling, group doc permissions, and corporate email integrations.'
  },
  {
    id: 'microsoft_excel',
    name: 'Microsoft Excel',
    developer: 'Microsoft Corporation',
    category: 'Operations & POS',
    description: 'Sync cloud-hosted Excel databases, track transactional spreadsheets, and load analytical workbooks instantly.',
    logoBg: 'bg-emerald-700',
    logoText: 'text-white',
    rating: '4.8 ★',
    details: 'Exposes worksheet-specific cell ranges, dynamic mathematical formulas, and live budget spreadsheets.'
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    developer: 'Amazon Web Services Inc.',
    category: 'Operations & POS',
    description: 'Monitor cloud hosting clusters, relational RDS schemas, and scalable S3 buckets natively.',
    logoBg: 'bg-amber-600',
    logoText: 'text-white',
    rating: '4.7 ★',
    details: 'Exposes telemetry on computing power thresholds, active endpoints, data warehouses, and serverless logs.'
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    developer: 'Google LLC',
    category: 'Operations & POS',
    description: 'Analyze secure BigQuery SQL datasets, host serverless compute modules, and run cloud storage pipelines.',
    logoBg: 'bg-emerald-600',
    logoText: 'text-white',
    rating: '4.9 ★',
    details: 'Integrates real-time database queries, machine learning workloads, cloud functions, and VPC security groups.'
  },
  {
    id: 'slack',
    name: 'Slack Applications',
    developer: 'Slack Technologies',
    category: 'Operations & POS',
    description: 'Connect Slack corporate workspaces, automate alert lists, and link company channels with your financial and HR reports.',
    logoBg: 'bg-purple-600',
    logoText: 'text-white',
    rating: '4.8 ★',
    details: 'Stream notifications, hook public or private chat threads, and activate real-time trigger pings for workflows.'
  }
];

export function AppsView({ preset = 'stark' }: { preset?: PresetName }) {
  const styles = PRESETS[preset] || PRESETS.stark;
  const [connectedAppIds, setConnectedAppIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Square specific sync configs
  const [squareConfig, setSquareConfig] = useState<{
    merchantId: string;
    env: 'production' | 'sandbox';
    token: string;
    locationName: string;
    connectedAt: string;
  } | null>(null);

  // Connection Dialog states
  const [connectingApp, setConnectingApp] = useState<ConnectedApp | null>(null);
  const [formMerchantId, setFormMerchantId] = useState('ML-89A7B31');
  const [formEnv, setFormEnv] = useState<'production' | 'sandbox'>('sandbox');
  const [formToken, setFormToken] = useState('EAAAEO_sq_sandbox_token...');
  const [formLocation, setFormLocation] = useState('West Coast Retail Outlet');
  const [isLinkingInProcess, setIsLinkingInProcess] = useState(false);

  useEffect(() => {
    try {
      const storedConnected = localStorage.getItem('pulse_connected_apps');
      if (storedConnected) {
        setConnectedAppIds(JSON.parse(storedConnected));
      } else {
        const initial = ['square', 'shopify', 'stripe', 'slack'];
        setConnectedAppIds(initial);
        localStorage.setItem('pulse_connected_apps', JSON.stringify(initial));
      }

      const storedSquare = localStorage.getItem('pulse_square_config');
      if (storedSquare) {
        setSquareConfig(JSON.parse(storedSquare));
      } else {
        const initialSquare = {
          merchantId: 'ML-89A7B31',
          env: 'sandbox' as const,
          token: 'EAAAEO_sq_sandbox_...',
          locationName: 'West Coast Retail Outlet',
          connectedAt: new Date().toLocaleDateString()
        };
        setSquareConfig(initialSquare);
        localStorage.setItem('pulse_square_config', JSON.stringify(initialSquare));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleInitiateConnect = (app: ConnectedApp) => {
    setConnectingApp(app);
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
      setFormLocation('Central Warehouse depot');
    }
  };

  const handleFinishConnect = async () => {
    if (!connectingApp) return;
    setIsLinkingInProcess(true);
    await new Promise(resolve => setTimeout(resolve, 1200)); // OAuth handshake simulation

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

  const handleDisconnectApp = (appId: string) => {
    const updated = connectedAppIds.filter(id => id !== appId);
    setConnectedAppIds(updated);
    localStorage.setItem('pulse_connected_apps', JSON.stringify(updated));
    if (appId === 'square') {
      setSquareConfig(null);
      localStorage.removeItem('pulse_square_config');
    }
  };

  // Filter apps
  const MARKETPLACE_CATEGORIES = [
    'All', 
    'Accounting & Tax', 
    'eCommerce & Retail', 
    'Customers & Marketing', 
    'Operations & POS',
    'Human Resources',
    'Supply Chain'
  ];
  
  const filteredApps = MARKETPLACE_APPS.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto pb-12 mt-2 select-none ${preset === 'cosmic' ? 'text-slate-100' : 'text-[#0E0E0F]'}`} id="apps-main-view">
      
      {/* Header Banner - Modern Microsoft style header */}
      <div className={`${styles.heroCard} relative overflow-hidden transition-all duration-300`}>
        {/* Soft watermark trending line */}
        <div className={`absolute right-10 bottom-0 md:-bottom-4 w-72 h-44 opacity-[0.06] pointer-events-none ${preset === 'cosmic' ? 'text-violet-400 opacity-[0.12]' : 'text-[#201F1E]'}`}>
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M5 90 L30 65 L50 75 L85 20 M85 20 L60 20 M85 20 L85 45" />
          </svg>
        </div>
        


        {/* Content Row */}
        <div className={`flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-6 ${styles.divider} mb-0`}>
          <div className="max-w-3xl">
            <h1 className={`text-3xl md:text-4xl font-extrabold ${preset === 'editorial' ? 'uppercase font-mono' : 'tracking-tight'} mb-3`}>
              Connected Metrics Ecosystem
            </h1>
            <p className={`text-xs leading-relaxed ${preset === 'stark' ? 'text-slate-500' : preset === 'cosmic' ? 'text-slate-400' : 'text-slate-800'} font-medium`}>
              Link company datasets, authorize live webhook streams, and align external transaction registers seamlessly within your predictive ledger.
            </p>
          </div>
        </div>
      </div>

      {/* CATEGORY DIRECTORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="marketplace-content">
          
          {/* Category Filter on Left */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${styles.card} p-5`}>
              <h3 className={`font-mono text-[10px] font-bold uppercase tracking-wider mb-4 border-b ${styles.divider} pb-2 ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>
                FILTER NODES
              </h3>
              <div className="flex flex-col gap-1.5 font-bold text-xs uppercase tracking-wide">
                {MARKETPLACE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left py-2 px-3 transition-all flex items-center justify-between rounded ${
                      selectedCategory === cat 
                        ? styles.tabActive 
                        : styles.tabInactive
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      selectedCategory === cat 
                        ? (preset === 'cosmic' ? 'bg-[#202020] text-[#60CDFF]' : 'bg-[#FFFFFF] text-[#0078D4]')
                        : (preset === 'cosmic' ? 'bg-[#333333] text-[#CCCCCC]' : 'bg-[#EDEBE9] text-[#201F1E]')
                    }`}>
                      {cat === 'All' 
                        ? MARKETPLACE_APPS.length 
                        : MARKETPLACE_APPS.filter(app => app.category === cat).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-5 text-[11px] font-semibold leading-relaxed ${
              preset === 'cosmic' 
                ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 rounded-lg' 
                : preset === 'stark'
                ? 'bg-[#DFF6DD] border border-[#107C41]/30 text-[#107C41] rounded-lg'
                : 'bg-[#FFFDF9] border-2 border-[#201F1E] shadow-[4px_4px_0px_0px_#0078D4] text-[#201F1E]'
            }`}>
              <span className="font-bold font-mono text-xs block mb-1 uppercase tracking-tight">[!] CRYPTO HANDSHAKE</span>
              Continuous mutual authentication is active across linked sandbox environments and live enterprise gateways. Datasets balance automatically every 10 minutes.
            </div>
          </div>

          {/* Grid of Apps */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Input */}
            <div className={`${styles.card} p-4 flex flex-col md:flex-row gap-3 items-center justify-between`}>
              <div className="relative w-full md:w-80">
                <Search className={`w-4 h-4 absolute left-3 top-3 ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  placeholder="QUERY ACTIVE API NODES..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full text-xs font-mono font-bold pl-9 pr-4 py-2 border rounded-md outline-none uppercase transition-colors ${
                    preset === 'cosmic' 
                      ? 'border-slate-700 bg-[#202020] text-white focus:border-[#60CDFF] focus:bg-[#2c2c2c]' 
                      : 'border-slate-300 bg-white text-[#201F1E] focus:border-[#0078D4] focus:bg-slate-50'
                  }`}
                />
              </div>

              <div className={`text-[10px] font-mono font-bold ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-500'}`}>
                SYNAPSED: <span className={`px-2 py-0.5 rounded ${
                  preset === 'cosmic' ? 'bg-[#333333] text-white' : 'bg-[#EDEBE9] text-[#201F1E]'
                }`}>{filteredApps.length}</span> / {MARKETPLACE_APPS.length} TOTAL_DEVICES
              </div>
            </div>

            {/* Apps Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApps.map(app => {
                const isConnected = connectedAppIds.includes(app.id);
                return (
                  <div 
                    key={app.id} 
                    className={`${styles.card} p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
                  >
                    <div>
                      {/* Logo and meta layout */}
                      <div className={`flex items-start justify-between mb-4 pb-3 border-b border-dashed ${styles.divider}`}>
                        <div className="flex gap-3">
                          {renderAppLogo(app.id)}
                          <div>
                            <h4 className={`font-extrabold text-sm tracking-tight uppercase leading-tight font-sans ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>{app.name}</h4>
                            <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5 uppercase tracking-wider">{app.developer}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                            preset === 'cosmic' ? 'bg-[#1E293B] text-[#60CDFF] border border-slate-700' : 'bg-[#EDEBE9] text-[#0078D4] border border-[#C8C6C4]'
                          }`}>
                            {app.rating}
                          </span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                            preset === 'cosmic' ? 'bg-[#383838] text-slate-300' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {app.category}
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs leading-relaxed min-h-[60px] ${preset === 'cosmic' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {app.description}
                      </p>

                      {/* Connection details readouts inside the card */}
                      {isConnected && (
                        <div className={`mt-4 p-3 ${
                          preset === 'cosmic' ? 'bg-[#202020] border border-slate-700 text-[#E0E0E0]' : 'bg-[#FAF9F8] border border-[#EDEBE9] text-[#323130]'
                        } space-y-1.5 text-[9.5px] font-mono rounded`}>
                          {app.id === 'square' ? (
                            <>
                              <div className={`flex justify-between border-b ${styles.divider} pb-1`}>
                                <span className="opacity-60">Synced Location:</span>
                                <span className="font-bold text-emerald-500">{squareConfig?.locationName || 'West Coast Retail Outlet'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-60">Merchant ID:</span>
                                <span className={`font-bold ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>{squareConfig?.merchantId || 'ML-89A7B31'}</span>
                              </div>
                            </>
                          ) : app.id === 'quickbooks' ? (
                            <>
                              <div className={`flex justify-between border-b ${styles.divider} pb-1`}>
                                <span className="opacity-60">Synced Ledger:</span>
                                <span className="font-bold text-emerald-500">Accruals Journal Map</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-60">Standard:</span>
                                <span className={`font-bold ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>US-GAAP SECURE</span>
                              </div>
                            </>
                          ) : app.id === 'stripe' ? (
                            <>
                              <div className={`flex justify-between border-b ${styles.divider} pb-1`}>
                                <span className="opacity-60">Webhook Connection:</span>
                                <span className="font-bold text-emerald-500 font-mono">whsec_stripe_live_•••</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-60">Settlement Route:</span>
                                <span className={`font-bold ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>2-Day Floating Cash</span>
                              </div>
                            </>
                          ) : app.id === 'shopify' ? (
                            <>
                              <div className={`flex justify-between border-b ${styles.divider} pb-1`}>
                                <span className="opacity-60">Digital Channels:</span>
                                <span className="font-bold text-emerald-500">Shopify Online Core</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-60">Live Updates:</span>
                                <span className={`font-bold ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>checkout_completed</span>
                              </div>
                            </>
                          ) : app.id === 'xero' ? (
                            <>
                              <div className={`flex justify-between border-b ${styles.divider} pb-1`}>
                                <span className="opacity-60">Journal Identifier:</span>
                                <span className="font-bold text-emerald-500 font-mono">XE-LEDGER-9481</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-60">Balanced State:</span>
                                <span className={`font-bold ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>Verified</span>
                              </div>
                            </>
                          ) : app.id === 'microsoft_excel' ? (
                            <>
                              <div className={`flex justify-between border-b ${styles.divider} pb-1`}>
                                <span className="opacity-60">Excel file:</span>
                                <span className="font-bold text-emerald-500">Business_Forecast_2026.xlsx</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-60">Active Tab:</span>
                                <span className={`font-bold ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>Accruals_Input</span>
                              </div>
                            </>
                          ) : app.id === 'google_workspace' ? (
                            <>
                              <div className={`flex justify-between border-b ${styles.divider} pb-1`}>
                                <span className="opacity-60">Coupled domain:</span>
                                <span className="font-bold text-emerald-500">admin@yourcompany.com</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-60">Calendar pipe:</span>
                                <span className={`font-bold ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>Live Sync</span>
                              </div>
                            </>
                          ) : app.id === 'slack' || app.id === 'slack_hr' || app.id === 'slack_general' ? (
                            <>
                              <div className={`flex justify-between border-b ${styles.divider} pb-1`}>
                                <span className="opacity-60">Channel target:</span>
                                <span className="font-bold text-emerald-500 font-mono">#finance-operations</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-60">Relay method:</span>
                                <span className={`font-bold ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>Webhooks continuous</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className={`flex justify-between border-b ${styles.divider} pb-1`}>
                                <span className="opacity-60">Sync state:</span>
                                <span className="font-bold text-emerald-500">Active credentials handshake</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-60">Handshake rate:</span>
                                <span className={`font-bold ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>10m endpoints checks</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={`mt-6 pt-4 border-t ${styles.divider} flex items-center justify-between`}>
                      {isConnected ? (
                        <div className="flex items-center gap-2 w-full">
                          <span className={`text-[10px] font-mono font-bold px-2 py-1 flex items-center gap-1.5 select-none rounded border ${
                            preset === 'cosmic' 
                              ? 'bg-[#183a21] text-[#6ad99a] border-[#235833]' 
                              : 'bg-[#DFF6DD] text-[#107C41] border-[#107C41]/20'
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            INTEGRATED
                          </span>
                          <button
                            onClick={() => handleDisconnectApp(app.id)}
                            className="ml-auto text-[10px] font-mono font-bold uppercase text-rose-600 hover:text-rose-500 hover:underline py-1 cursor-pointer"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleInitiateConnect(app)}
                          className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 shadow-md border border-transparent active:translate-y-0.5 ${getBrandButtonColor(app.id)}`}
                        >
                          <Link2 className="w-3.5 h-3.5" /> Integrate Application
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      {/* SECURE OAUTH HANDSHAKE MODAL */}
      {connectingApp && (
        <div className="fixed inset-0 bg-[#000000]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-100 font-sans ${styles.card} border-2`}>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0078D4]" />

            <div className={`p-5 border-b ${styles.divider} flex items-center justify-between ${preset === 'cosmic' ? 'bg-[#2D2D2D]' : 'bg-[#FAF9F8]'}`}>
              <h3 className={`font-extrabold text-xs uppercase tracking-tight flex items-center gap-2 ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>
                <Link2 className="w-4 h-4 text-[#0078D4]" /> 
                SECURE AUTHORIZATION LINK // {connectingApp.name}
              </h3>
              <button
                onClick={() => setConnectingApp(null)}
                className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${preset === 'cosmic' ? 'text-slate-400 hover:text-white' : 'text-[#201F1E]'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              
              <div className={`flex gap-4 items-center p-4 border-2 ${
                preset === 'cosmic' 
                  ? 'bg-[#202020] border-slate-700 shadow-[3px_3px_0px_0px_#60CDFF]' 
                  : 'bg-white border-[#EDEBE9] shadow-[3px_3px_0px_0px_#0078D4]'
              }`}>
                {renderAppLogo(connectingApp.id, "w-14 h-14 border rounded flex items-center justify-center shrink-0 overflow-hidden bg-white")}
                <div>
                  <h4 className={`font-extrabold text-xs uppercase tracking-wide ${preset === 'cosmic' ? 'text-white' : 'text-[#201F1E]'}`}>
                    Permission Scope Verified
                  </h4>
                  <p className={`text-[10px] leading-normal mt-1 font-semibold ${preset === 'cosmic' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Pulse requires continuous secure handshake authentication to read checkout terminals, spreadsheet parameters, and payout schedules. External data is never exposed.
                  </p>
                </div>
              </div>

              <div className={`space-y-2 border-t border-dashed ${styles.divider} pt-4 ${preset === 'cosmic' ? 'text-slate-300' : 'text-slate-750'}`}>
                <div className="flex items-center gap-2 text-[9.5px] font-mono font-bold uppercase font-mono">
                  <span>[✓] scope.merchant_profile_read</span>
                </div>
                <div className="flex items-center gap-2 text-[9.5px] font-mono font-bold uppercase font-mono">
                  <span>[✓] scope.payments_transactions_read</span>
                </div>
                <div className="flex items-center gap-2 text-[9.5px] font-mono font-bold uppercase font-mono">
                  <span>[✓] scope.settlements_ledger_read</span>
                </div>
              </div>

              <div className={`space-y-3 font-sans border-t ${styles.divider} pt-4`}>
                <div>
                  <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest mb-1 ${preset === 'cosmic' ? 'text-slate-300' : 'text-[#201F1E]'}`}>
                    {connectingApp.id === 'square' ? 'Square Merchant Ref' : 'Client Developer ID'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formMerchantId}
                    onChange={e => setFormMerchantId(e.target.value)}
                    className={`w-full text-xs p-2.5 border rounded-md outline-none font-mono font-bold uppercase focus:ring-1 ${
                      preset === 'cosmic' 
                        ? 'border-slate-700 bg-[#202020] text-white focus:border-[#60CDFF] focus:ring-[#60CDFF]' 
                        : 'border-slate-300 bg-white text-[#201F1E] focus:border-[#0078D4] focus:ring-[#0078D4]'
                    }`}
                    placeholder="e.g. ML-89A7B31"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest mb-1 ${preset === 'cosmic' ? 'text-slate-300' : 'text-[#201F1E]'}`}>
                      Platform Env
                    </label>
                    <select
                      value={formEnv}
                      onChange={e => setFormEnv(e.target.value as any)}
                      className={`w-full text-xs p-2.5 border rounded-md outline-none font-bold uppercase cursor-pointer ${
                        preset === 'cosmic' 
                          ? 'border-slate-700 bg-[#202020] text-white focus:border-[#60CDFF]' 
                          : 'border-slate-300 bg-white text-[#201F1E] focus:border-[#0078D4]'
                      }`}
                    >
                      <option value="sandbox">Sandbox Emulation</option>
                      <option value="production">Production Live</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest mb-1 ${preset === 'cosmic' ? 'text-slate-300' : 'text-[#201F1E]'}`}>
                      Store Location / Tab
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                      className={`w-full text-xs p-2.5 border rounded-md outline-none font-bold uppercase ${
                        preset === 'cosmic' 
                          ? 'border-slate-700 bg-[#202020] text-white focus:border-[#60CDFF]' 
                          : 'border-slate-300 bg-white text-[#201F1E] focus:border-[#0078D4]'
                      }`}
                      placeholder="e.g. West Coast Outlet"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest mb-1 flex items-center justify-between ${preset === 'cosmic' ? 'text-slate-300' : 'text-[#201F1E]'}`}>
                    <span>Integration Token / API secret</span>
                    <span className="text-[7.5px] font-sans text-amber-700 dark:text-amber-500 uppercase">[sandbox_mocked]</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formToken}
                    onChange={e => setFormToken(e.target.value)}
                    className={`w-full text-xs p-2.5 border rounded-md outline-none font-mono ${
                      preset === 'cosmic' 
                        ? 'border-slate-700 bg-[#202020] text-white focus:border-[#60CDFF]' 
                        : 'border-slate-300 bg-white text-slate-700 focus:border-[#0078D4]'
                    }`}
                    placeholder="••••••••••••••••••••••••••••"
                  />
                </div>
              </div>

               <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setConnectingApp(null)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinishConnect}
                  disabled={isLinkingInProcess || !formMerchantId || !formToken}
                  className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer rounded-lg border border-transparent shadow-sm transition-all text-white bg-emerald-600 hover:bg-emerald-700`}
                >
                  {isLinkingInProcess ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {isLinkingInProcess ? 'Authorizing Sync...' : 'Sync Node'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
