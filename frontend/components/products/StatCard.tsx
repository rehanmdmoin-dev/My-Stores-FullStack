import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export default function StatCard({
  index,
  label,
  value,
  icon: Icon,
  tone = "ink",
}: {
  index: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "ink" | "success" | "danger" | "brass";
}) {
  const toneClasses = {
    ink: "text-ink bg-line-soft",
    success: "text-success bg-success-soft",
    danger: "text-danger bg-danger-soft",
    brass: "text-brass-deep bg-brass-soft",
  }[tone];

  return (
    <div className="relative bg-paper border border-line rounded-[var(--radius-card)] shadow-[var(--shadow-card)] px-5 pt-4 pb-5 overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-[10px] text-slate-light">{index}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-[8px]", toneClasses)}>
          <Icon size={16} strokeWidth={2} />
        </span>
      </div>
      <p className="font-mono text-[28px] font-medium text-ink leading-none mb-1.5">{value}</p>
      <p className="text-[12.5px] text-slate">{label}</p>
    </div>
  );
}
