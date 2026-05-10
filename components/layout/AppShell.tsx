"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useExpenseStore } from "@/store/expenseStore";
import { getSupabaseClient } from "@/lib/supabase";
import BottomNav from "@/components/layout/BottomNav";

const PUBLIC_PATHS = ["/login"];
const GROUP_PATHS = ["/groups"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const { activeGroupId, groupsChecked, setGroups, setCurrentUser, clearGroups, resetStore } =
    useExpenseStore();

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isGroupPage = GROUP_PATHS.includes(pathname);

  // Load all groups after session confirmed
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      resetStore();
      return;
    }
    if (groupsChecked) return;

    setCurrentUser(session.user.id);

    type MemberRow = { groups: { id: string; name: string; invite_code: string } | null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getSupabaseClient() as any)
      .from("group_members")
      .select("groups(id, name, invite_code)")
      .eq("user_id", session.user.id)
      .then(({ data }: { data: MemberRow[] | null }) => {
        const groups = (data ?? [])
          .filter((r) => r.groups)
          .map((r) => ({
            id: r.groups!.id,
            name: r.groups!.name,
            inviteCode: r.groups!.invite_code,
          }));
        if (groups.length > 0) {
          setGroups(groups);
        } else {
          clearGroups();
        }
      });
  }, [authLoading, session, groupsChecked, setGroups, setCurrentUser, clearGroups, resetStore]);

  // Redirect logic
  useEffect(() => {
    if (authLoading) return;
    if (!session && !isPublic) { router.replace("/login"); return; }
    if (session && isPublic) { router.replace("/"); return; }
    if (!groupsChecked) return;
    if (session && !activeGroupId && !isGroupPage) { router.replace("/groups"); return; }
  }, [authLoading, session, groupsChecked, activeGroupId, isPublic, isGroupPage, router]);

  // Show loading while checking auth or groups
  const stillChecking = authLoading || (session && !groupsChecked);
  if (!isPublic && stillChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60 text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  // Block protected pages until group is known
  if (!isPublic && !isGroupPage && (!session || !activeGroupId)) return null;

  const showNav = !isPublic && !isGroupPage && !!session && !!activeGroupId;

  return (
    <>
      {children}
      {showNav && <BottomNav />}
    </>
  );
}
