import type { Category } from "@/types";
import { CATEGORIES } from "@/lib/constants";

interface CategoryIconProps {
  category: Category;
  size?: "sm" | "md";
}

export default function CategoryIcon({ category, size = "md" }: CategoryIconProps) {
  const cat = CATEGORIES.find((c) => c.value === category);
  const emoji = cat?.emoji ?? "📦";
  const sizeClass = size === "sm" ? "w-8 h-8 text-base" : "w-10 h-10 text-xl";

  return (
    <div
      className={`${sizeClass} rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center flex-shrink-0`}
    >
      {emoji}
    </div>
  );
}
