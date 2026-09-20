import Link from "next/link";
import { Truck } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Botanical from "@/components/ui/Botanical";
import MobileMenu from "@/components/layout/MobileMenu";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavLinks from "@/components/layout/NavLinks";
import CartButton from "@/components/cart/CartButton";
import { navLinks, announcements } from "@/data/site";

const iconButton =
  "inline-flex size-9 md:size-10 items-center justify-center rounded-full text-forest transition-colors hover:bg-sage";

export default function Navbar() {
  return (
    <>
      <AnnouncementBar announcements={announcements} />

      <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/90 backdrop-blur-md">
        {/* Corner leaves, clipped to the navbar and kept behind the content. */}
        <div className="pointer-events-none absolute inset-0 isolate overflow-hidden" aria-hidden>
          <Botanical name="corner" className="bottom-0 left-0 hidden w-9 opacity-25 2xl:block" />
          <Botanical name="eucalyptus" className="top-0 right-0 hidden w-12 -scale-100 opacity-35 md:block" />
          <Botanical name="leafLight" className="-top-2 right-24 hidden w-6 rotate-[160deg] opacity-40 xl:block" />
        </div>
        <nav aria-label="Main" className="container-page relative flex h-14 md:h-16 items-center justify-between gap-4">
          <Logo />

          <NavLinks links={navLinks} />

          <div className="flex items-center gap-1 sm:gap-1.5">
            <Link href="/track-order" aria-label="Track your order" className={`${iconButton} hidden sm:inline-flex`}>
              <Truck className="size-[18px] md:size-5" strokeWidth={1.75} />
            </Link>
            <CartButton className={iconButton} />
            <MobileMenu links={navLinks} />
          </div>
        </nav>
      </header>
    </>
  );
}
