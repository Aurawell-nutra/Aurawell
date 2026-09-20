import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Botanical from "@/components/ui/Botanical";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";

export default function TestimonialsSection({ reviews = [] }) {
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="relative isolate scroll-mt-20 overflow-hidden bg-cream py-16 sm:py-20 lg:py-24">
      <Image
        src="/images/decorative/leaves-corner.svg"
        alt=""
        width={440}
        height={440}
        className="pointer-events-none absolute bottom-0 left-0 w-28 -scale-x-100 opacity-40 sm:w-36"
      />
      <Botanical name="fern" className="top-0 right-0 w-20 -scale-100 opacity-50 sm:w-28 lg:w-32" />
      <Botanical name="leaf" className="top-20 left-[8%] hidden w-10 -rotate-45 opacity-50 md:block" />
      <Botanical name="leafLight" className="right-[10%] bottom-10 hidden w-9 rotate-[70deg] opacity-50 md:block" />
      <div className="container-page relative">
        <SectionHeading eyebrow="Real People. Real Wellness." title="Loved by Many" align="center" />
        <TestimonialCarousel testimonials={reviews} />
      </div>
    </section>
  );
}
