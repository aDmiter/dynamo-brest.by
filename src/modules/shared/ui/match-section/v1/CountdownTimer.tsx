// Version 1 — таймер в стеклянных ячейках, шрифт Inter Tight
'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  compact?: boolean;
  /** large — крупные ячейки на главной (Base) */
  size?: 'default' | 'large';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft | null {
  const difference = targetDate.getTime() - Date.now();
  if (difference <= 0) return null;
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

const LABELS = ['дн', 'ч', 'м', 'с'] as const;

export default function CountdownTimer({
  targetDate,
  compact = false,
  size = 'default',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const sizeClass = size === 'large' ? ' home-match__countdown--large' : '';

  if (!timeLeft) {
    return (
      <p
        className={`home-match__countdown-soon${size === 'large' ? ' home-match__countdown-soon--large' : ''}`}
      >
        Скоро на поле
      </p>
    );
  }

  const values = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds];

  return (
    <div
      className={`home-match__countdown${compact ? ' home-match__countdown--compact' : ''}${sizeClass}`}
      role="timer"
      aria-live="polite"
    >
      {values.map((value, index) => (
        <div key={LABELS[index]} className="home-match__countdown-unit">
          <span className="home-match__countdown-value">{String(value).padStart(2, '0')}</span>
          <span className="home-match__countdown-label">{LABELS[index]}</span>
          {index < values.length - 1 && (
            <span className="home-match__countdown-sep" aria-hidden>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
