"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import { useAppDispatch } from "@/lib/hooks";
import { authLogout } from "@/redux/slice/authSlice";
import {
  LayoutGrid,
  Package,
  PlusCircle,
  ListChecks,
  UserRound,
  KeyRound,
  LogOut,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutGrid }],
  },
  {
    label: "Product",
    items: [
      { label: "All Products", href: "/dashboard/products", icon: Package },
      { label: "Add Product", href: "/dashboard/products/add", icon: PlusCircle },
      { label: "My Products", href: "/dashboard/products/my", icon: ListChecks },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/dashboard/profile", icon: UserRound },
      { label: "Change Password", href: "/dashboard/change-password", icon: KeyRound },
    ],
  },
];

export default function Sidebar() {
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
    <aside className="hidden lg:flex w-[248px] shrink-0 flex-col bg-ink text-ivory h-screen sticky top-0">
      <div className="px-6 pt-7 pb-6">
        <Logo variant="light" />
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-3 mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ivory/35">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                      active
                        ? "bg-ivory/[0.08] text-brass"
                        : "text-ivory/65 hover:text-ivory hover:bg-ivory/[0.05]"
                    )}
                  >
                    <Icon size={17} strokeWidth={2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 pb-6 pt-2 border-t border-ivory/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13.5px] font-medium text-ivory/65 hover:text-ivory hover:bg-ivory/[0.05] transition-colors cursor-pointer"
        >
          <LogOut size={17} strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  );
}
