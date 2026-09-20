import PageHeader from "@/components/ui/PageHeader";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="Checkout" breadcrumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <section className="bg-ivory py-12 sm:py-16">
        <div className="container-page">
          <CheckoutFlow />
        </div>
      </section>
    </>
  );
}
