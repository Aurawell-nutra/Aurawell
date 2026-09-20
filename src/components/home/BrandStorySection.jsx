import Image from "next/image";
import { ArrowRight, Eye, Sprout, HeartHandshake } from "lucide-react";
import Button from "@/components/ui/Button";
import Botanical from "@/components/ui/Botanical";

const pillars = [
  { icon: Eye, title: "Our Vision", text: "To make everyday wellness simpler for everyone." },
  { icon: Sprout, title: "Our Philosophy", text: "Better ingredients. Thoughtful formulation." },
  { icon: HeartHandshake, title: "Our Promise", text: "Quality, transparency and a consumer-first experience." },
];

export default function BrandStorySection() {
  return (
    <section id="about" className="relative isolate scroll-mt-20 overflow-hidden bg-ivory py-16 sm:py-20 lg:py-24">
      <Botanical name="corner" className="bottom-0 left-0 w-28 -scale-x-100 opacity-60 sm:w-40" />
      <Botanical name="sprig" className="top-0 right-0 w-16 -scale-100 opacity-50 sm:w-24" />
      <div className="relative container-page">
        <div className="grid overflow-hidden rounded-[2rem] border border-line bg-white shadow-card lg:grid-cols-2">
          <div className="relative min-h-72 bg-blush sm:min-h-96">
            <Image
              src="/images/banners/daily-nutra-gummy-banner.webp"
              alt="Aaurawell Daily Nutra Gummy bottle, front and back label"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" aria-hidden />
            <p className="absolute bottom-6 left-6 font-script text-4xl leading-[0.9] text-white drop-shadow sm:text-5xl">
              A Healthier,
              <br />
              Brighter You
            </p>
          </div>

          <div className="relative isolate flex flex-col justify-center overflow-hidden p-8 sm:p-12 lg:p-14">
            <Botanical name="eucalyptus" className="right-0 bottom-0 w-24 -scale-x-100 opacity-25 sm:w-32" />
            <p className="mb-3 text-xs font-medium tracking-[0.2em] text-leaf uppercase">About Aaurawell Nutra</p>
            <h2 className="text-3xl leading-tight sm:text-4xl">
              Small Gummies.
              <br />
              Big Possibilities.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
              Aaurawell Nutra was created with a simple idea — to make everyday wellness easier, more enjoyable and more
              accessible. From daily nutrition and digestive wellness to women&apos;s wellness and iron support, our
              gummies are here to support your everyday routine.
            </p>

            <ul className="mt-8 grid gap-5 sm:grid-cols-3">
              {pillars.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <Icon className="size-6 text-leaf" strokeWidth={1.5} aria-hidden />
                  <h3 className="mt-2 font-sans text-sm font-medium text-ink">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
                </li>
              ))}
            </ul>

            <div>
              <Button href="/about" className="mt-8">
                Explore Our Story <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
