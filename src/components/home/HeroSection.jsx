import Image from "next/image";
import { ArrowRight, Leaf, FlaskConical, Candy, Smile } from "lucide-react";
import Button from "@/components/ui/Button";
import HeroCarousel from "@/components/home/HeroCarousel";

const highlights = [
  { icon: Leaf, label: "Premium Nutrition" },
  { icon: FlaskConical, label: "Science Backed" },
  { icon: Candy, label: "Delicious Gummies" },
  { icon: Smile, label: "A Healthier Tomorrow" },
];

export default function HeroSection({ products }) {
  return (
    <section id="home" className="relative isolate overflow-hidden">
      {/* Brand photography fills the whole hero */}
      <Image
        src="/images/banners/hero-background.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      {/* Keeps the text readable over the photo on every screen size */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cream/95 via-cream/70 to-cream/20 lg:via-cream/55 lg:to-transparent" aria-hidden />

      <div className="container-page relative grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:py-20">
        <div className="text-center lg:text-left">
          <p className="text-xs font-medium tracking-[0.25em] text-leaf uppercase">Small Gummies. Big Wellness.</p>
          <h1 className="mt-4 text-5xl leading-[1.05] font-semibold sm:text-6xl xl:text-7xl">
            New Era
            <br />
            of <span className="text-leaf">Wellness</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink/80 lg:mx-0">
            Thoughtfully formulated nutritional gummies for a healthier, brighter you.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button href="/shop">
              Shop Our Gummies <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button href="/about" variant="outline" className="bg-white/70 backdrop-blur-sm">
              Our Story
            </Button>
          </div>

          <ul className="mx-auto mt-10 grid max-w-md grid-cols-4 gap-2 sm:gap-4 lg:mx-0">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
                <span className="flex size-11 items-center justify-center rounded-full border border-forest/20 bg-white/80 text-forest backdrop-blur-sm">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="text-[0.65rem] leading-tight text-ink sm:text-xs">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <p className="mb-2 text-center font-script text-4xl leading-none text-forest sm:text-5xl">Wellness in Every Gummy</p>
          <HeroCarousel products={products.slice(0, 4)} />
        </div>
      </div>
    </section>
  );
}
