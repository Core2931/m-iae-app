"use client";

import { use } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import PageHeader from "@/components/layout/PageHeader";
import ExpenseForm from "@/components/expenses/ExpenseForm";

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { expenses, isLoaded } = useExpenses();

  if (!isLoaded) {
    return <p className="text-white/60 text-center pt-20">กำลังโหลด...</p>;
  }

  const expense = expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="ไม่พบรายการ" backHref="/expenses" />
        <p className="text-white/60 text-center pt-10">รายการนี้ไม่มีในระบบแล้ว</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="แก้ไขรายจ่าย" backHref="/expenses" />
      <ExpenseForm initial={expense} />
    </div>
  );
}
