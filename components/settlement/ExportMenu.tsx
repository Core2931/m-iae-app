"use client";

import { useState } from "react";
import type { SettlementResult, Expense, AppConfig } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { CATEGORIES } from "@/lib/constants";
import Button from "@/components/ui/Button";

interface ExportMenuProps {
  settlement: SettlementResult;
  expenses: Expense[];
  config: AppConfig;
}

function buildSummaryText(
  settlement: SettlementResult,
  expenses: Expense[],
  config: AppConfig
): string {
  const { direction, netAmount, totalExpenses } = settlement;
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  const conclusionLine =
    direction === "settled"
      ? "✅ เสมอกัน ไม่มีใครต้องจ่ายคืน"
      : direction === "me_owes"
      ? `💸 ${config.myName}ต้องจ่าย ${config.partnerName} ${formatCurrency(netAmount)}`
      : `💸 ${config.partnerName}ต้องจ่าย ${config.myName} ${formatCurrency(netAmount)}`;

  const lines = [
    `📊 สรุปรายจ่าย M-IAE`,
    `────────────────────`,
    ...sorted.map((e) => {
      const cat = CATEGORIES.find((c) => c.value === e.category);
      const payer = e.paidBy === "me" ? config.myName : config.partnerName;
      return `${cat?.emoji} ${e.description} ${formatCurrency(e.amount)} (${payer}จ่าย ${e.splitRatio.me}/${e.splitRatio.partner})`;
    }),
    `────────────────────`,
    `รวมทั้งหมด: ${formatCurrency(totalExpenses)}`,
    conclusionLine,
  ];

  return lines.join("\n");
}

export default function ExportMenu({ settlement, expenses, config }: ExportMenuProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildSummaryText(settlement, expenses, config);
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
