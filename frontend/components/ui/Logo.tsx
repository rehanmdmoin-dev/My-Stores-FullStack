import { cn } from "@/lib/utils";

export default function Logo({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const isLight = variant === "light";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-[8px] font-display text-[15px] font-semibold",
          isLight ? "bg-brass text-ink" : "bg-ink text-brass"
        )}
      >
        M
      </span>
      <span
        className={cn(
          "font-display text-[19px] font-medium tracking-tight",
          isLight ? "text-ivory" : "text-ink"
        )}
      >
        MyStore
      </span>
    </div>
  );
}
