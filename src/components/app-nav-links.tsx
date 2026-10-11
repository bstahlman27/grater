"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  activePrefixes?: string[];
};

type AppNavLinksProps = {
  items: NavItem[];
};

function isActivePath(pathname: string, item: NavItem) {
  if (item.href === "/") {
    return pathname === "/";
  }

  return [item.href, ...(item.activePrefixes ?? [])].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function AppNavLinks({ items }: AppNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-zinc-700 lg:justify-center">
      {items.map((item) => {
        const isActive = isActivePath(pathname, item);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`transition hover:text-amber-500 ${
              isActive ? "font-black text-emerald-600" : ""
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
