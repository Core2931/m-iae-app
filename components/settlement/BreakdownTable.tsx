import type { SettlementResult, AppConfig } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import GlassCard from "@/components/ui/GlassCard";

interface BreakdownTableProps {
  settlement: SettlementResult;
  config: AppConfig;
}

export default function BreakdownTable({ settlement, config }: BreakdownTableProps) {
  const { meActuallyPaid, partnerActuallyPaid, meShouldPay, partnerShouldPay } = settlement;

  const rows = [
    {
      label: "จ่ายไปแล้ว",
      me: meActuallyPaid,
      partner: partnerActuallyPaid,
    },
    {
      label: "ควรจ่าย (ตามส่วน)",
      me: meShouldPay,
      partner: partnerShouldPay,
    },
    {
      label: "ส่วนต่าง",
      me: meActuallyPaid - meShouldPay,
      partner: partnerActuallyPaid - partnerShouldPay,
      highlight: true,
    },
  ];

  return (
    <GlassCard className="overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/15">
            <th className="text-left text-white/60 font-medium px-4 py-3"></th>
            <th className="text-right text-white font-semibold px-4 py-3">{config.myName}</th>
            <th className="text-right text-white font-semibold px-4 py-3">{config.partnerName}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, me, partner, highlight }) => (
            <tr key={label} className="border-b border-white/10 last:border-0">
              <td className="text-white/60 px-4 py-3">{label}</td>
              <td
                className={`text-right px-4 py-3 font-medium ${
                  highlight
                    ? me >= 0
                      ? "text-emerald-300"
                      : "text-rose-300"
                    : "text-white"
                }`}
              >
                {me >= 0 ? "" : "-"}
                {formatCurrency(Math.abs(me))}
              </td>
              <td
                className={`text-right px-4 py-3 font-medium ${
                  highlight
                    ? partner >= 0
                      ? "text-emerald-300"
                      : "text-rose-300"
                    : "text-white"
                }`}
              >
                {partner >= 0 ? "" : "-"}
                {formatCurrency(Math.abs(partner))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
