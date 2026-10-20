"use client";

import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { requestPasswordReset } from "@/redux/slice/authSlice";
import { Mail, ShieldCheck } from "lucide-react";

export default function ChangePasswordPage() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((s) => s.auth);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!user?.email) return;
    try {
      await dispatch(requestPasswordReset({ email: user.email })).unwrap();
      setSent(true);
    } catch {
      // toast already shown by the slice
    }
  };

  return (
    <>
      <Topbar title="Change Password" subtitle="Update your account password securely." />
      <div className="px-6 lg:px-10 py-8 max-w-xl">
        <Card className="p-6 lg:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-brass-soft text-brass-deep mb-5">
            <ShieldCheck size={20} />
          </div>
          <h2 className="font-display text-[20px] font-medium text-ink mb-2">
            Reset via email link
          </h2>
          <p className="text-[14px] text-slate leading-relaxed mb-6">
            For your security, password changes are confirmed by email. We&apos;ll
            send a reset link to <span className="font-medium text-ink">{user?.email}</span> —
            open it to set a new password.
          </p>

          {sent ? (
            <div className="rounded-[var(--radius-control)] border border-success/20 bg-success-soft px-4 py-3.5 text-[14px] text-success flex items-center gap-2">
              <Mail size={16} /> Reset link sent — check your inbox.
            </div>
          ) : (
            <Button onClick={handleSend} loading={loading}>
              <Mail size={16} /> Send reset link
            </Button>

            
          )}
        </Card>
      </div>
    </>
  );
}
