"use client";

import { useMemo } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { calculateSettlement } from "@/lib/settlement";

export function useSettlement() {
  const { expenses, members, groupName } = useExpenseStore();
  const settlement = useMemo(
    () => calculateSettlement(expenses, members),
    [expenses, members]
  );
  return { settlement, groupName, members };
}
