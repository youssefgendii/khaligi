"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, LogOut, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/upload", label: "Upload Images", icon: ImagePlus },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="w-60 bg-[#050505] border-r border-[#D6B25E20] flex flex-col min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#D6B25E20]">
        <p className="arabic-brand text-[#D6B25E] text-xl">الخليجية</p>
        <p className="text-[#D8C7A1] text-[10px] tracking-[0.2em] uppercase opacity-60 mt-0.5">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-150",
                active
                  ? "bg-[#D6B25E] text-[#050505] font-semibold"
                  : "text-[#D8C7A1] hover:bg-[#D6B25E15] hover:text-[#D6B25E]"
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#D6B25E20]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm text-[#D8C7A1] hover:bg-red-500/10 hover:text-red-400 rounded transition-all"
        >
          <LogOut size={17} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
