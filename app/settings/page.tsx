"use client";

import { useState } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/layout/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SettingsPage() {
  const { inviteCode } = useExpenseStore();
  const { config, saveConfig } = useExpenses();
  const { signOut } = useAuth();
  const [myName, setMyName] = useState(config.myName);
  const [partnerName, setPartnerName] = useState(config.partnerName);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCopyCode() {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveNames(e: React.FormEvent) {
    e.preventDefault();
    if (!myName.trim() || !partnerName.trim()) return;
    setSaving(true);
    await saveConfig({ ...config, myName: myName.trim(), partnerName: partnerName.trim() });
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <PageHeader title="ตั้งค่า" />

      {/* Invite Code */}
      <GlassCard>
        <p className="text-white/70 text-sm font-medium mb-3">Invite Code</p>
        <p className="text-white/50 text-xs mb-3">แชร์ code นี้ให้แฟนเพื่อเข้าร่วมกลุ่ม</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3 text-white text-xl font-mono tracking-widest text-center">
            {inviteCode ?? "—"}
          </div>
          <Button
            type="button"
            onClick={handleCopyCode}
            className="px-4 py-3 text-sm"
          >
            {copied ? "✓ Copied" : "Copy"}
          </Button>
        </div>
      </GlassCard>

      {/* Names */}
      <GlassCard>
        <p className="text-white/70 text-sm font-medium mb-3">ชื่อในแอป</p>
        <form onSubmit={handleSaveNames} className="flex flex-col gap-3">
          <Input
            label="ชื่อฉัน"
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            placeholder="ฉัน"
          />
          <Input
            label="ชื่อแฟน"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="แฟน"
          />
          <Button type="submit" disabled={saving} className="w-full py-3">
            {saving ? "กำลังบันทึก..." : "บันทึกชื่อ"}
          </Button>
        </form>
      </GlassCard>

      {/* Logout */}
      <GlassCard>
        <Button
          type="button"
          variant="danger"
          onClick={signOut}
          className="w-full py-3"
        >
          ออกจากระบบ
        </Button>
      </GlassCard>
    </div>
  );
}
