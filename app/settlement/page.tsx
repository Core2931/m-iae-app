"use client";

import { useExpenses } from "@/hooks/useExpenses";
import { useSettlement } from "@/hooks/useSettlement";
import PageHeader from "@/components/layout/PageHeader";
import SettlementCard from "@/components/settlement/SettlementCard";
import BreakdownTable from "@/components/settlement/BreakdownTable";
import ExportMenu from "@/components/settlement/ExportMenu";

export default function SettlementPage() {
  const { expenses, isLoaded } = useExpenses();
  const { settlement, groupName, members } = useSettlement();

  if (!isLoaded) {
    return <p className="text-white/60 text-center pt-20">กำลังโหลด...</p>;
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="สรุปยอด" />
        <p className="text-white/60 text-center pt-10">ยังไม่มีรายจ่าย</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="สรุปยอด" />
      <SettlementCard settlement={settlement} groupName={groupName} />
      <BreakdownTable settlement={settlement} />
      <ExportMenu settlement={settlement} expenses={expenses} members={members} groupName={groupName} />
    </div>
  );
}
