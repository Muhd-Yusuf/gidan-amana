import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import SessionProvider from "@/components/SessionProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Login page doesn't need auth check
  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen">
        {session && <AdminNav />}
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </SessionProvider>
  );
}
