export type Category =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "utilities"
  | "other";

export interface GroupMember {
  userId: string;
  displayName: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  paidByUserId: string;
  splits: ExpenseSplit[];
  date: string;
  note?: string;
  createdAt: string;
}

export interface MemberBalance {
  userId: string;
  displayName: string;
  totalPaid: number;
  totalOwed: number;
  net: number;
}

export interface SettlementTransaction {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface SettlementResult {
  totalExpenses: number;
  memberBalances: MemberBalance[];
  transactions: SettlementTransaction[];
  expenseCount: number;
}

export interface StorageAdapter {
  getExpenses(): Promise<Expense[]>;
  addExpense(expense: Expense): Promise<void>;
  updateExpense(id: string, updates: Partial<Expense>): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  getGroupInfo(): Promise<{ name: string; members: GroupMember[] }>;
  saveGroupName(name: string): Promise<void>;
  updateMyDisplayName(name: string): Promise<void>;
}
