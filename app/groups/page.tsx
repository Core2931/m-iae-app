"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenseStore } from "@/store/expenseStore";
import { getSupabaseClient } from "@/lib/supabase";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Tab = "create" | "join";

export default function GroupsPage() {
  const router = useRouter();
  const { groups, activeGroupId, setActiveGroup, addGroup } = useExpenseStore();
  const [tab, setTab] = useState<Tab>("create");
  const [groupName, setGroupName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [joinDisplayName, setJoinDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!groupName.trim() || !displayName.trim()) return;
    setError("");
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: rpcError } = await (getSupabaseClient().rpc as any)("create_group", {
      p_name: groupName.trim(),
      p_display_name: displayName.trim(),
    });

    setLoading(false);
    if (rpcError || !data) {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
      return;
    }
    addGroup({ id: data.id, name: data.name, inviteCode: data.invite_code });
    setActiveGroup(data.id);
    router.replace("/");
  }

  async function handleJoin() {
    if (!code.trim() || !joinDisplayName.trim()) return;
    setError("");
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: rpcError } = await (getSupabaseClient().rpc as any)("join_group", {
      p_invite_code: code.trim().toUpperCase(),
      p_display_name: joinDisplayName.trim(),
    });

    setLoading(false);
    if (rpcError || !data) {
      setError("ไม่พบ invite code นี้ หรืออาจเข้าร่วมไปแล้ว");
      return;
    }
    addGroup({ id: data.id, name: data.name, inviteCode: data.invite_code });
    setActiveGroup(data.id);
    router.replace("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <p className="text-5xl mb-3">👥</p>
          <h1 className="text-white text-xl font-bold">กลุ่มของฉัน</h1>
          <p className="text-white/60 text-sm mt-1">สร้างกลุ่มใหม่ หรือเข้าร่วมกลุ่มที่มีอยู่</p>
        </div>

        {/* Existing groups */}
        {groups.length > 0 && (
          <GlassCard>
            <p className="text-white/70 text-sm font-medium mb-3">กลุ่มของฉัน</p>
            <div className="flex flex-col gap-2">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-2xl",
                    g.id === activeGroupId ? "bg-white/25" : "bg-white/10"
                  )}
                >
                  <div>
                    <p className="text-white text-sm font-medium">{g.name}</p>
                    <p className="text-white/50 text-xs font-mono">{g.inviteCode}</p>
                  </div>
                  {g.id !== activeGroupId && (
                    <Button
                      type="button"
                      onClick={() => { setActiveGroup(g.id); router.replace("/"); }}
                      className="px-3 py-1.5 text-xs"
                    >
                      เลือก
                    </Button>
                  )}
                  {g.id === activeGroupId && (
                    <span className="text-white/60 text-xs">ใช้งานอยู่</span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Create / Join */}
        <GlassCard>
          <div className="flex rounded-2xl bg-white/10 p-1 mb-5">
            {(["create", "join"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(""); }}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                  tab === t ? "bg-white/30 text-white shadow-sm" : "text-white/60"
                )}
              >
                {t === "create" ? "สร้างกลุ่มใหม่" : "เข้าร่วมกลุ่ม"}
              </button>
            ))}
          </div>

          {tab === "create" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="ชื่อกลุ่ม"
                placeholder="ทริปเชียงใหม่"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Input
                label="ชื่อของคุณในกลุ่ม"
                placeholder="มาร์ค"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              {error && <p className="text-red-300 text-sm text-center">{error}</p>}
              <Button
                onClick={handleCreate}
                disabled={loading || !groupName.trim() || !displayName.trim()}
                className="w-full py-3"
              >
                {loading ? "กำลังสร้าง..." : "สร้างกลุ่ม"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input
                label="Invite Code"
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="text-center tracking-widest uppercase"
              />
              <Input
                label="ชื่อของคุณในกลุ่ม"
                placeholder="นัท"
                value={joinDisplayName}
                onChange={(e) => setJoinDisplayName(e.target.value)}
              />
              {error && <p className="text-red-300 text-sm text-center">{error}</p>}
              <Button
                onClick={handleJoin}
                disabled={loading || !code.trim() || !joinDisplayName.trim()}
                className="w-full py-3"
              >
                {loading ? "กำลังเข้าร่วม..." : "เข้าร่วมกลุ่ม"}
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
