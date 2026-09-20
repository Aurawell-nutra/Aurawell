import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Botanical from "@/components/ui/Botanical";
import { contact } from "@/data/site";
import Accordion from "@/components/ui/Accordion";
import PageHeader from "@/components/ui/PageHeader";
import { faqs } from "@/data/faqs";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about Aaurawell Nutra gummies, usage, storage and orders.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader title="Frequently Asked Questions" breadcrumbs={[{ label: "FAQs" }]} />

      <section className="bg-ivory py-14 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <Accordion items={faqs} />

          <aside className="relative isolate h-fit overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest to-forest-dark p-8 text-center shadow-soft lg:sticky lg:top-28">
            <div className="pointer-events-none absolute inset-3 -z-10 rounded-[1.6rem] border border-gold/25" aria-hidden />
            <div className="pointer-events-none absolute -top-16 -right-16 -z-10 size-52 rounded-full bg-leaf/30 blur-3xl" aria-hidden />
            <Botanical name="corner" className="top-0 right-0 w-24 -scale-y-100 opacity-25" />
            <Botanical name="fern" className="bottom-0 left-0 w-14 opacity-20" />

            <p className="flex items-center justify-center gap-3 text-[0.7rem] tracking-[0.3em] text-gold uppercase">
              <span className="h-px w-6 bg-gold/60" aria-hidden /> Support <span className="h-px w-6 bg-gold/60" aria-hidden />
            </p>
            <p className="mt-4 font-script text-5xl leading-[0.95] text-cream">
              Still have
              <br />
              <span className="text-gold">questions?</span>
            </p>
            <p className="mt-3 text-sm text-white/70">Our team is happy to help with products, orders and delivery.</p>

            <Link
              href="/contact"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-medium text-forest shadow-card transition hover:bg-white"
            >
              Send Us a Message <ArrowRight className="size-4" aria-hidden />
            </Link>

            <div className="mt-6 border-t border-white/10 pt-5 text-sm text-white/70">
              <p className="text-xs tracking-wide text-white/50">Prefer to reach us directly?</p>
              <p className="mt-2 flex flex-col gap-1">
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="whitespace-nowrap text-cream underline-offset-4 hover:underline">{contact.phone}</a>
                <a href={`mailto:${contact.email}`} className="text-cream underline-offset-4 hover:underline">{contact.email}</a>
              </p>
              <p className="mt-1 text-xs text-white/50">{contact.hours}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
