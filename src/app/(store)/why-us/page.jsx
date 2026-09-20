import { Sprout, Candy, Target, ShieldCheck, Smile, Sparkles } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import TrustBadges from "@/components/ui/TrustBadges";
import PromoBanner from "@/components/shop/PromoBanner";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export const metadata = {
  title: "Why Choose Aaurawell",
  description: "Carefully selected ingredients in a convenient, enjoyable gummy format.",
};

const reasons = [
  { icon: Sprout, title: "Carefully Selected Ingredients", text: "We focus on thoughtfully formulated nutritional and botanical ingredients." },
  { icon: Candy, title: "Convenient Gummy Format", text: "Easy to include in your everyday wellness routine — no water, no pills." },
  { icon: Target, title: "Purpose-Driven Formulations", text: "Each product is designed around a specific area of everyday wellness." },
  { icon: ShieldCheck, title: "Quality & Transparency", text: "We believe in clear information about what you're consuming." },
  { icon: Smile, title: "Enjoyable Wellness", text: "Because good wellness doesn't have to feel like a chore." },
  { icon: Sparkles, title: "Made for Modern Life", text: "Designed to fit your lifestyle and your everyday goals." },
];

export default function WhyUsPage() {
  return (
    <>
      <PageHeader title="Why Choose Aaurawell?" subtitle="Designed around you." breadcrumbs={[{ label: "Why Us" }]} />

      <section className="bg-ivory py-16 sm:py-20">
        <div className="container-page">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }, i) => (
              <li
                key={title}
                className={`rounded-3xl border border-line p-8 text-center shadow-card transition-shadow hover:shadow-soft ${
                  ["bg-white", "bg-blush/50", "bg-sage/60"][i % 3]
                }`}
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-forest/15 bg-white text-forest">
                  <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                </span>
                <h2 className="mt-5 font-sans text-base font-semibold text-ink">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
          <TrustBadges className="mt-12" />
        </div>
      </section>

      <TestimonialsSection />
      <div className="bg-ivory pt-16 sm:pt-20">
        <PromoBanner script={["Small Gummies", "Big Wellness"]} cta={{ label: "Explore Our Products", href: "/shop" }} />
      </div>
    </>
  );
}
