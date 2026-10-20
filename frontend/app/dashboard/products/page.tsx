"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StockBadge from "@/components/products/StockBadge";
import ProductThumb from "@/components/products/ProductThumb";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts } from "@/redux/slice/productSlice";
import { formatCurrency } from "@/lib/utils";
import { Search, SlidersHorizontal } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

export default function AllProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.product);

  const [query, setQuery] = useState("");
  const [color, setColor] = useState("all");
  const [size, setSize] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const colors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.color || []))),
    [products]
  );
  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.size || []))),
    [products]
  );

  const filtered = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q)
      );
    }
    if (color !== "all") list = list.filter((p) => p.color?.includes(color));
    if (size !== "all") list = list.filter((p) => p.size?.includes(size));
    if (minPrice) list = list.filter((p) => p.productPrice >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.productPrice <= Number(maxPrice));

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.productPrice - b.productPrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.productPrice - a.productPrice);
        break;
      case "name-asc":
        list.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [products, query, color, size, minPrice, maxPrice, sort]);

  return (
    <>
      <Topbar title="All Products" subtitle="Browse everything listed in the store." />

      <div className="px-6 lg:px-10 py-8">
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full h-10 rounded-[var(--radius-control)] border border-line bg-paper pl-10 pr-3.5 text-[14px] text-ink placeholder:text-slate-light focus:border-brass"
              />
            </div>

            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 rounded-[var(--radius-control)] border border-line bg-paper px-3 text-[13.5px] text-ink focus:border-brass"
            >
              <option value="all">All Colors</option>
              {colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="h-10 rounded-[var(--radius-control)] border border-line bg-paper px-3 text-[13.5px] text-ink focus:border-brass"
            >
              <option value="all">All Sizes</option>
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min Price"
              className="h-10 w-28 rounded-[var(--radius-control)] border border-line bg-paper px-3 text-[13.5px] text-ink placeholder:text-slate-light focus:border-brass"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max Price"
              className="h-10 w-28 rounded-[var(--radius-control)] border border-line bg-paper px-3 text-[13.5px] text-ink placeholder:text-slate-light focus:border-brass"
            />

            <div className="flex items-center gap-2 ml-auto">
              <SlidersHorizontal size={15} className="text-slate-light" />
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
          </div>
        </Card>

        {loading ? (
          <p className="text-slate text-sm">Loading products…</p>
        ) : filtered.length === 0 ? (
          <Card className="px-6 py-14 text-center">
            <p className="text-ink font-medium mb-1">No products match your filters</p>
            <p className="text-slate text-[13.5px]">Try adjusting your search or filters.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <Link key={p._id} href={`/dashboard/products/${p._id}`}>
                <Card className="p-4 hover:shadow-[var(--shadow-card-hover)] hover:border-brass/40 transition-all h-full flex flex-col">
                  <div className="aspect-square rounded-[10px] overflow-hidden bg-line-soft mb-3">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ProductThumb alt={p.productName} size="lg" />
                      </div>
                    )}
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-brass-deep mb-1">{p.brand}</p>
                  <p className="text-[14.5px] font-medium text-ink mb-1 truncate">{p.productName}</p>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-mono text-[15px] text-ink">{formatCurrency(p.productPrice)}</span>
                    <StockBadge stock={p.stock} />
                  </div>
                  {p.color?.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {p.color.slice(0, 4).map((c) => (
                        <Badge key={c} tone="slate" className="normal-case font-normal">{c}</Badge>
                      ))}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
