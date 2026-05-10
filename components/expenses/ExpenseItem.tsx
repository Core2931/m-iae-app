"use client";

import Link from "next/link";
import type { Expense, GroupMember } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import CategoryIcon from "./CategoryIcon";
import Badge from "@/components/ui/Badge";

interface ExpenseItemProps {
  expense: Expense;
  members: GroupMember[];
}

export default function ExpenseItem({ expense, members }: ExpenseItemProps) {
  const { id, description, amount, category, paidByUserId, splits, date } = expense;
  const cat = CATEGORIES.find((c) => c.value === category);
  const payer = members.find((m) => m.userId === paidByUserId);
  const payerLabel = payer?.displayName ?? "ไม่ทราบ";

  const isEqual = splits.length > 0 &&
    splits.every((s) => Math.abs(s.amount - splits[0].amount) < 0.01);
  const splitLabel = isEqual ? `หาร ${splits.length} คน` : "กำหนดเอง";

  return (
    <Link href={`/expenses/${id}`} className="block">
      <div className="glass rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
        <CategoryIcon category={category} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{description}</p>
          <p className="text-white/60 text-xs mt-0.5">
            {cat?.label} · {payerLabel}จ่าย · {splitLabel}
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
