"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import PageHeader from "@/components/layout/PageHeader";
import ExpenseList from "@/components/expenses/ExpenseList";
import { CATEGORIES } from "@/lib/constants";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

export default function ExpensesPage() {
  const { expenses, config, isLoaded } = useExpenses();
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [filterPayer, setFilterPayer] = useState<"all" | "me" | "partner">("all");

  const filtered = expenses.filter((e) => {
    if (filterCategory !== "all" && e.category !== filterCategory) return false;
    if (filterPayer !== "all" && e.paidBy !== filterPayer) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="รายจ่ายทั้งหมด" />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { value: "all", label: "ทั้งหมด" },
          ...CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` })),
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterCategory(value as Category | "all")}
            className={cn(
              "flex-shrink-0 rounded-2xl px-3 py-1.5 text-xs border transition-all",
              filterCategory === value
                ? "bg-white/30 border-white/50 text-white font-semibold"
                : "bg-white/10 border-white/20 text-white/60"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {[
          { value: "all", label: "ทุกคน" },
          { value: "me", label: `${config.myName}จ่าย` },
          { value: "partner", label: `${config.partnerName}จ่าย` },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterPayer(value as "all" | "me" | "partner")}
            className={cn(
              "flex-1 rounded-2xl px-3 py-1.5 text-xs border transition-all",
              filterPayer === value
                ? "bg-white/30 border-white/50 text-white font-semibold"
                : "bg-white/10 border-white/20 text-white/60"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoaded ? (
        <ExpenseList
          expenses={filtered}
          config={config}
          emptyMessage="ไม่พบรายจ่ายในตัวกรองนี้"
        />
      ) : (
        <p className="text-white/60 text-center py-10">กำลังโหลด...</p>
      )}
    </div>
  );
}
