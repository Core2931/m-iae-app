import type { SettlementResult, AppConfig } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface SettlementCardProps {
  settlement: SettlementResult;
  config: AppConfig;
  compact?: boolean;
}

export default function SettlementCard({ settlement, config, compact }: SettlementCardProps) {
  const { direction, netAmount, totalExpenses, expenseCount } = settlement;

  const colorClass =
    direction === "settled"
      ? "from-emerald-500/40 to-teal-500/40 border-emerald-300/30"
      : direction === "me_owes"
      ? "from-rose-500/40 to-pink-500/40 border-rose-300/30"
      : "from-blue-500/40 to-violet-500/40 border-blue-300/30";

  const headline =
    direction === "settled"
      ? "เสมอกัน! 🎉"
      : direction === "me_owes"
      ? `${config.myName}ต้องจ่าย ${config.partnerName}`
      : `${config.partnerName}ต้องจ่าย ${config.myName}`;

  return (
    <div
      className={cn(
        "rounded-3xl p-5 bg-gradient-to-br border backdrop-blur-2xl",
        colorClass
      )}
    >
      <p className="text-white/70 text-sm mb-1">{headline}</p>
      <p className="text-white font-bold text-4xl mb-3">
        {direction === "settled" ? "✓" : formatCurrency(netAmount)}
      </p>
      {!compact && (
        <p className="text-white/60 text-xs">
          {expenseCount} รายการ · รวม {formatCurrency(totalExpenses)}
        </p>
      )}
    </div>
  );
}
