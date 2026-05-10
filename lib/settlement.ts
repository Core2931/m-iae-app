import type { Expense, GroupMember, MemberBalance, SettlementResult, SettlementTransaction } from "@/types";

export function calculateSettlement(expenses: Expense[], members: GroupMember[]): SettlementResult {
  const balance: Record<string, number> = {};
  members.forEach((m) => { balance[m.userId] = 0; });

  let totalExpenses = 0;
  for (const expense of expenses) {
    totalExpenses += expense.amount;
    balance[expense.paidByUserId] = (balance[expense.paidByUserId] ?? 0) + expense.amount;
    for (const split of expense.splits) {
      balance[split.userId] = (balance[split.userId] ?? 0) - split.amount;
    }
  }

  const memberBalances: MemberBalance[] = members.map((m) => {
    const net = balance[m.userId] ?? 0;
    const totalPaid = expenses
      .filter((e) => e.paidByUserId === m.userId)
      .reduce((s, e) => s + e.amount, 0);
    const totalOwed = expenses.reduce(
      (s, e) => s + (e.splits.find((sp) => sp.userId === m.userId)?.amount ?? 0),
      0
    );
    return { userId: m.userId, displayName: m.displayName, totalPaid, totalOwed, net };
  });

  // Greedy debt simplification — minimizes transaction count
  const creditors = memberBalances
    .filter((m) => m.net > 0.01)
    .map((m) => ({ id: m.userId, name: m.displayName, amt: m.net }))
    .sort((a, b) => b.amt - a.amt);
  const debtors = memberBalances
    .filter((m) => m.net < -0.01)
    .map((m) => ({ id: m.userId, name: m.displayName, amt: -m.net }))
    .sort((a, b) => b.amt - a.amt);

  const transactions: SettlementTransaction[] = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const transfer = Math.min(creditors[ci].amt, debtors[di].amt);
    if (transfer > 0.01) {
      transactions.push({
        fromUserId: debtors[di].id,
        fromName: debtors[di].name,
        toUserId: creditors[ci].id,
        toName: creditors[ci].name,
        amount: Math.round(transfer * 100) / 100,
      });
    }
    creditors[ci].amt -= transfer;
    debtors[di].amt -= transfer;
    if (creditors[ci].amt < 0.01) ci++;
    if (debtors[di].amt < 0.01) di++;
  }

  return { totalExpenses, memberBalances, transactions, expenseCount: expenses.length };
}
