// src/app/api/auth/[...nextauth]/route.ts - API роут для аутентификации
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
