"use client";

import { useEffect } from "react";
import { useExpenseStore } from "@/store/expenseStore";

export function useExpenses() {
  const {
    expenses,
    members,
    groupName,
    currentUserId,
    isLoaded,
    load,
    addExpense,
    updateExpense,
    deleteExpense,
    saveGroupName,
    updateMyDisplayName,
  } = useExpenseStore();

  useEffect(() => {
    if (!isLoaded) load();
  }, [isLoaded, load]);

  return {
    expenses,
    members,
    groupName,
    currentUserId,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    saveGroupName,
    updateMyDisplayName,
  };
}
