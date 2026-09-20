import Image from "next/image";
import { ArrowRight, Leaf, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import Botanical from "@/components/ui/Botanical";

const PERKS = [
  { icon: Truck, label: "Free shipping over ₹599" },
  { icon: Leaf, label: "Gelatin free" },
  { icon: Sparkles, label: "No artificial colours" },
];

/** Premium forest-green promo banner used on Shop, About and Why Us. */
export default function PromoBanner({
  script = ["Good Nutrition", "Brighter Days"],
  eyebrow = "Aaurawell Nutra",
  cta = { label: "Shop All Gummies", href: "/shop" },
}) {
  return (
    <section className="bg-ivory pb-16 sm:pb-20">
      <div className="container-page">
        <div className="relative isolate grid items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest via-forest to-forest-dark shadow-soft md:grid-cols-[1.05fr_1fr]">
          {/* Decorative layers */}
          <div className="pointer-events-none absolute -top-24 -left-24 -z-10 size-72 rounded-full bg-leaf/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute right-1/4 -bottom-32 -z-10 size-80 rounded-full bg-gold/20 blur-3xl" aria-hidden />
          <Botanical name="corner" className="top-0 left-0 w-28 -scale-100 opacity-20 sm:w-40" />
          <Botanical name="fern" className="bottom-0 left-0 w-16 opacity-20 sm:w-24" />
          <Botanical name="eucalyptus" className="top-0 right-0 hidden w-28 -scale-100 opacity-25 md:block" />
          <div className="pointer-events-none absolute inset-3 -z-10 rounded-[1.6rem] border border-gold/25" aria-hidden />

          <div className="relative px-6 py-12 text-center sm:px-12 md:py-16 md:text-left">
            <p className="flex items-center justify-center gap-3 text-[0.7rem] font-medium tracking-[0.3em] text-gold uppercase md:justify-start">
              <span className="h-px w-8 bg-gold/60" aria-hidden /> {eyebrow}
            </p>
            <p className="mt-5 font-script text-5xl leading-[0.95] text-cream sm:text-6xl lg:text-7xl">
              {script[0]}
              <br />
              <span className="text-gold md:ml-12">{script[1]}</span>
            </p>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-white/70 md:mx-0">
              Thoughtfully formulated gummies that make everyday wellness simple, delicious and easy to keep up with.
            </p>

            <ul className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
              {PERKS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85">
                  <Icon className="size-3.5 text-gold" aria-hidden /> {label}
                </li>
              ))}
            </ul>

            <Link
              href={cta.href}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm font-medium text-forest shadow-card transition hover:bg-white hover:shadow-soft"
            >
              {cta.label} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="relative p-5 md:py-8 md:pr-8 md:pl-0">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[1.4rem] border border-gold/25 shadow-card">
              <Image
                src="/images/banners/all-gummies.webp"
                alt="The full range of Aaurawell gummies"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
