import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Botanical from "@/components/ui/Botanical";

export default function ProductShowcase({ products }) {
  return (
    <section id="shop" className="relative isolate scroll-mt-20 overflow-hidden bg-ivory py-16 sm:py-20 lg:py-24">
      <Botanical name="eucalyptus" className="top-0 left-0 w-24 -scale-y-100 opacity-60 sm:w-32 lg:w-40" />
      <Botanical name="olive" className="right-0 bottom-0 w-40 -scale-x-100 opacity-60 sm:w-52 lg:w-64" />
      <Botanical name="leafLight" className="top-16 right-[12%] hidden w-10 rotate-[25deg] opacity-60 md:block" />
      <div className="relative container-page">
        <SectionHeading
          eyebrow="Our Products"
          title="Find Your Wellness Gummy"
          subtitle="Targeted nutrition for your everyday wellness goals."
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} id={product.slug} className="scroll-mt-24">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Button href="/shop" variant="outline">
            View All Gummies <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
