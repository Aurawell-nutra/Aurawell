import Image from "next/image";
import { ArrowRight, Leaf, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import Botanical from "@/components/ui/Botanical";

const JARS = [
  { src: "/images/products/pms-care-gummy-soft.webp", alt: "PMS Care Gummy", className: "z-10 w-[30%] -rotate-6 translate-y-6" },
  { src: "/images/products/daily-nutra-gummy-soft.webp", alt: "Daily Nutra Gummy", className: "z-20 -mx-[6%] w-[36%]" },
  { src: "/images/products/iron-glow-gummy-soft.webp", alt: "Iron Glow Gummy", className: "z-10 w-[30%] rotate-6 translate-y-6" },
];

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

          <div className="relative flex justify-center px-6 pb-10 md:px-10 md:py-10">
            {/* Arched cream stage for the jars */}
            <div className="relative w-full max-w-md">
              <div className="absolute inset-x-[8%] top-[6%] bottom-0 rounded-t-full bg-gradient-to-b from-cream to-cream-dark shadow-[inset_0_-20px_40px_-20px_rgba(15,74,46,0.25)]" aria-hidden />
              <div className="absolute inset-x-[8%] top-[6%] bottom-0 rounded-t-full border border-gold/40" aria-hidden />
              <div className="relative flex items-end justify-center px-[10%] pt-[18%]">
                {JARS.map((jar) => (
                  <div key={jar.src} className={`relative ${jar.className}`}>
                    <Image src={jar.src} alt={jar.alt} width={320} height={546} sizes="(min-width: 768px) 180px, 30vw" className="h-auto w-full drop-shadow-2xl" />
                  </div>
                ))}
              </div>
              <div className="relative mx-auto -mt-4 h-6 w-[80%] rounded-[50%] bg-forest-dark/40 blur-md" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
