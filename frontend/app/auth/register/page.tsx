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
import { authRegister } from "@/redux/slice/authSlice";

const schema = yup.object({
  name: yup.string().trim().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9]{10,15}$/, "Phone must be 10–15 digits")
    .required("Phone number is required"),
  password: yup
    .string()
    .min(6, "At least 6 characters")
    .max(128, "Too long")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

type FormValues = yup.InferType<typeof schema>;

export default function RegisterPage() {
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
      await dispatch(authRegister(data)).unwrap();
      router.push(`/auth/otp?email=${encodeURIComponent(data.email)}`);
    } catch {
      // toast already shown by the slice
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Open your ledger"
      subtitle="Set up your account to start listing products."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-ink hover:text-brass-deep">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Full name" placeholder="Rahul Verma" {...register("name")} error={errors.name?.message} />
        <Input label="Email address" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
        <Input label="Phone number" placeholder="9876543210" {...register("phone")} error={errors.phone?.message} />
        <Input label="Password" type="password" placeholder="Create a password" {...register("password")} error={errors.password?.message} />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
