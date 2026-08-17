'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface SuccessScreenProps {
  title: string;
  message: string;
  accentColor: string;
  fontFamilyClass: string;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title,
  message,
  accentColor,
  fontFamilyClass,
}) => {
  useEffect(() => {
    // Elegant heart/confetti explosion
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [accentColor, '#f472b6', '#fb7185'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [accentColor, '#f472b6', '#fb7185'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [accentColor]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center text-center p-6 min-h-[400px]"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 animate-bounce"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      </motion.div>

      <h2
        className={`text-3xl md:text-4xl font-semibold mb-4 leading-snug ${fontFamilyClass}`}
        style={{ color: accentColor }}
      >
        {title}
      </h2>

      <p className="text-stone-600 text-lg max-w-sm font-light leading-relaxed">
        {message}
      </p>
    </motion.div>
  );
};
export default SuccessScreen;
