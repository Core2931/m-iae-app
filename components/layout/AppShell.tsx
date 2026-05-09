"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/layout/BottomNav";

const PUBLIC_PATHS = ["/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isPublic && !session) router.replace("/login");
    if (isPublic && session) router.replace("/");
  }, [isLoading, session, isPublic, router]);

  if (!isPublic && (isLoading || !session)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60 text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <>
      {children}
      {!isPublic && session && <BottomNav />}
    </>
  );
}
