"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
    setLoading(true);
    const { error: authError } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } else {
      router.replace("/");
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
            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
