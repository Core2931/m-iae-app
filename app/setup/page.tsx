"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useExpenseStore } from "@/store/expenseStore";
import { getSupabaseClient } from "@/lib/supabase";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Tab = "create" | "join";

export default function SetupPage() {
  const router = useRouter();
  const { session } = useAuth();
  const { setCouple } = useExpenseStore();
  const [tab, setTab] = useState<Tab>("create");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!session) return;
    setError("");
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: rpcError } = await (getSupabaseClient().rpc as any)("create_couple", {
      p_my_name: "ฉัน",
      p_partner_name: "แฟน",
    });

    setLoading(false);
    if (rpcError || !data) {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
      return;
    }
    setCouple(data.id, data.invite_code);
    router.replace("/");
  }

  async function handleJoin() {
    if (!session || !code.trim()) return;
    setError("");
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: rpcError } = await (getSupabaseClient().rpc as any)("join_couple", {
      p_invite_code: code.trim().toUpperCase(),
    });

    setLoading(false);
    if (rpcError || !data) {
      setError("ไม่พบ invite code นี้ หรืออาจเต็มแล้ว (max 2 คน)");
      return;
    }
    setCouple(data.id, data.invite_code);
    router.replace("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <p className="text-5xl mb-3">💑</p>
          <h1 className="text-white text-xl font-bold">ตั้งค่ากลุ่ม</h1>
          <p className="text-white/60 text-sm mt-1">สร้างกลุ่มใหม่ หรือเข้าร่วมกลุ่มที่มีอยู่</p>
        </div>

        <GlassCard>
          {/* Tabs */}
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
              <p className="text-white/70 text-sm text-center">
                สร้างกลุ่มแล้วได้รับ invite code เพื่อแชร์ให้แฟน
              </p>
              {error && <p className="text-red-300 text-sm text-center">{error}</p>}
              <Button onClick={handleCreate} disabled={loading} className="w-full py-3">
                {loading ? "กำลังสร้าง..." : "สร้างกลุ่มใหม่"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-white/70 text-sm text-center">
                กรอก invite code ที่ได้รับจากอีกฝ่าย
              </p>
              <Input
                label="Invite Code"
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="text-center tracking-widest uppercase"
              />
              {error && <p className="text-red-300 text-sm text-center">{error}</p>}
              <Button onClick={handleJoin} disabled={loading || !code.trim()} className="w-full py-3">
                {loading ? "กำลังเข้าร่วม..." : "เข้าร่วมกลุ่ม"}
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
