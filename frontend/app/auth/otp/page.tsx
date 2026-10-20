"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { verifyOtp } from "@/redux/slice/authSlice";
import { toast } from "sonner";

const OTP_LENGTH = 4; // backend generates a 4-digit OTP: Math.floor(1000 + Math.random() * 9000)

function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Enter all ${OTP_LENGTH} digits`);
      return;
    }
    if (!email) {
      toast.error("Missing email — please register again");
      return;
    }
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
      router.push("/auth/login");
    } catch {
      // toast already shown by the slice
    }
  };

  return (
    <AuthShell
      eyebrow="Verify email"
      title="Check your inbox"
      subtitle={
        email
          ? `Enter the code we sent to ${email}`
          : "Enter the verification code sent to your email"
      }
      footer={
        <Link href="/auth/login" className="font-semibold text-ink hover:text-brass-deep">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex justify-between gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-14 rounded-[var(--radius-control)] border border-line bg-paper text-center text-xl font-mono font-medium text-ink focus:border-brass"
            />
          ))}
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Verify code
        </Button>
      </form>
    </AuthShell>
  );
}

export default function OtpPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}
