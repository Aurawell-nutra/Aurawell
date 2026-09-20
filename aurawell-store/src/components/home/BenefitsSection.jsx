import Botanical from "@/components/ui/Botanical";
import { ArrowRight, Sprout, Candy, FlaskConical, ShieldCheck, FileText, Smile } from "lucide-react";
import Button from "@/components/ui/Button";

const benefits = [
  { icon: Sprout, title: "Carefully Selected Ingredients", text: "Thoughtfully sourced nutrients and botanical ingredients." },
  { icon: Candy, title: "Convenient Gummy Format", text: "Easy to include in your everyday wellness routine." },
  { icon: FlaskConical, title: "Thoughtfully Formulated", text: "Each product is designed around a specific everyday need." },
  { icon: ShieldCheck, title: "Quality Focused", text: "Made with care and attention at every step." },
  { icon: FileText, title: "Transparent Information", text: "Clear ingredient details on every label." },
  { icon: Smile, title: "Enjoyable Wellness", text: "Because good habits don't have to feel like a chore." },
];

export default function BenefitsSection() {
  return (
    <section id="why-us" className="relative isolate scroll-mt-20 overflow-hidden bg-cream-dark/60 py-16 sm:py-20 lg:py-24">
      <Botanical name="tropical" className="right-0 bottom-0 w-32 -scale-x-100 opacity-40 sm:w-44 lg:w-56" />
      <Botanical name="fern" className="top-0 left-0 w-20 -scale-y-100 opacity-50 sm:w-24 lg:w-32" />
      <Botanical name="leaf" className="top-12 right-[40%] hidden w-9 rotate-[60deg] opacity-40 lg:block" />

      <div className="container-page relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="text-center lg:text-left">
          <p className="mb-3 text-xs font-medium tracking-[0.2em] text-leaf uppercase">Why Aaurawell Nutra</p>
          <h2 className="text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Wellness That
            <br className="hidden sm:block" /> Fits Your Life
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base lg:mx-0">
            We bring together carefully selected ingredients in a convenient and enjoyable gummy format — making
            everyday wellness simpler, delicious and more accessible.
          </p>
          <Button href="/why-us" className="mt-8">
            Know More About Us <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex flex-col items-center rounded-2xl border border-line bg-white/80 p-5 text-center transition-shadow hover:shadow-card"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-sage text-forest">
                <Icon className="size-5" strokeWidth={1.5} aria-hidden />
              </span>
              <h3 className="mt-4 font-sans text-sm font-medium text-ink">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
