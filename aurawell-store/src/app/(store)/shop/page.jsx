import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import TrustBadges from "@/components/ui/TrustBadges";
import ShopCatalog from "@/components/shop/ShopCatalog";
import PromoBanner from "@/components/shop/PromoBanner";
import { getCategories, getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop All Gummies",
  description: "Discover our collection of thoughtfully formulated wellness gummies.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <PageHeader
        title="Our Wellness Gummies"
        subtitle="Discover our collection of thoughtfully formulated gummies, created for a healthier, brighter you."
        breadcrumbs={[{ label: "Shop" }]}
      />

      <section className="bg-ivory py-12 sm:py-16">
        <div className="container-page">
          <Suspense>
            <ShopCatalog products={products} categories={getCategories(products)} />
          </Suspense>
          <TrustBadges className="mt-14" />
        </div>
      </section>

      <PromoBanner />
    </>
  );
}
