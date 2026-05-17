'use client';

import { useEffect } from 'react';

interface AnalyticsInjectorProps {
  googleHead: string;
  yandexHead: string;
  yandexBody: string;
}

function injectHtmlMarkup(html: string, target: ParentNode) {
  if (!html.trim() || typeof document === 'undefined') return;

  const holder = document.createElement('div');
  holder.innerHTML = html;

  holder.querySelectorAll('script').forEach((oldScript) => {
    const script = document.createElement('script');
    Array.from(oldScript.attributes).forEach((attr) => {
      script.setAttribute(attr.name, attr.value);
    });
    script.text = oldScript.textContent ?? '';
    target.appendChild(script);
  });

  Array.from(holder.childNodes).forEach((node) => {
    if (node.nodeName === 'SCRIPT') return;
    target.appendChild(node.cloneNode(true));
  });
}

export default function AnalyticsInjector({
  googleHead,
  yandexHead,
  yandexBody,
}: AnalyticsInjectorProps) {
  useEffect(() => {
    const headTarget = document.head;
    const bodyTarget = document.body;
    if (!headTarget || !bodyTarget) return;

    injectHtmlMarkup(googleHead, headTarget);
    injectHtmlMarkup(yandexHead, headTarget);

    if (yandexBody.trim()) {
      const holder = document.createElement('div');
      holder.innerHTML = yandexBody;
      const fragment = document.createDocumentFragment();
      Array.from(holder.childNodes).forEach((node) => {
        fragment.appendChild(node.cloneNode(true));
      });
      bodyTarget.insertBefore(fragment, bodyTarget.firstChild);
    }
  }, [googleHead, yandexHead, yandexBody]);

  return null;
}
