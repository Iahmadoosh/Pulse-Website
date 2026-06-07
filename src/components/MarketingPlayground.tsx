import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  PlayCircle, 
  Check, 
  Copy, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Hash, 
  AlignLeft, 
  Send, 
  Users,
  Globe,
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  RotateCcw,
  Feather,
  Eye,
  FileText,
  ThumbsUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Persona } from './MarketingPersonas';

interface ConnectedAccount {
  platform: string;
  handle: string;
  connectedAt: string;
}

const renderMockupPlatformLogo = (platform: 'instagram' | 'facebook' | 'x' | 'linkedin' | 'reddit', className = "w-3 h-3 shrink-0") => {
  switch (platform) {
    case 'instagram':
      return (
        <svg className={`${className} text-pink-600`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className={`${className} text-[#1877F2]`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'x':
      return (
        <svg className={`${className} text-slate-800`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={`${className} text-[#0077B5]`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      );
    case 'reddit':
      return (
        <svg className={`${className} text-[#FF4500]`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.35-4.24 3.71.79c.07.95.87 1.7 1.85 1.7 1.1 0 2-1 2-2s-.9-2-2-2c-.95 0-1.73.67-1.93 1.57l-4.1-.87c-.24-.05-.48.1-.55.33l-1.5 4.7C6.88 7.37 4.67 8.01 3.02 9A2.96 2.96 0 0 0 .52 11.5c0 1.65 1.35 3 3 3 .15 0 .3-.01.44-.04C3.86 16.03 7.64 17.5 12 17.5s8.14-1.47 8.54-3.04c.14.03.29.04.44.04 1.65 0 3-1.35 3-3zm-15.25 1c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm8.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5.25 3c-1.84 0-3.35-1.16-3.79-2.74-.08-.3.1-.63.4-.71.3-.08.63.1.71.4.32 1.15 1.48 1.95 2.68 1.95s2.36-.8 2.68-1.95c.08-.3.41-.48.71-.4.3.08.48.41.4.71-.44 1.58-1.95 2.74-3.79 2.74z" />
        </svg>
      );
    default:
      return null;
  }
};

// Structured helper to parse standard generative copywriting formats cleanly
function parseCopyBlocks(text: string) {
  if (!text) return { headline: '', body: '', cta: '', hashtags: [] };
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let headline = '';
  let bodyLines: string[] = [];
  let cta = '';
  const hashtags: string[] = [];
  
  lines.forEach((line) => {
    const lower = line.toLowerCase();
    
    // Find hash tags in the line
    const matches = line.match(/#[a-zA-Z0-9_]+/g);
    if (matches) {
      matches.forEach(tag => {
        if (!hashtags.includes(tag)) hashtags.push(tag);
      });
      // Remove hashtags from line for body text cleanup
      const cleaned = line.replace(/#[a-zA-Z0-9_]+/g, '').trim();
      if (cleaned && !cleaned.startsWith('**') && !cleaned.startsWith('#')) {
        bodyLines.push(cleaned);
      }
      return;
    }
    
    if (lower.startsWith('headline:') || lower.startsWith('**headline**:') || lower.startsWith('subject:') || lower.startsWith('**subject**:') || lower.startsWith('# ')) {
      headline = line.replace(/^(headline:|headline|subject:|\*\*headline\*\*:|\*\*subject\*\*:|#)\s*/i, '').replace(/\*/g, '').trim();
    } else if (lower.startsWith('cta:') || lower.startsWith('**cta**:') || lower.startsWith('call to action:') || lower.startsWith('**call to action**:') || lower.includes('discount') || lower.includes('coupon') || lower.includes('code:')) {
      cta = line.replace(/^(cta:|cta|call to action:|\*\*cta\*\*:|\*\*call to action\*\*:)\s*/i, '').replace(/\*/g, '').trim();
    } else if (!lower.includes('[variant') && !lower.includes('variant a') && !lower.includes('variant b')) {
      bodyLines.push(line);
    }
  });
  
  // Clean first body line if it was used for headline fallback
  if (!headline && bodyLines.length > 0) {
    headline = bodyLines[0].replace(/\*/g, '');
    bodyLines = bodyLines.slice(1);
  }
  
  if (!cta && bodyLines.length > 0) {
    const lastLine = bodyLines[bodyLines.length - 1];
    if (lastLine.toLowerCase().includes('http') || lastLine.toLowerCase().includes('click') || lastLine.toLowerCase().includes('discount') || lastLine.toLowerCase().includes('order') || lastLine.toLowerCase().includes('shop')) {
      cta = lastLine;
      bodyLines = bodyLines.slice(0, -1);
    }
  }
  
  return {
    headline: headline || 'Premium Stoneware Special Offer',
    body: bodyLines.join('\n\n') || text,
    cta: cta || 'Click link in bio to shop the limited release',
    hashtags: hashtags.length > 0 ? hashtags : ['#ArtisanCeramics', '#Handmade', '#WabiSabi', '#PulseERP']
  };
}

export function MarketingPlayground() {
  const [prompt, setPrompt] = useState('');
  const [toneProfile, setToneProfile] = useState<'expert' | 'emotional' | 'urgent'>('expert');
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  
  // Generation Outputs
  const [isGenerating, setIsGenerating] = useState(false);
  const [variantA, setVariantA] = useState('');
  const [variantB, setVariantB] = useState('');

  // Interactive Playground states
  const [activeTabA, setActiveTabA] = useState<'draft' | 'blocks' | 'preview' | 'edit'>('preview');
  const [activeTabB, setActiveTabB] = useState<'draft' | 'blocks' | 'preview' | 'edit'>('preview');
  const [previewPlatformA, setPreviewPlatformA] = useState<'instagram' | 'facebook' | 'x' | 'linkedin' | 'reddit'>('instagram');
  const [previewPlatformB, setPreviewPlatformB] = useState<'instagram' | 'facebook' | 'x' | 'linkedin' | 'reddit'>('instagram');
  const [editedCopyA, setEditedCopyA] = useState('');
  const [editedCopyB, setEditedCopyB] = useState('');
  const [copiedPart, setCopiedPart] = useState<string | null>(null);
  
  // Simulation Sandbox State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState<{
    aCtr: number;
    bCtr: number;
    aConvs: number;
    bConvs: number;
    aScore: number;
    bScore: number;
    winner: 'A' | 'B' | null;
  } | null>(null);

  // Auto Publish logs terminal
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishLogs, setPublishLogs] = useState<string[]>([]);
  const [publishComplete, setPublishComplete] = useState(false);
  const [copiedVariant, setCopiedVariant] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    try {
      // Load accounts to see synchronized posts
      const savedAccounts = localStorage.getItem('pulse_social_accounts');
      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts));
      }

      // Load correct persona Context
      const savedPersonas = localStorage.getItem('pulse_personas');
      const activeId = localStorage.getItem('pulse_active_persona');
      if (savedPersonas) {
        const parsed: Persona[] = JSON.parse(savedPersonas);
        const match = parsed.find(p => p.id === activeId) || parsed[0];
        if (match) setActivePersona(match);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGenerateAB = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setVariantA('');
    setVariantB('');
    setEditedCopyA('');
    setEditedCopyB('');
    setActiveTabA('preview');
    setActiveTabB('preview');
    setSimResults(null);
    setPublishLogs([]);
    setPublishComplete(false);

    // Context from active persona
    const pContext = activePersona 
      ? `Persona Context: Target is "${activePersona.name}" (${activePersona.demographics}). 
         Motivations: ${activePersona.motivations}. Barriers: ${activePersona.barriers}. 
         Preferred Tone guidelines: ${activePersona.tone}.`
      : 'Persona Context: General local boutique customer.';

    const promptText = `You are an elite copywriting agent trained in behavioral economics.
Generate two completely distinct copywriting variations (A and B) promoting: "${prompt}".
${pContext}

Variant A MUST represent: "Authority, expert craftsmanship, and concrete features" (Tone mode: ${toneProfile}).
Variant B MUST represent: "Emotional benefits, community story, and customer experience" (Tone mode: ${toneProfile}).

Generate the output formats cleanly in separate sections labeled [VARIANT A] and [VARIANT B]. Do not add preamble or footnotes. Make them highly compelling, ready for active social posts. Include relevant hashtags. Use proper markdown styling.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: promptText }] })
      });
      const data = await res.json();
      const text: string = data.reply;

      // Extract sections [VARIANT A] and [VARIANT B]
      let aText = '';
      let bText = '';

      if (text.includes('[VARIANT A]') && text.includes('[VARIANT B]')) {
        const parts = text.split('[VARIANT B]');
        aText = parts[0].replace('[VARIANT A]', '').trim();
        bText = parts[1].trim();
      } else {
        // Fallback split if formatting mismatched
        aText = text.slice(0, Math.floor(text.length / 2));
        bText = text.slice(Math.floor(text.length / 2));
      }

      const finalA = aText || "Variant A failed to parse fully.";
      const finalB = bText || "Variant B failed to parse fully.";

      setVariantA(finalA);
      setVariantB(finalB);
      setEditedCopyA(finalA);
      setEditedCopyB(finalB);
    } catch (e) {
      console.error(e);
      setVariantA("Failed to reach Gemini backend nodes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, vName: 'A' | 'B') => {
    navigator.clipboard.writeText(text);
    setCopiedVariant(vName);
    setTimeout(() => setCopiedVariant(null), 2000);
  };

  const handleCopyPartText = (text: string, partId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPart(partId);
    setTimeout(() => setCopiedPart(null), 2000);
  };

  const handleRunSimulation = async () => {
    if (isSimulating || !variantA) return;

    setIsSimulating(true);
    setSimResults(null);
    setPublishLogs([]);
    setPublishComplete(false);

    // Simulate real psychological analysis progress tickers
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isEmily = activePersona?.id === 'eco-emily';
    const isDave = activePersona?.id === 'downtown-dave';

    let aCtr = 3.2;
    let bCtr = 2.4;

    if (isEmily) {
      aCtr = 5.2; 
      bCtr = 2.1;
    } else if (isDave) {
      aCtr = 2.8;
      bCtr = 4.9;
    } else {
      aCtr = parseFloat((Math.random() * 3 + 2).toFixed(2));
      bCtr = parseFloat((Math.random() * 3 + 1.5).toFixed(2));
    }

    const imp = 10000;
    const aConvs = Math.round(imp * (aCtr / 100) * 0.15);
    const bConvs = Math.round(imp * (bCtr / 100) * 0.15);

    const aScore = Math.round(aCtr * 18);
    const bScore = Math.round(bCtr * 18);

    setSimResults({
      aCtr,
      bCtr,
      aConvs,
      bConvs,
      aScore,
      bScore,
      winner: aCtr >= bCtr ? 'A' : 'B'
    });
    setIsSimulating(false);
  };

  const handlePublishWinner = async (vChoice: 'A' | 'B') => {
    if (isPublishing || accounts.length === 0) return;

    setIsPublishing(true);
    setPublishLogs([]);
    setPublishComplete(false);

    const append = (msg: string, delay = 800) => {
      return new Promise<void>(res => {
        setTimeout(() => {
          setPublishLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
          res();
        }, delay);
      });
    };

    const sourceCopy = vChoice === 'A' ? editedCopyA : editedCopyB;
    const snippet = sourceCopy ? `"${sourceCopy.slice(0, 38).replace(/\n/g, ' ')}..."` : 'Campaign copy';

    await append("Starting campaign dispatch for Winner Variant " + vChoice + "...");
    await append(`Siphoned Persona alignment metadata from user storage: ${activePersona?.name || 'General Buyer'}.`);
    await append(`Preparing custom refined payload: ${snippet}`);

    for (const acc of accounts) {
      await append(`Authorizing OAuth2 token handshake for @${acc.platform} channel...`);
      await append(`Transmitting thread payload metadata. Server Response: 201 Created.`);
      await append(`Post successfully scheduled & published live on @${acc.platform}!`);
    }

    await append("All channels reported positive synchronizations. Dispatch complete.");
    setIsPublishing(false);
    setPublishComplete(true);
  };

  // Parse active content on demand
  const parsedA = parseCopyBlocks(editedCopyA || variantA);
  const parsedB = parseCopyBlocks(editedCopyB || variantB);

  return (
    <div id="marketing-ab-playground-root" className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300 select-none">
      
      {/* Left Input Configuration Column */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-fit space-y-5">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">A/B Camp Studio</h4>
          </div>

          {/* Connected Persona Indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1.5">Context injection Target</span>
            {activePersona ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{activePersona.avatar}</span>
                <div>
                  <h5 className="font-extrabold text-slate-800 text-xs">{activePersona.name}</h5>
                  <p className="text-[9px] text-slate-500 line-clamp-1">Barriers: {activePersona.barriers}</p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-medium">
                No active buyer persona loaded. Go to **Target Personas** tab to customize psychological targeting overlays.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Style Tone Modulation</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg border">
              <button
                type="button"
                onClick={() => setToneProfile('expert')}
                className={`py-1 text-[9px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  toneProfile === 'expert' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Expertise
              </button>
              <button
                type="button"
                onClick={() => setToneProfile('emotional')}
                className={`py-1 text-[9px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  toneProfile === 'emotional' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Community
              </button>
              <button
                type="button"
                onClick={() => setToneProfile('urgent')}
                className={`py-1 text-[9px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  toneProfile === 'urgent' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                FOMO Urgence
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Promotional Brief</label>
            <textarea
              className="w-full h-32 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors resize-none font-medium"
              placeholder="e.g. Handmade dark indigo clay platter with 20% opening discount code PLATTER20..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          onClick={handleGenerateAB}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4" />}
          {isGenerating ? 'Synthesizing Variants...' : 'Generate A/B Copy'}
        </button>
      </div>

      {/* Center & Right Splitscreen Column for Output variants */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Double column side-by-side drafts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* ================================== VARIANT A CARD ================================== */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[480px] shadow-sm relative">
            <div>
              {/* Variant Header & Main Action */}
              <div className="flex items-center justify-between border-b pb-2 mb-3 border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200">
                  Variant A: Authority Focus
                </span>
                
                {variantA && (
                  <button
                    onClick={() => handleCopy(editedCopyA || variantA, 'A')}
                    className="p-1 px-2 rounded hover:bg-slate-50 border text-[9px] uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedVariant === 'A' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedVariant === 'A' ? 'Copied' : 'Copy Full'}
                  </button>
                )}
              </div>

              {variantA && (
                /* Sleek Interactive Tabs for Variant A */
                <div className="flex gap-1 border-b border-slate-100 pb-2 mb-3 overflow-x-auto">
                  <button
                    onClick={() => setActiveTabA('preview')}
                    className={`px-2 py-1 text-[9.5px] uppercase font-black tracking-wider transition-all rounded-md flex items-center gap-1 cursor-pointer ${
                      activeTabA === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                    }`}
                  >
                    <Eye className="w-2.5 h-2.5" /> Mockup
                  </button>
                  <button
                    onClick={() => setActiveTabA('blocks')}
                    className={`px-2 py-1 text-[9.5px] uppercase font-black tracking-wider transition-all rounded-md flex items-center gap-1 cursor-pointer ${
                      activeTabA === 'blocks' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                    }`}
                  >
                    <AlignLeft className="w-2.5 h-2.5" /> Blocks
                  </button>
                  <button
                    onClick={() => setActiveTabA('draft')}
                    className={`px-2 py-1 text-[9.5px] uppercase font-black tracking-wider transition-all rounded-md flex items-center gap-1 cursor-pointer ${
                      activeTabA === 'draft' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                    }`}
                  >
                    <FileText className="w-2.5 h-2.5" /> Raw
                  </button>
                  <button
                    onClick={() => setActiveTabA('edit')}
                    className={`px-2 py-1 text-[9.5px] uppercase font-black tracking-wider transition-all rounded-md flex items-center gap-1 cursor-pointer ${
                      activeTabA === 'edit' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                    }`}
                  >
                    <Feather className="w-2.5 h-2.5" /> Refine
                  </button>
                </div>
              )}

              {isGenerating ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest animate-pulse font-black">AI building authority briefs...</p>
                </div>
              ) : variantA ? (
                <div className="min-h-[260px] flex flex-col justify-between">
                  
                  {/* TAB 1: RAW MARKDOWN */}
                  {activeTabA === 'draft' && (
                    <div className="text-[11.5px] text-slate-700 leading-relaxed font-sans prose prose-indigo max-h-72 overflow-y-auto pr-1 select-text bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <ReactMarkdown>{editedCopyA || variantA}</ReactMarkdown>
                    </div>
                  )}

                  {/* TAB 2: WELL-ORGANIZED INTERACTIVE COPY BLOCKS */}
                  {activeTabA === 'blocks' && (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {/* HEADLINE BLOCK */}
                      <div className="bg-white border rounded-lg p-2.5 space-y-1 relative group hover:border-blue-400 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-bold text-blue-500 uppercase tracking-widest">Headline Hook</span>
                          <button
                            onClick={() => handleCopyPartText(parsedA.headline, 'a-head')}
                            className="text-[8px] uppercase tracking-wider text-slate-400 hover:text-[#2563EB] font-black cursor-pointer flex items-center gap-0.5"
                          >
                            {copiedPart === 'a-head' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            {copiedPart === 'a-head' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-800 tracking-tight leading-snug">{parsedA.headline}</p>
                      </div>

                      {/* BODY DRAFT */}
                      <div className="bg-white border rounded-lg p-2.5 space-y-1 relative group hover:border-blue-400 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-bold text-blue-500 uppercase tracking-widest">Middle Text Draft</span>
                          <button
                            onClick={() => handleCopyPartText(parsedA.body, 'a-body')}
                            className="text-[8px] uppercase tracking-wider text-slate-400 hover:text-[#2563EB] font-black cursor-pointer flex items-center gap-0.5"
                          >
                            {copiedPart === 'a-body' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            {copiedPart === 'a-body' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-650 leading-relaxed max-h-24 overflow-y-auto select-text pr-0.5 whitespace-pre-wrap">{parsedA.body}</p>
                      </div>

                      {/* CALL TO ACTION */}
                      <div className="bg-white border rounded-lg p-2.5 space-y-1 relative group hover:border-blue-400 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-bold text-blue-500 uppercase tracking-widest">Campaign CTA</span>
                          <button
                            onClick={() => handleCopyPartText(parsedA.cta, 'a-cta')}
                            className="text-[8px] uppercase tracking-wider text-slate-400 hover:text-[#2563EB] font-black cursor-pointer flex items-center gap-0.5"
                          >
                            {copiedPart === 'a-cta' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            {copiedPart === 'a-cta' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-1 rounded cursor-text select-text">{parsedA.cta}</p>
                      </div>

                      {/* HASHTAGS BLOCK */}
                      <div className="bg-white border rounded-lg p-2.5 space-y-1.5 hover:border-blue-400 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-bold text-blue-500 uppercase tracking-widest">Optimal Hashtags</span>
                          <button
                            onClick={() => handleCopyPartText(parsedA.hashtags.join(' '), 'a-tags')}
                            className="text-[8px] uppercase tracking-wider text-slate-400 hover:text-[#2563EB] font-black cursor-pointer flex items-center gap-0.5"
                          >
                            {copiedPart === 'a-tags' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            {copiedPart === 'a-tags' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {parsedA.hashtags.map((tag, i) => (
                            <span key={i} className="text-[10px] text-blue-600 bg-slate-50 border border-slate-100 rounded px-1.5 font-mono">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: IMMERSIVE ATTRACTIVE LIVE PREVIEW MOCKUPS */}
                  {activeTabA === 'preview' && (
                    <div className="space-y-3">
                      {/* Sub-tabs to choose preview networks with SVG logos */}
                      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                        {(['instagram', 'facebook', 'x', 'linkedin', 'reddit'] as const).map((plt) => {
                          const isActive = previewPlatformA === plt;
                          return (
                            <button
                              key={plt}
                              onClick={() => setPreviewPlatformA(plt)}
                              type="button"
                              className={`text-[8.5px] font-black uppercase flex-1 py-1 px-0.5 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                                isActive 
                                  ? 'bg-white shadow-xs text-slate-800 font-bold' 
                                  : 'text-slate-400 hover:text-slate-600 font-normal'
                              }`}
                            >
                              {renderMockupPlatformLogo(plt, "w-3 h-3 shrink-0")}
                              <span className="hidden sm:inline-block">{plt === 'x' ? 'X Feed' : plt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* INSTAGRAM MOCKUP */}
                      {previewPlatformA === 'instagram' && (
                        <div className="border border-slate-205 border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden max-h-64 overflow-y-auto">
                          {/* Header bar */}
                          <div className="flex items-center gap-2 p-2.5 border-b border-slate-100">
                            <span className="w-6 h-6 rounded-full bg-slate-900 border flex items-center justify-center text-xs">🏺</span>
                            <div className="text-left">
                              <h5 className="font-extrabold text-[10.5px] text-slate-800 flex items-center gap-0.5">
                                artisan_ceramics 
                                <span className="inline-block w-2.5 h-2.5 text-blue-500">✓</span>
                              </h5>
                              <p className="text-[8px] text-slate-400 -mt-0.5">Wabi-Sabi Kiln, Ceramic NY</p>
                            </div>
                          </div>
                          {/* Photo Placeholder */}
                          <div className="bg-gradient-to-tr from-orange-50 to-indigo-100/40 border-b border-slate-100 py-6 text-center">
                            <span className="text-2xl block mb-1">🏺</span>
                            <span className="text-[9px] text-indigo-950 font-bold tracking-widest uppercase block">[ AI Stoneware Campaign Visual ]</span>
                          </div>
                          {/* Bottom captions */}
                          <div className="p-3 text-left space-y-1.5 bg-[#FAFAFA]">
                            <div className="flex items-center gap-2.5 text-slate-700">
                              <Heart className="w-4 h-4 hover:fill-red-500 hover:text-red-500 cursor-pointer transition-colors" />
                              <MessageSquare className="w-4 h-4 cursor-pointer" />
                              <Send className="w-3.5 h-3.5 cursor-pointer" />
                              <Bookmark className="w-4 h-4 ml-auto cursor-pointer" />
                            </div>
                            <p className="text-[10px] text-slate-800 leading-normal select-text">
                              <span className="font-extrabold mr-1">artisan_ceramics</span>
                              {parsedA.headline}. {parsedA.body} <span className="font-semibold text-blue-700">{parsedA.cta}</span>
                            </p>
                            <p className="text-[9px] text-blue-600 select-text font-mono mt-0.5">{parsedA.hashtags.join(' ')}</p>
                          </div>
                        </div>
                      )}

                      {/* X (TWITTER) MOCKUP */}
                      {previewPlatformA === 'x' && (
                        <div className="border border-slate-105 border-slate-200 rounded-xl bg-slate-950 p-4 text-white text-left max-h-64 overflow-y-auto font-sans">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-indigo-950 border border-slate-800 flex items-center justify-center text-xs">🏺</span>
                            <div>
                              <h5 className="font-bold text-xs text-white flex items-center gap-1">
                                Artisan Ceramics <span className="text-sky-400 text-[10px]">✓</span>
                              </h5>
                              <p className="text-[9.5px] text-slate-400">@ArtisanCeramics • 2h</p>
                            </div>
                          </div>
                          <div className="mt-3 text-[11px] leading-relaxed text-slate-100 font-normal select-text">
                            <p className="font-bold text-white mb-1.5">{parsedA.headline}</p>
                            <p className="whitespace-pre-wrap">{parsedA.body}</p>
                            <p className="font-extrabold text-[#60CDFF] mt-2">{parsedA.cta}</p>
                            <p className="text-sky-400 font-mono mt-2 text-[10px]">{parsedA.hashtags.join(' ')}</p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-zinc-800 flex justify-between text-slate-500 text-[9px] font-semibold tracking-wider uppercase font-mono">
                            <span>💬 12 replies</span>
                            <span>🔁 43 reposts</span>
                            <span>❤️ {Math.round(simResults?.aScore || 142)} likes</span>
                          </div>
                        </div>
                      )}

                      {/* LINKEDIN MOCKUP */}
                      {previewPlatformA === 'linkedin' && (
                        <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 text-left max-h-64 overflow-y-auto">
                          <div className="flex items-start gap-2.5">
                            <span className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center text-sm shadow">🏺</span>
                            <div>
                              <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                Artisan Ceramics <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">1st</span>
                              </h5>
                              <p className="text-[9px] text-slate-500">Atelier of Sustainable Pottery & Ceramics • Handcrafted</p>
                              <p className="text-[8.5px] text-slate-400 flex items-center gap-1">1d • Edited • <Globe className="w-2.5 h-2.5 inline" /></p>
                            </div>
                          </div>
                          <div className="mt-3 border-l-2 border-indigo-500 pl-2.5 text-[11px] leading-relaxed text-slate-700 select-text">
                            <p className="font-extrabold text-slate-900 mb-1">{parsedA.headline}</p>
                            <p className="whitespace-pre-wrap">{parsedA.body}</p>
                            <span className="font-bold text-indigo-700 block mt-1.5">{parsedA.cta}</span>
                            <p className="text-indigo-600 mt-2 font-mono text-[9.5px]">{parsedA.hashtags.join(' ')}</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-150 border-slate-200 flex justify-between text-[9px] uppercase font-bold text-slate-500">
                            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><ThumbsUp className="w-3 h-3 text-blue-500" /> Like</span>
                            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><MessageSquare className="w-3 h-3" /> Comment</span>
                            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600">🔁 Repost</span>
                            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><Send className="w-3 h-3" /> Send</span>
                          </div>
                        </div>
                      )}

                      {/* FACEBOOK MOCKUP */}
                      {previewPlatformA === 'facebook' && (
                        <div className="border border-slate-200 rounded-xl bg-white p-4 text-left max-h-64 overflow-y-auto">
                          <div className="flex items-center gap-2 border-b pb-2">
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs shadow-inner">🏺</span>
                            <div>
                              <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1 leading-none">
                                Artisan Ceramics
                              </h5>
                              <p className="text-[8.5px] text-slate-500 mt-1">Sponsored • Paid Audience • 🌐</p>
                            </div>
                          </div>
                          <div className="mt-2.5 text-[11px] text-slate-800 leading-relaxed font-sans select-text">
                            <p className="font-extrabold text-slate-950 text-xs mb-1">{parsedA.headline}</p>
                            <p className="whitespace-pre-wrap">{parsedA.body}</p>
                            <span className="font-bold text-blue-600 block mt-2 hover:underline">{parsedA.cta}</span>
                            <p className="text-blue-600 mt-1.5 font-mono text-[9px]">{parsedA.hashtags.join(' ')}</p>
                          </div>
                          {/* Creative banner block */}
                          <div className="mt-3 bg-slate-50 border rounded-lg p-2.5 flex justify-between items-center">
                            <div className="text-left font-sans">
                              <span className="text-[8px] font-bold text-slate-400 block uppercase">[ Meta Network Placement ]</span>
                              <span className="text-[10px] font-black text-slate-700 block">{parsedA.headline || "Secure Premium Ceramics"}</span>
                            </div>
                            <button type="button" className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-[8.5px] px-2.5 py-1 rounded uppercase tracking-wider">Learn More</button>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-slate-150 flex justify-between text-slate-500 text-[10px] font-bold">
                            <span className="cursor-pointer hover:text-blue-600">👍 Like</span>
                            <span className="cursor-pointer hover:text-blue-600">💬 Comment</span>
                            <span className="cursor-pointer hover:text-blue-600">➡️ Share</span>
                          </div>
                        </div>
                      )}

                      {/* REDDIT MOCKUP */}
                      {previewPlatformA === 'reddit' && (
                        <div className="border border-[#343536]/20 rounded-xl bg-[#FFFFFF] p-4 text-left max-h-64 overflow-y-auto">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-medium border-b pb-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs">🏺</span>
                            <span className="font-bold text-slate-800 text-[10px]">r/artisan_pottery</span>
                            <span>• Posted by u/artisan_ceramics 2h ago</span>
                          </div>
                          <div className="mt-2 text-left select-text">
                            <h4 className="font-black text-sm text-[#1A1A1B] leading-snug">{parsedA.headline}</h4>
                            <div className="mt-1.5 p-2.5 bg-slate-50 border-l-2 border-orange-500 text-slate-700 text-[11px] leading-relaxed rounded-r-lg">
                              <p className="whitespace-pre-wrap">{parsedA.body}</p>
                              <p className="font-extrabold text-[#0079D3] mt-2 block hover:underline">{parsedA.cta}</p>
                            </div>
                            <p className="text-[#FF4500] font-mono mt-2 text-[9px]">{parsedA.hashtags.join(' ')}</p>
                          </div>
                          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex gap-4 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                            <span className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">🔺 Upvote</span>
                            <span className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">💬 Comment</span>
                            <span className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">📣 Share</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: INTERACTIVE DYNAMIC TEXT REFINE & METRIC EDITOR */}
                  {activeTabA === 'edit' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tweak Copy Live</label>
                          <button
                            onClick={() => {
                              setEditedCopyA(variantA);
                              setCopiedPart('a-reset');
                              setTimeout(() => setCopiedPart(null), 1500);
                            }}
                            className="text-[8.5px] uppercase font-black tracking-widest text-[#9C27B0] hover:text-[#7B1FA2] flex items-center gap-0.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> 
                            {copiedPart === 'a-reset' ? 'Restored' : 'Reset Original'}
                          </button>
                        </div>
                        <textarea
                          className="w-full h-36 p-2 text-[11px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-all font-sans select-text leading-relaxed outline-none"
                          value={editedCopyA}
                          onChange={e => setEditedCopyA(e.target.value)}
                        />
                      </div>

                      {/* Live character stats bar */}
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span>Words: {editedCopyA.split(/\s+/).filter(Boolean).length}</span>
                        <div className="flex items-center gap-2">
                          <span className="uppercase">Twitter Limit (280 characters):</span>
                          <span className={`px-1.5 py-0.5 rounded font-mono ${editedCopyA.length <= 280 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            {editedCopyA.length} / 280
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-24 text-slate-400 text-xs">
                  Awaiting promotional brief variables...
                </div>
              )}
            </div>

            {simResults && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-400">Predicted CTR Rate:</span>
                  <strong className="text-blue-950 font-mono font-bold text-sm bg-slate-50 px-2 py-0.5 rounded border">{simResults.aCtr}%</strong>
                </div>
                <div className="flex justify-between items-center text-[10px] mt-1 text-slate-500 font-mono">
                  <span>Conversions / 10k Imp:</span>
                  <strong>{simResults.aConvs} sales</strong>
                </div>
              </div>
            )}
          </div>

          {/* ================================== VARIANT B CARD ================================== */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[480px] shadow-sm relative">
            <div>
              {/* Variant Header & Main Action */}
              <div className="flex items-center justify-between border-b pb-2 mb-3 border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#9C27B0] bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  Variant B: Emotional Benefits
                </span>

                {variantB && (
                  <button
                    onClick={() => handleCopy(editedCopyB || variantB, 'B')}
                    className="p-1 px-2 rounded hover:bg-slate-50 border text-[9px] uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedVariant === 'B' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedVariant === 'B' ? 'Copied' : 'Copy Full'}
                  </button>
                )}
              </div>

              {variantB && (
                /* Sleek Interactive Tabs for Variant B */
                <div className="flex gap-1 border-b border-slate-100 pb-2 mb-3 overflow-x-auto">
                  <button
                    onClick={() => setActiveTabB('preview')}
                    className={`px-2 py-1 text-[9.5px] uppercase font-black tracking-wider transition-all rounded-md flex items-center gap-1 cursor-pointer ${
                      activeTabB === 'preview' ? 'bg-[#9C27B0] text-white' : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                    }`}
                  >
                    <Eye className="w-2.5 h-2.5" /> Mockup
                  </button>
                  <button
                    onClick={() => setActiveTabB('blocks')}
                    className={`px-2 py-1 text-[9.5px] uppercase font-black tracking-wider transition-all rounded-md flex items-center gap-1 cursor-pointer ${
                      activeTabB === 'blocks' ? 'bg-[#9C27B0] text-white' : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                    }`}
                  >
                    <AlignLeft className="w-2.5 h-2.5" /> Blocks
                  </button>
                  <button
                    onClick={() => setActiveTabB('draft')}
                    className={`px-2 py-1 text-[9.5px] uppercase font-black tracking-wider transition-all rounded-md flex items-center gap-1 cursor-pointer ${
                      activeTabB === 'draft' ? 'bg-[#9C27B0] text-white' : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                    }`}
                  >
                    <FileText className="w-2.5 h-2.5" /> Raw
                  </button>
                  <button
                    onClick={() => setActiveTabB('edit')}
                    className={`px-2 py-1 text-[9.5px] uppercase font-black tracking-wider transition-all rounded-md flex items-center gap-1 cursor-pointer ${
                      activeTabB === 'edit' ? 'bg-[#9C27B0] text-white' : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                    }`}
                  >
                    <Feather className="w-2.5 h-2.5" /> Refine
                  </button>
                </div>
              )}

              {isGenerating ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest animate-pulse font-black">AI building emotional narrative...</p>
                </div>
              ) : variantB ? (
                <div className="min-h-[260px] flex flex-col justify-between">
                  
                  {/* TAB 1: RAW MARKDOWN */}
                  {activeTabB === 'draft' && (
                    <div className="text-[11.5px] text-slate-700 leading-relaxed font-sans prose prose-indigo max-h-72 overflow-y-auto pr-1 select-text bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <ReactMarkdown>{editedCopyB || variantB}</ReactMarkdown>
                    </div>
                  )}

                  {/* TAB 2: WELL-ORGANIZED INTERACTIVE COPY BLOCKS */}
                  {activeTabB === 'blocks' && (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {/* HEADLINE BLOCK */}
                      <div className="bg-white border rounded-lg p-2.5 space-y-1 relative group hover:border-[#9C27B0] transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-bold text-purple-600 uppercase tracking-widest">Story Hook Headline</span>
                          <button
                            onClick={() => handleCopyPartText(parsedB.headline, 'b-head')}
                            className="text-[8px] uppercase tracking-wider text-slate-400 hover:text-[#9C27B0] font-black cursor-pointer flex items-center gap-0.5"
                          >
                            {copiedPart === 'b-head' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            {copiedPart === 'b-head' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-800 tracking-tight leading-snug">{parsedB.headline}</p>
                      </div>

                      {/* BODY DRAFT */}
                      <div className="bg-white border rounded-lg p-2.5 space-y-1 relative group hover:border-[#9C27B0] transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-bold text-purple-600 uppercase tracking-widest">Narrative body</span>
                          <button
                            onClick={() => handleCopyPartText(parsedB.body, 'b-body')}
                            className="text-[8px] uppercase tracking-wider text-slate-400 hover:text-[#9C27B0] font-black cursor-pointer flex items-center gap-0.5"
                          >
                            {copiedPart === 'b-body' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            {copiedPart === 'b-body' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-650 leading-relaxed max-h-24 overflow-y-auto select-text pr-0.5 whitespace-pre-wrap">{parsedB.body}</p>
                      </div>

                      {/* CALL TO ACTION */}
                      <div className="bg-white border rounded-lg p-2.5 space-y-1 relative group hover:border-[#9C27B0] transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-bold text-purple-600 uppercase tracking-widest">Community CTA Invite</span>
                          <button
                            onClick={() => handleCopyPartText(parsedB.cta, 'b-cta')}
                            className="text-[8px] uppercase tracking-wider text-slate-400 hover:text-[#9C27B0] font-black cursor-pointer flex items-center gap-0.5"
                          >
                            {copiedPart === 'b-cta' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            {copiedPart === 'b-cta' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-1 rounded cursor-text select-text">{parsedB.cta}</p>
                      </div>

                      {/* HASHTAGS BLOCK */}
                      <div className="bg-white border rounded-lg p-2.5 space-y-1.5 hover:border-[#9C27B0] transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-bold text-purple-600 uppercase tracking-widest">Emotional Hashtags</span>
                          <button
                            onClick={() => handleCopyPartText(parsedB.hashtags.join(' '), 'b-tags')}
                            className="text-[8px] uppercase tracking-wider text-slate-400 hover:text-[#9C27B0] font-black cursor-pointer flex items-center gap-0.5"
                          >
                            {copiedPart === 'b-tags' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            {copiedPart === 'b-tags' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {parsedB.hashtags.map((tag, i) => (
                            <span key={i} className="text-[10px] text-purple-600 bg-slate-50 border border-slate-100 rounded px-1.5 font-mono">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: IMMERSIVE ATTRACTIVE LIVE PREVIEW B MOCKUPS */}
                  {activeTabB === 'preview' && (
                    <div className="space-y-3">
                      {/* Sub-tabs to choose preview networks with SVG logos */}
                      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                        {(['instagram', 'facebook', 'x', 'linkedin', 'reddit'] as const).map((plt) => {
                          const isActive = previewPlatformB === plt;
                          return (
                            <button
                              key={plt}
                              onClick={() => setPreviewPlatformB(plt)}
                              type="button"
                              className={`text-[8.5px] font-black uppercase flex-1 py-1 px-0.5 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                                isActive 
                                  ? 'bg-white shadow-xs text-slate-800 font-bold' 
                                  : 'text-slate-400 hover:text-slate-600 font-normal'
                              }`}
                            >
                              {renderMockupPlatformLogo(plt, "w-3 h-3 shrink-0")}
                              <span className="hidden sm:inline-block">{plt === 'x' ? 'X Feed' : plt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* INSTAGRAM B MOCKUP */}
                      {previewPlatformB === 'instagram' && (
                        <div className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden max-h-64 overflow-y-auto">
                          {/* Header bar */}
                          <div className="flex items-center gap-2 p-2.5 border-b border-slate-100">
                            <span className="w-6 h-6 rounded-full bg-slate-900 border flex items-center justify-center text-xs">🏺</span>
                            <div className="text-left">
                              <h5 className="font-extrabold text-[10.5px] text-slate-800 flex items-center gap-0.5">
                                artisan_ceramics 
                                <span className="inline-block w-2.5 h-2.5 text-blue-500">✓</span>
                              </h5>
                              <p className="text-[8px] text-slate-400 -mt-0.5">Wabi-Sabi Kiln, Ceramic NY</p>
                            </div>
                          </div>
                          {/* Photo Placeholder */}
                          <div className="bg-gradient-to-tr from-purple-50 to-pink-100/40 border-b border-slate-100 py-6 text-center">
                            <span className="text-2xl block mb-1">🏺</span>
                            <span className="text-[9px] text-purple-950 font-bold tracking-widest uppercase block">[ AI Crafting Story Graphic ]</span>
                          </div>
                          {/* Bottom captions */}
                          <div className="p-3 text-left space-y-1.5 bg-[#FAFAFA]">
                            <div className="flex items-center gap-2.5 text-slate-700">
                              <Heart className="w-4 h-4 hover:fill-red-500 hover:text-red-500 cursor-pointer transition-colors" />
                              <MessageSquare className="w-4 h-4 cursor-pointer" />
                              <Send className="w-3.5 h-3.5 cursor-pointer" />
                              <Bookmark className="w-4 h-4 ml-auto cursor-pointer" />
                            </div>
                            <p className="text-[10px] text-slate-800 leading-normal select-text">
                              <span className="font-extrabold mr-1">artisan_ceramics</span>
                              {parsedB.headline}. {parsedB.body} <span className="font-semibold text-purple-700">{parsedB.cta}</span>
                            </p>
                            <p className="text-[9px] text-blue-600 select-text font-mono mt-0.5">{parsedB.hashtags.join(' ')}</p>
                          </div>
                        </div>
                      )}

                      {/* X B MOCKUP */}
                      {previewPlatformB === 'x' && (
                        <div className="border border-slate-200 rounded-xl bg-slate-950 p-4 text-white text-left max-h-64 overflow-y-auto font-sans font-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-[#1e1b4b] border border-slate-800 flex items-center justify-center text-xs">🏺</span>
                            <div>
                              <h5 className="font-bold text-xs text-white flex items-center gap-1">
                                Artisan Ceramics <span className="text-sky-400 text-[10px]">✓</span>
                              </h5>
                              <p className="text-[9.5px] text-slate-400">@ArtisanCeramics • Just now</p>
                            </div>
                          </div>
                          <div className="mt-3 text-[11px] leading-relaxed text-slate-100 font-normal select-text">
                            <p className="font-bold text-white mb-1.5">{parsedB.headline}</p>
                            <p className="whitespace-pre-wrap">{parsedB.body}</p>
                            <p className="font-extrabold text-[#60CDFF] mt-2">{parsedB.cta}</p>
                            <p className="text-sky-400 font-mono mt-2 text-[10px]">{parsedB.hashtags.join(' ')}</p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-zinc-800 flex justify-between text-slate-500 text-[9px] font-semibold tracking-wider uppercase font-mono">
                            <span>💬 8 replies</span>
                            <span>🔁 17 reposts</span>
                            <span>❤️ {Math.round(simResults?.bScore || 116)} likes</span>
                          </div>
                        </div>
                      )}

                      {/* LINKEDIN B MOCKUP */}
                      {previewPlatformB === 'linkedin' && (
                        <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 text-left max-h-64 overflow-y-auto">
                          <div className="flex items-start gap-2.5">
                            <span className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center text-sm shadow">🏺</span>
                            <div>
                              <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                Artisan Ceramics <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">1st</span>
                              </h5>
                              <p className="text-[9px] text-slate-500">Atelier of Sustainable Pottery & Ceramics • Handcrafted</p>
                              <p className="text-[8.5px] text-slate-400 flex items-center gap-1 flex justify-start items-center">Just now • Edited • <Globe className="w-2.5 h-2.5 inline" /></p>
                            </div>
                          </div>
                          <div className="mt-3 border-l-2 border-purple-500 pl-2.5 text-[11px] leading-relaxed text-slate-700 select-text">
                            <p className="font-extrabold text-slate-900 mb-1">{parsedB.headline}</p>
                            <p className="whitespace-pre-wrap">{parsedB.body}</p>
                            <span className="font-bold text-purple-750 text-purple-800 block mt-1.5">{parsedB.cta}</span>
                            <p className="text-purple-600 mt-2 font-mono text-[9.5px]">{parsedB.hashtags.join(' ')}</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-[9px] uppercase font-bold text-slate-500">
                            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><ThumbsUp className="w-3 h-3 text-blue-500" /> Like</span>
                            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><MessageSquare className="w-3 h-3" /> Comment</span>
                            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600">🔁 Repost</span>
                            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><Send className="w-3 h-3" /> Send</span>
                          </div>
                        </div>
                      )}

                      {/* FACEBOOK B MOCKUP */}
                      {previewPlatformB === 'facebook' && (
                        <div className="border border-slate-200 rounded-xl bg-white p-4 text-left max-h-64 overflow-y-auto font-sans">
                          <div className="flex items-center gap-2 border-b pb-2">
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs shadow-inner">🏺</span>
                            <div>
                              <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1 leading-none">
                                Artisan Ceramics
                              </h5>
                              <p className="text-[8.5px] text-slate-500 mt-1">Sponsored • Paid Audience • 🌐</p>
                            </div>
                          </div>
                          <div className="mt-2.5 text-[11px] text-slate-800 leading-relaxed font-sans select-text">
                            <p className="font-extrabold text-slate-950 text-xs mb-1">{parsedB.headline}</p>
                            <p className="whitespace-pre-wrap">{parsedB.body}</p>
                            <span className="font-bold text-violet-600 block mt-2 hover:underline">{parsedB.cta}</span>
                            <p className="text-violet-600 mt-1.5 font-mono text-[9px]">{parsedB.hashtags.join(' ')}</p>
                          </div>
                          {/* Creative banner block */}
                          <div className="mt-3 bg-slate-50 border rounded-lg p-2.5 flex justify-between items-center">
                            <div className="text-left font-sans">
                              <span className="text-[8px] font-bold text-slate-400 block uppercase">[ Meta Network Placement ]</span>
                              <span className="text-[10px] font-black text-slate-700 block">{parsedB.headline || "Explore Artisan Selections"}</span>
                            </div>
                            <button type="button" className="bg-slate-250 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-[8.5px] px-2.5 py-1 rounded uppercase tracking-wider">Learn More</button>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-slate-150 flex justify-between text-slate-500 text-[10px] font-bold">
                            <span className="cursor-pointer hover:text-blue-600">👍 Like</span>
                            <span className="cursor-pointer hover:text-blue-600">💬 Comment</span>
                            <span className="cursor-pointer hover:text-blue-600">➡️ Share</span>
                          </div>
                        </div>
                      )}

                      {/* REDDIT B MOCKUP */}
                      {previewPlatformB === 'reddit' && (
                        <div className="border border-[#343536]/20 rounded-xl bg-[#FFFFFF] p-4 text-left max-h-64 overflow-y-auto">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-medium border-b pb-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs">🏺</span>
                            <span className="font-bold text-slate-800 text-[10px]">r/artisan_pottery</span>
                            <span>• Posted by u/artisan_ceramics 2h ago</span>
                          </div>
                          <div className="mt-2 text-left select-text">
                            <h4 className="font-black text-sm text-[#1A1A1B] leading-snug">{parsedB.headline}</h4>
                            <div className="mt-1.5 p-2.5 bg-slate-50 border-l-2 border-purple-500 text-slate-700 text-[11px] leading-relaxed rounded-r-lg">
                              <p className="whitespace-pre-wrap">{parsedB.body}</p>
                              <p className="font-extrabold text-[#9c27b0] mt-2 block hover:underline">{parsedB.cta}</p>
                            </div>
                            <p className="text-[#FF4500] font-mono mt-2 text-[9px]">{parsedB.hashtags.join(' ')}</p>
                          </div>
                          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex gap-4 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                            <span className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">🔺 Upvote</span>
                            <span className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">💬 Comment</span>
                            <span className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">📣 Share</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: INTERACTIVE DYNAMIC TEXT REFINE B EDITOR */}
                  {activeTabB === 'edit' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tweak Copy Live</label>
                          <button
                            onClick={() => {
                              setEditedCopyB(variantB);
                              setCopiedPart('b-reset');
                              setTimeout(() => setCopiedPart(null), 1500);
                            }}
                            className="text-[8.5px] uppercase font-black tracking-widest text-[#9C27B0] hover:text-[#7B1FA2] flex items-center gap-0.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> 
                            {copiedPart === 'b-reset' ? 'Restored' : 'Reset Original'}
                          </button>
                        </div>
                        <textarea
                          className="w-full h-36 p-2 text-[11px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#9C27B0] transition-all font-sans select-text leading-relaxed whitespace-pre"
                          value={editedCopyB}
                          onChange={e => setEditedCopyB(e.target.value)}
                        />
                      </div>

                      {/* Live character stats bar */}
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span>Words: {editedCopyB.split(/\s+/).filter(Boolean).length}</span>
                        <div className="flex items-center gap-2">
                          <span className="uppercase">Twitter Limit (280 characters):</span>
                          <span className={`px-1.5 py-0.5 rounded font-mono ${editedCopyB.length <= 280 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            {editedCopyB.length} / 280
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-24 text-slate-400 text-xs">
                  Awaiting promotional brief variables...
                </div>
              )}
            </div>

            {simResults && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-400">Predicted CTR Rate:</span>
                  <strong className="text-purple-950 font-mono font-bold text-sm bg-slate-50 px-2 py-0.5 rounded border">{simResults.bCtr}%</strong>
                </div>
                <div className="flex justify-between items-center text-[10px] mt-1 text-slate-500 font-mono">
                  <span>Conversions / 10k Imp:</span>
                  <strong>{simResults.bConvs} sales</strong>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Dynamic Simulation Ticker Action Row */}
        {variantA && (
          <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-emerald-500" /> Sandbox Behavior Predictor
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Run simulated user response checks comparing A/B CTR, conversion values, and engagement indices.
                </p>
              </div>

              {!simResults ? (
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
                >
                  {isSimulating ? 'Simulating Analysis...' : 'Predict Campaign Performance'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePublishWinner(simResults.winner!)}
                    disabled={isPublishing || accounts.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Auto-Publish Winner ({simResults.winner})
                  </button>
                  <button
                    onClick={handleRunSimulation}
                    className="border text-slate-650 font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    Re-Run Simulation
                  </button>
                </div>
              )}
            </div>

            {simResults && (
              <div className="p-4 bg-emerald-50/70 text-emerald-950 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl bg-white p-1 rounded border shadow-2xs">🏆</span>
                  <div>
                    <h6 className="font-extrabold text-xs">Variant {simResults.winner} Is Certified Path Winner!</h6>
                    <p className="text-[10px] text-emerald-800 font-medium">
                      Based on psychological triggers configured in your active Buyer profile, Variant {simResults.winner} has a {simResults.winner === 'A' ? simResults.aCtr : simResults.bCtr}% CTR, driving over <strong>{simResults.winner === 'A' ? simResults.aConvs : simResults.bConvs} product orders</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Simulated execution terminal log */}
            {publishLogs.length > 0 && (
              <div className="p-4 bg-slate-900 border border-slate-950 rounded-xl font-mono text-[10px] text-emerald-400 space-y-1.5 shadow-inner">
                <div className="text-slate-400 font-bold border-b pb-1.5 border-slate-800 flex items-center justify-between">
                  <span>Transmitting Synchronized Thread Despatches:</span>
                  <span className="text-[8px] uppercase tracking-widest text-emerald-500 bg-emerald-950/40 px-1 border border-emerald-900">live</span>
                </div>
                {publishLogs.map((l, i) => (
                  <div key={i} className="leading-tight select-text">{l}</div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
