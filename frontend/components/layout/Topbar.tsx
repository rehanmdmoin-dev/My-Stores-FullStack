"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { authLogout } from "@/redux/slice/authSlice";
import { initials } from "@/lib/utils";
import { ChevronDown, UserRound, KeyRound, LogOut } from "lucide-react";

export default function Topbar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(authLogout()).unwrap();
    } catch {
      // ignore logout errors and still route to login
    }
    router.replace("/auth/login");
  };

  return (
    <header className="flex items-center justify-between gap-4 px-6 lg:px-10 py-6 border-b border-line bg-ivory">
      <div>
        <h1 className="font-display text-[26px] font-medium text-ink leading-tight">
          {title}
        </h1>
        {subtitle && <p className="text-[14px] text-slate mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-full pl-1 pr-2.5 py-1 border border-line bg-paper hover:border-brass transition-colors cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-soft text-brass-deep text-[12px] font-semibold font-mono">
              {user ? initials(user.name) : "—"}
            </span>
            <span className="hidden sm:block text-[13.5px] font-medium text-ink">
              {user?.name || "Account"}
            </span>
            <ChevronDown size={15} className="text-slate-light" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-[var(--radius-card)] border border-line bg-paper shadow-[var(--shadow-card-hover)] overflow-hidden z-20">
              <div className="px-4 py-3 border-b border-line-soft">
                <p className="text-[13.5px] font-medium text-ink truncate">{user?.name}</p>
                <p className="text-[12px] text-slate truncate">{user?.email}</p>
              </div>
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-ink hover:bg-line-soft transition-colors"
              >
                <UserRound size={16} /> Profile
              </Link>
              <Link
                href="/dashboard/change-password"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-ink hover:bg-line-soft transition-colors"
              >
                <KeyRound size={16} /> Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-danger hover:bg-danger-soft transition-colors cursor-pointer"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
