"use client";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { authLogin } from "@/redux/slice/authSlice";

const schema = yup.object({
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "At least 6 characters").required("Password is required"),
});

type FormValues = yup.InferType<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(authLogin(data)).unwrap();
      router.push("/dashboard");
    } catch {
      // toast already shown by the slice
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Enter your details to access your dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-ink hover:text-brass-deep">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email address" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
        <div>
          <Input label="Password" type="password" placeholder="Enter your password" {...register("password")} error={errors.password?.message} />
          <div className="mt-2 text-right">
            <Link href="/auth/forgot-password" className="text-[13px] font-medium text-brass-deep hover:text-brass">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-1">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
