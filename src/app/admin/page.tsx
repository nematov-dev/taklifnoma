'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { DEFAULT_SETTINGS, InvitationSettings } from '@/config/invitationConfig';
import InvitationCard from '@/components/InvitationCard';
import { 
  Save,
  Eye, 
  LogOut, 
  Plus, 
  Trash2, 
  Settings, 
  Heart, 
  Lock, 
  ExternalLink,
  Clipboard,
  CheckCircle,
  Database
} from 'lucide-react';

interface RsvpResponse {
  id: string;
  invite_id: string;
  location: string;
  date_time: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);

  // Invitation configurations
  const [inviteId, setInviteId] = useState('default');
  const [settings, setSettings] = useState<InvitationSettings>(DEFAULT_SETTINGS);
  
  // Custom new invite ID creation
  const [newInviteId, setNewInviteId] = useState('');
  
  // RSVP responses list
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'editor' | 'responses'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copied, setCopied] = useState(false);

  // New item inputs
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newNoText, setNewNoText] = useState('');

  // Check if Supabase is active
  useEffect(() => {
    setIsSupabaseActive(!!supabase);
    // If Supabase is active, check active session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
        }
      });
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Fetch settings & RSVPs on inviteId change
  useEffect(() => {
    if (isAuthenticated) {
      loadInviteData();
    }
  }, [isAuthenticated, inviteId]);

  const loadInviteData = async () => {
    try {
      // 1. Fetch settings
      const settingsRes = await fetch(`/api/invite?id=${inviteId}`);
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings);
      }
      
      // 2. Fetch RSVPs
      const rsvpRes = await fetch(`/api/rsvp?inviteId=${inviteId}`);
      if (rsvpRes.ok) {
        const data = await rsvpRes.json();
        setRsvps(data.responses || []);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isSupabaseActive && supabase) {
      // Real auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setIsAuthenticated(true);
      }
    } else {
      // Fallback Dev Auth
      if (password === 'admin') {
        setIsAuthenticated(true);
      } else {
        setAuthError('Noto‘g‘ri parol. Dev rejimida parol "admin" deb kiritilishi kerak.');
      }
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseActive && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setPassword('');
    setEmail('');
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: inviteId,
          settings,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      const savedSource = data.source || 'server';
      if (savedSource === 'database') {
        setMessage({ text: 'O‘zgarishlar ma‘lumotlar bazasida (Supabase) muvaffaqiyatli saqlandi! 🎉', type: 'success' });
      } else {
        setMessage({ text: 'O‘zgarishlar loyiha serverida muvaffaqiyatli saqlandi! 💾', type: 'success' });
      }

      loadInviteData();
    } catch (err: any) {
      setMessage({ text: `Xatolik yuz berdi: ${err.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const createNewInvite = () => {
    const formattedId = newInviteId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!formattedId) return;
    
    setInviteId(formattedId);
    setSettings(DEFAULT_SETTINGS);
    setNewInviteId('');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${inviteId === 'default' ? '/' : `/invite/${inviteId}`}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // List manipulation helpers
  const removeLocation = (index: number) => {
    const updated = settings.locations.filter((_, i) => i !== index);
    setSettings({ ...settings, locations: updated });
  };

  const addLocation = () => {
    if (!newLocation.trim()) return;
    setSettings({
      ...settings,
      locations: [...settings.locations, newLocation.trim()]
    });
    setNewLocation('');
  };

  const removeDate = (index: number) => {
    const updated = settings.dates.filter((_, i) => i !== index);
    setSettings({ ...settings, dates: updated });
  };

  const addDate = () => {
    if (!newDate.trim()) return;
    setSettings({
      ...settings,
      dates: [...settings.dates, newDate.trim()]
    });
    setNewDate('');
  };

  const removeNoText = (index: number) => {
    const updated = (settings.noButtonTexts || []).filter((_, i) => i !== index);
    setSettings({ ...settings, noButtonTexts: updated });
  };

  const addNoText = () => {
    if (!newNoText.trim()) return;
    const currentTexts = settings.noButtonTexts || [];
    setSettings({
      ...settings,
      noButtonTexts: [...currentTexts, newNoText.trim()]
    });
    setNewNoText('');
  };

  const handleDeleteRsvp = async (id: string) => {
    if (!confirm("Haqiqatan ham ushbu javobni o‘chirmoqchimisiz?")) return;
    
    try {
      const response = await fetch(`/api/rsvp?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Javobni o‘chirib bo‘lmadi');
      }

      loadInviteData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#fbf9f6] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-stone-100 shadow-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 mb-3">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Admin panelga kirish</h1>
            <p className="text-sm text-stone-500 mt-1">Taklifnoma matnlari va sozlamalarini tahrirlash</p>
          </div>

          {!isSupabaseActive && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-4 mb-5 flex items-start gap-2.5">
              <Settings size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Supabase sozlanmagan</p>
                <p className="mt-1 font-light opacity-90">Local Dev rejimi faol. Kirish uchun parol maydoniga <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">admin</code> deb yozing.</p>
              </div>
            </div>
          )}

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 mb-5 font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {isSupabaseActive && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-600">Email manzili</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@taklifnoma.uz"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-600">
                {isSupabaseActive ? 'Parol' : 'Dev parol'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-semibold transition-all mt-2 shadow-md hover:shadow-lg"
            >
              Kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
      {/* Header bar */}
      <header className="bg-white border-b border-stone-150 py-4 px-6 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white">
            <Heart size={16} fill="white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-850">Taklifnoma Admin</h1>
            <p className="text-[10px] text-stone-400 font-medium">Boshqaruv paneli</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'editor' ? 'bg-white text-stone-850 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
            >
              Tahrirlovchi
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'responses' ? 'bg-white text-stone-850 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
            >
              Javoblar ({rsvps.length})
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-stone-500 hover:text-red-600 transition-colors text-xs font-semibold px-2 py-1"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </header>

      {/* Main dashboard content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1400px] w-full mx-auto">
        
        {/* LEFT COLUMN: Controls & Editor */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-73px)] border-r border-stone-150">
          
          {/* Card Config Switcher */}
          <div className="bg-white rounded-2xl p-5 border border-stone-150 shadow-sm mb-6 flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-stone-400">Taklifnomani tanlash</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-stone-550 mb-1 block">Taklifnoma ID</label>
                <select
                  value={inviteId}
                  onChange={(e) => setInviteId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                >
                  <option value="default">default (Bosh sahifa /)</option>
                  <option value="sevinch">sevinch</option>
                  <option value="laylo">laylo</option>
                  {inviteId !== 'default' && inviteId !== 'sevinch' && inviteId !== 'laylo' && (
                    <option value={inviteId}>{inviteId}</option>
                  )}
                </select>
              </div>

              <div className="flex-1 border-t sm:border-t-0 sm:border-l border-stone-100 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-end">
                <label className="text-[10px] uppercase font-bold text-stone-550 mb-1 block">Yangi ID qo‘shish</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInviteId}
                    onChange={(e) => setNewInviteId(e.target.value)}
                    placeholder="masalan: laylo"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                  <button
                    onClick={createNewInvite}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 p-2.5 rounded-xl transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* URL Display */}
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-150 flex items-center justify-between gap-3 text-xs mt-1">
              <div className="truncate text-stone-600 font-mono">
                {typeof window !== 'undefined' && `${window.location.origin}${inviteId === 'default' ? '/' : `/invite/${inviteId}`}`}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 hover:bg-white border border-transparent hover:border-stone-200 rounded-lg text-stone-500 hover:text-stone-800 transition-all flex items-center gap-1"
                >
                  {copied ? <CheckCircle size={14} className="text-green-600" /> : <Clipboard size={14} />}
                  <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
                </button>
                <a
                  href={inviteId === 'default' ? '/' : `/invite/${inviteId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:bg-white border border-transparent hover:border-stone-200 rounded-lg text-stone-500 hover:text-stone-800 transition-all flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  <span>Ko‘rish</span>
                </a>
              </div>
            </div>
          </div>

          {activeTab === 'editor' ? (
            <div className="space-y-6">
              
              {/* Form card 1: Text contents */}
              <div className="bg-white rounded-2xl p-6 border border-stone-150 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-2">
                  <Settings size={18} className="text-pink-600" />
                  <h2 className="text-sm font-bold text-stone-850">Taklifnoma Matnlari</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">Yuqori yorliq (Label)</label>
                    <input
                      type="text"
                      value={settings.invitationLabel}
                      onChange={(e) => setSettings({ ...settings, invitationLabel: e.target.value })}
                      className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">Ism (Cursive sarlavha)</label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">Yuboruvchi ismi (Signature)</label>
                    <input
                      type="text"
                      value={settings.senderName || ''}
                      onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                      className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-600">Iqtibos matni (Quote Card)</label>
                  <textarea
                    rows={3}
                    value={settings.quote}
                    onChange={(e) => setSettings({ ...settings, quote: e.target.value })}
                    className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-600">Asosiy savol</label>
                  <input
                    type="text"
                    value={settings.question}
                    onChange={(e) => setSettings({ ...settings, question: e.target.value })}
                    className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">"Ha" tugmasi matni</label>
                    <input
                      type="text"
                      value={settings.yesButton}
                      onChange={(e) => setSettings({ ...settings, yesButton: e.target.value })}
                      className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">"Yo‘q" tugmasi matni</label>
                    <input
                      type="text"
                      value={settings.noButton}
                      onChange={(e) => setSettings({ ...settings, noButton: e.target.value })}
                      className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Playful tooltips for runaway button */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-stone-100">
                  <label className="text-xs font-semibold text-stone-600">"Yo‘q" qochganida chiqadigan savollar/yozuvlar (Tooltips)</label>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {(settings.noButtonTexts || []).map((txt, index) => (
                      <div key={txt + index} className="flex items-center gap-1 bg-stone-50 border border-stone-200 text-stone-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        <span>{txt}</span>
                        <button 
                          onClick={() => removeNoText(index)} 
                          className="text-stone-400 hover:text-red-600 focus:outline-none ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoText}
                      onChange={(e) => setNewNoText(e.target.value)}
                      placeholder="Yangi gap qo‘shish (masalan: Iltimos 🥺)"
                      className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                    <button
                      onClick={addNoText}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Qo‘shish
                    </button>
                  </div>
                </div>
              </div>

              {/* Form card 2: Preference Options flow */}
              <div className="bg-white rounded-2xl p-6 border border-stone-150 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-2">
                  <Heart size={18} className="text-pink-600" />
                  <h2 className="text-sm font-bold text-stone-850">RSVP Tanlovlari</h2>
                </div>

                {/* Location selector configs */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">Joy savoli</label>
                    <input
                      type="text"
                      value={settings.locationQuestion}
                      onChange={(e) => setSettings({ ...settings, locationQuestion: e.target.value })}
                      className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-600">Variantlar ro‘yxati (Joylar)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {settings.locations.map((loc, index) => (
                        <div key={loc + index} className="flex items-center gap-1 bg-pink-50 border border-pink-100 text-pink-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          <span>{loc}</span>
                          <button onClick={() => removeLocation(index)} className="text-pink-500 hover:text-pink-800 focus:outline-none ml-1">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="Yangi variant qo‘shish (masalan: ☕ Kafe)"
                        className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      />
                      <button
                        onClick={addLocation}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Qo‘shish
                      </button>
                    </div>
                  </div>
                </div>

                {/* Date selector configs */}
                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">Vaqt savoli</label>
                    <input
                      type="text"
                      value={settings.dateQuestion}
                      onChange={(e) => setSettings({ ...settings, dateQuestion: e.target.value })}
                      className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-600">Variantlar ro‘yxati (Vaqtlar)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {settings.dates.map((dateStr, index) => (
                        <div key={dateStr + index} className="flex items-center gap-1 bg-pink-50 border border-pink-100 text-pink-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          <span>{dateStr}</span>
                          <button onClick={() => removeDate(index)} className="text-pink-500 hover:text-pink-800 focus:outline-none ml-1">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        placeholder="Yangi variant qo‘shish (masalan: Shanba, 18:00)"
                        className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      />
                      <button
                        onClick={addDate}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Qo‘shish
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit button text */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-stone-100">
                  <label className="text-xs font-semibold text-stone-600">Yuborish tugmasi matni</label>
                  <input
                    type="text"
                    value={settings.submitButton}
                    onChange={(e) => setSettings({ ...settings, submitButton: e.target.value })}
                    className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form card 3: Success Screen configs */}
              <div className="bg-white rounded-2xl p-6 border border-stone-150 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-2">
                  <CheckCircle size={18} className="text-pink-600" />
                  <h2 className="text-sm font-bold text-stone-850">Muvaffaqiyat Sahifasi</h2>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-600">Muvaffaqiyat sarlavhasi (Success Title)</label>
                  <input
                    type="text"
                    value={settings.successTitle}
                    onChange={(e) => setSettings({ ...settings, successTitle: e.target.value })}
                    className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-600">Muvaffaqiyat xabari (Success Message)</label>
                  <textarea
                    rows={2}
                    value={settings.successMessage}
                    onChange={(e) => setSettings({ ...settings, successMessage: e.target.value })}
                    className="px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Form card 4: Styles config */}
              <div className="bg-white rounded-2xl p-6 border border-stone-150 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-2">
                  <Database size={18} className="text-pink-600" />
                  <h2 className="text-sm font-bold text-stone-850">Dizayn va Ranglar Sozlamalari</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">Asosiy urg‘u rangi (Accent Color)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="w-10 h-9 rounded-xl border border-stone-200 cursor-pointer p-0 overflow-hidden shrink-0"
                      />
                      <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">Fon rangi (Background Color)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.bgColor}
                        onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                        className="w-10 h-9 rounded-xl border border-stone-200 cursor-pointer p-0 overflow-hidden shrink-0"
                      />
                      <input
                        type="text"
                        value={settings.bgColor}
                        onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                        className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">Shrift oilasi (Font Family)</label>
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value as any })}
                      className="px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    >
                      <option value="Playfair Display">Playfair Display (Premium Serif)</option>
                      <option value="Cormorant Garamond">Cormorant Garamond (Elegant Serif)</option>
                      <option value="Great Vibes">Great Vibes (Romantic Script)</option>
                      <option value="Allura">Allura (Slanted Romantic Script)</option>
                      <option value="Inter">Inter (Clean Sans-serif)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600">Tugma dizayni (Button Style)</label>
                    <select
                      value={settings.buttonStyle}
                      onChange={(e) => setSettings({ ...settings, buttonStyle: e.target.value as any })}
                      className="px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    >
                      <option value="rounded-full">Dumaloq (Rounded Full)</option>
                      <option value="rounded-lg">Yarim-burchak (Rounded Large)</option>
                      <option value="rounded-none">O‘tkir burchak (Flat/Sharp)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Message Banner */}
              {message && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  {message.text}
                </div>
              )}

              {/* Sticky action bar */}
              <div className="sticky bottom-4 z-20 flex gap-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex-1 py-3 px-6 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  <span>{isSaving ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}</span>
                </button>
              </div>

            </div>
          ) : (
            /* RSVP Responses tab */
            <div className="bg-white rounded-2xl p-6 border border-stone-150 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-pink-600 fill-pink-50" />
                  <h2 className="text-sm font-bold text-stone-850">Mijozlar RSVP Javoblari ({rsvps.length})</h2>
                </div>
                <button 
                  onClick={loadInviteData} 
                  className="text-xs font-semibold text-pink-600 hover:text-pink-850 px-2 py-1 rounded-lg border border-pink-100 hover:bg-pink-50 transition-all"
                >
                  Yangilash
                </button>
              </div>

              {rsvps.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <Heart size={40} className="mx-auto text-stone-200 mb-3" />
                  <p className="text-sm">Hozircha javoblar yo‘q.</p>
                  <p className="text-xs mt-1 font-light">Kimdir taklifnomangizni qabul qilsa, bu yerda aks etadi.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-150 text-stone-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Joy (Qayerga)</th>
                        <th className="py-3 px-2">Vaqt (Qachon)</th>
                        <th className="py-3 px-2">Kutib olingan vaqt</th>
                        <th className="py-3 px-2 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {rsvps.map((rsvp) => (
                        <tr key={rsvp.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3.5 px-2 font-medium text-stone-800">{rsvp.location}</td>
                          <td className="py-3.5 px-2 font-medium text-stone-800">{rsvp.date_time}</td>
                          <td className="py-3.5 px-2 text-stone-500 font-mono">
                            {new Date(rsvp.created_at).toLocaleString('uz-UZ', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <button
                              onClick={() => handleDeleteRsvp(rsvp.id)}
                              className="p-1 text-stone-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              title="Javobni o‘chirish"
                            >
                              <Trash2 size={15} className="hover:text-red-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Live Interactive Preview */}
        <div className="w-full lg:w-[480px] bg-stone-100 p-6 flex flex-col justify-between items-center max-h-[calc(100vh-73px)] overflow-y-auto">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider font-bold text-stone-400 flex items-center gap-1.5">
              <Eye size={14} />
              <span>Jonli ko‘rinish (Live Preview)</span>
            </span>
            <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              Interaktiv
            </span>
          </div>

          {/* Device Mockup Wrapper */}
          <div className="w-full max-w-[390px] aspect-[9/19] rounded-[48px] border-[12px] border-stone-800 shadow-2xl overflow-hidden relative bg-[#fffcf9] my-auto">
            {/* Speaker & camera notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-stone-800 z-50 rounded-b-3xl flex justify-center items-center">
              <div className="w-16 h-3 bg-stone-900 rounded-full"></div>
            </div>
            
            {/* App container inside device frame */}
            <div className="w-full h-full overflow-y-auto overflow-x-hidden pt-6 bg-inherit">
              <InvitationCard 
                settings={settings} 
                inviteId={inviteId} 
                isPreview={true} 
              />
            </div>
          </div>

          <p className="text-[10px] text-stone-400 mt-4 text-center max-w-xs font-light">
            Eslatma: Jonli ko‘rinish sizning sozlamalaringizni darhol aks ettiradi. "Saqlash" tugmasini bosganingizdan so‘ng o‘zgarishlar faol bo‘ladi.
          </p>
        </div>

      </div>
    </div>
  );
}
