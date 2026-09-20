import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/server/db";
import { toAdminProduct } from "@/lib/server/admin-products";
import { idSchema } from "@/lib/server/validation";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }) {
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const product = await prisma.product.findUnique({
    where: { id: parsed.data },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!product) notFound();

  const { _count, createdAt, updatedAt, ...rest } = product;
  void createdAt;
  void updatedAt;

  return (
    <>
      <AdminPageHeader title="Edit Product" description={product.name} />
      <ProductForm product={toAdminProduct(rest)} hasOrders={_count.orderItems > 0} />
    </>
  );
}
