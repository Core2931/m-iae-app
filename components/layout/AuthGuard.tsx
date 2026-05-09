"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, session } = useAuth();

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60 text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  return <>{children}</>;
}
