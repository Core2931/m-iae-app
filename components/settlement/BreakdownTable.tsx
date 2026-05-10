import type { SettlementResult } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import GlassCard from "@/components/ui/GlassCard";

interface BreakdownTableProps {
  settlement: SettlementResult;
}

export default function BreakdownTable({ settlement }: BreakdownTableProps) {
  const { memberBalances } = settlement;

  return (
    <GlassCard className="overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/15">
            <th className="text-left text-white/60 font-medium px-4 py-3">สมาชิก</th>
            <th className="text-right text-white/60 font-medium px-3 py-3">จ่ายไป</th>
            <th className="text-right text-white/60 font-medium px-3 py-3">ควรจ่าย</th>
            <th className="text-right text-white font-semibold px-4 py-3">ยอดสุทธิ</th>
          </tr>
        </thead>
        <tbody>
          {memberBalances.map((m) => (
            <tr key={m.userId} className="border-b border-white/10 last:border-0">
              <td className="text-white px-4 py-3 font-medium">{m.displayName}</td>
              <td className="text-right text-white/80 px-3 py-3">
                {formatCurrency(m.totalPaid)}
              </td>
              <td className="text-right text-white/80 px-3 py-3">
                {formatCurrency(m.totalOwed)}
              </td>
              <td
                className={`text-right px-4 py-3 font-semibold ${
                  m.net > 0.01
                    ? "text-emerald-300"
                    : m.net < -0.01
                    ? "text-rose-300"
                    : "text-white/60"
                }`}
              >
                {m.net > 0.01 ? "+" : ""}
                {formatCurrency(m.net)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
