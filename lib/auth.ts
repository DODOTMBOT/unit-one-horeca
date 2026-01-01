import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      permissions: string[];
      surname?: string | null;
      partnerId?: string | null;
    } & DefaultSession["user"]
  }
  interface User {
    id: string;
    role: string;
    surname?: string | null;
    partnerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions: string[];
    partnerId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) throw new Error("Данные не введены");
        const user = await prisma.user.findFirst({
          where: { OR: [{ login: credentials.login }, { email: credentials.login }] }
        });
        if (!user || !user.password) throw new Error("Пользователь не найден");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Неверный пароль");
        return { id: user.id, name: user.name, email: user.email, role: user.role, partnerId: user.partnerId };
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id || token.id;
      
      if (userId) {
        // ИСПОЛЬЗУЕМ newRole, так как именно так называется связь в твоей schema.prisma
        const dbUser = await prisma.user.findUnique({
          where: { id: userId as string },
          include: { 
            newRole: { 
              include: { 
                permissions: { 
                  include: { 
                    permission: true 
                  } 
                } 
              } 
            } 
          }
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role; // Это OWNER/PARTNER из Enuma
          token.partnerId = dbUser.partnerId;
          
          // Достаем права из newRole
          const perms = dbUser.newRole?.permissions?.map((p: any) => p.permission.name) || [];
          token.permissions = perms;
          
          console.log("AUTH SUCCESS. Loaded permissions:", perms.length);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions || [];
        session.user.partnerId = token.partnerId;
      }
      return session;
    },
  },
};