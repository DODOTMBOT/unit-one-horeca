import { NextAuthOptions, DefaultSession } from "next-auth";
import YandexProvider from "next-auth/providers/yandex";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

// 1. Расширяем типы NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      roleName?: string;
      permissions: string[];
      surname?: string | null;
      partnerId?: string | null; // Исправлено на partnerId согласно схеме
    } & DefaultSession["user"]
  }

  interface User {
    role: string;
    surname?: string | null;
    partnerId?: string | null; // Исправлено
  }
}

// 2. Расширяем типы JWT специально для Middleware
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions: string[];
    surname?: string | null;
    partnerId?: string | null; // Исправлено
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID!,
      clientSecret: process.env.YANDEX_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          throw new Error("Введите логин и пароль");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { login: credentials.login },
              { email: credentials.login }
            ]
          }
        });

        if (!user || !user.password) {
          throw new Error("Пользователь не найден");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Неверный пароль");
        }

        return {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role: user.role,
        };
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id || token.id;
      
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId as string },
          select: {
            id: true,
            role: true,
            surname: true,
            partnerId: true, // Используем актуальное поле из схемы
            newRole: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.surname = dbUser.surname;
          token.partnerId = dbUser.partnerId;
          // Собираем массив строк названий прав
          token.permissions = dbUser.newRole?.permissions.map((rp: any) => rp.permission.name) || [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.surname = token.surname;
        session.user.partnerId = token.partnerId;
        session.user.permissions = token.permissions || [];
      }
      return session;
    },
  },
};