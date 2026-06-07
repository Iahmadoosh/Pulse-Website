import { useState, useEffect } from 'react';
import { Users, Sparkles, Loader2, Trash2, CheckCircle, Plus, Brain, AlertCircle } from 'lucide-react';

export interface Persona {
  id: string;
  name: string;
  avatar: string;
  demographics: string;
  barriers: string;
  motivations: string;
  habits: string;
  tone: string;
}

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'eco-emily',
    name: 'Eco-conscious Emily',
    avatar: '🍃',
    demographics: 'F, age 28-40, local community organizer, graphic designer',
    barriers: 'High price-sensitivity but willing to pay premium for clear carbon neutrality and zero-plastic kiln shipping.',
    motivations: 'Supporting local craftsmen, reduction in plastic footprint, story-driven artistic pieces.',
    habits: 'Buys ceramics to gift friends, active in farmers markets, reads long ingredient origin labels.',
    tone: 'Sincere, informative, artisanal, eco-centric'
  },
  {
    id: 'downtown-dave',
    name: 'Downtown Dave',
    avatar: '☕',
    demographics: 'M, age 24-35, tech consultant, coffee connoisseur',
    barriers: 'Subtle imperfections must feel wabi-sabi/ rugged, not sloppy. Zero patience for slow email inquiries.',
    motivations: 'Wants ultra-durable, thick premium mugs for home espresso machine setups, minimalist aesthetics.',
    habits: 'Shares morning office desk brew photos on Slack, frequent cafe explorer, values ergonomics.',
    tone: 'Bold, minimal, punchy, modern'
  }
];

