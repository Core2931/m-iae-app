import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense, ExpenseSplit, GroupMember, StorageAdapter } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";

type ExpenseRow = {
  id: string;
  description: string;
  amount: number;
  category: string;
  paid_by_user_id: string;
  splits: { userId: string; amount: number }[];
  date: string;
  note: string | null;
  created_at: string;
  group_id: string;
};

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category as Expense["category"],
    paidByUserId: row.paid_by_user_id,
    splits: (row.splits ?? []) as ExpenseSplit[],
    date: row.date,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

function expenseToRow(e: Expense, groupId: string): ExpenseRow {
  return {
    id: e.id,
    description: e.description,
    amount: e.amount,
    category: e.category,
    paid_by_user_id: e.paidByUserId,
    splits: e.splits,
    date: e.date,
    note: e.note ?? null,
    created_at: e.createdAt,
    group_id: groupId,
  };
}

export class SupabaseAdapter implements StorageAdapter {
  groupId: string | null = null;
  currentUserId: string | null = null;

  private get client(): SupabaseClient {
    return getSupabaseClient();
  }

  async getExpenses(): Promise<Expense[]> {
    if (!this.groupId) return [];
    const { data, error } = await this.client
      .from("expenses")
      .select("*")
      .eq("group_id", this.groupId)
      .order("date", { ascending: false });
    if (error) throw error;
    return (data as ExpenseRow[]).map(rowToExpense);
  }

  async addExpense(expense: Expense): Promise<void> {
    if (!this.groupId) throw new Error("groupId not set");
    const { error } = await this.client
      .from("expenses")
      .insert(expenseToRow(expense, this.groupId));
    if (error) throw error;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: Record<string, any> = {};
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.amount !== undefined) row.amount = updates.amount;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.paidByUserId !== undefined) row.paid_by_user_id = updates.paidByUserId;
    if (updates.splits !== undefined) row.splits = updates.splits;
    if (updates.date !== undefined) row.date = updates.date;
    if (updates.note !== undefined) row.note = updates.note ?? null;

    const { error } = await this.client.from("expenses").update(row).eq("id", id);
    if (error) throw error;
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await this.client.from("expenses").delete().eq("id", id);
    if (error) throw error;
  }

  async getGroupInfo(): Promise<{ name: string; members: GroupMember[] }> {
    if (!this.groupId) return { name: "", members: [] };
    const [groupRes, membersRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.client as any).from("groups").select("name").eq("id", this.groupId).single(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.client as any)
        .from("group_members")
        .select("user_id, display_name")
        .eq("group_id", this.groupId),
    ]);
    return {
      name: groupRes.data?.name ?? "",
      members: ((membersRes.data ?? []) as { user_id: string; display_name: string }[]).map(
        (r) => ({ userId: r.user_id, displayName: r.display_name })
      ),
    };
  }

  async saveGroupName(name: string): Promise<void> {
    if (!this.groupId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.client as any)
      .from("groups")
      .update({ name })
      .eq("id", this.groupId);
    if (error) throw error;
  }

  async updateMyDisplayName(name: string): Promise<void> {
    if (!this.groupId || !this.currentUserId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.client as any)
      .from("group_members")
      .update({ display_name: name })
      .eq("group_id", this.groupId)
      .eq("user_id", this.currentUserId);
    if (error) throw error;
  }
}
