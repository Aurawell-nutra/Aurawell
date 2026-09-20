"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function NavLinks({ links }) {
  const pathname = usePathname();

  return (
    <ul className="hidden items-center gap-6 xl:gap-8 lg:flex">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <li key={link.label}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`relative py-1 text-sm font-light tracking-wide transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-forest after:transition-transform hover:text-forest ${
                active ? "font-normal text-forest after:scale-x-100" : "text-ink/75 after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
