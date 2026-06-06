import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

const COPYRIGHT_YEAR = 2026;

export function Footer() {
  return (
    <footer className="border-t border-[#D6B25E20] bg-[#050505] text-[#D8C7A1]">
      <div className="flex items-center justify-center px-8 py-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D6B25E40]" />
        <span className="px-4 text-lg text-[#D6B25E]">*</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D6B25E40]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <BrandLogo size="md" />
            <p className="mt-2 max-w-xs text-center text-sm text-[#D8C7A1] opacity-70 md:text-left">
              Premium Gulf-inspired women&apos;s fashion delivered to your door.
              Cash on delivery - no account required.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 md:items-start">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#D6B25E]">
              Quick Links
            </h4>
            {[
              { href: "/", label: "Home" },
              { href: "/products", label: "Collection" },
              { href: "/cart", label: "Cart" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#D8C7A1] transition-colors hover:text-[#D6B25E]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2 md:items-start">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#D6B25E]">
              Get In Touch
            </h4>
            <p className="text-sm opacity-70">Cairo, Egypt</p>
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-[#D6B25E] hover:underline"
            >
              WhatsApp Us
            </a>
            <a
              href="mailto:info@alkhaleiafashion.com"
              className="text-sm opacity-70 transition-colors hover:text-[#D6B25E] hover:opacity-100"
            >
              info@alkhaleiafashion.com
            </a>
            <div className="mt-2 flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="text-[#D8C7A1] transition-colors hover:text-[#D6B25E]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-[#D8C7A1] transition-colors hover:text-[#D6B25E]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#D6B25E15] pt-6 sm:flex-row">
          <p className="text-xs text-[#D8C7A1] opacity-50">
            Copyright {COPYRIGHT_YEAR} Al Khalejia Fashion. All rights
            reserved.
          </p>
          <p className="text-xs text-[#D6B25E] opacity-60">
            Cash on Delivery - No Account Required
          </p>
        </div>
      </div>
    </footer>
  );
}
