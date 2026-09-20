import ProductForm from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata = { title: "Add Product" };

export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader title="Add Product" />
      <ProductForm />
    </>
  );
}
