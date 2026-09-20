import { Suspense } from "react";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import Botanical from "@/components/ui/Botanical";

export const metadata = { title: "Order Confirmed" };

export default function OrderConfirmedPage() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-ivory to-sage/60 py-16 sm:py-24">
      <Botanical name="corner" className="top-0 right-0 w-32 -scale-y-100 opacity-80 sm:w-52" />
      <Botanical name="eucalyptus" className="bottom-0 left-0 w-24 opacity-60 sm:w-36" />
      <div className="container-page relative">
        <Suspense>
          <OrderConfirmation />
        </Suspense>
      </div>
    </section>
  );
}
