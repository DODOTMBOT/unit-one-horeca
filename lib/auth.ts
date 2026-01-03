import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string | null;
      roleId: string | null;
      permissions: string[];
      establishments: { id: string, name: string }[];
      partnerId?: string | null;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  
  pages: {
    signIn: "/auth/signin", 
  },

  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id || token.sub;
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: { 
            establishments: { select: { id: true, name: true } }, 
            newRole: { include: { permissions: { include: { permission: true } } } } 
          }
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.roleId = dbUser.roleId;
          token.partnerId = dbUser.partnerId;
          token.establishments = dbUser.establishments; 
          token.permissions = dbUser.newRole?.permissions?.map((p: any) => p.permission.name) || [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.roleId = token.roleId as string;
        session.user.partnerId = token.partnerId as string;
        (session.user as any).establishments = token.establishments; 
        session.user.permissions = (token.permissions as string[]) || [];
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { login: { type: "text" }, password: { type: "password" } },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: { OR: [{ login: credentials.login }, { email: credentials.login }] }
        });
        
        if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            roleId: user.roleId, 
            partnerId: user.partnerId 
          };
        }
        return null;
      }
    }),
  ],
};