import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Пускаем только партнеров или главного владельца
  if (!session || (session.user.role !== "PARTNER" && session.user.role !== "OWNER")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {children}
    </div>
  );
}