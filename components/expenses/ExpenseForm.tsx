"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Expense, ExpenseSplit } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { todayISO, formatCurrency } from "@/lib/formatters";
import { useExpenses } from "@/hooks/useExpenses";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface ExpenseFormProps {
  initial?: Expense;
}

export default function ExpenseForm({ initial }: ExpenseFormProps) {
  const router = useRouter();
  const { addExpense, updateExpense, deleteExpense, members, currentUserId } = useExpenses();

  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "food");
  const [paidByUserId, setPaidByUserId] = useState(
    initial?.paidByUserId ?? currentUserId ?? ""
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [note, setNote] = useState(initial?.note ?? "");
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEdit = !!initial;
  const amountNum = parseFloat(amount) || 0;

  // Init paidByUserId once members load
  useEffect(() => {
    if (!paidByUserId && currentUserId) setPaidByUserId(currentUserId);
  }, [currentUserId, paidByUserId]);

  // Init customSplits from initial expense
  useEffect(() => {
    if (initial?.splits) {
      const map: Record<string, string> = {};
      initial.splits.forEach((s) => { map[s.userId] = String(s.amount); });
      setCustomSplits(map);
      // Check if it's equal split
      const amounts = initial.splits.map((s) => s.amount);
      const isEq = amounts.every((a) => Math.abs(a - amounts[0]) < 0.01);
      setSplitMode(isEq ? "equal" : "custom");
    }
  }, [initial]);

  function buildSplits(): ExpenseSplit[] {
    if (splitMode === "equal") {
      if (members.length === 0) return [];
      const each = Math.round((amountNum / members.length) * 100) / 100;
      const splits = members.map((m, i) => ({
        userId: m.userId,
        amount: i === members.length - 1
          ? Math.round((amountNum - each * (members.length - 1)) * 100) / 100
          : each,
      }));
      return splits;
    }
    return members.map((m) => ({
      userId: m.userId,
      amount: parseFloat(customSplits[m.userId] ?? "0") || 0,
    }));
  }

  function customSplitTotal() {
    return members.reduce((s, m) => s + (parseFloat(customSplits[m.userId] ?? "0") || 0), 0);
  }

  function isCustomValid() {
    const total = customSplitTotal();
    return Math.abs(total - amountNum) < 0.01;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount || !paidByUserId) return;
    if (splitMode === "custom" && !isCustomValid()) return;
    setSaving(true);
    const data = {
      description: description.trim(),
      amount: amountNum,
      category: category as Expense["category"],
      paidByUserId,
      splits: buildSplits(),
      date,
      note: note.trim() || undefined,
    };
    if (isEdit) {
      await updateExpense(initial.id, data);
    } else {
      await addExpense(data);
    }
    router.push("/expenses");
  }

  async function handleDelete() {
    if (!initial || !confirm("ลบรายการนี้?")) return;
    await deleteExpense(initial.id);
    router.push("/expenses");
  }

  const equalPerPerson = members.length > 0
    ? Math.round((amountNum / members.length) * 100) / 100
    : 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <GlassCard>
        <div className="flex flex-col gap-4">
          <Input
            label="รายการ"
            placeholder="เช่น ข้าวมันไก่, โรงหนัง"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            label="จำนวนเงิน (฿)"
            type="number"
            inputMode="decimal"
            placeholder="0"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Select
            label="หมวดหมู่"
            value={category}
            onChange={(e) => setCategory(e.target.value as Expense["category"])}
            options={CATEGORIES.map((c) => ({
              value: c.value,
              label: `${c.emoji} ${c.label}`,
            }))}
          />
          <Input
            label="วันที่"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Who paid */}
      <GlassCard>
        <p className="text-white/70 text-sm font-medium mb-3">ใครจ่าย?</p>
        {members.length === 0 ? (
          <p className="text-white/50 text-sm">กำลังโหลดสมาชิก...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {members.map((m) => (
              <button
                key={m.userId}
                type="button"
                onClick={() => setPaidByUserId(m.userId)}
                className={cn(
                  "py-3 rounded-2xl border text-sm font-medium transition-all",
                  paidByUserId === m.userId
                    ? "bg-white/30 border-white/50 text-white shadow-md"
                    : "bg-white/10 border-white/20 text-white/60"
                )}
              >
                {m.displayName}
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Split */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/70 text-sm font-medium">แบ่งยังไง?</p>
          <div className="flex rounded-xl bg-white/10 p-0.5">
            {(["equal", "custom"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSplitMode(mode)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                  splitMode === mode ? "bg-white/30 text-white" : "text-white/60"
                )}
              >
                {mode === "equal" ? "เท่ากัน" : "กำหนดเอง"}
              </button>
            ))}
          </div>
        </div>

        {members.length === 0 ? (
          <p className="text-white/50 text-sm">กำลังโหลดสมาชิก...</p>
        ) : splitMode === "equal" ? (
          <div className="flex flex-col gap-1.5">
            {members.map((m) => (
              <div key={m.userId} className="flex justify-between items-center">
                <span className="text-white/80 text-sm">{m.displayName}</span>
                <span className="text-white/60 text-sm">
                  {amountNum > 0 ? formatCurrency(equalPerPerson) : "฿0"}
                </span>
              </div>
            ))}
            {amountNum > 0 && (
              <div className="border-t border-white/20 mt-2 pt-2 flex justify-between">
                <span className="text-white/60 text-xs">รวม</span>
                <span className="text-white text-xs">{formatCurrency(amountNum)} ✓</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center gap-3">
                <span className="text-white/80 text-sm flex-1">{m.displayName}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={customSplits[m.userId] ?? ""}
                  onChange={(e) =>
                    setCustomSplits((prev) => ({ ...prev, [m.userId]: e.target.value }))
                  }
                  className="w-28 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white text-sm text-right focus:outline-none focus:border-white/50"
                />
              </div>
            ))}
            <div
              className={cn(
                "border-t border-white/20 mt-1 pt-2 flex justify-between",
              )}
            >
              <span className="text-white/60 text-xs">รวม</span>
              <span
                className={cn(
                  "text-xs",
                  amountNum > 0 && !isCustomValid() ? "text-red-300" : "text-white"
                )}
              >
                {formatCurrency(customSplitTotal())}
                {amountNum > 0 && isCustomValid() && " ✓"}
                {amountNum > 0 && !isCustomValid() && ` (ต้องรวมเป็น ${formatCurrency(amountNum)})`}
              </span>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <Input
          label="หมายเหตุ (ไม่บังคับ)"
          placeholder="รายละเอียดเพิ่มเติม"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </GlassCard>

      <Button
        type="submit"
        disabled={saving || (splitMode === "custom" && amountNum > 0 && !isCustomValid())}
        className="w-full py-4 text-base"
      >
        {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "บันทึกรายจ่าย"}
      </Button>

      {isEdit && (
        <Button type="button" variant="danger" onClick={handleDelete} className="w-full py-3">
          ลบรายการนี้
        </Button>
      )}
    </form>
  );
}
