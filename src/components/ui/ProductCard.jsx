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
    <article style={theme.style} className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-shadow duration-300 hover:shadow-soft">
      <Link href={href} className={cn("relative block aspect-[4/5] overflow-hidden", theme.bg)} tabIndex={-1}>
        <Image
          src={image}
          alt={`${name} — bottle of ${count} gummies`}
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5 text-center">
        <h3 className={cn("font-sans text-sm font-semibold tracking-wide uppercase", theme.accent)}>
          <Link href={href} className="hover:underline">
            {name}
          </Link>
        </h3>
        <p className="mt-1 text-xs font-medium text-ink">{subtitle}</p>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">{description}</p>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
          <span>
            {count} Gummies · {flavour.replace(" Flavour", "")}
          </span>
          <span className="font-serif text-lg font-semibold text-forest">{formatPrice(price)}</span>
        </div>

        {variant === "shop" ? (
          <AddToCartButton product={product} className={cn("mt-4 px-5 py-2.5 text-xs", theme.button)} />
        ) : (
          <Link
            href={href}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-forest-dark"
          >
            View Product <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}
