import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchase from "@/components/product/ProductPurchase";
import ProductTabs from "@/components/product/ProductTabs";
import ProductIcon from "@/components/ui/ProductIcon";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import TrustBadges from "@/components/ui/TrustBadges";
import Botanical from "@/components/ui/Botanical";
import ProductReviews from "@/components/product/ProductReviews";
import { getProductBySlug, getProductReviews, getProducts } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [allProducts, reviews] = await Promise.all([getProducts(), getProductReviews(product.id)]);
  const related = allProducts.filter((p) => p.slug !== slug).slice(0, 3);
  const { theme } = product;

  return (
    <div style={theme.style}>
      <section className={cn("relative isolate overflow-hidden bg-gradient-to-b to-ivory", theme.tint)}>
        <Botanical name="corner" className="top-0 right-0 w-28 -scale-y-100 opacity-70 sm:w-44" />
        <Botanical name="eucalyptus" className="bottom-0 left-0 hidden w-24 opacity-40 lg:block" />

        <div className="container-page relative py-8 sm:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <li>
                <Link href="/" className="hover:text-forest">Home</Link>
              </li>
              <ChevronRight className="size-3" aria-hidden />
              <li>
                <Link href="/shop" className="hover:text-forest">Shop</Link>
              </li>
              <ChevronRight className="size-3" aria-hidden />
              <li className="text-forest" aria-current="page">{product.name}</li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <ProductGallery product={product} />

            <div>
              <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">{product.name}</h1>
              <p className="mt-2 text-sm text-muted">{[product.subtitle, product.tagline].filter(Boolean).join(" | ")}</p>

              <a href="#reviews" className="mt-3 flex w-fit items-center gap-2 text-sm hover:underline">
                <span className="flex text-gold" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-4", product.rating && i < Math.round(product.rating) && "fill-current")} />
                  ))}
                </span>
                <span className="text-muted">
                  {product.reviews > 0 ? `(${product.rating}) · ${product.reviews} Reviews` : "No reviews yet — write the first one"}
                </span>
              </a>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-serif text-4xl font-semibold text-forest">{formatPrice(product.price)}</span>
                {product.mrp > product.price && <span className="text-sm text-muted line-through">{formatPrice(product.mrp)}</span>}
              </div>
              <p className="text-xs text-muted">Inclusive of all taxes · {product.count} Gummies · {product.flavour}</p>

              <p className="mt-5 text-sm leading-relaxed text-muted">{product.description}</p>

              <ul className="mt-6 grid grid-cols-4 gap-3">
                {product.benefits.map((b) => (
                  <li key={b.label} className="flex flex-col items-center gap-2 text-center">
                    <span className={cn("flex size-12 items-center justify-center rounded-full border bg-white", theme.outline)}>
                      <ProductIcon name={b.icon} className="size-5" />
                    </span>
                    <span className="text-[0.7rem] leading-tight text-ink">{b.label}</span>
                  </li>
                ))}
              </ul>

              <ProductPurchase product={product} />
            </div>
          </div>

          <TrustBadges className="mt-10" />
        </div>
      </section>

      <section className="bg-ivory py-12 sm:py-16">
        <div className="container-page">
          <ProductTabs product={product} />
        </div>
      </section>

      <ProductReviews product={product} reviews={reviews} />

      <section className="relative isolate overflow-hidden bg-cream py-16 sm:py-20">
        <Botanical name="fern" className="top-0 right-0 w-20 -scale-100 opacity-40 sm:w-28" />
        <div className="container-page relative">
          <SectionHeading eyebrow="You may also like" title="Explore More Gummies" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} variant="shop" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
