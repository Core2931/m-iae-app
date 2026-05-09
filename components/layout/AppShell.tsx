"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useExpenseStore } from "@/store/expenseStore";
import { getSupabaseClient } from "@/lib/supabase";
import BottomNav from "@/components/layout/BottomNav";

const PUBLIC_PATHS = ["/login"];
const SETUP_PATHS = ["/setup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading: authLoading, signOut } = useAuth();
  const { coupleId, coupleChecked, setCouple, clearCouple, resetStore } = useExpenseStore();

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isSetup = SETUP_PATHS.includes(pathname);

  // Query couple membership after session is confirmed
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      resetStore();
      return;
    }
    if (coupleChecked) return;

    type MemberRow = { couple_id: string; couples: { invite_code: string } | null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getSupabaseClient() as any)
      .from("couple_members")
      .select("couple_id, couples(invite_code)")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }: { data: MemberRow | null }) => {
        if (data?.couple_id) {
          setCouple(data.couple_id, data.couples?.invite_code ?? "");
        } else {
          clearCouple();
        }
      });
  }, [authLoading, session, coupleChecked, setCouple, clearCouple, resetStore]);

  // Redirect logic
  useEffect(() => {
    if (authLoading) return;
    if (!session && !isPublic) { router.replace("/login"); return; }
    if (session && isPublic) { router.replace("/"); return; }
    if (!coupleChecked) return;
    if (session && !coupleId && !isSetup) { router.replace("/setup"); return; }
    if (session && coupleId && isSetup) { router.replace("/"); return; }
  }, [authLoading, session, coupleChecked, coupleId, isPublic, isSetup, router]);

  // Show loading while checking auth or couple
  const stillChecking = authLoading || (session && !coupleChecked);
  if (!isPublic && stillChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60 text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  // Block render of protected pages until couple is known
  if (!isPublic && !isSetup && (!session || !coupleId)) return null;

  const showNav = !isPublic && !isSetup && !!session && !!coupleId;

  return (
    <>
      {children}
      {showNav && <BottomNav />}
    </>
  );
}
