import { Phone, Mail, MapPin, Clock } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ContactForm from "@/components/contact/ContactForm";
import Botanical from "@/components/ui/Botanical";
import { contact } from "@/data/site";

export const metadata = {
  title: "Contact Us",
  description: "Have a question about our products, orders or your Aaurawell experience? We're here to help.",
};

const details = [
  { icon: Phone, title: "Customer Care", lines: [contact.phone, contact.email] },
  { icon: MapPin, title: "Head Office", lines: ["Aaurawell Nutra", "New Era of Wellness", contact.address] },
  { icon: Clock, title: "Business Hours", lines: [contact.hours] },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="We're Here to Help"
        subtitle="Have a question about our products, orders or your Aaurawell experience? Our team would be happy to hear from you."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <section className="relative isolate overflow-hidden bg-ivory py-14 sm:py-20">
        <Botanical name="tropical" className="right-0 bottom-0 w-32 -scale-x-100 opacity-30 sm:w-48" />
        <div className="container-page relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-4">
            {details.map(({ icon: Icon, title, lines }) => (
              <div key={title} className="flex gap-4 rounded-3xl border border-line bg-white p-6 shadow-card">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sage text-forest">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                </span>
                <div>
                  <h2 className="font-sans text-base font-semibold text-ink">{title}</h2>
                  {lines.map((line) => (
                    <p key={line} className="mt-1 text-sm break-words text-muted">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center justify-center gap-2 rounded-full border border-forest py-3 text-sm text-forest transition-colors hover:bg-forest hover:text-white"
            >
              <Mail className="size-4" aria-hidden /> Email us directly
            </a>
          </aside>

          <div className="rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-10">
            <h2 className="text-3xl">Send us a message</h2>
            <p className="mt-2 text-sm text-muted">We usually reply within one business day.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
