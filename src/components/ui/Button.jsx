import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-forest text-white hover:bg-forest-dark",
  outline: "border border-forest text-forest hover:bg-forest hover:text-white",
  light: "bg-white text-forest hover:bg-cream",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
};

/** Pill-shaped button. Renders a Link when `href` is provided. */
export default function Button({ href, variant = "primary", size = "md", className, children, ...props }) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
