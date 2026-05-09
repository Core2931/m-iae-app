import type { AppConfig, Expense, StorageAdapter } from "@/types";
import { DEFAULT_CONFIG } from "@/lib/constants";

const KEYS = {
  expenses: "miae_expenses",
  config: "miae_config",
} as const;

export class LocalStorageAdapter implements StorageAdapter {
  async getExpenses(): Promise<Expense[]> {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEYS.expenses);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  }

  async addExpense(expense: Expense): Promise<void> {
    const current = await this.getExpenses();
    localStorage.setItem(KEYS.expenses, JSON.stringify([...current, expense]));
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    const current = await this.getExpenses();
    const updated = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
    localStorage.setItem(KEYS.expenses, JSON.stringify(updated));
  }

  async deleteExpense(id: string): Promise<void> {
    const current = await this.getExpenses();
    localStorage.setItem(
      KEYS.expenses,
      JSON.stringify(current.filter((e) => e.id !== id))
    );
  }

  async getConfig(): Promise<AppConfig> {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    const raw = localStorage.getItem(KEYS.config);
    return raw ? (JSON.parse(raw) as AppConfig) : DEFAULT_CONFIG;
  }

  async saveConfig(config: AppConfig): Promise<void> {
    localStorage.setItem(KEYS.config, JSON.stringify(config));
  }
}
