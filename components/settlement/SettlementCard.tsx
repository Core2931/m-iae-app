import type { SettlementResult } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface SettlementCardProps {
  settlement: SettlementResult;
  groupName?: string;
  compact?: boolean;
}

export default function SettlementCard({ settlement, groupName, compact }: SettlementCardProps) {
  const { transactions, totalExpenses, expenseCount } = settlement;
  const isSettled = transactions.length === 0;

  return (
    <div
      className={cn(
        "rounded-3xl p-5 bg-gradient-to-br border backdrop-blur-2xl",
        isSettled
          ? "from-emerald-500/40 to-teal-500/40 border-emerald-300/30"
          : "from-blue-500/40 to-violet-500/40 border-blue-300/30"
      )}
    >
      {groupName && (
        <p className="text-white/60 text-xs mb-1">{groupName}</p>
      )}
      <p className="text-white/70 text-sm mb-3">
        {isSettled ? "ทุกคนเสมอกัน! 🎉" : "ต้องชำระ"}
      </p>

      {isSettled ? (
        <p className="text-white font-bold text-4xl">✓</p>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-white/90 text-sm">
                <span className="font-medium">{t.fromName}</span>
                <span className="text-white/60"> → </span>
                <span className="font-medium">{t.toName}</span>
              </span>
              <span className="text-white font-semibold text-sm">
                {formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {!compact && (
        <p className="text-white/60 text-xs mt-3">
          {expenseCount} รายการ · รวม {formatCurrency(totalExpenses)}
        </p>
      )}
    </div>
  );
}
