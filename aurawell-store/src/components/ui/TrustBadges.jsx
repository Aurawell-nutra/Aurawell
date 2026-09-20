import { Leaf, FlaskConical, Palette, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  { icon: Leaf, label: "Natural Ingredients" },
  { icon: Sprout, label: "Gelatin Free" },
  { icon: Palette, label: "No Artificial Colours" },
  { icon: FlaskConical, label: "No Artificial Flavours" },
];

export default function TrustBadges({ className }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {badges.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2.5 rounded-2xl border border-line bg-white/70 px-3 py-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sage text-forest">
            <Icon className="size-4" strokeWidth={1.5} aria-hidden />
          </span>
          <span className="text-xs leading-tight text-ink">{label}</span>
        </li>
      ))}
    </ul>
  );
}
