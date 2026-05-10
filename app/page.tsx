"use client";

import Link from "next/link";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettlement } from "@/hooks/useSettlement";
import { useExpenseStore } from "@/store/expenseStore";
import PageHeader from "@/components/layout/PageHeader";
import SettlementCard from "@/components/settlement/SettlementCard";
import ExpenseList from "@/components/expenses/ExpenseList";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { expenses, members, isLoaded } = useExpenses();
  const { settlement, groupName } = useSettlement();
  const { groups, activeGroupId } = useExpenseStore();

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-svh">
        <p className="text-white/60">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={activeGroup?.name ?? "M-IAE"}
        action={
          <Link href="/expenses/new">
            <Button className="text-sm px-4 py-2">+ เพิ่ม</Button>
          </Link>
        }
      />

      <SettlementCard settlement={settlement} groupName={groupName} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-base">รายจ่ายล่าสุด</h2>
          {expenses.length > 5 && (
            <Link href="/expenses" className="text-white/60 text-sm hover:text-white">
              ดูทั้งหมด →
            </Link>
          )}
        </div>
        <ExpenseList
          expenses={expenses}
          members={members}
          limit={5}
          emptyMessage="ยังไม่มีรายจ่าย กด + เพิ่มรายการแรก"
        />
      </div>
    </div>
  );
}
