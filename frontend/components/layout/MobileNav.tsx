"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import { useAppDispatch } from "@/lib/hooks";
import { authLogout } from "@/redux/slice/authSlice";
import {
  Menu,
  X,
  LayoutGrid,
  Package,
  PlusCircle,
  ListChecks,
  UserRound,
  KeyRound,
  LogOut,
} from "lucide-react";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "All Products", href: "/dashboard/products", icon: Package },
  { label: "Add Product", href: "/dashboard/products/add", icon: PlusCircle },
  { label: "My Products", href: "/dashboard/products/my", icon: ListChecks },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  { label: "Change Password", href: "/dashboard/change-password", icon: KeyRound },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(authLogout()).unwrap();
    } catch {
      // ignore logout errors and still route to login
    }
    router.replace("/auth/login");
  };

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-ink text-ivory">
        <Logo variant="light" />
        <button onClick={() => setOpen(true)} className="p-1.5" aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-[280px] bg-ink text-ivory h-full flex flex-col p-5">
            <div className="flex items-center justify-between mb-8">
              <Logo variant="light" />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1">
              {items.map((item) => {
                const active =
                  item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[14px] font-medium",
                      active ? "bg-ivory/[0.08] text-brass" : "text-ivory/65"
                    )}
                  >
                    <Icon size={17} /> {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-ivory/65 border-t border-ivory/10 pt-4 mt-4"
            >
              <LogOut size={17} /> Logout
            </button>
          </div>
          <div className="flex-1 bg-ink/40" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
