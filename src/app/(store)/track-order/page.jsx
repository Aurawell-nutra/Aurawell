import PageHeader from "@/components/ui/PageHeader";
import TrackOrderForm from "@/components/checkout/TrackOrderForm";

export const metadata = {
  title: "Track Your Order",
  description: "Check the status of your Aaurawell Nutra order.",
};

export default function TrackOrderPage() {
  return (
    <>
      <PageHeader
        title="Track Your Order"
        subtitle="Enter your order number and the email address used at checkout."
        breadcrumbs={[{ label: "Track Order" }]}
      />
      <section className="bg-ivory py-12 sm:py-16">
        <div className="container-page">
          <TrackOrderForm />
        </div>
      </section>
    </>
  );
}
