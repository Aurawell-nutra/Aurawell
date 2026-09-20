import Botanical from "@/components/ui/Botanical";
import { ShieldCheck, Truck, Headset, BadgeCheck } from "lucide-react";
import NewsletterForm from "@/components/home/NewsletterForm";

const trustBadges = [
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Truck, label: "Fast Shipping" },
  { icon: Headset, label: "Dedicated Support" },
  { icon: BadgeCheck, label: "100% Authentic" },
];

export default function NewsletterSection() {
  return (
    <section id="newsletter" className="scroll-mt-24 bg-cream pb-16 sm:pb-20 lg:pb-24">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-forest px-5 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
          <Botanical name="corner" className="top-0 right-0 w-36 -scale-y-100 opacity-30 lg:w-48" />
          <Botanical name="tropical" className="bottom-0 left-0 w-32 opacity-20 sm:w-44" />
          <Botanical name="eucalyptus" className="right-0 bottom-0 hidden w-24 -scale-x-100 opacity-20 sm:block" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
            <div className="text-center lg:text-left">
              <p className="font-script text-3xl text-sage-dark">Aaurawell Nutra</p>
              <h2 className="mt-1 text-3xl leading-tight text-white sm:text-4xl">New Era of Wellness</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/75 lg:mx-0">
                Join our community for wellness tips, new launches and exclusive offers — straight to your inbox.
              </p>
              <NewsletterForm />
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {trustBadges.map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-2.5 text-center sm:gap-3">
                  <span className="flex size-12 items-center justify-center rounded-full border border-white/30 bg-white/5 sm:size-14">
                    <Icon className="size-5 sm:size-6" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="text-xs text-white/85">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
