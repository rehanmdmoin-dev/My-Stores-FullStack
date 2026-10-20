"use client";

import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchDashboard } from "@/redux/slice/authSlice";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchDashboard());
    }
  }, [dispatch, user]);

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <MobileNav />
        {children}
      </div>
    </div>
  );
}
