"use client";

import { useState } from "react";
import type { SettlementResult, Expense, GroupMember } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { CATEGORIES } from "@/lib/constants";
import Button from "@/components/ui/Button";

interface ExportMenuProps {
  settlement: SettlementResult;
  expenses: Expense[];
  members: GroupMember[];
  groupName: string;
}

function buildSummaryText(
  settlement: SettlementResult,
  expenses: Expense[],
  members: GroupMember[],
  groupName: string
): string {
  const { transactions, totalExpenses } = settlement;
  const nameMap = new Map(members.map((m) => [m.userId, m.displayName]));
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  const settlementLines =
    transactions.length === 0
      ? ["✅ ทุกคนเสมอกัน ไม่มีใครต้องจ่ายคืน"]
      : transactions.map(
          (t) => `💸 ${t.fromName} จ่ายให้ ${t.toName} ${formatCurrency(t.amount)}`
        );

  const lines = [
    `📊 สรุปรายจ่าย ${groupName}`,
    `────────────────────`,
    ...sorted.map((e) => {
      const cat = CATEGORIES.find((c) => c.value === e.category);
      const payer = nameMap.get(e.paidByUserId) ?? "?";
      return `${cat?.emoji} ${e.description} ${formatCurrency(e.amount)} (${payer}จ่าย) [${formatDate(e.date)}]`;
    }),
    `────────────────────`,
    `รวมทั้งหมด: ${formatCurrency(totalExpenses)}`,
    ``,
    ...settlementLines,
  ];

  return lines.join("\n");
}

export default function ExportMenu({ settlement, expenses, members, groupName }: ExportMenuProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildSummaryText(settlement, expenses, members, groupName);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex gap-3">
      <Button onClick={handleCopy} className="flex-1 text-center">
        {copied ? "✓ คัดลอกแล้ว" : "📋 คัดลอกสรุป"}
      </Button>
      <Button onClick={handlePrint} variant="ghost" className="flex-1 text-center">
        🖨️ พิมพ์
      </Button>
    </div>
  );
}
