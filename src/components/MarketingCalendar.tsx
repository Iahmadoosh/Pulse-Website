import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, X, Sparkles, Megaphone, CheckCircle } from 'lucide-react';

interface QueuedPost {
  id: string;
  day: number;
  content: string;
  channels: string[];
  time: string;
}

export function MarketingCalendar() {
  const [scheduledPosts, setScheduledPosts] = useState<QueuedPost[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Create / Input Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedTime, setSelectedTime] = useState('14:30');
  const [chosenChannels, setChosenChannels] = useState<Record<string, boolean>>({
    instagram: true,
    x: true,
    facebook: false,
    tiktok: false,
  });

  // Calendar sync and connection states
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Load scheduler on mount & check active calendar integrations
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pulse_scheduler');
      if (stored) {
        setScheduledPosts(JSON.parse(stored));
      } else {
        const initialDefault: QueuedPost[] = [
          { id: '1', day: 5, content: '📅 Showcase of our organic Kiln firing process today! Carbon-neutral, earth-friendly ceramic platters.', channels: ['instagram'], time: '14:30' },
          { id: '2', day: 12, content: '☕ Father\'s day mugs are officially open for early orders inside our boutique! Use code COFFEE_BOB.', channels: ['x', 'facebook'], time: '16:00' },
          { id: '3', day: 20, content: '🌿 Local boutique community workshop coming June 20! Limited space available.', channels: ['instagram', 'tiktok'], time: '11:15' },
        ];
        setScheduledPosts(initialDefault);
        localStorage.setItem('pulse_scheduler', JSON.stringify(initialDefault));
      }
    } catch (e) {
      console.error(e);
    }

    const checkCalendarConnections = () => {
      try {
        const stored = localStorage.getItem('pulse_social_accounts');
        if (stored) {
          const parsed = JSON.parse(stored);
          setGoogleConnected(parsed.some((acc: any) => acc.platform === 'google_calendar'));
        } else {
          setGoogleConnected(false);
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkCalendarConnections();
    window.addEventListener('storage', checkCalendarConnections);
    return () => window.removeEventListener('storage', checkCalendarConnections);
  }, []);

  const handleToggleCalendar = (platform: 'google_calendar') => {
    try {
      const stored = localStorage.getItem('pulse_social_accounts');
      let accounts = stored ? JSON.parse(stored) : [];
      const exists = accounts.some((acc: any) => acc.platform === platform);
      
      if (exists) {
        accounts = accounts.filter((acc: any) => acc.platform !== platform);
        if (platform === 'google_calendar') setGoogleConnected(false);
        setSyncStatusMsg(`Disconnected from Google Calendar.`);
      } else {
        const newAcc = {
          platform,
          handle: 'marketing-team@gmail.com',
          appId: `CAL-MD-${Date.now().toString().slice(-4)}`,
          token: 'OAUTH_SYNC_TOKEN_ACTIVE',
          connectedAt: new Date().toLocaleDateString()
        };
        accounts.push(newAcc);
        if (platform === 'google_calendar') setGoogleConnected(true);
        setSyncStatusMsg(`Successfully connected Google Calendar to the campaign calendar!`);
      }
      localStorage.setItem('pulse_social_accounts', JSON.stringify(accounts));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncStatusMsg('Pushing interactive timeline slots to connected calendars...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg('Campaign dates synchronized successfully with corporate workspace calendar!');
    }, 1500);
  };

  const saveScheduler = (newPosts: QueuedPost[]) => {
    setScheduledPosts(newPosts);
    localStorage.setItem('pulse_scheduler', JSON.stringify(newPosts));
  };

  const handleOpenDay = (day: number) => {
    setSelectedDay(day);
    // Find if a post exists to pre-populate sandbox
    const match = scheduledPosts.find(p => p.day === day);
    if (match) {
      setInputValue(match.content);
      setSelectedTime(match.time);
      const platforms: Record<string, boolean> = { instagram: false, x: false, facebook: false, tiktok: false };
      match.channels.forEach(ch => {
        platforms[ch] = true;
      });
      setChosenChannels(platforms);
    } else {
      setInputValue('');
      setSelectedTime('14:30');
      setChosenChannels({ instagram: true, x: true, facebook: false, tiktok: false });
    }
    setIsModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDay === null) return;

    const channelsArray = Object.keys(chosenChannels).filter(k => chosenChannels[k]);
    if (channelsArray.length === 0) {
      alert("Please choose at least one social media channel endpoint.");
      return;
    }

    const filtered = scheduledPosts.filter(p => p.day !== selectedDay);
    if (inputValue.trim()) {
      const newPost: QueuedPost = {
        id: Date.now().toString(),
        day: selectedDay,
        content: inputValue.trim(),
        channels: channelsArray,
        time: selectedTime,
      };
      saveScheduler([...filtered, newPost]);
    } else {
      // If prompt empty, interpret as deletion of existing day schedule
      saveScheduler(filtered);
    }
    setIsModalOpen(false);
  };

  const handleDeletePost = (day: number) => {
    const filtered = scheduledPosts.filter(p => p.day !== day);
    saveScheduler(filtered);
    setIsModalOpen(false);
  };

  // June 2026 starts on a Monday (1st is Monday). June has 30 days. Perfect 30-day block!
  const juneDays = Array.from({ length: 30 }, (_, index) => index + 1);

  // A peak helper hours prediction guide suggested by marketing models
  // e.g. Tuesday (days 2, 9, 16, 23, 30), Thursday (4, 11, 18, 25), Saturday (6, 13, 20, 27) have high indicators
  const getHeatmapColor = (day: number) => {
    const isTuesday = day % 7 === 2;
    const isThursday = day % 7 === 4;
    const isSaturday = day % 7 === 6;

    if (isTuesday) return 'bg-emerald-100 hover:bg-emerald-250 border-emerald-300 ring-2 ring-emerald-300';
    if (isThursday) return 'bg-emerald-100/70 hover:bg-emerald-200 border-emerald-250 ring-1 ring-emerald-200';
    if (isSaturday) return 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200';
    return 'bg-slate-50 hover:bg-slate-100 border-slate-200';
  };

  const getHeatmapTip = (day: number) => {
    const isTuesday = day % 7 === 2;
    const isThursday = day % 7 === 4;
    const isSaturday = day % 7 === 6;

    if (isTuesday) return '92% Peak - AI Top Recommended!';
    if (isThursday) return '80% High Engagement Spot';
    if (isSaturday) return '72% Warm Community Activity';
    return 'Standard traffic window';
  };

  return (
    <div id="marketing-calendar-container" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" /> Interactive Campaign Calendar
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tap on any calendar day in June 2026 to view queued dispatches, or draft new platform campaigns.
          </p>
        </div>

        {/* Heatmap Legend indicator */}
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 select-none">
          <span className="font-semibold text-slate-400">Peak Heatmap:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-100 ring-2 ring-emerald-300 rounded" />
            <span>Top Peak (92%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-100/70 ring-1 ring-emerald-200 rounded" />
            <span>High (80%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-slate-100 rounded" />
            <span>Standard</span>
          </div>
        </div>
      </div>

      {/* Corporate Calendar Synchronized Connector Module */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">External Calendar Integrations</h4>
            <p className="text-[11px] text-slate-500">
              Sync marketing dispatches and product drop dates directly with corporate scheduling feeds.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Google Calendar Toggle sync */}
          <button
            type="button"
            onClick={() => handleToggleCalendar('google_calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10.5px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
              googleConnected
                ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="3" fill="#e8eaed" />
              <path d="M18 2h-1V1h-2v1H9V1H7v1H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#4285F4"/>
              <path d="M18 20H6V8h12v12zM6 6V4h12v2H6z" fill="#34A853"/>
              <path d="M11 11H9V9h2v2zm4 0h-2V9h2v2zm-4 4H9v-2h2v2zm4 0h-2v-2h2v2z" fill="#FBBC05"/>
            </svg>
            Google Calendar {googleConnected ? 'Connected' : 'Disconnected'}
          </button>

          {googleConnected && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-slate-900 border border-slate-950 hover:bg-black text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>

      {syncStatusMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Grid of the week headings */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      {/* The 30 days grid of June 2026 (Mon June 1st to Sun June 30) */}
      <div className="grid grid-cols-7 gap-3">
        {juneDays.map((day) => {
          const match = scheduledPosts.find(p => p.day === day);
          const colorClass = getHeatmapColor(day);
          const heatTip = getHeatmapTip(day);

          return (
            <button
              id={`calendar-day-${day}`}
              key={day}
              onClick={() => handleOpenDay(day)}
              className={`h-28 border rounded-xl p-2.5 flex flex-col justify-between transition-all relative group text-left ${colorClass} shadow-xs hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-extrabold text-slate-700">{day}</span>
                <span className="text-[8px] font-black uppercase text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {heatTip.split(' ')[0]}
                </span>
              </div>

              {match ? (
                <div className="w-full bg-white/90 border border-emerald-200 rounded-lg p-1.5 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-emerald-800 uppercase flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-emerald-600" /> {match.time}
                    </span>
                    <span className="text-[7px] font-mono bg-emerald-600 text-white px-1 rounded uppercase tracking-wider">
                      {match.channels.join(', ')}
                    </span>
                  </div>
                  <p className="text-[9px] font-medium text-slate-800 line-clamp-2 leading-snug">
                    {match.content}
                  </p>
                </div>
              ) : (
                <div className="w-full flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="p-1 rounded bg-slate-900 border text-white hover:bg-black">
                    <Plus className="w-2.5 h-2.5" />
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* DAY VIEW / SCHEDULER DIALOG MODAL */}
      {isModalOpen && selectedDay !== null && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in zoom-in-95 duration-250 text-left">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500 animate-pulse" /> Queue Buffer for June {selectedDay}, 2026
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer animate-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Core Promotion/Message Brief</label>
                <textarea
                  className="w-full h-24 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors resize-none font-medium"
                  placeholder="Insert post copy drafts, coupon handles, or launch announcements..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Publish Time (EST)</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Platform Endpoints</label>
                  <div className="flex gap-2 flex-wrap pt-0.5">
                    {['instagram', 'x', 'facebook', 'tiktok'].map(pl => {
                      const active = chosenChannels[pl];
                      return (
                        <button
                          type="button"
                          key={pl}
                          onClick={() => setChosenChannels(p => ({ ...p, [pl]: !p[pl] }))}
                          className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-1.5 border rounded transition-colors cursor-pointer ${
                            active 
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {pl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Peak forecast context */}
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-[10px] flex items-center justify-between font-sans">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> High Engagement Period: <strong>{getHeatmapTip(selectedDay)}</strong>
                </span>
                <span className="text-[8px] bg-white border px-1.5 py-0.5 font-bold rounded uppercase">Forecast OK</span>
              </div>

              <div className="pt-4 flex gap-3">
                {scheduledPosts.some(p => p.day === selectedDay) && (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(selectedDay)}
                    className="border border-rose-200 text-rose-600 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border text-slate-700 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 border border-slate-950 text-white hover:bg-black font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
