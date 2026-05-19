'use client';

import { useActionState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LoginState } from './actions';

type LoginFormProps = {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
};

export default function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0B0F1C] via-[#0D1225] to-[#0F1529] px-4">
      <div className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl">
        <div className="mb-8 text-center">
          <img
            src="/images/logos/logo-white.png"
            alt="Динамо-Брест"
            className="mx-auto h-16 w-auto"
          />
          <h1 className="mt-4 font-heading text-2xl font-bold text-white">Динамо-Брест</h1>
          <p className="mt-2 text-sm text-gray-400">Вход в панель управления</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <div className="relative">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <Input
              type="text"
              name="email"
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
              name="password"
              placeholder="Пароль"
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#ee862c] py-5 text-sm font-bold uppercase tracking-wider hover:bg-[#f0ac74]"
            disabled={pending}
          >
            {pending ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  );
}
