"use client";

import { useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { requestPasswordReset } from "@/redux/slice/authSlice";

const schema = yup.object({
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
});
type FormValues = yup.InferType<typeof schema>;

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(requestPasswordReset(data)).unwrap();
      setSent(true);
    } catch {
      // toast already shown by the slice
    }
  };

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={
        <Link href="/auth/login" className="font-semibold text-ink hover:text-brass-deep">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-[var(--radius-control)] border border-success/20 bg-success-soft px-4 py-3.5 text-[14px] text-success">
          Check your inbox — a reset link is on its way.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email address" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
          <Button type="submit" size="lg" fullWidth loading={loading} className="mt-1">
            Send reset link
          </Button>
          
        </form>
      )}

      

      
    </AuthShell>

    
  );
}
