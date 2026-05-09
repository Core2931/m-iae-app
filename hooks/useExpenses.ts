"use client";

import { useEffect } from "react";
import { useExpenseStore } from "@/store/expenseStore";

export function useExpenses() {
  const { expenses, config, isLoaded, load, addExpense, updateExpense, deleteExpense } =
    useExpenseStore();

  useEffect(() => {
    if (!isLoaded) load();
  }, [isLoaded, load]);

  return { expenses, config, isLoaded, addExpense, updateExpense, deleteExpense };
}
