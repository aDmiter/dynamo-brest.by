import Script from 'next/script';

/** Скрипт 24afisha: перехватывает клики по saleframe.* и открывает покупку в модальном окне. */
export default function AfpTicketScript({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return <Script src="/js/afp.js" strategy="afterInteractive" />;
}
