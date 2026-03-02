"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-green-800 font-semibold">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;
  return <>{children}</>;
}
