"use client";

import Topbar from "@/components/layout/Topbar";
import ProductForm from "@/components/products/ProductForm";

export default function AddProductPage() {
  return (
    <>
      <Topbar title="Add Product" subtitle="List a new product in your store." />
      <div className="px-6 lg:px-10 py-8">
        <ProductForm />
      </div>
    </>
  );
}
