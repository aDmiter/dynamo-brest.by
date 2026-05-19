import type { AdminSectionId } from '@/config/admin-sections';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    permissions: AdminSectionId[];
  }

  interface Session {
    user: {
      id: string;
      role: string;
      permissions: AdminSectionId[];
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    permissions?: AdminSectionId[];
  }
}
