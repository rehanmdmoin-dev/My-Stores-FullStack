"use client";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { resetPassword } from "@/redux/slice/authSlice";

const schema = yup.object({
  password: yup.string().min(6, "At least 6 characters").required("New password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm your new password"),
});
type FormValues = yup.InferType<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ id: string; token: string }>();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(
        resetPassword({
          id: params.id,
          token: params.token,
          password: data.password,
          confirm_password: data.confirm_password,
        })
      ).unwrap();
      router.push("/auth/login");
    } catch {
      // toast already shown by the slice
    }
  };

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Set a new password"
      subtitle="Choose a new password for your account."
      footer={
        <Link href="/auth/login" className="font-semibold text-ink hover:text-brass-deep">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="New password"
          type="password"
          placeholder="Enter new password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          label="Confirm new password"
          type="password"
          placeholder="Repeat new password"
          {...register("confirm_password")}
          error={errors.confirm_password?.message}
        />
        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-1">
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}
