import type { Expense, GroupMember } from "@/types";
import ExpenseItem from "./ExpenseItem";

interface ExpenseListProps {
  expenses: Expense[];
  members: GroupMember[];
  emptyMessage?: string;
  limit?: number;
}

export default function ExpenseList({
  expenses,
  members,
  emptyMessage = "ยังไม่มีรายจ่าย",
  limit,
}: ExpenseListProps) {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const displayed = limit ? sorted.slice(0, limit) : sorted;

  if (displayed.length === 0) {
    return (
      <div className="text-center text-white/50 py-10 text-sm">{emptyMessage}</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {displayed.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} members={members} />
      ))}
    </div>
  );
}
