"use client";

import Link from "next/link";
import type { Expense } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import CategoryIcon from "./CategoryIcon";
import Badge from "@/components/ui/Badge";

interface ExpenseItemProps {
  expense: Expense;
  myName: string;
  partnerName: string;
}

export default function ExpenseItem({ expense, myName, partnerName }: ExpenseItemProps) {
  const { id, description, amount, category, paidBy, splitRatio, date } = expense;
  const cat = CATEGORIES.find((c) => c.value === category);
  const payerLabel = paidBy === "me" ? myName : partnerName;
  const splitLabel =
    splitRatio.me === splitRatio.partner
      ? "50/50"
      : `${splitRatio.me}/${splitRatio.partner}`;

  return (
    <Link href={`/expenses/${id}`} className="block">
      <div className="glass rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
        <CategoryIcon category={category} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{description}</p>
          <p className="text-white/60 text-xs mt-0.5">
            {cat?.label} · {payerLabel}จ่าย · แบ่ง {splitLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-white font-semibold text-sm">
            {formatCurrency(amount)}
          </span>
          <Badge className="text-[10px]">{formatDateShort(date)}</Badge>
        </div>
      </div>
    </Link>
  );
}
