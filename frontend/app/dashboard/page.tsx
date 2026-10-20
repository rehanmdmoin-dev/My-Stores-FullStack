"use client";

import { useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatCard from "@/components/products/StatCard";
import ProductThumb from "@/components/products/ProductThumb";
import StockBadge from "@/components/products/StockBadge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts, deleteProduct } from "@/redux/slice/productSlice";
import { formatCurrency } from "@/lib/utils";
import { Package, Boxes, AlertTriangle, PlusCircle, Eye, Pencil, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.product);
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const total = products.length;
  const inStock = products.filter((p) => p.stock > 0).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  const recent = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const firstName = user?.name?.split(" ")[0];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={firstName ? `Welcome back, ${firstName}` : "Manage your products and grow your store."}
        actions={
          <Link href="/dashboard/products/add">
            <Button size="md">
              <PlusCircle size={16} /> Add Product
            </Button>
          </Link>
        }
      />

      <div className="px-6 lg:px-10 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard index="01" label="Total Products" value={total} icon={Package} tone="ink" />
          <StatCard index="02" label="In Stock" value={inStock} icon={Boxes} tone="success" />
          <StatCard index="03" label="Out of Stock" value={outOfStock} icon={AlertTriangle} tone="danger" />
          <StatCard index="04" label="Total Units" value={totalUnits} icon={Boxes} tone="brass" />
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-line-soft">
            <h2 className="font-display text-[18px] font-medium text-ink">Recent Products</h2>
            <Link href="/dashboard/products/my" className="text-[13px] font-medium text-brass-deep hover:text-brass">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-slate text-sm">Loading products…</div>
          ) : recent.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-ink font-medium mb-1">No products yet</p>
              <p className="text-slate text-[13.5px] mb-4">Add your first product to see it here.</p>
              <Link href="/dashboard/products/add">
                <Button size="sm">
                  <PlusCircle size={15} /> Add Product
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-light border-b border-line-soft">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p._id} className="border-b border-line-soft last:border-0 hover:bg-line-soft/40">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <ProductThumb src={p.image} alt={p.productName} size="sm" />
                        <div>
                          <p className="text-[13.5px] font-medium text-ink">{p.productName}</p>
                          <p className="text-[12px] text-slate-light">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[13.5px] text-ink">
                      {formatCurrency(p.productPrice)}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[13.5px] text-ink">{p.stock}</td>
                    <td className="px-6 py-3.5">
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/products/${p._id}`}
                          className="p-1.5 rounded-[6px] text-slate hover:text-ink hover:bg-line-soft"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/dashboard/products/${p._id}/edit`}
                          className="p-1.5 rounded-[6px] text-slate hover:text-ink hover:bg-line-soft"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => dispatch(deleteProduct(p._id))}
                          className="p-1.5 rounded-[6px] text-slate hover:text-danger hover:bg-danger-soft cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
