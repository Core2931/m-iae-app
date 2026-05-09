import PageHeader from "@/components/layout/PageHeader";
import ExpenseForm from "@/components/expenses/ExpenseForm";

export default function NewExpensePage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="เพิ่มรายจ่าย" backHref="/expenses" />
      <ExpenseForm />
    </div>
  );
}
