import Image from "next/image";
import { ArrowRight, Eye, Sprout, HeartHandshake } from "lucide-react";
import Button from "@/components/ui/Button";
import Botanical from "@/components/ui/Botanical";
import SectionHeading from "@/components/ui/SectionHeading";
import PromoBanner from "@/components/shop/PromoBanner";

export const metadata = {
  title: "About Us",
  description: "Aaurawell Nutra was created to make everyday wellness easier, more enjoyable and more accessible.",
};

const pillars = [
  { icon: Eye, title: "Our Vision", text: "To make everyday wellness simpler and more enjoyable for everyone." },
  { icon: Sprout, title: "Our Philosophy", text: "Better ingredients. Thoughtful formulation. Convenient nutrition." },
  { icon: HeartHandshake, title: "Our Promise", text: "Quality, transparency and a consumer-first experience in everything we do." },
];

const values = [
  { value: "4", label: "Thoughtful formulations" },
  { value: "30", label: "Gummies in every bottle" },
  { value: "100%", label: "Gelatin free" },
  { value: "0", label: "Artificial colours or flavours" },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-ivory to-blush/60">
        <Botanical name="corner" className="top-0 right-0 w-28 -scale-y-100 opacity-80 sm:w-48" />
        <Botanical name="fern" className="bottom-0 left-0 w-20 opacity-50 sm:w-28" />

        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="text-xs font-medium tracking-[0.2em] text-leaf uppercase">Our Story</p>
            <h1 className="mt-3 text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">About Aaurawell Nutra</h1>
            <p className="mt-2 font-serif text-xl text-leaf">A New Era of Wellness</p>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-muted sm:text-base lg:mx-0">
              Aaurawell Nutra was created with a simple idea — to make everyday wellness easier, more enjoyable and more
              accessible. We focus on thoughtfully formulated nutritional gummies, bringing together carefully selected
              ingredients to support different wellness needs.
            </p>
            <Button href="/shop" className="mt-8">
              Explore Our Gummies <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-soft">
              <Image
                src="/images/banners/pms-care-gummy-banner.webp"
                alt="Aaurawell PMS Care Gummy bottles"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="absolute -bottom-6 left-4 -rotate-6 rounded-2xl bg-white/90 px-5 py-3 font-script text-3xl text-forest shadow-card sm:text-4xl">
              Wellness for a Brighter Tomorrow
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-16 sm:py-20">
        <div className="container-page">
          <ul className="grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-3xl border border-line bg-white p-8 text-center shadow-card">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-sage text-forest">
                  <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                </span>
                <h2 className="mt-5 text-2xl">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-cream py-16 sm:py-20">
        <Botanical name="olive" className="right-0 bottom-0 w-40 -scale-x-100 opacity-40 sm:w-56" />
        <div className="container-page relative grid items-center gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            {["/images/products/gut-comfort-gummy.webp", "/images/products/daily-nutra-gummy.webp"].map((src, i) => (
              <div key={src} className={`relative aspect-[3/4] overflow-hidden rounded-3xl ${i ? "mt-10 bg-peach" : "bg-sage"}`}>
                <Image src={src} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover object-top" />
              </div>
            ))}
          </div>
          <div>
            <SectionHeading
              align="left"
              eyebrow="What we believe"
              title="Small Gummies. Big Possibilities."
              subtitle="From daily nutrition and digestive wellness to women's wellness and iron support, every Aaurawell gummy is designed around a specific everyday need — with clear labels, carefully chosen ingredients and a taste you'll enjoy."
            />
            <dl className="mt-8 grid grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.label} className="rounded-2xl border border-line bg-white p-5">
                  <dt className="text-xs text-muted">{v.label}</dt>
                  <dd className="font-serif text-3xl font-semibold text-forest">{v.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="bg-ivory pt-16 sm:pt-20">
        <PromoBanner script={["Small Gummies", "Big Wellness"]} cta={{ label: "Explore Our Products", href: "/shop" }} />
      </div>
    </>
  );
}
