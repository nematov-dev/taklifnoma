'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Heart, Sparkles, Send } from 'lucide-react';
import SuccessScreen from './SuccessScreen';
import { InvitationSettings } from '@/config/invitationConfig';

interface InvitationCardProps {
  settings: InvitationSettings;
  inviteId: string;
  isPreview?: boolean;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  settings,
  inviteId,
  isPreview = false,
}) => {
  const [step, setStep] = useState<'invite' | 'details' | 'success'>('invite');
  
  // Selection states
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Runaway "Yo'q" button states
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);
  const [noTooltip, setNoTooltip] = useState('');
  const [noParticles, setNoParticles] = useState<{ id: number; x: number; y: number; emoji: string; scale: number; angle: number }[]>([]);
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Background floating hearts
  const [risingHearts, setRisingHearts] = useState<{ id: number; left: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate a set of rising hearts
    const hearts = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      size: Math.random() * 16 + 12, // 12px to 28px
      delay: Math.random() * 6,
      duration: Math.random() * 6 + 6, // 6s to 12s
    }));
    setRisingHearts(hearts);
  }, []);

  const getFontFamilyClass = (font: string) => {
    switch (font) {
      case 'Cormorant Garamond': return 'font-cormorant italic';
      case 'Playfair Display': return 'font-playfair';
      case 'Great Vibes': return 'font-great-vibes';
      case 'Allura': return 'font-allura';
      case 'Inter': return 'font-inter';
      default: return 'font-playfair';
    }
  };

  const getTitleFontFamilyClass = (font: string) => {
    switch (font) {
      case 'Great Vibes': return 'font-great-vibes text-5xl md:text-6xl font-normal';
      case 'Allura': return 'font-allura text-5xl md:text-6xl font-normal';
      case 'Cormorant Garamond': return 'font-cormorant text-4xl md:text-5xl font-semibold italic';
      case 'Playfair Display': return 'font-playfair text-4xl md:text-5xl font-bold';
      case 'Inter': return 'font-inter text-3xl md:text-4xl font-bold tracking-tight';
      default: return 'font-great-vibes text-5xl md:text-6xl font-normal';
    }
  };

  const getQuestionFontFamilyClass = (font: string) => {
    switch (font) {
      case 'Great Vibes': return 'font-great-vibes text-3xl md:text-4xl font-normal';
      case 'Allura': return 'font-allura text-3.5xl md:text-4.5xl font-normal';
      case 'Cormorant Garamond': return 'font-cormorant text-2xl md:text-3xl font-medium italic';
      case 'Playfair Display': return 'font-playfair text-xl md:text-2xl font-semibold italic';
      case 'Inter': return 'font-inter text-lg font-medium';
      default: return 'font-cormorant text-2xl md:text-3xl font-medium italic';
    }
  };

  const cursiveTitleClass = getTitleFontFamilyClass(settings.fontFamily);
  const cursiveQuestionClass = getQuestionFontFamilyClass(settings.fontFamily);
  const cursiveSignatureClass = getFontFamilyClass(settings.fontFamily);

  const getButtonStyle = () => {
    switch (settings.buttonStyle) {
      case 'rounded-full': return 'rounded-full';
      case 'rounded-lg': return 'rounded-2xl';
      case 'rounded-none': return 'rounded-none';
      default: return 'rounded-full';
    }
  };

  const handleNoButtonAction = () => {
    const dialogTexts = settings.noButtonTexts && settings.noButtonTexts.length > 0
      ? settings.noButtonTexts
      : [
          "Yana bir o‘ylab ko‘ring 🥺",
          "Atigi 1 soat vaqtingizni olaman ☕",
          "Ha ni bosa qolaylik 💕",
          "Rostdanmi? 💔",
          "Keling, 'Ha 💕' tugmasini bosaylik! 🥰"
        ];

    // Spawn particles near the button before it jumps
    const newParticles = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: noOffset.x + (Math.random() - 0.5) * 45,
      y: noOffset.y + (Math.random() - 0.5) * 20,
      emoji: dialogTexts[Math.floor(Math.random() * dialogTexts.length)],
      scale: Math.random() * 0.4 + 0.8,
      angle: (Math.random() - 0.5) * 45,
    }));
    setNoParticles(prev => [...prev, ...newParticles].slice(-25));

    // Runaway effect within boundaries
    const rangeX = window.innerWidth > 500 ? 120 : 80;
    const rangeY = window.innerHeight > 800 ? 80 : 50;
    
    let newX = (Math.random() - 0.5) * rangeX * 2;
    let newY = (Math.random() - 0.5) * rangeY * 2;
    
    // Minimum move distance to make sure it jumps noticeably
    if (Math.abs(newX) < 40) newX = newX > 0 ? 55 : -55;
    if (Math.abs(newY) < 30) newY = newY > 0 ? 45 : -45;

    setNoOffset({ x: newX, y: newY });
    const nextCount = noCount + 1;
    setNoCount(nextCount);

    // Dynamic funny text (cycle or stay at last item)
    const textIndex = Math.min(nextCount - 1, dialogTexts.length - 1);
    setNoTooltip(dialogTexts[textIndex] || "Iltimos 🥺");
  };

  const handleYes = () => {
    setStep('details');
  };

  const handleSubmitRsvp = async () => {
    if (!selectedLocation || !selectedDate) {
      setError("Iltimos, ikkala variantni ham tanlang.");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);

    // Save to local storage first as local fallback
    try {
      const existingStr = localStorage.getItem('invitation_responses');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const newResponse = {
        id: 'local_' + Math.random().toString(36).substring(2, 9),
        invite_id: inviteId,
        location: selectedLocation,
        date_time: selectedDate,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('invitation_responses', JSON.stringify([newResponse, ...existing]));
    } catch (e) {
      console.error("Failed to save RSVP to local storage", e);
    }

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteId,
          location: selectedLocation,
          dateTime: selectedDate,
        }),
      });

      if (!response.ok) {
        throw new Error('RSVP server request failed');
      }

      setStep('success');
    } catch (err) {
      console.error("Database RSVP submission failed, using local storage fallback:", err);
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-pink-100 select-none"
      style={{ backgroundColor: settings.bgColor }}
    >
      {/* Floating rising hearts background */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        {risingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute text-pink-400 pointer-events-none"
            style={{
              left: `${heart.left}%`,
              bottom: '-50px',
              fontSize: `${heart.size}px`,
            }}
            animate={{
              y: [0, -1000],
              x: [0, Math.sin(heart.id) * 35, 0],
              rotate: [0, 360],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ♥
          </motion.div>
        ))}
      </div>

      {/* Main card container */}
      <div className="w-full max-w-[430px] relative z-10">
        <div 
          className="bg-white/85 backdrop-blur-lg rounded-[32px] px-6 py-10 border border-white/60 shadow-[0_24px_50px_-15px_rgba(219,39,119,0.12)] relative flex flex-col"
        >
          {/* Sparkles decoration */}
          <div className="absolute top-6 right-6 text-pink-300 pointer-events-none animate-pulse">
            <Sparkles size={18} />
          </div>
          
          <AnimatePresence mode="wait">
            {step === 'invite' && (
              <motion.div
                key="invite"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                {/* Envelope Icon with pink-magenta gradient & shadow */}
                <div className="relative mb-6">
                  <div 
                    className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
                    style={{ backgroundColor: settings.accentColor }}
                  ></div>
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center relative z-10 text-white shadow-lg transition-transform hover:scale-105"
                    style={{ 
                      background: `linear-gradient(135deg, ${settings.accentColor}, #d946ef)` 
                    }}
                  >
                    <Mail size={22} className="stroke-[1.5]" />
                  </div>
                </div>

                {/* Subtitle */}
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-400/90 mb-3">
                  — {settings.invitationLabel} —
                </span>

                {/* Name heading */}
                <h1 
                  className={`mb-4 select-text leading-normal tracking-wide py-1 ${cursiveTitleClass}`}
                  style={{ color: settings.accentColor }}
                >
                  {settings.name}
                </h1>

                {/* Heart line separator */}
                <div className="flex items-center w-full max-w-[120px] justify-between mb-8">
                  <div className="h-[0.5px] bg-stone-200/90 w-10"></div>
                  <Heart className="w-3 h-3 fill-current animate-pulse" style={{ color: settings.accentColor }} />
                  <div className="h-[0.5px] bg-stone-200/90 w-10"></div>
                </div>

                {/* Quote card */}
                <div 
                  className="relative rounded-2xl px-6 py-7 mb-8 italic text-stone-600 font-light leading-relaxed text-sm shadow-sm w-full border"
                  style={{ 
                    backgroundColor: `${settings.accentColor}08`, 
                    borderColor: `${settings.accentColor}12`
                  }}
                >
                  {/* Styled quotation marks */}
                  <span className="absolute top-2 left-3 text-4xl font-serif text-pink-300/60 pointer-events-none select-none">“</span>
                  <p className="px-3 font-sans not-italic text-stone-600/90 tracking-wide">
                    {settings.quote}
                  </p>
                </div>

                {/* Main Question (in cursive / italic script) */}
                <p 
                  className={`mb-8 font-medium leading-relaxed max-w-xs px-2 ${cursiveQuestionClass}`}
                  style={{ color: settings.accentColor }}
                >
                  {settings.question}
                </p>

                {/* Buttons wrapper */}
                <div className="w-full flex items-center justify-center gap-4 min-h-[60px] relative">
                  
                  {/* Floating speech bubble from No button runaway */}
                  <AnimatePresence>
                    {noTooltip && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -top-12 right-2 text-xs font-semibold px-4 py-2 rounded-2xl shadow-md border flex items-center gap-1.5 z-20"
                        style={{ 
                          borderColor: `${settings.accentColor}20`, 
                          backgroundColor: 'white', 
                          color: settings.accentColor,
                          boxShadow: '0 8px 24px -6px rgba(219, 39, 119, 0.15)'
                        }}
                      >
                        <span>{noTooltip}</span>
                        <span className="absolute bottom-[-6px] right-8 w-3 h-3 bg-white border-r border-b rotate-45" style={{ borderColor: `transparent ${settings.accentColor}20 ${settings.accentColor}20 transparent` }}></span>
                      </motion.div>
                    )}

                    {/* Runaway Floating Particles Burst */}
                    {noParticles.map((p) => (
                      <motion.div
                        key={p.id}
                        className="absolute text-xs font-semibold select-none pointer-events-none z-30 bg-white/95 px-2.5 py-1 rounded-full border shadow-md flex items-center justify-center whitespace-nowrap"
                        style={{
                          left: `calc(50% + ${p.x}px)`,
                          top: `calc(50% + ${p.y}px)`,
                          borderColor: `${settings.accentColor}20`,
                          color: settings.accentColor,
                          boxShadow: '0 4px 12px -3px rgba(219, 39, 119, 0.1)'
                        }}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{
                          y: -120, // drift up
                          x: p.x + (Math.random() - 0.5) * 50,
                          opacity: 0,
                          scale: p.scale,
                          rotate: p.angle,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.4, ease: "easeOut" }}
                      >
                        {p.emoji}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Pulsing Yes button */}
                  <motion.button
                    onClick={handleYes}
                    animate={{ scale: [1, 1.04, 1, 1.04, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-3 px-6 text-white font-medium shadow-md hover:shadow-lg transition-shadow text-sm flex items-center justify-center gap-2 cursor-pointer ${getButtonStyle()}`}
                    style={{ 
                      background: `linear-gradient(135deg, ${settings.accentColor}, #d946ef)`
                    }}
                  >
                    {settings.yesButton}
                  </motion.button>

                  {/* Runaway No button */}
                  <motion.button
                    animate={noOffset}
                    onMouseEnter={handleNoButtonAction}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleNoButtonAction();
                    }}
                    onClick={handleNoButtonAction}
                    className={`flex-1 py-3 px-6 border border-stone-200 bg-white text-stone-500 font-medium hover:bg-stone-50 transition-shadow text-sm cursor-pointer ${getButtonStyle()}`}
                  >
                    {settings.noButton}
                  </motion.button>
                </div>

                {/* Sender Name */}
                <span 
                  className={`mt-8 text-sm opacity-80 ${cursiveSignatureClass}`}
                  style={{ color: settings.accentColor }}
                >
                  — {settings.senderName}
                </span>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col text-center items-center"
              >
                <div className="flex justify-center mb-5 text-pink-400">
                  <Heart className="w-9 h-9 fill-current animate-pulse" style={{ color: settings.accentColor }} />
                </div>

                {/* Location question (cursive) */}
                <h2 
                  className={`mb-5 px-2 ${cursiveQuestionClass}`}
                  style={{ color: settings.accentColor }}
                >
                  {settings.locationQuestion}
                </h2>

                {/* Location Choices (Horizontal inline pills) */}
                <div className="flex flex-wrap justify-center gap-2.5 mb-7 w-full">
                  {settings.locations.map((loc) => {
                    const isSelected = selectedLocation === loc;
                    return (
                      <button
                        key={loc}
                        onClick={() => setSelectedLocation(loc)}
                        className={`py-2 px-4 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                          isSelected 
                            ? 'text-white border-transparent' 
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                        style={{
                          backgroundColor: isSelected ? settings.accentColor : undefined,
                        }}
                      >
                        <span>{loc}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Date question (cursive) */}
                <h2 
                  className={`mb-5 px-2 ${cursiveQuestionClass}`}
                  style={{ color: settings.accentColor }}
                >
                  {settings.dateQuestion}
                </h2>

                {/* Date Choices (Horizontal inline pills) */}
                <div className="flex flex-wrap justify-center gap-2.5 mb-7 w-full">
                  {settings.dates.map((dateStr) => {
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`py-2 px-4 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                          isSelected 
                            ? 'text-white border-transparent' 
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                        style={{
                          backgroundColor: isSelected ? settings.accentColor : undefined,
                        }}
                      >
                        <span>{dateStr}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-medium mb-4">
                    {error}
                  </p>
                )}

                {/* Submit button (gradient & heartbeat) */}
                <motion.button
                  disabled={isSubmitting}
                  onClick={handleSubmitRsvp}
                  animate={{ scale: [1, 1.03, 1, 1.03, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3.5 px-6 font-medium text-white shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer ${getButtonStyle()}`}
                  style={{ 
                    background: `linear-gradient(135deg, ${settings.accentColor}, #d946ef)`
                  }}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Yuborilmoqda...' : settings.submitButton}</span>
                </motion.button>
                
                <button
                  onClick={() => setStep('invite')}
                  className="mt-4 text-xs font-light text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                >
                  Orqaga qaytish
                </button>

                {/* Sender Name */}
                <span 
                  className={`mt-6 text-sm opacity-80 ${cursiveSignatureClass}`}
                  style={{ color: settings.accentColor }}
                >
                  — {settings.senderName}
                </span>
              </motion.div>
            )}

            {step === 'success' && (
              <SuccessScreen
                title={settings.successTitle}
                message={settings.successMessage}
                accentColor={settings.accentColor}
                fontFamilyClass={cursiveSignatureClass}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
export default InvitationCard;
