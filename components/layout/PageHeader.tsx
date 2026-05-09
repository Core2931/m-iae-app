import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, backHref, action, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between pt-12 pb-4", className)}>
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="text-white/70 hover:text-white text-xl transition-colors"
          >
            ←
          </Link>
        )}
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
