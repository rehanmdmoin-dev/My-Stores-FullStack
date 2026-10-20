"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductThumb({
  src,
  alt,
  size = "md",
}: {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}) {
  const [error, setError] = useState(false);
  const dims = { sm: "h-10 w-10", md: "h-12 w-12", lg: "h-20 w-20" }[size];

  if (!src || error) {
    return (
      <div
        className={cn(
          dims,
          "flex items-center justify-center rounded-[10px] bg-line-soft text-slate-light shrink-0"
        )}
      >
        <ImageOff size={16} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn(dims, "rounded-[10px] object-cover border border-line shrink-0")}
    />
  );
}
