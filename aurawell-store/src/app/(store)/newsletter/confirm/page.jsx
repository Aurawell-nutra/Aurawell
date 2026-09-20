import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Botanical from "@/components/ui/Botanical";
import { confirmSubscription } from "@/lib/server/newsletter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirm Subscription", robots: { index: false } };

export default async function NewsletterConfirmPage({ searchParams }) {
  const { token } = await searchParams;
  const result = await confirmSubscription(token);
  const ok = result !== "invalid";

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-ivory to-sage/60 py-20 sm:py-28">
      <Botanical name="corner" className="top-0 right-0 w-32 -scale-y-100 opacity-80 sm:w-48" />
      <Botanical name="fern" className="bottom-0 left-0 w-20 opacity-50 sm:w-28" />
      <div className="container-page relative">
        <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-white p-10 text-center shadow-soft">
          {ok ? <CheckCircle2 className="mx-auto size-14 text-leaf" aria-hidden /> : <XCircle className="mx-auto size-14 text-crimson" aria-hidden />}
          <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">{ok ? "You're subscribed!" : "Link expired"}</h1>
          <p className="mt-3 text-sm text-muted">
            {result === "confirmed" && "Welcome to the Aaurawell community. We'll let you know about new launches, wellness tips and offers."}
            {result === "already" && "Your subscription is already confirmed. Thank you for being part of our community."}
            {result === "invalid" && "This confirmation link is invalid or has expired. Please subscribe again from our homepage."}
          </p>
          <Button href={ok ? "/shop" : "/#newsletter"} className="mt-8">
            {ok ? "Explore Our Gummies" : "Subscribe Again"} <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
