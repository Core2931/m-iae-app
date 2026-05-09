"use client";

import { useMemo } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { calculateSettlement } from "@/lib/settlement";

export function useSettlement() {
  const { expenses, config } = useExpenseStore();
  const settlement = useMemo(() => calculateSettlement(expenses), [expenses]);
  return { settlement, config };
}
