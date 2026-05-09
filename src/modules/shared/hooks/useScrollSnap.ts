// src/modules/shared/hooks/useScrollSnap.ts - Автоматическая прокрутка между модулями
'use client';

import { useEffect, useRef } from 'react';

export function useScrollSnap() {
  const isScrolling = useRef(false);

  useEffect(() => {
    // Только на десктопах
    if (window.innerWidth < 1024) return;

    // Ищем все sections + footer
    const getSections = () => {
      const sections = document.querySelectorAll('section');
      const footer = document.querySelector('footer');
      const elements = Array.from(sections);
      if (footer) elements.push(footer);
      return elements;
    };

    const sections = getSections();
    if (sections.length === 0) return;

    const handleWheel = (e: WheelEvent) => {
      // Только скролл вниз
      if (e.deltaY <= 0) return;

      e.preventDefault();

      if (isScrolling.current) return;
      isScrolling.current = true;

      // Находим текущую секцию
      const currentSection = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom > 100;
      });

      if (!currentSection) {
        isScrolling.current = false;
        return;
      }

      // Находим следующую секцию
      const currentIndex = sections.indexOf(currentSection);
      const nextSection = sections[currentIndex + 1] as HTMLElement | undefined;

      if (nextSection) {
        // Кастомный плавный скролл (медленнее, чем стандартный)
        const targetPosition = nextSection.getBoundingClientRect().top + window.scrollY;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 1200; // 1.2 секунды (было ~0.6)
        let startTime: number | null = null;

        const animation = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);

          // Easing: easeInOutCubic (плавное начало и конец)
          const ease =
            progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          window.scrollTo(0, startPosition + distance * ease);

          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          } else {
            isScrolling.current = false;
          }
        };

        requestAnimationFrame(animation);
      } else {
        isScrolling.current = false;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);
}
