import Image from "next/image";
import { ArrowRight, Leaf, FlaskConical, Candy, Smile } from "lucide-react";
import Button from "@/components/ui/Button";

const highlights = [
  { icon: Leaf, label: "Premium Nutrition" },
  { icon: FlaskConical, label: "Science Backed" },
  { icon: Candy, label: "Delicious Gummies" },
  { icon: Smile, label: "A Healthier Tomorrow" },
];

function HeroCopy({ className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium tracking-[0.25em] text-leaf uppercase">Small Gummies. Big Wellness.</p>
      <h1 className="mt-4 text-4xl leading-[1.05] font-semibold sm:text-5xl xl:text-6xl 2xl:text-7xl">
        New Era
        <br />
        of <span className="text-leaf">Wellness</span>
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink/80">
        Thoughtfully formulated nutritional gummies for a healthier, brighter you.
      </p>

      <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
        <Button href="/shop">
          Shop Our Gummies <ArrowRight className="size-4" aria-hidden />
        </Button>
        <Button href="/about" variant="outline" className="bg-white/70 backdrop-blur-sm">
          Our Story
        </Button>
      </div>

      <ul className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3 sm:max-w-md sm:grid-cols-4 sm:gap-4 lg:mx-0">
        {highlights.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-left sm:flex-col sm:items-center sm:gap-2 sm:text-center lg:items-start lg:text-left">
            <span className="flex size-11 items-center justify-center rounded-full border border-forest/20 bg-white/80 text-forest backdrop-blur-sm">
              <Icon className="size-5" strokeWidth={1.5} aria-hidden />
            </span>
            <span className="text-xs leading-tight text-ink">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The photograph is shown whole — never cropped — by letting it set the section height:
 * on large screens the copy is overlaid on its empty left side, and on smaller screens
 * the copy sits underneath. `unoptimized` serves the supplied file as-is, so it isn't
 * re-compressed (which softened the detail).
 */
export default function HeroSection() {
  return (
    <section id="home" className="relative isolate bg-cream">
      {/* Phones get a portrait framing of the same photo, with its lower edge faded so the
          photo melts into the page and the copy can sit right under the product. */}
      <div
        className="lg:hidden"
        style={{ maskImage: "linear-gradient(to bottom, #000 60%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, #000 60%, transparent 100%)" }}
      >
        <Image
          src="/images/banners/hero-background-mobile.webp"
          alt="Aaurawell Daily Nutra Gummy jar with fresh fruit and leaves"
          width={720}
          height={799}
          priority
          unoptimized
          sizes="100vw"
          className="h-auto w-full"
        />
      </div>
      <Image
        src="/images/banners/hero-background.webp"
        alt="Aaurawell Daily Nutra Gummy jar with fresh fruit and leaves"
        width={1967}
        height={799}
        priority
        unoptimized
        sizes="100vw"
        className="hidden h-auto w-full lg:block"
      />

      {/* Large screens: copy overlaid on the photo's soft left-hand area */}
      <div className="absolute inset-0 hidden items-center lg:flex">
        <div className="container-page">
          <HeroCopy className="max-w-lg text-left" />
        </div>
      </div>

      {/* Small screens: copy tucked into the faded lower edge of the photo */}
      <div className="container-page relative -mt-20 pb-8 sm:-mt-24 lg:hidden">
        <HeroCopy className="mx-auto max-w-sm text-center sm:max-w-md" />
      </div>
    </section>
  );
}
