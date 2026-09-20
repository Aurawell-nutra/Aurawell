import Image from "next/image";
import { ArrowRight, Leaf, FlaskConical, Candy, Smile } from "lucide-react";
import Button from "@/components/ui/Button";
import Botanical from "@/components/ui/Botanical";

const highlights = [
  { icon: Leaf, label: "Premium Nutrition" },
  { icon: FlaskConical, label: "Science Backed" },
  { icon: Candy, label: "Delicious Gummies" },
  { icon: Smile, label: "A Healthier Tomorrow" },
];

// The four jar renders share one canvas size, so equal widths line them up
// on the same baseline with a slight overlap.
const jarStyles = [
  "z-10 w-[27%]",
  "z-20 -ml-[3%] w-[27%]",
  "z-30 -ml-[3%] w-[27%]",
  "z-20 -ml-[3%] w-[27%]",
];

export default function HeroSection({ products }) {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-ivory to-sage/70">
      {/* Corner botanicals — layered back-to-front: large soft shapes first, crisp sprigs on top. */}
      {/* Top right */}
      <Botanical name="tropical" className="top-0 right-0 w-32 -scale-100 opacity-25 sm:w-48 lg:w-64" />
      <Botanical name="eucalyptus" className="top-0 right-24 hidden w-24 -scale-100 opacity-45 md:block lg:right-40 lg:w-32" />
      <Botanical name="corner" className="top-0 right-0 w-28 -scale-y-100 opacity-90 sm:w-44 lg:w-56" />
      <Botanical name="leafLight" className="top-40 right-6 hidden w-10 rotate-[130deg] opacity-70 lg:block" />
      {/* Top left */}
      <Botanical name="fern" className="top-0 left-0 w-16 -scale-y-100 opacity-35 sm:w-20 lg:w-24" />
      <Botanical name="leaf" className="top-6 left-20 hidden w-8 rotate-[150deg] opacity-40 xl:block" />
      {/* Bottom left */}
      <Botanical name="tropical" className="bottom-0 left-0 hidden w-28 opacity-25 sm:block lg:w-40" />
      <Botanical name="fern" className="bottom-0 left-0 w-20 opacity-70 sm:w-28 xl:w-36" />
      <Botanical name="leafLight" className="bottom-24 left-2 hidden w-9 -rotate-[20deg] opacity-60 xl:block" />
      {/* Bottom right */}
      <Botanical name="olive" className="right-0 bottom-0 hidden w-40 -scale-x-100 opacity-40 md:block lg:w-56" />
      <Botanical name="eucalyptus" className="right-0 bottom-0 hidden w-28 -scale-x-100 opacity-60 lg:block xl:w-36" />
      <Botanical name="leaf" className="right-10 bottom-28 hidden w-8 rotate-[200deg] opacity-50 xl:block" />
      <div className="pointer-events-none absolute top-1/4 right-1/4 size-96 rounded-full bg-peach/60 blur-3xl" aria-hidden />

      <div className="container-page relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-6 lg:py-20">
        <div className="text-center lg:text-left">
          <p className="text-xs font-medium tracking-[0.25em] text-leaf uppercase">Small Gummies. Big Wellness.</p>
          <h1 className="mt-4 text-5xl leading-[1.05] font-semibold sm:text-6xl xl:text-7xl">
            New Era
            <br />
            of <span className="text-leaf">Wellness</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted lg:mx-0">
            Thoughtfully formulated nutritional gummies for a healthier, brighter you.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button href="/shop">
              Shop Our Gummies <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button href="/about" variant="outline">
              Our Story
            </Button>
          </div>

          <ul className="mx-auto mt-10 grid max-w-md grid-cols-4 gap-2 sm:gap-4 lg:mx-0">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
                <span className="flex size-11 items-center justify-center rounded-full border border-forest/20 bg-white/70 text-forest">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="text-[0.65rem] leading-tight text-ink sm:text-xs">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative isolate">
          <Botanical name="leaf" className="top-24 left-0 w-10 -rotate-[35deg] opacity-80 sm:w-14" />
          <Botanical name="leafLight" className="top-1/3 right-0 w-9 rotate-45 opacity-80 sm:w-12" />
          <p className="absolute top-0 right-6 z-40 -rotate-6 font-script text-4xl leading-[0.9] text-forest sm:right-16 sm:text-5xl lg:-top-6 lg:right-20">
            Wellness
            <br />
            <span className="ml-8">in Every Gummy</span>
          </p>

          <div className="relative flex items-end justify-center pt-20 sm:pt-24">
            {products.slice(0, 4).map((product, i) => (
              <div key={product.id} className={`relative ${jarStyles[i]}`}>
                <Image
                  src={product.heroImage}
                  alt={product.name}
                  width={640}
                  height={782}
                  priority={i === 2}
                  sizes="(min-width: 1024px) 210px, 30vw"
                  className="h-auto w-full drop-shadow-xl"
                />
              </div>
            ))}
          </div>
          <div
            className="relative z-0 mx-auto -mt-8 h-12 w-[95%] rounded-[50%] bg-gradient-to-b from-white to-cream-dark shadow-soft"
            aria-hidden
          />

          <Image src="/images/decorative/gummy-red.svg" alt="" width={60} height={50} className="absolute bottom-1 left-3 z-40 w-10 sm:w-14" />
          <Image
            src="/images/decorative/gummy-orange.svg"
            alt=""
            width={60}
            height={50}
            className="absolute right-5 -bottom-2 z-40 w-10 rotate-12 sm:w-14"
          />
        </div>
      </div>
    </section>
  );
}
