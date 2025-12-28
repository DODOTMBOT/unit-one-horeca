import { NextAuthOptions, DefaultSession } from "next-auth";
import YandexProvider from "next-auth/providers/yandex";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

// Расширяем типы NextAuth, чтобы TS не ругался на роли и коды
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      partnerCode?: string | null;
    } & DefaultSession["user"]
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

        // Используем any для обхода временного лага типов Prisma
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

        return {
          id: user.id,
          name: user.name,
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
        token.role = (user as any).role;
        token.partnerCode = (user as any).partnerCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.partnerCode = token.partnerCode as string | null;
      }
      return session;
    },
  },
};