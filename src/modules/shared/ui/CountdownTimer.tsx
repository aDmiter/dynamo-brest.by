// src/modules/shared/ui/CountdownTimer.tsx - Таймер обратного отсчёта до матча
'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft | null {
  const difference = targetDate.getTime() - new Date().getTime();
  if (difference <= 0) return null;
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(targetDate));
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted || !timeLeft) {
    return (
      <div className="text-center">
        <span className="text-lg text-gray-400">Скоро</span>
      </div>
    );
  }

  const items = [
    { value: timeLeft.days, label: 'Дней' },
    { value: timeLeft.hours, label: 'Часов' },
    { value: timeLeft.minutes, label: 'Минут' },
    { value: timeLeft.seconds, label: 'Секунд' },
  ];

  return (
    <div className="flex items-center gap-3 md:gap-5">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-3 md:gap-5">
          <div className="text-center">
            <div
              style={{
                fontFamily: "'Jersey 10 Charted', monospace",
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 400,
                color: 'var(--color-accent)',
                lineHeight: 1,
                letterSpacing: '0.02em',
              }}
            >
              {String(item.value).padStart(2, '0')}
            </div>
            <div
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 9,
                fontWeight: 600,
                color: 'var(--color-text-label)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: 4,
              }}
            >
              {item.label}
            </div>
          </div>
          {index < items.length - 1 && (
            <div
              style={{
                width: 1,
                height: 24,
                background: 'linear-gradient(to bottom, var(--color-accent-30), transparent)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
