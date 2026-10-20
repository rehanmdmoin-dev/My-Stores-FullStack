"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Topbar from "@/components/layout/Topbar";
import ProductForm from "@/components/products/ProductForm";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts } from "@/redux/slice/productSlice";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.product);

  useEffect(() => {
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch, products.length]);

  const product = products.find((p) => p._id === params.id);

  return (
    <>
      <Topbar title="Edit Product" subtitle="Update details for this product." />
      <div className="px-6 lg:px-10 py-8">
        {loading && !product ? (
          <p className="text-slate text-sm">Loading…</p>
        ) : !product ? (
          <p className="text-slate text-sm">Product not found.</p>
        ) : (
          <ProductForm product={product} />
        )}
      </div>
    </>
  );
}
