import type { Category } from "@/types";

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "food", label: "อาหาร", emoji: "🍜" },
  { value: "transport", label: "เดินทาง", emoji: "🚗" },
  { value: "shopping", label: "ช้อปปิ้ง", emoji: "🛍️" },
  { value: "entertainment", label: "บันเทิง", emoji: "🎬" },
  { value: "utilities", label: "สาธารณูปโภค", emoji: "💡" },
  { value: "other", label: "อื่นๆ", emoji: "📦" },
];
