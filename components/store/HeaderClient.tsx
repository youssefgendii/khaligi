"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/cart/store";

interface NavLink {
  href: string;
  label: string;
}

interface HeaderClientProps {
  navLinks: NavLink[];
}

export function HeaderClient({ navLinks }: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          className="p-3 -ml-1 text-[#D6B25E] touch-manipulation"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="flex items-center">
        <Link
          href="/products"
          className="p-3 text-[#D8C7A1] transition-colors hover:text-[#D6B25E] touch-manipulation"
          aria-label="Search products"
        >
          <Search size={20} />
        </Link>
        <Link
          href="/cart"
          className="relative p-3 -mr-2 text-[#D8C7A1] transition-colors hover:text-[#D6B25E] touch-manipulation"
          aria-label="Shopping cart"
        >
          <ShoppingBag size={20} />
          {totalItems > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D6B25E] text-[10px] font-bold leading-none text-[#050505]">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </Link>
      </div>

      {menuOpen && (
        <div className="absolute inset-x-0 top-16 border-t border-[#D6B25E20] bg-[#0B0B0B] px-4 py-2 lg:hidden shadow-2xl">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[#D6B25E10] py-4 text-sm font-medium uppercase tracking-wide text-[#D8C7A1] hover:text-[#D6B25E] last:border-0 touch-manipulation"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
