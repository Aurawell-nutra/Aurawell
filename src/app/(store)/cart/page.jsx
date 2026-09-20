import PageHeader from "@/components/ui/PageHeader";
import CartView from "@/components/cart/CartView";

export const metadata = { title: "Your Cart" };

export default function CartPage() {
  return (
    <>
      <PageHeader title="Your Cart" subtitle="Your wellness journey starts here." breadcrumbs={[{ label: "Cart" }]} />
      <section className="bg-ivory py-12 sm:py-16">
        <div className="container-page">
          <CartView />
        </div>
      </section>
    </>
  );
}
