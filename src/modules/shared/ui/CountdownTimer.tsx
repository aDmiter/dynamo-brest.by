// src/modules/shared/ui/CountdownTimer.tsx - Счетчик обратного отсчета
'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const items = [
    { value: timeLeft.days, label: 'Дней' },
    { value: timeLeft.hours, label: 'Часов' },
    { value: timeLeft.minutes, label: 'Минут' },
    { value: timeLeft.seconds, label: 'Секунд' },
  ];

  return (
    <div className="flex items-center justify-center gap-0">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          <div className="text-center">
            <p
              className="text-5xl text-white md:text-6xl"
              style={{ fontFamily: "'Jersey 10 Charted', monospace" }}
            >
              {String(item.value).padStart(2, '0')}
            </p>
          </div>
          {index < items.length - 1 && (
            <div className="mx-2 flex items-center md:mx-4">
              <span
                className="text-[8px] uppercase tracking-wider text-white/30"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                {item.label}
              </span>
            </div>
          )}
        </div>
      ))}
      <div className="ml-2 flex items-center md:ml-4">
        <span
          className="text-[8px] uppercase tracking-wider text-white/30"
          style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
        >
          {items[items.length - 1].label}
        </span>
      </div>
    </div>
  );
}
