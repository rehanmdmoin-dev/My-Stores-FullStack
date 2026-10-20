"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProductThumb from "@/components/products/ProductThumb";
import StockBadge from "@/components/products/StockBadge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts, deleteProduct } from "@/redux/slice/productSlice";
import { formatCurrency } from "@/lib/utils";
import { Search, PlusCircle, Eye, Pencil, Trash2 } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "stock-asc", label: "Stock: Low to High" },
];

export default function MyProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.product);
  const { user } = useAppSelector((s) => s.auth);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const mine = useMemo(
    () => products.filter((p) => user && p.createdBy === user.id),
    [products, user]
  );

  const filtered = useMemo(() => {
    let list = [...mine];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.productName.toLowerCase().includes(q));
    }
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.productPrice - b.productPrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.productPrice - a.productPrice);
        break;
      case "stock-asc":
        list.sort((a, b) => a.stock - b.stock);
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [mine, query, sort]);

  const handleDelete = async (id: string) => {
    await dispatch(deleteProduct(id));
    setConfirmId(null);
  };

  return (
    <>
      <Topbar
        title="My Products"
        subtitle="Manage and edit your products."
        actions={
          <Link href="/dashboard/products/add">
            <Button size="md">
              <PlusCircle size={16} /> Add Product
            </Button>
          </Link>
        }
      />

      <div className="px-6 lg:px-10 py-8">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-line-soft">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your products…"
                className="w-full h-10 rounded-[var(--radius-control)] border border-line bg-paper pl-10 pr-3.5 text-[14px] text-ink placeholder:text-slate-light focus:border-brass"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-[var(--radius-control)] border border-line bg-paper px-3 text-[13.5px] text-ink focus:border-brass"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-slate text-sm">Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-ink font-medium mb-1">No products yet</p>
              <p className="text-slate text-[13.5px] mb-4">Products you add will show up here.</p>
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
                {filtered.map((p) => (
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
                        {confirmId === p._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="px-2 py-1 rounded-[6px] text-[11px] font-semibold text-white bg-danger cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-2 py-1 rounded-[6px] text-[11px] font-medium text-slate hover:bg-line-soft cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(p._id)}
                            className="p-1.5 rounded-[6px] text-slate hover:text-danger hover:bg-danger-soft cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
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
