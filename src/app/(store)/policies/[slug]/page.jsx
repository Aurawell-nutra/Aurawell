import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { policies } from "@/data/policies";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: policies[slug]?.title };
}

export default async function PolicyPage({ params }) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();

  return (
    <>
      <PageHeader title="Our Policies" breadcrumbs={[{ label: policy.title }]} />

      <section className="bg-ivory py-12 sm:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[0.35fr_1fr]">
          <nav aria-label="Policies" className="h-fit rounded-3xl border border-line bg-white p-3 shadow-card lg:sticky lg:top-28">
            <ul>
              {Object.entries(policies).map(([key, p]) => (
                <li key={key}>
                  <Link
                    href={`/policies/${key}`}
                    aria-current={key === slug ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-colors",
                      key === slug ? "bg-sage font-medium text-forest" : "text-ink hover:bg-cream"
                    )}
                  >
                    {p.title}
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <article className="rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-10">
            <h2 className="text-3xl sm:text-4xl">{policy.title}</h2>
            <p className="mt-2 text-xs text-muted">Last updated: {policy.updated}</p>
            <div className="mt-8 space-y-6">
              {policy.sections.map((s) => (
                <section key={s.heading}>
                  <h3 className="font-sans text-base font-semibold text-ink">{s.heading}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
