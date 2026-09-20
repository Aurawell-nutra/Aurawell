import HeroSection from "@/components/home/HeroSection";
import ProductShowcase from "@/components/home/ProductShowcase";
import BenefitsSection from "@/components/home/BenefitsSection";
import BrandStorySection from "@/components/home/BrandStorySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { getHomepageReviews, getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, reviews] = await Promise.all([getProducts(), getHomepageReviews()]);

  return (
    <>
      <HeroSection />
      <ProductShowcase products={products} />
      <BenefitsSection />
      <BrandStorySection />
      <TestimonialsSection reviews={reviews} />
      <NewsletterSection />
    </>
  );
}
