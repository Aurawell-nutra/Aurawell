import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Botanical from "@/components/ui/Botanical";
import StoreLayout from "@/app/(store)/layout";

export default function NotFound() {
  return (
    <StoreLayout>
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-ivory to-sage/60 py-24 text-center">
      <Botanical name="corner" className="top-0 right-0 w-40 -scale-y-100 opacity-70" />
      <div className="container-page relative">
        <p className="font-script text-6xl text-leaf">Oops!</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Page not found</h1>
        <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Button href="/" className="mt-8">
          Back to Home <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </section>
    </StoreLayout>
  );
}
