export interface PresetStyles {
  bg: string;
  canvas: string;
  sidebar: string;
  header: string;
  title: string;
  subText: string;
  card: string;
  heroCard: string;
  tabActive: string;
  tabInactive: string;
  badgeBlue: string;
  badgeGreen: string;
  badgeGrey: string;
  accentText: string;
  accentBg: string;
  primaryButton: string;
  divider: string;
}

export type PresetName = "stark" | "editorial" | "cosmic" | "mist";

export const PRESETS: Record<PresetName, PresetStyles> = {
  stark: {
    // Microsoft Fluent Light Theme
    bg: "bg-[#F3F2F1]",
    canvas: "bg-[#F3F2F1]",
    sidebar: "bg-[#FAF9F8] border-r border-[#E0DEDC] text-[#201F1E]",
    header: "bg-[#FFFFFF] border-b border-[#E0DEDC] text-[#201F1E] shadow-sm",
    title: "text-[#201F1E] font-sans font-semibold tracking-tight",
    subText: "text-[#605E5C] font-sans font-normal",
    card: "bg-[#FFFFFF] rounded-lg border border-[#EDEBE9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)]",
    heroCard:
      "bg-[#FFFFFF] rounded-xl border border-[#EDEBE9] p-8 shadow-[0_6.4px_14.4px_0_rgba(0,0,0,0.13),0_1.2px_3.6px_0_rgba(0,0,0,0.11)]",
    tabActive:
      "bg-[#EDEBE9] text-[#0078D4] font-semibold rounded-md border-l-4 border-[#0078D4]",
    tabInactive:
      "text-[#323130] hover:text-[#201F1E] hover:bg-[#F3F2F1] rounded-md",
    badgeBlue:
      "bg-[#E1DFDD] text-[#004578] border border-[#C8C6C4] px-2.5 py-1 rounded text-[10px] font-semibold font-sans",
    badgeGreen:
      "bg-[#DFF6DD] text-[#107C41] border border-[#A19F9D] px-2.5 py-1 rounded text-[10px] font-semibold font-sans",
    badgeGrey:
      "bg-[#F3F2F1] text-[#201F1E] border border-[#EDEBE9] px-2.5 py-1 rounded text-[10px] font-semibold font-sans",
    accentText: "text-[#0078D4]",
    accentBg: "bg-[#0078D4]",
    primaryButton:
      "bg-[#121214] text-white hover:bg-slate-800 rounded-xl font-bold p-3 text-xs uppercase",
    divider: "border-[#EDEBE9]",
  },
  editorial: {
    // Microsoft 365 Deep Corporate Theme
    bg: "bg-[#FAF9F8]",
    canvas: "bg-[#FAF9F8]",
    sidebar: "bg-[#201F1E] border-r border-[#323130] text-[#FFFFFF]",
    header: "bg-[#FFFFFF] border-b border-[#EDEBE9] text-[#201F1E] shadow-sm",
    title: "text-[#201F1E] font-sans font-bold tracking-tight",
    subText: "text-[#323130]/80 font-sans font-normal",
    card: "bg-[#FFFFFF] rounded-md border-2 border-[#201F1E] shadow-[4px_4px_0px_0px_#0078D4]",
    heroCard:
      "bg-[#FFFFFF] rounded-md border-2 border-[#201F1E] p-8 shadow-[4px_4px_0px_0px_#0078D4]",
    tabActive:
      "bg-[#0078D4] text-[#FFFFFF] font-semibold rounded border-2 border-[#201F1E] shadow-[2px_2px_0px_0px_#201F1E]",
    tabInactive:
      "text-[#F3F2F1]/80 hover:text-white hover:bg-[#323130] rounded border border-transparent",
    badgeBlue:
      "bg-[#0078D4] text-[#FFFFFF] text-[9.5px] font-sans font-bold uppercase tracking-wider px-3 py-1 border border-[#201F1E]",
    badgeGreen:
      "bg-[#107C41] text-[#FFFFFF] text-[9.5px] font-sans font-bold uppercase tracking-wider px-3 py-1 border border-[#201F1E]",
    badgeGrey:
      "bg-[#FFFFFF] text-[#201F1E] text-[9.5px] font-sans font-bold uppercase tracking-wider px-3 py-1 border border-[#201F1E]",
    accentText: "text-[#0078D4]",
    accentBg: "bg-[#0078D4]",
    primaryButton:
      "bg-[#0E0E0F] text-white hover:bg-slate-800 border-2 border-[#0E0E0F] shadow-[3px_3px_0px_0px_#002FA7] transition-none p-3 text-xs font-mono uppercase tracking-wider",
    divider: "border-[#EDEBE9]",
  },
  cosmic: {
    // Microsoft Windows 11 Fluent Dark Theme
    bg: "bg-[#202020]",
    canvas: "bg-[#202020]",
    sidebar: "bg-[#2d2d2d] border-r border-[#3b3b3b] text-[#E0E0E0]",
    header: "bg-[#2d2d2d] border-b border-[#3b3b3b] text-[#E0E0E0] shadow-md",
    title: "text-[#FFFFFF] font-sans font-semibold tracking-tight",
    subText: "text-[#CCCCCC] font-sans font-normal",
    card: "bg-[#2f2f2f] rounded-lg border border-[#444444] shadow-[0_8px_16px_rgba(0,0,0,0.24)]",
    heroCard:
      "bg-[#2f2f2f] rounded-xl border border-[#444444] p-8 shadow-[0_16px_32px_rgba(0,0,0,0.3)]",
    tabActive:
      "bg-[#383838] text-[#FFFFFF] font-semibold rounded-md border-l-4 border-[#60CDFF]",
    tabInactive:
      "text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#3d3d3d] rounded-md",
    badgeBlue:
      "bg-[#1c2c3a] text-[#60CDFF] border border-[#2b4c66] px-2.5 py-1 rounded text-[10px] font-semibold font-sans",
    badgeGreen:
      "bg-[#183a21] text-[#6ad99a] border border-[#235833] px-2.5 py-1 rounded text-[10px] font-semibold font-sans",
    badgeGrey:
      "bg-[#333333] text-[#F3F3F3] border border-[#444444] px-2.5 py-1 rounded text-[10px] font-semibold font-sans",
    accentText: "text-[#60CDFF]",
    accentBg: "bg-[#0078D4]",
    primaryButton:
      "bg-violet-600 text-white hover:bg-violet-500 rounded-xl font-bold p-3 text-xs uppercase",
    divider: "border-[#444444]",
  },
  mist: {
    // Calm, readable soft-light theme
    bg: "bg-[#F5F7FB]",
    canvas: "bg-[#F5F7FB]",
    sidebar: "bg-[#FFFFFF] border-r border-[#DDE3EE] text-[#1E293B]",
    header: "bg-[#FFFFFF] border-b border-[#DDE3EE] text-[#1E293B] shadow-sm",
    title: "text-[#1E293B] font-sans font-semibold tracking-tight",
    subText: "text-[#475569] font-sans font-normal",
    card: "bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_2px_8px_rgba(15,23,42,0.06)]",
    heroCard:
      "bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-8 shadow-[0_8px_20px_rgba(15,23,42,0.08)]",
    tabActive:
      "bg-[#EAF2FF] text-[#1D4ED8] font-semibold rounded-md border-l-4 border-[#2563EB]",
    tabInactive:
      "text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-md",
    badgeBlue:
      "bg-[#E0ECFF] text-[#1D4ED8] border border-[#BFDBFE] px-2.5 py-1 rounded text-[10px] font-semibold font-sans",
    badgeGreen:
      "bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] px-2.5 py-1 rounded text-[10px] font-semibold font-sans",
    badgeGrey:
      "bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0] px-2.5 py-1 rounded text-[10px] font-semibold font-sans",
    accentText: "text-[#2563EB]",
    accentBg: "bg-[#2563EB]",
    primaryButton:
      "bg-[#2563EB] text-white hover:bg-[#1D4ED8] rounded-xl font-bold p-3 text-xs uppercase",
    divider: "border-[#E2E8F0]",
  },
};
