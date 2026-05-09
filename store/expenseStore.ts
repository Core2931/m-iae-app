"use client";

import { create } from "zustand";
import type { AppConfig, Expense } from "@/types";
import { storage } from "@/lib/storage";
import { SupabaseAdapter } from "@/lib/storage/supabaseAdapter";
import { DEFAULT_CONFIG } from "@/lib/constants";

interface ExpenseStore {
  expenses: Expense[];
  config: AppConfig;
  isLoaded: boolean;
  coupleId: string | null;
  inviteCode: string | null;
  coupleChecked: boolean;
  setCouple(id: string, inviteCode: string): void;
  clearCouple(): void;
  resetStore(): void;
  load(): Promise<void>;
  addExpense(data: Omit<Expense, "id" | "createdAt">): Promise<void>;
  updateExpense(id: string, updates: Partial<Expense>): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  saveConfig(config: AppConfig): Promise<void>;
}

const adapter = storage as SupabaseAdapter;

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  config: DEFAULT_CONFIG,
  isLoaded: false,
  coupleId: null,
  inviteCode: null,
  coupleChecked: false,

  setCouple(id, inviteCode) {
    adapter.coupleId = id;
    set({ coupleId: id, inviteCode, coupleChecked: true, isLoaded: false, expenses: [], config: DEFAULT_CONFIG });
  },

  clearCouple() {
    adapter.coupleId = null;
    set({ coupleId: null, inviteCode: null, coupleChecked: true, isLoaded: false, expenses: [], config: DEFAULT_CONFIG });
  },

  resetStore() {
    adapter.coupleId = null;
    set({ coupleId: null, inviteCode: null, coupleChecked: false, isLoaded: false, expenses: [], config: DEFAULT_CONFIG });
  },

  async load() {
    if (!adapter.coupleId) return;
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
    set((s) => ({ expenses: [expense, ...s.expenses] }));
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
