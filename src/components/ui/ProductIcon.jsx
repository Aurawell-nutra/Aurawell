import { Heart, Flower2, Smile, Leaf, Apple, Activity, ShieldPlus, Zap, Droplet, Sparkles } from "lucide-react";

// Maps the icon names used in src/data/products.js to Lucide icons.
const icons = {
  heart: Heart,
  flower: Flower2,
  smile: Smile,
  leaf: Leaf,
  apple: Apple,
  activity: Activity,
  shield: ShieldPlus,
  zap: Zap,
  droplet: Droplet,
  sparkles: Sparkles,
};

export default function ProductIcon({ name, className }) {
  const Icon = icons[name] ?? Leaf;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}
