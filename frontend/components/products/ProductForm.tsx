"use client";

import { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAppDispatch } from "@/lib/hooks";
import { createProduct, updateProduct, Product } from "@/redux/slice/productSlice";
import { UploadCloud } from "lucide-react";

const schema = yup.object({
  productName: yup.string().trim().required("Product name is required"),
  desc: yup.string().trim().required("Description is required"),
  productPrice: yup
    .number()
    .typeError("Enter a valid price")
    .positive("Price must be greater than 0")
    .required("Price is required"),
  brand: yup.string().trim().required("Brand / category is required"),
  stock: yup
    .number()
    .typeError("Enter a valid stock count")
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),
  size: yup.string().trim(),
  color: yup.string().trim(),
});

type FormValues = yup.InferType<typeof schema>;

export default function ProductForm({ product }: { product?: Product }) {
  const isEdit = !!product;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.image || null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: product
      ? {
          productName: product.productName,
          desc: product.desc,
          productPrice: product.productPrice,
          brand: product.brand,
          stock: product.stock,
          size: product.size?.join(", ") || "",
          color: product.color?.join(", ") || "",
        }
      : { stock: 0 },
  });

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose a valid image file");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    const payload = {
      productName: data.productName,
      desc: data.desc,
      productPrice: data.productPrice,
      brand: data.brand,
      stock: data.stock,
      size: data.size ? data.size.split(",").map((s) => s.trim()).filter(Boolean) : [],
      color: data.color ? data.color.split(",").map((s) => s.trim()).filter(Boolean) : [],
      image: file,
    };

    try {
      if (isEdit && product) {
        await dispatch(updateProduct({ id: product._id, data: payload })).unwrap();
      } else {
        await dispatch(createProduct(payload)).unwrap();
      }
      router.push("/dashboard/products/my");
    } catch {
      // toast already shown by the slice
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-[1fr_320px] gap-6">
      <Card className="p-6 flex flex-col gap-5">
        <Input label="Product name" placeholder="Enter product name" {...register("productName")} error={errors.productName?.message} />
        <Textarea label="Description" placeholder="Enter product description" {...register("desc")} error={errors.desc?.message} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Price ($)" type="number" step="0.01" placeholder="0.00" {...register("productPrice")} error={errors.productPrice?.message} />
          <Input label="Brand / Category" placeholder="e.g. Footwear" {...register("brand")} error={errors.brand?.message} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Size" placeholder="S, M, L, XL" hint="Comma-separated" {...register("size")} error={errors.size?.message} />
          <Input label="Color" placeholder="Black, White" hint="Comma-separated" {...register("color")} error={errors.color?.message} />
        </div>

        <Input label="Stock" type="number" placeholder="0" {...register("stock")} error={errors.stock?.message} />
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate mb-3">Product Image</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-square rounded-[var(--radius-control)] border-2 border-dashed border-line hover:border-brass bg-line-soft/40 flex flex-col items-center justify-center gap-2 text-slate transition-colors overflow-hidden cursor-pointer"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <UploadCloud size={26} />
                <span className="text-[13px] font-medium">Upload image</span>
                <span className="text-[11px] text-slate-light">PNG, JPG up to 2MB</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
        </Card>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {isEdit ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
