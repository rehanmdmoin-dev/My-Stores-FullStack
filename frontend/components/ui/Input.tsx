"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-semibold uppercase tracking-wide text-slate"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={isPassword ? (show ? "text" : "password") : type}
            className={cn(
              "w-full h-11 rounded-[var(--radius-control)] border bg-paper px-3.5 text-[14.5px] text-ink placeholder:text-slate-light transition-colors",
              "border-line focus:border-brass",
              error && "border-danger focus:border-danger",
              isPassword && "pr-11",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light hover:text-slate text-xs font-medium"
            >
              {show ? "Hide" : "Show"}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-light">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
