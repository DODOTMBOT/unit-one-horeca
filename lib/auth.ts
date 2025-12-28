import { NextAuthOptions, DefaultSession } from "next-auth";
import YandexProvider from "next-auth/providers/yandex";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

// 1. Расширяем типы NextAuth, добавляя surname
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      surname?: string | null; // Добавили фамилию
      partnerCode?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    role: string;
    surname?: string | null; // Добавили фамилию
    partnerCode?: string | null;
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
        }) as any;

        if (!user || !user.password) {
          throw new Error("Пользователь не найден");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Неверный пароль");
        }

        // 2. Возвращаем surname из БД при авторизации
        return {
          id: user.id,
          name: user.name,
          surname: user.surname, // <--- Важно
          email: user.email,
          role: user.role,
          partnerCode: user.partnerCode,
        };
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.surname = user.surname; // 3. Записываем в токен
        token.partnerCode = user.partnerCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.surname = token.surname as string | null; // 4. Пробрасываем в сессию
        session.user.partnerCode = token.partnerCode as string | null;
      }
      return session;
    },
  },
};