import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { HeaderClient } from "./HeaderClient";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collection" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#D6B25E20] bg-[#050505] shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium uppercase tracking-wide text-[#D8C7A1] transition-colors duration-150 hover:text-[#D6B25E]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="absolute left-1/2 -translate-x-1/2">
            <BrandLogo size="sm" />
          </div>

          <HeaderClient navLinks={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
