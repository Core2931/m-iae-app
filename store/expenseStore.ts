"use client";

import { create } from "zustand";
import type { AppConfig, Expense } from "@/types";
import { storage } from "@/lib/storage";
import { DEFAULT_CONFIG } from "@/lib/constants";

interface ExpenseStore {
  expenses: Expense[];
  config: AppConfig;
  isLoaded: boolean;
  load(): Promise<void>;
  addExpense(data: Omit<Expense, "id" | "createdAt">): Promise<void>;
  updateExpense(id: string, updates: Partial<Expense>): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  saveConfig(config: AppConfig): Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  config: DEFAULT_CONFIG,
  isLoaded: false,

  async load() {
    const [expenses, config] = await Promise.all([
      storage.getExpenses(),
      storage.getConfig(),
    ]);
    set({ expenses, config, isLoaded: true });
  },

  async addExpense(data) {
    const expense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await storage.addExpense(expense);
    set((s) => ({ expenses: [...s.expenses, expense] }));
  },

  async updateExpense(id, updates) {
    await storage.updateExpense(id, updates);
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  async deleteExpense(id) {
    await storage.deleteExpense(id);
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
  },

  async saveConfig(config) {
    await storage.saveConfig(config);
    set({ config });
  },
}));
