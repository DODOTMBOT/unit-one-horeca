import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // <-- Тянем настройки из файла выше

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };