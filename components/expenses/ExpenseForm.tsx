"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Expense } from "@/types";
import { CATEGORIES, SPLIT_PRESETS } from "@/lib/constants";
import { todayISO } from "@/lib/formatters";
import { useExpenses } from "@/hooks/useExpenses";
import { useExpenseStore } from "@/store/expenseStore";
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
  const { addExpense, updateExpense, deleteExpense, config } = useExpenses();

  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "food");
  const [paidBy, setPaidBy] = useState<"me" | "partner">(initial?.paidBy ?? "me");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [note, setNote] = useState(initial?.note ?? "");
  const [splitMe, setSplitMe] = useState(initial?.splitRatio.me ?? 50);
  const [saving, setSaving] = useState(false);

  const isEdit = !!initial;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    setSaving(true);
    const data = {
      description: description.trim(),
      amount: parseFloat(amount),
      category: category as Expense["category"],
      paidBy,
      splitRatio: { me: splitMe, partner: 100 - splitMe },
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

      <GlassCard>
        <p className="text-white/70 text-sm font-medium mb-3">ใครจ่าย?</p>
        <div className="grid grid-cols-2 gap-2">
          {(["me", "partner"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPaidBy(p)}
              className={cn(
                "py-3 rounded-2xl border text-sm font-medium transition-all",
                paidBy === p
                  ? "bg-white/30 border-white/50 text-white shadow-md"
                  : "bg-white/10 border-white/20 text-white/60"
              )}
            >
              {p === "me" ? `${config.myName} จ่าย` : `${config.partnerName} จ่าย`}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-white/70 text-sm font-medium mb-3">แบ่งกัน</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SPLIT_PRESETS.map((preset) => {
            const active = preset.me === splitMe;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setSplitMe(preset.me)}
                className={cn(
                  "py-2 rounded-2xl border text-xs font-medium transition-all",
                  active
                    ? "bg-white/30 border-white/50 text-white shadow-md"
                    : "bg-white/10 border-white/20 text-white/60"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-xs w-16 text-right">{config.myName} {splitMe}%</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={splitMe}
            onChange={(e) => setSplitMe(Number(e.target.value))}
            className="flex-1 accent-white"
          />
          <span className="text-white/60 text-xs w-16">{config.partnerName} {100 - splitMe}%</span>
        </div>
      </GlassCard>

      <GlassCard>
        <Input
          label="หมายเหตุ (ไม่บังคับ)"
          placeholder="รายละเอียดเพิ่มเติม"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </GlassCard>

      <Button type="submit" disabled={saving} className="w-full py-4 text-base">
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
