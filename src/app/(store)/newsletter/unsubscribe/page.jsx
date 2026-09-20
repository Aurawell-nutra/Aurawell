import { Suspense } from "react";
import Botanical from "@/components/ui/Botanical";
import UnsubscribeForm from "@/components/home/UnsubscribeForm";

export const metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };


// The page asks for a click instead of unsubscribing on load, so email link scanners
// that pre-open links can't unsubscribe people by accident.
export default function NewsletterUnsubscribePage() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-ivory to-sage/60 py-20 sm:py-28">
      <Botanical name="corner" className="top-0 right-0 w-32 -scale-y-100 opacity-80 sm:w-48" />
      <div className="container-page relative">
        <Suspense>
          <UnsubscribeForm />
        </Suspense>
      </div>
    </section>
  );
}
