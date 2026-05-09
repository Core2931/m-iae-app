import type { Expense, SettlementResult } from "@/types";

export function calculateSettlement(expenses: Expense[]): SettlementResult {
  let meActuallyPaid = 0;
  let partnerActuallyPaid = 0;
  let meShouldPay = 0;
  let partnerShouldPay = 0;

  for (const expense of expenses) {
    const { amount, paidBy, splitRatio } = expense;
    if (paidBy === "me") meActuallyPaid += amount;
    else partnerActuallyPaid += amount;
    meShouldPay += (amount * splitRatio.me) / 100;
    partnerShouldPay += (amount * splitRatio.partner) / 100;
  }

  // positive → I overpaid → partner owes me
  // negative → I underpaid → I owe partner
  const net = meActuallyPaid - meShouldPay;

  return {
    totalExpenses: meActuallyPaid + partnerActuallyPaid,
    meActuallyPaid,
    partnerActuallyPaid,
    meShouldPay,
    partnerShouldPay,
    netAmount: Math.abs(net),
    direction: net > 0.01 ? "partner_owes" : net < -0.01 ? "me_owes" : "settled",
    expenseCount: expenses.length,
  };
}
