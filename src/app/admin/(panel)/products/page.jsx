import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/server/db";
import { formatPaise } from "@/lib/pricing-rules";
import { AdminPageHeader, Card, StatusBadge, adminButton } from "@/components/admin/ui";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { orderItems: true, reviews: true } } },
  });

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${products.length} products`}
        action={
          <Link href="/products/new" className={adminButton.primary}>
            <Plus className="size-4" aria-hidden /> Add Product
          </Link>
        }
      />

      <Card className="p-0 sm:p-0">
        {products.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No products yet. Add your first product or run <code>npm run db:seed</code>.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Order</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-line first:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream">
                          <Image src={p.mainImage} alt="" fill sizes="48px" className="object-contain p-1" />
                        </span>
                        <div>
                          <p className="font-medium text-ink">{p.name}</p>
                          <p className="text-xs text-muted">{p.sku ? `Code ${p.sku}` : "No product code"} · {p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {formatPaise(p.price)}
                      {p.compareAtPrice && <span className="ml-1 text-xs text-muted line-through">{formatPaise(p.compareAtPrice)}</span>}
                    </td>
                    <td className={`px-3 py-3 ${p.stockQuantity <= 10 ? "font-medium text-tangerine" : ""}`}>{p.stockQuantity}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <StatusBadge status={p.isActive ? "ACTIVE" : "INACTIVE"} />
                        {p.isFeatured && <StatusBadge status="CONFIRMED" label="FEATURED" />}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted">{p.sortOrder}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/products/${p.id}/edit`} className="text-forest hover:underline">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
