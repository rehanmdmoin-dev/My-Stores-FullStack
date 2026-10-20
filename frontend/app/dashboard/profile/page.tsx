"use client";

import { useEffect } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateProfile } from "@/redux/slice/authSlice";
import { initials } from "@/lib/utils";

const schema = yup.object({
  name: yup.string().trim().min(2, "At least 2 characters").required("Name is required"),
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9]{10,15}$/, "Phone must be 10–15 digits")
    .required("Phone number is required"),
});
type FormValues = yup.InferType<typeof schema>;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email, phone: user.phone });
    }
  }, [user, reset]);

  const onSubmit = (data: FormValues) => {
    dispatch(updateProfile(data));
  };

  return (
    <>
      <Topbar title="Profile" subtitle="View and manage your account information." />
      <div className="px-6 lg:px-10 py-8 max-w-2xl">
        <Card className="p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-8">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brass-soft text-brass-deep text-[20px] font-semibold font-mono">
              {user ? initials(user.name) : "—"}
            </span>
            <div>
              <p className="font-display text-[20px] font-medium text-ink">{user?.name}</p>
              <p className="text-[13.5px] text-slate">{user?.role === "admin" ? "Administrator" : "Store owner"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Full name" {...register("name")} error={errors.name?.message} />
            <Input label="Email address" {...register("email")} error={errors.email?.message} />
            <Input label="Phone number" {...register("phone")} error={errors.phone?.message} />
            <div className="mt-2">
              <Button type="submit" loading={loading}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
