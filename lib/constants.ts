import type { AppConfig, Category } from "@/types";

export const DEFAULT_CONFIG: AppConfig = {
  myName: "ฉัน",
  partnerName: "แฟน",
  currency: "THB",
  defaultSplit: { me: 50, partner: 50 },
};

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "food", label: "อาหาร", emoji: "🍜" },
  { value: "transport", label: "เดินทาง", emoji: "🚗" },
  { value: "shopping", label: "ช้อปปิ้ง", emoji: "🛍️" },
  { value: "entertainment", label: "บันเทิง", emoji: "🎬" },
  { value: "utilities", label: "สาธารณูปโภค", emoji: "💡" },
  { value: "other", label: "อื่นๆ", emoji: "📦" },
];

export const SPLIT_PRESETS: { label: string; me: number; partner: number }[] = [
  { label: "50/50", me: 50, partner: 50 },
  { label: "60/40", me: 60, partner: 40 },
  { label: "40/60", me: 40, partner: 60 },
  { label: "ฉันจ่ายคนเดียว", me: 100, partner: 0 },
  { label: "แฟนจ่ายคนเดียว", me: 0, partner: 100 },
];
