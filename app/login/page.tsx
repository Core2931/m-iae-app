"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Tab = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace("/");
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (tab === "login") {
      const { error: authError } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      setLoading(false);
      if (authError) setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      else router.replace("/");
    } else {
      const { error: authError } = await getSupabaseClient().auth.signUp({ email, password });
      setLoading(false);
      if (authError) setError(authError.message);
      else setInfo("สมัครสำเร็จ! ตรวจสอบอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <p className="text-5xl mb-3">💑</p>
          <h1 className="text-white text-2xl font-bold">M-IAE</h1>
          <p className="text-white/60 text-sm mt-1">บันทึกรายจ่ายร่วมกัน</p>
        </div>

        <GlassCard>
          {/* Tabs */}
          <div className="flex rounded-2xl bg-white/10 p-1 mb-4">
            {(["login", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(""); setInfo(""); }}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                  tab === t ? "bg-white/30 text-white shadow-sm" : "text-white/60"
                )}
              >
                {t === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="อีเมล"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="รหัสผ่าน"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-300 text-sm text-center">{error}</p>}
            {info && <p className="text-green-300 text-sm text-center">{info}</p>}
            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "กำลังดำเนินการ..." : tab === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