export function MarketingPersonas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newNiche, setNewNiche] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pulse_personas');
      if (stored) {
        setPersonas(JSON.parse(stored));
      } else {
        setPersonas(DEFAULT_PERSONAS);
        localStorage.setItem('pulse_personas', JSON.stringify(DEFAULT_PERSONAS));
      }

      // Read active selected persona
      const active = localStorage.getItem('pulse_active_persona');
      if (active) setSelectedPersona(active);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const savePersonas = (newList: Persona[]) => {
    setPersonas(newList);
    localStorage.setItem('pulse_personas', JSON.stringify(newList));
  };

  const handleSelectPersona = (id: string) => {
    setSelectedPersona(id);
    localStorage.setItem('pulse_active_persona', id);
  };

  const handleDeletePersona = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = personas.filter(p => p.id !== id);
    savePersonas(updated);
    if (selectedPersona === id) {
      setSelectedPersona('');
      localStorage.removeItem('pulse_active_persona');
    }
  };

  const handleCreateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNiche.trim() || isGenerating) return;

    setIsGenerating(true);
    const promptText = `Generate a highly strategic psychological marketing persona group for a local boutique small business.
The specific customer niche described: "${newNiche}".

Please generate:
1. Demographics Overview (e.g. "Age 25-35, urban professional")
2. Psychological Barriers (Purchasing hesitations or frictions)
3. Motivations (Emotional triggers driving purchase decisions)
4. Key Purchasing Habits
5. Recommended Brand Tone Preference
6. Suggest a single emoji representing an appropriate avatar.

Return your response strictly as JSON that parses perfectly, with exactly these key structures:
{
  "name": "Unique Name for Persona",
  "avatar": "Single Emoji representing them",
  "demographics": " demographics summary string ",
  "barriers": " barriers summary string ",
  "motivations": " motivations string ",
  "habits": " habits summary string ",
  "tone": " tone guidelines "
}

Do not include any explanation or backticks. Only return the valid JSON string.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: promptText }] })
      });
      const data = await res.json();
      
      // Parse JSON from returned GPT content
      let cleanText = data.reply.trim();
      // Safeguard markdown fences code blocks
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanText);
      const newPerson: Persona = {
        id: 'persona-' + Date.now().toString(),
        name: parsed.name || newNiche,
        avatar: parsed.avatar || '🎯',
        demographics: parsed.demographics || 'Not specified',
        barriers: parsed.barriers || 'Not specified',
        motivations: parsed.motivations || 'Not specified',
        habits: parsed.habits || 'Not specified',
        tone: parsed.tone || 'Not specified',
      };

      const updated = [...personas, newPerson];
      savePersonas(updated);
      handleSelectPersona(newPerson.id);
      setNewNiche('');
    } catch (err) {
      console.error(err);
      alert("Failed to parse AI outcome. Creating manual backup model instead.");
      // fallback
      const fallback: Persona = {
        id: 'persona-manual-' + Date.now().toString(),
        name: newNiche,
        avatar: '👤',
        demographics: 'Local target audience',
        barriers: 'Needs authentic local touch points.',
        motivations: 'Value, convenience, and high customer care.',
        habits: 'Researches local listings and values maps recommendations.',
        tone: 'Friendly, local, expert',
      };
      const updated = [...personas, fallback];
      savePersonas(updated);
      handleSelectPersona(fallback.id);
      setNewNiche('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="marketing-personas-wrapper" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Overview Banner */}
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
            <Brain className="w-5 h-5 text-emerald-600 shrink-0" /> Target Customer Persona Builder
          </h3>
          <p className="text-xs text-emerald-800 leading-relaxed mt-1">
            Map out psychological target markets. Selecting an active persona will dynamically inject buying motivations as context inside the AI Content Studio.
          </p>
        </div>
        
        {selectedPersona && (
          <div className="text-[10px] bg-emerald-500 border border-emerald-600 text-white font-black uppercase tracking-wider p-2 rounded-lg flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Context Synced to Studio
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Persona List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available Buyers Map</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{personas.length} profiles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personas.map((per) => {
              const active = selectedPersona === per.id;
              return (
                <div
                  id={`persona-card-${per.id}`}
                  key={per.id}
                  onClick={() => handleSelectPersona(per.id)}
                  className={`bg-white border rounded-xl overflow-hidden p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all text-left relative cursor-pointer ${
                    active ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/5' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl bg-slate-50 rounded-lg p-1.5 border border-slate-100">{per.avatar}</span>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm leading-tight">{per.name}</h5>
                          <span className="text-[9px] font-mono text-slate-400 tracking-wider font-semibold uppercase block mt-0.5">Demographics Key</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleDeletePersona(per.id, e)}
                        className="p-1 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Persona"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5 text-[11px] leading-relaxed select-text mt-3 pt-3 border-t border-slate-100 font-sans text-slate-700">
                      <div>
                        <strong className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider">Demographic Profile:</strong>
                        <p className="font-medium text-slate-800">{per.demographics}</p>
                      </div>
                      <div>
                        <strong className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider">Motivations:</strong>
                        <p>{per.motivations}</p>
                      </div>
                      <div>
                        <strong className="text-rose-500 font-semibold block text-[10px] uppercase tracking-wider">Frictions & Barriers:</strong>
                        <p>{per.barriers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400 flex items-center gap-1 font-mono uppercase">
                      Tone: <span className="text-slate-700">{per.tone.split(',')[0]}</span>
                    </span>
                    {active ? (
                      <span className="text-emerald-700 uppercase tracking-widest flex items-center gap-1 bg-emerald-100/60 px-2.5 py-1 rounded-full border border-emerald-200">
                        ● Synced
                      </span>
                    ) : (
                      <span className="text-slate-400 group-hover:text-slate-700 bg-slate-50 px-2.5 py-1 rounded-full border">
                        Inject Context
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: AI Persona Generator form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-fit">
          <form onSubmit={handleCreateAI} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">Generate psychological profile</h4>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              Enter target market criteria to discover emotional buying patterns, psychological barriers, and optimized tone parameters.
            </p>

            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Target Persona Segment</label>
              <input
                type="text"
                value={newNiche}
                onChange={e => setNewNiche(e.target.value)}
                required
                placeholder="e.g. Interior designer seeking clay accents"
                className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || !newNiche.trim()}
              className="w-full bg-slate-900 border border-slate-950 text-white hover:bg-black font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <Plus className="w-4 h-4" />}
              {isGenerating ? 'Synthesizing Profile...' : 'Spawn Persona'}
            </button>
          </form>

          {isGenerating && (
            <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-[10px] text-slate-500 leading-snug">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-slate-700 block">AI Handshake in Progress</strong>
                Computing behavioral indexes, purchasing frictions & suggested copywriting tone formulas...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
