"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote, Package, Settings, ShoppingBag, Store, X } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { useAdmin } from "@/components/admin/AdminProvider";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/products", label: "Products", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/reviews", label: "Reviews", icon: MessageSquareQuote },
  { href: "/subscribers", label: "Subscribers", icon: Mail },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, adminFetch, base, adminUrl } = useAdmin();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await adminFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace(adminUrl("/login"));
    router.refresh();
  };

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="border-b border-line p-5">
        <LogoMark tagline={false} className="h-10 w-auto" />
        <p className="mt-2 text-xs tracking-[0.2em] text-muted uppercase">Admin Panel</p>
      </div>
      <ul className="flex-1 space-y-1 p-3">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const target = adminUrl(href);
          const active = exact ? pathname === target : pathname.startsWith(target);
          return (
            <li key={href}>
              <Link
                href={target}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors",
                  active ? "bg-forest text-white" : "text-ink hover:bg-sage"
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-line p-3">
        <a href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-ink hover:bg-sage">
          <Store className="size-4" aria-hidden /> View Store
        </a>
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-ink hover:bg-rose hover:text-crimson">
          <LogOut className="size-4" aria-hidden /> Sign Out
        </button>
        <p className="truncate px-4 pt-2 text-xs text-muted" title={admin.email}>
          {admin.name} · {admin.email}
        </p>
      </div>
    </nav>
  );

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-ivory lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ivory/95 px-4 py-3 backdrop-blur lg:hidden">
        <LogoMark tagline={false} className="h-9 w-auto" />
        <button type="button" aria-label="Open admin menu" onClick={() => setOpen(true)} className="flex size-10 items-center justify-center rounded-full hover:bg-sage">
          <Menu className="size-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ivory shadow-soft">
            <button type="button" aria-label="Close admin menu" onClick={() => setOpen(false)} className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full hover:bg-sage">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="min-w-0 p-4 sm:p-8">{children}</main>
    </div>
  );
}
