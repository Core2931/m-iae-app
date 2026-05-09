export type Category =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "utilities"
  | "other";

export type Payer = "me" | "partner";

export interface SplitRatio {
  me: number;
  partner: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  paidBy: Payer;
  splitRatio: SplitRatio;
  date: string;
  note?: string;
  createdAt: string;
}

export interface SettlementResult {
  totalExpenses: number;
  meActuallyPaid: number;
  partnerActuallyPaid: number;
  meShouldPay: number;
  partnerShouldPay: number;
  netAmount: number;
  direction: "me_owes" | "partner_owes" | "settled";
  expenseCount: number;
}

export interface AppConfig {
  myName: string;
  partnerName: string;
  currency: string;
  defaultSplit: SplitRatio;
}

export interface Couple {
  id: string;
  inviteCode: string;
  myName: string;
  partnerName: string;
}

export interface StorageAdapter {
  getExpenses(): Promise<Expense[]>;
  addExpense(expense: Expense): Promise<void>;
  updateExpense(id: string, updates: Partial<Expense>): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  getConfig(): Promise<AppConfig>;
  saveConfig(config: AppConfig): Promise<void>;
}
