import Badge from "@/components/ui/Badge";

export default function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge tone="danger">Out of stock</Badge>;
  if (stock <= 5) return <Badge tone="brass">Low stock</Badge>;
  return <Badge tone="success">In stock</Badge>;
}
