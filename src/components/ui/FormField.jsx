import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-line bg-ivory px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-forest focus:bg-white focus:outline-none aria-[invalid=true]:border-crimson";

/** Label + input (or textarea/select via `as`) + optional error message. */
export default function FormField({ label, name, as: Tag = "input", error, className, children, ...props }) {
  const id = `field-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <Tag
        id={id}
        name={name}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputClass, Tag === "textarea" && "min-h-32 resize-y")}
        {...props}
      >
        {children}
      </Tag>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}
