import { cn } from "@/lib/utils";

export default function SectionHeading({ eyebrow, title, subtitle, align = "center", className }) {
  return (
    <div className={cn(align === "center" ? "mx-auto text-center" : "text-left", "max-w-2xl", className)}>
      {eyebrow && (
        <p className="mb-3 text-xs font-medium tracking-[0.2em] text-leaf uppercase">{eyebrow}</p>
      )}
      <h2 className="text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-muted sm:text-base">{subtitle}</p>}
    </div>
  );
}
