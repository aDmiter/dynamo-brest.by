'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  message: string;
}

export default function PreviewLoginForm({ message }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError('');

    try {
      const res = await fetch('/api/site-preview/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Не удалось войти');
        return;
      }

      const from = searchParams.get('from');
      router.push(from && from.startsWith('/') && !from.startsWith('//') ? from : '/');
      router.refresh();
    } catch {
      setError('Ошибка соединения');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0B0F1C] via-[#0D1225] to-[#0F1529] px-4">
      <div className="w-full max-w-md border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <img
            src="/images/logos/logo-white.png"
            alt="Динамо-Брест"
            className="mx-auto h-16 w-auto"
          />
          <h1 className="mt-4 font-heading text-2xl font-bold text-white">Динамо-Брест</h1>
          <p className="mt-2 text-sm text-gray-400">Доступ к демонстрационной версии сайта</p>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-gray-400">{message}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="relative">
            <FontAwesomeIcon
              icon={faUser}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <Input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Логин"
              autoComplete="username"
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <div className="relative">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              autoComplete="current-password"
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#ee862c] py-5 text-sm font-bold uppercase tracking-wider hover:bg-[#f0ac74]"
            disabled={pending}
          >
            {pending ? 'Вход…' : 'Войти на сайт'}
          </Button>
        </form>
      </div>
    </div>
  );
}
