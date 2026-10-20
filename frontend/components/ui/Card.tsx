import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-paper border border-line rounded-[var(--radius-card)] shadow-[var(--shadow-card)]",
        className
      )}
      {...props}
    />
  );
}
