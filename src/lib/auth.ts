// src/lib/auth.ts - Настройка аутентификации
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import {
  isSuperAdmin,
  parseAdminPermissions,
  SUPERADMIN_ROLE,
} from '@/lib/admin-permissions';
import { ALL_ADMIN_SECTION_IDS } from '@/config/admin-sections';
import bcrypt from 'bcryptjs';

function mapAdminToAuthUser(admin: {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: unknown;
}) {
  const permissions = isSuperAdmin(admin.role)
    ? ALL_ADMIN_SECTION_IDS
    : parseAdminPermissions(admin.permissions);

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim();
        const password = String(credentials?.password ?? '');
        if (!email || !password) {
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { email },
        });

        if (!admin || !admin.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
          return null;
        }

        return mapAdminToAuthUser(admin);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }

      // Повторный запрос в БД только если в токене нет роли (старые сессии)
      if (token.id && !token.role) {
        const admin = await prisma.admin.findUnique({
          where: { id: token.id as string },
        });

        if (!admin || !admin.isActive) {
          return null;
        }

        const mapped = mapAdminToAuthUser(admin);
        token.role = mapped.role;
        token.permissions = mapped.permissions;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.id || !token.role) {
        return session;
      }

      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.permissions = (token.permissions as typeof ALL_ADMIN_SECTION_IDS) ?? [];
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
});

export { SUPERADMIN_ROLE };
