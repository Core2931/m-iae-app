import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppConfig, Expense, StorageAdapter } from "@/types";
import { DEFAULT_CONFIG } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase";

type ExpenseRow = {
  id: string;
  description: string;
  amount: number;
  category: string;
  paid_by: string;
  split_me: number;
  split_partner: number;
  date: string;
  note: string | null;
  created_at: string;
  couple_id: string;
};

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category as Expense["category"],
    paidBy: row.paid_by as Expense["paidBy"],
    splitRatio: { me: row.split_me, partner: row.split_partner },
    date: row.date,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

function expenseToRow(e: Expense, coupleId: string): Omit<ExpenseRow, never> {
  return {
    id: e.id,
    description: e.description,
    amount: e.amount,
    category: e.category,
    paid_by: e.paidBy,
    split_me: e.splitRatio.me,
    split_partner: e.splitRatio.partner,
    date: e.date,
    note: e.note ?? null,
    created_at: e.createdAt,
    couple_id: coupleId,
  };
}

export class SupabaseAdapter implements StorageAdapter {
  coupleId: string | null = null;

  private get client(): SupabaseClient {
    return getSupabaseClient();
  }

  async getExpenses(): Promise<Expense[]> {
    if (!this.coupleId) return [];
    const { data, error } = await this.client
      .from("expenses")
      .select("*")
      .eq("couple_id", this.coupleId)
      .order("date", { ascending: false });
    if (error) throw error;
    return (data as ExpenseRow[]).map(rowToExpense);
  }

  async addExpense(expense: Expense): Promise<void> {
    if (!this.coupleId) throw new Error("coupleId not set");
    const { error } = await this.client
      .from("expenses")
      .insert(expenseToRow(expense, this.coupleId));
    if (error) throw error;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    const row: Partial<Omit<ExpenseRow, "couple_id">> = {};
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.amount !== undefined) row.amount = updates.amount;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.paidBy !== undefined) row.paid_by = updates.paidBy;
    if (updates.splitRatio !== undefined) {
      row.split_me = updates.splitRatio.me;
      row.split_partner = updates.splitRatio.partner;
    }
    if (updates.date !== undefined) row.date = updates.date;
    if (updates.note !== undefined) row.note = updates.note ?? null;

    const { error } = await this.client.from("expenses").update(row).eq("id", id);
    if (error) throw error;
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await this.client.from("expenses").delete().eq("id", id);
    if (error) throw error;
  }

  async getConfig(): Promise<AppConfig> {
    if (!this.coupleId) return DEFAULT_CONFIG;
    const { data, error } = await this.client
      .from("couples")
      .select("my_name, partner_name")
      .eq("id", this.coupleId)
      .single();
    if (error || !data) return DEFAULT_CONFIG;
    return {
      myName: data.my_name,
      partnerName: data.partner_name,
      currency: "THB",
      defaultSplit: { me: 50, partner: 50 },
    };
  }

  async saveConfig(config: AppConfig): Promise<void> {
    if (!this.coupleId) return;
    const { error } = await this.client
      .from("couples")
      .update({ my_name: config.myName, partner_name: config.partnerName })
      .eq("id", this.coupleId);
    if (error) throw error;
  }
}
