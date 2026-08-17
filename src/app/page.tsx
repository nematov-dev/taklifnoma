'use client';

import React, { useState, useEffect } from 'react';
import InvitationCard from '@/components/InvitationCard';
import { DEFAULT_SETTINGS, InvitationSettings } from '@/config/invitationConfig';

export default function Home() {
  const [settings, setSettings] = useState<InvitationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/invite?id=default');
        if (!response.ok) throw new Error('Failed to load settings');
        const data = await response.json();
        setSettings(data.settings);
      } catch (err) {
        console.error(err);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#fffcf9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          <p className="text-stone-400 text-sm font-medium tracking-wide">Taklifnoma ochilmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <InvitationCard 
      settings={settings || DEFAULT_SETTINGS} 
      inviteId="default" 
    />
  );
}
