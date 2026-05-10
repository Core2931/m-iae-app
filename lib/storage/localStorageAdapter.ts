import type { Expense, GroupMember, StorageAdapter } from "@/types";

const KEYS = {
  expenses: "miae_expenses",
} as const;

// Stub implementation — not used in production (SupabaseAdapter is active)
// Kept for local testing fallback only
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
    localStorage.setItem(KEYS.expenses, JSON.stringify(current.filter((e) => e.id !== id)));
  }

  async getGroupInfo(): Promise<{ name: string; members: GroupMember[] }> {
    return { name: "Local", members: [] };
  }

  async saveGroupName(_name: string): Promise<void> {}

  async updateMyDisplayName(_name: string): Promise<void> {}
}
