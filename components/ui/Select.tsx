import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export default function Select({ label, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-white/70 text-sm font-medium">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "glass rounded-xl px-4 py-2.5 text-white text-sm outline-none",
          "focus:border-white/60 transition-colors appearance-none cursor-pointer",
          "bg-white/10",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-purple-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
