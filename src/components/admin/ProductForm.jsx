"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, Trash2, Upload } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Card, adminButton } from "@/components/admin/ui";
import FormField, { inputClass } from "@/components/ui/FormField";
import ProductIcon from "@/components/ui/ProductIcon";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "blush", label: "Blush pink", swatch: "bg-blush" },
  { value: "sage", label: "Sage green", swatch: "bg-sage" },
  { value: "peach", label: "Peach", swatch: "bg-peach" },
  { value: "rose", label: "Rose red", swatch: "bg-rose" },
];
const ICONS = ["heart", "flower", "smile", "leaf", "apple", "activity", "shield", "zap", "droplet", "sparkles"];

const empty = {
  name: "", slug: "", shortDescription: "", description: "", price: "", compareAtPrice: "", stockQuantity: 0, sku: "",
  mainImage: "", heroImage: "", galleryImages: [], ingredients: [], benefits: [], usageInstructions: "", warnings: "",
  storageInfo: "", category: "", subtitle: "", tagline: "", flavour: "", servingCount: 30, theme: "sage", scriptLines: ["", "", ""],
  isActive: true, isFeatured: false, sortOrder: 0,
};

const slugify = (v) => v.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function Section({ title, description, children }) {
  return (
    <Card>
      <h2 className="text-xl">{title}</h2>
      {description && <p className="mt-1 text-xs text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function ImageField({ label, value, onChange, error, onUpload, uploading }) {
  const input = useRef(null);
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      <div className="flex gap-3">
        <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-cream">
          {value && /^\/(images|api\/media)\//.test(value) ? (
            <Image src={value} alt="" fill sizes="64px" className="object-contain p-1" unoptimized={value.startsWith("/api/")} />
          ) : (
            <ImagePlus className="m-auto mt-5 size-5 text-muted" aria-hidden />
          )}
        </span>
        <div className="flex-1">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/products/…" className={inputClass} aria-label={`${label} path`} aria-invalid={error ? "true" : undefined} />
          <button type="button" onClick={() => input.current?.click()} disabled={uploading} className="mt-2 inline-flex items-center gap-1.5 text-xs text-forest hover:underline disabled:opacity-50">
            <Upload className="size-3.5" aria-hidden /> {uploading ? "Uploading…" : "Upload image (JPG, PNG, WebP · max 2 MB)"}
          </button>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onUpload(file, onChange);
            }}
          />
          {error && <p className="mt-1 text-xs text-crimson">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ProductForm({ product, hasOrders = false }) {
  const router = useRouter();
  const { adminFetch } = useAdmin();
  const isNew = !product;
  const [form, setForm] = useState(() =>
    product
      ? {
          ...empty,
          ...product,
          compareAtPrice: product.compareAtPrice ?? "",
          sku: product.sku ?? "",
          heroImage: product.heroImage ?? "",
          storageInfo: product.storageInfo ?? "",
          subtitle: product.subtitle ?? "",
          tagline: product.tagline ?? "",
          flavour: product.flavour ?? "",
          scriptLines: [...product.scriptLines, "", "", ""].slice(0, 3),
        }
      : empty
  );
  const isCustomTheme = /^#/.test(form.theme);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const text = (key) => ({ name: key, value: form[key], onChange: (e) => set(key, e.target.value), error: errors[key] });

  const upload = async (file, apply) => {
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const { path } = await adminFetch("/api/admin/uploads", { method: "POST", body });
      apply(path);
    } catch (err) {
      setMessage({ tone: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const listUpdate = (key, index, patch) =>
    set(key, form[key].map((row, i) => (i === index ? (typeof patch === "object" && patch !== null ? { ...row, ...patch } : patch) : row)));
  const listRemove = (key, index) => set(key, form[key].filter((_, i) => i !== index));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage(null);
    const payload = {
      ...Object.fromEntries(Object.keys(empty).map((k) => [k, form[k]])),
      compareAtPrice: form.compareAtPrice === "" ? null : form.compareAtPrice,
      sku: form.sku.trim() ? form.sku.trim().toUpperCase() : null,
      heroImage: form.heroImage || null,
      storageInfo: form.storageInfo || null,
      subtitle: form.subtitle || null,
      tagline: form.tagline || null,
      flavour: form.flavour || null,
      scriptLines: form.scriptLines.map((l) => l.trim()).filter(Boolean),
      galleryImages: form.galleryImages.filter(Boolean),
    };
    try {
      const { product: saved } = await adminFetch(isNew ? "/api/admin/products" : `/api/admin/products/${product.id}`, {
        method: isNew ? "POST" : "PATCH",
        body: payload,
      });
      if (isNew) {
        router.replace(`/products/${saved.id}/edit`);
      } else {
        setMessage({ tone: "success", text: "Product saved." });
        router.refresh();
      }
    } catch (err) {
      setErrors(err.fields ?? {});
      setMessage({ tone: "error", text: err.message });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const question = hasOrders
      ? "This product has orders, so it will be deactivated (hidden from the store) rather than deleted. Continue?"
      : "Delete this product permanently? This cannot be undone.";
    if (!window.confirm(question)) return;
    try {
      const res = await adminFetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (res.result === "deleted") {
        router.replace("/products");
        router.refresh();
      } else {
        setForm((f) => ({ ...f, isActive: false, isFeatured: false }));
        setMessage({ tone: "success", text: res.message });
        router.refresh();
      }
    } catch (err) {
      setMessage({ tone: "error", text: err.message });
    }
  };

  const fieldErrorFor = (prefix) => Object.entries(errors).find(([k]) => k.startsWith(prefix))?.[1];

  return (
    <form onSubmit={save} noValidate className="space-y-6">
      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={cn("rounded-2xl px-4 py-3 text-sm", message.tone === "error" ? "bg-rose text-crimson" : "bg-sage text-forest")}>
          {message.text}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Section title="Basic information">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Product name"
                {...text("name")}
                maxLength={100}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
              <FormField
                label="URL slug"
                {...text("slug")}
                maxLength={80}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
              <FormField label="Category" {...text("category")} maxLength={60} placeholder="e.g. Gut Wellness" />
              <FormField label="Subtitle" {...text("subtitle")} maxLength={80} placeholder="e.g. Gut Care" />
              <FormField label="Tagline" {...text("tagline")} maxLength={120} className="sm:col-span-2" />
              <FormField label="Short description" as="textarea" {...text("shortDescription")} maxLength={200} className="sm:col-span-2" />
              <FormField label="Full description (About this product)" as="textarea" {...text("description")} maxLength={3000} className="sm:col-span-2" />
            </div>
          </Section>

          <Section title="Ingredients" description="Shown as a table on the product page, as printed on the label.">
            <div className="space-y-2">
              {form.ingredients.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_90px_auto] gap-2">
                  <input aria-label="Ingredient name" value={row.name} onChange={(e) => listUpdate("ingredients", i, { name: e.target.value })} maxLength={80} className={inputClass} placeholder="Ingredient" />
                  <input aria-label="Quantity" value={row.quantity} onChange={(e) => listUpdate("ingredients", i, { quantity: e.target.value })} maxLength={20} className={inputClass} placeholder="Qty" />
                  <input aria-label="Unit" value={row.unit} onChange={(e) => listUpdate("ingredients", i, { unit: e.target.value })} maxLength={20} className={inputClass} placeholder="Unit" />
                  <button type="button" aria-label="Remove ingredient" onClick={() => listRemove("ingredients", i)} className="px-2 text-muted hover:text-crimson">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            {fieldErrorFor("ingredients") && <p className="mt-2 text-xs text-crimson">{fieldErrorFor("ingredients")}</p>}
            <button type="button" onClick={() => set("ingredients", [...form.ingredients, { name: "", quantity: "", unit: "mg" }])} className={cn(adminButton.outline, "mt-3")}>
              <Plus className="size-4" aria-hidden /> Add ingredient
            </button>
          </Section>

          <Section title="Benefits" description="Up to 8 icon + label pairs shown under the price.">
            <div className="space-y-2">
              {form.benefits.map((row, i) => (
                <div key={i} className="grid grid-cols-[auto_150px_1fr_auto] items-center gap-2">
                  <span className="flex size-10 items-center justify-center rounded-full bg-sage text-forest">
                    <ProductIcon name={row.icon} className="size-4" />
                  </span>
                  <select aria-label="Icon" value={row.icon} onChange={(e) => listUpdate("benefits", i, { icon: e.target.value })} className={inputClass}>
                    {ICONS.map((icon) => (
                      <option key={icon}>{icon}</option>
                    ))}
                  </select>
                  <input aria-label="Benefit label" value={row.label} onChange={(e) => listUpdate("benefits", i, { label: e.target.value })} maxLength={40} className={inputClass} placeholder="e.g. Immunity Support" />
                  <button type="button" aria-label="Remove benefit" onClick={() => listRemove("benefits", i)} className="px-2 text-muted hover:text-crimson">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            {fieldErrorFor("benefits") && <p className="mt-2 text-xs text-crimson">{fieldErrorFor("benefits")}</p>}
            {form.benefits.length < 8 && (
              <button type="button" onClick={() => set("benefits", [...form.benefits, { icon: "leaf", label: "" }])} className={cn(adminButton.outline, "mt-3")}>
                <Plus className="size-4" aria-hidden /> Add benefit
              </button>
            )}
          </Section>

          <Section title="Usage & safety">
            <div className="grid gap-4">
              <FormField label="How to use" as="textarea" {...text("usageInstructions")} maxLength={1000} />
              <FormField label="Warnings / caution" as="textarea" {...text("warnings")} maxLength={2000} />
              <FormField label="Storage (optional)" as="textarea" {...text("storageInfo")} maxLength={500} />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Visibility">
            <div className="space-y-3">
              {[
                ["isActive", "Active", "Visible and purchasable in the store"],
                ["isFeatured", "Featured", "Highlight this product"],
              ].map(([key, label, note]) => (
                <label key={key} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-3">
                  <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="mt-1 accent-forest" />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted">{note}</span>
                  </span>
                </label>
              ))}
              <FormField label="Display order (lower shows first)" type="number" min={0} max={10000} {...text("sortOrder")} />
            </div>
          </Section>

          <Section title="Pricing & inventory" description="Prices in ₹, inclusive of taxes.">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <FormField label="Price (₹)" type="number" min={1} step="0.01" inputMode="decimal" {...text("price")} />
              <FormField label="Compare-at price / MRP (₹)" type="number" min={1} step="0.01" inputMode="decimal" {...text("compareAtPrice")} />
              <FormField label="Stock quantity" type="number" min={0} step={1} {...text("stockQuantity")} />
              <FormField label="Product code (SKU, optional)" {...text("sku")} maxLength={40} placeholder="e.g. AW-GUT-30" />
              <FormField label="Gummies per bottle" type="number" min={1} {...text("servingCount")} />
              <FormField label="Flavour" {...text("flavour")} maxLength={60} placeholder="Orange Flavour" />
            </div>
          </Section>

          <Section title="Images">
            <div className="space-y-5">
              <ImageField label="Main image" value={form.mainImage} onChange={(v) => set("mainImage", v)} error={errors.mainImage} onUpload={upload} uploading={uploading} />
              <ImageField label="Hero image (optional)" value={form.heroImage} onChange={(v) => set("heroImage", v)} error={errors.heroImage} onUpload={upload} uploading={uploading} />
              <div>
                <p className="text-sm font-medium text-ink">Gallery</p>
                <div className="mt-2 space-y-4">
                  {form.galleryImages.map((src, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1">
                        <ImageField label={`Gallery image ${i + 1}`} value={src} onChange={(v) => listUpdate("galleryImages", i, v)} error={errors[`galleryImages.${i}`]} onUpload={upload} uploading={uploading} />
                      </div>
                      <button type="button" aria-label="Remove gallery image" onClick={() => listRemove("galleryImages", i)} className="mt-8 px-2 text-muted hover:text-crimson">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {form.galleryImages.length < 8 && (
                  <button type="button" onClick={() => set("galleryImages", [...form.galleryImages, ""])} className={cn(adminButton.outline, "mt-3")}>
                    <Plus className="size-4" aria-hidden /> Add gallery image
                  </button>
                )}
              </div>
            </div>
          </Section>

          <Section title="Storefront style">
            <p className="mb-2 text-sm font-medium text-ink">Colour theme</p>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <label key={t.value} className={cn("flex cursor-pointer items-center gap-2 rounded-2xl border p-2.5 text-sm", form.theme === t.value ? "border-forest" : "border-line")}>
                  <input type="radio" name="theme" value={t.value} checked={form.theme === t.value} onChange={() => set("theme", t.value)} className="accent-forest" />
                  <span className={cn("size-4 rounded-full border border-line", t.swatch)} />
                  {t.label}
                </label>
              ))}
              <label className={cn("col-span-2 flex cursor-pointer items-center gap-2 rounded-2xl border p-2.5 text-sm", isCustomTheme ? "border-forest" : "border-line")}>
                <input
                  type="radio"
                  name="theme"
                  value="custom"
                  checked={isCustomTheme}
                  onChange={() => set("theme", isCustomTheme ? form.theme : "#0f4a2e")}
                  className="accent-forest"
                />
                Custom colour
                <input
                  type="color"
                  aria-label="Custom theme colour"
                  value={isCustomTheme ? form.theme : "#0f4a2e"}
                  onChange={(e) => set("theme", e.target.value)}
                  className="ml-auto h-8 w-12 cursor-pointer rounded-lg border border-line bg-white p-0.5"
                />
                {isCustomTheme && <span className="w-16 font-mono text-xs text-muted uppercase">{form.theme}</span>}
              </label>
            </div>
            {errors.theme && <p className="mt-1 text-xs text-crimson">{errors.theme}</p>}
            <p className="mt-2 text-xs text-muted">Sets the card background, product name and button colour in the store.</p>
            <p className="mt-5 mb-2 text-sm font-medium text-ink">Script tagline (up to 3 short lines)</p>
            <div className="space-y-2">
              {form.scriptLines.map((line, i) => (
                <input key={i} aria-label={`Script line ${i + 1}`} value={line} maxLength={30} onChange={(e) => listUpdate("scriptLines", i, e.target.value)} className={inputClass} />
              ))}
            </div>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        {!isNew ? (
          <button type="button" onClick={remove} className={adminButton.danger}>
            <Trash2 className="size-4" aria-hidden /> {hasOrders ? "Deactivate" : "Delete"}
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/products")} className={adminButton.outline}>
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading} className={adminButton.primary}>
            {saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
