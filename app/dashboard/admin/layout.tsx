import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const role = (session.user as { role?: string }).role;

  if (role !== "ADMIN" && role !== "OFFICER") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
