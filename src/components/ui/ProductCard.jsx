import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { cn, formatPrice } from "@/lib/utils";

/** `variant="shop"` shows Add to Cart; the default (home) variant links to the product. */
export default function ProductCard({ product, variant = "home" }) {
  const { name, subtitle, description, price, count, flavour, image, theme, slug } = product;
  const href = `/shop/${slug}`;

  return (
    <article style={theme.style} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-shadow duration-300 hover:shadow-soft sm:rounded-3xl">
      <Link href={href} className={cn("relative block aspect-[4/5] overflow-hidden", theme.bg)} tabIndex={-1}>
        <Image
          src={image}
          alt={`${name} — bottle of ${count} gummies`}
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 45vw"
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04] sm:p-5"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 text-center sm:p-5">
        <h3 className={cn("font-sans text-sm font-semibold tracking-wide uppercase", theme.accent)}>
          <Link href={href} className="hover:underline">
            {name}
          </Link>
        </h3>
        <p className="mt-1 text-xs font-medium text-ink">{subtitle}</p>
        <p className="mt-2 hidden flex-1 text-xs leading-relaxed text-muted sm:block">{description}</p>

        <div className="mt-3 flex flex-col items-center gap-1 border-t border-line pt-3 text-xs text-muted sm:mt-4 sm:flex-row sm:justify-between sm:pt-4">
          <span className="order-2 sm:order-1">
            {count} Gummies · {flavour.replace(" Flavour", "")}
          </span>
          <span className="order-1 font-serif text-lg font-semibold text-forest sm:order-2">{formatPrice(price)}</span>
        </div>

        {variant === "shop" ? (
          <AddToCartButton product={product} className={cn("mt-3 px-4 py-2.5 text-xs sm:mt-4 sm:px-5", theme.button)} />
        ) : (
          <Link
            href={href}
            className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-forest px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-forest-dark sm:mt-4 sm:gap-2 sm:px-5"
          >
            View Product <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}
