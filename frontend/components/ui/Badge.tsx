import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "danger" | "brass" | "slate";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  brass: "bg-brass-soft text-brass-deep",
  slate: "bg-line-soft text-slate",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export default function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
