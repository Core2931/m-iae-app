"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenses } from "@/hooks/useExpenses";
import { useExpenseStore } from "@/store/expenseStore";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/layout/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SettingsPage() {
  const router = useRouter();
  const { members, groupName, currentUserId, saveGroupName, updateMyDisplayName } = useExpenses();
  const { activeGroupId, groups } = useExpenseStore();
  const { signOut } = useAuth();

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const me = members.find((m) => m.userId === currentUserId);

  const [newGroupName, setNewGroupName] = useState(groupName);
  const [myDisplayName, setMyDisplayName] = useState(me?.displayName ?? "");
  const [copied, setCopied] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [savingName, setSavingName] = useState(false);

  async function handleCopyCode() {
    if (!activeGroup?.inviteCode) return;
    await navigator.clipboard.writeText(activeGroup.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveGroupName(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setSavingGroup(true);
    await saveGroupName(newGroupName.trim());
    setSavingGroup(false);
  }

  async function handleSaveMyName(e: React.FormEvent) {
    e.preventDefault();
    if (!myDisplayName.trim()) return;
    setSavingName(true);
    await updateMyDisplayName(myDisplayName.trim());
    setSavingName(false);
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <PageHeader title="ตั้งค่า" />

      {/* Invite Code */}
      <GlassCard>
        <p className="text-white/70 text-sm font-medium mb-1">Invite Code</p>
        <p className="text-white/50 text-xs mb-3">แชร์ให้เพื่อนเข้าร่วมกลุ่ม</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3 text-white text-xl font-mono tracking-widest text-center">
            {activeGroup?.inviteCode ?? "—"}
          </div>
          <Button type="button" onClick={handleCopyCode} className="px-4 py-3 text-sm">
            {copied ? "✓ Copied" : "Copy"}
          </Button>
        </div>
      </GlassCard>

      {/* Members */}
      <GlassCard>
        <p className="text-white/70 text-sm font-medium mb-3">สมาชิกในกลุ่ม ({members.length} คน)</p>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                {m.displayName.charAt(0)}
              </div>
              <span className="text-white text-sm">{m.displayName}</span>
              {m.userId === currentUserId && (
                <span className="text-white/50 text-xs">(คุณ)</span>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* My display name */}
      <GlassCard>
        <p className="text-white/70 text-sm font-medium mb-3">ชื่อของฉันในกลุ่ม</p>
        <form onSubmit={handleSaveMyName} className="flex flex-col gap-3">
          <Input
            label="ชื่อ"
            value={myDisplayName}
            onChange={(e) => setMyDisplayName(e.target.value)}
            placeholder={me?.displayName ?? "ชื่อของคุณ"}
          />
          <Button type="submit" disabled={savingName} className="w-full py-3">
            {savingName ? "กำลังบันทึก..." : "บันทึกชื่อ"}
          </Button>
        </form>
      </GlassCard>

      {/* Group name */}
      <GlassCard>
        <p className="text-white/70 text-sm font-medium mb-3">ชื่อกลุ่ม</p>
        <form onSubmit={handleSaveGroupName} className="flex flex-col gap-3">
          <Input
            label="ชื่อกลุ่ม"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder={groupName || "ชื่อกลุ่ม"}
          />
          <Button type="submit" disabled={savingGroup} className="w-full py-3">
            {savingGroup ? "กำลังบันทึก..." : "บันทึกชื่อกลุ่ม"}
          </Button>
        </form>
      </GlassCard>

      {/* Switch group */}
      <GlassCard>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/groups")}
          className="w-full py-3"
        >
          👥 จัดการกลุ่ม / เปลี่ยนกลุ่ม
        </Button>
      </GlassCard>

      {/* Logout */}
      <GlassCard>
        <Button type="button" variant="danger" onClick={signOut} className="w-full py-3">
          ออกจากระบบ
        </Button>
      </GlassCard>
    </div>
  );
}
