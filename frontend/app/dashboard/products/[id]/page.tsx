"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StockBadge from "@/components/products/StockBadge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts, deleteProduct } from "@/redux/slice/productSlice";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.product);
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch, products.length]);

  const product = products.find((p) => p._id === params.id);
  const isOwner = product && user && product.createdBy === user.id;

  const handleDelete = async () => {
    if (!product) return;
    await dispatch(deleteProduct(product._id));
    router.push("/dashboard/products/my");
  };

  return (
    <>
      <Topbar
        title="Product Details"
        actions={
          <Link href="/dashboard/products" className="text-[13px] font-medium text-slate hover:text-ink flex items-center gap-1.5">
            <ArrowLeft size={15} /> Back to products
          </Link>
        }
      />
      <div className="px-6 lg:px-10 py-8">
        {loading && !product ? (
          <p className="text-slate text-sm">Loading…</p>
        ) : !product ? (
          <p className="text-slate text-sm">Product not found.</p>
        ) : (
          <Card className="p-6 lg:p-8 grid lg:grid-cols-[380px_1fr] gap-8">
            <div className="aspect-square rounded-[var(--radius-control)] overflow-hidden bg-line-soft">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-light">No image</div>
              )}
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-brass-deep mb-2">
                {product.brand}
              </p>
              <h2 className="font-display text-[28px] font-medium text-ink mb-3">
                {product.productName}
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[24px] text-ink">{formatCurrency(product.productPrice)}</span>
                <StockBadge stock={product.stock} />
              </div>

              <p className="text-[14.5px] text-slate leading-relaxed mb-6">{product.desc}</p>

              {product.color?.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate mb-2">Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.color.map((c) => (
                      <Badge key={c} tone="slate">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.size?.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate mb-2">Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.size.map((s) => (
                      <Badge key={s} tone="slate">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[13px] text-slate-light font-mono mb-6">Stock: {product.stock} units</p>

              {isOwner && (
                <div className="flex gap-3">
                  <Link href={`/dashboard/products/${product._id}/edit`}>
                    <Button variant="secondary">
                      <Pencil size={15} /> Edit
                    </Button>
                  </Link>
                  <Button variant="danger" onClick={handleDelete}>
                    <Trash2 size={15} /> Delete
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
