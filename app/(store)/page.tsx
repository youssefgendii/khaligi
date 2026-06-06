export const unstable_instant = { prefetch: "static", unstable_disableValidation: true };

import { Suspense } from "react";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { ProductCard } from "@/components/store/ProductCard";
import { Truck, UserX, Gem, Package } from "lucide-react";
import type { Product, Category } from "@/lib/types";

// ── cached data fetchers ────────────────────────────────────────────────────

async function getFeaturedProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);
  return (data as Product[]) ?? [];
}

async function getNewArrivals(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .eq("is_active", true)
    .eq("is_new_arrival", true)
    .order("created_at", { ascending: false })
    .limit(4);
  return (data as Product[]) ?? [];
}

async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  cacheTag("categories");
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data as Category[]) ?? [];
}

// ── async streaming sections ────────────────────────────────────────────────

async function CategoriesSection() {
  const categories = await getCategories();
  if (categories.length === 0) return null;
  return (
    <section className="bg-[#F8F4EA] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif-brand text-xl text-[#050505] text-center mb-6">
          Shop by Category
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="border border-[#D6B25E40] hover:border-[#D6B25E] bg-white hover:bg-[#050505] text-[#050505] hover:text-[#D6B25E] px-5 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-200"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function FeaturedSection() {
  const featured = await getFeaturedProducts();
  if (featured.length === 0) return null;
  return (
    <section className="bg-[#F8F4EA] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif-brand text-xl text-[#050505] text-center mb-8">
          Featured Collection
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-block border border-[#050505] hover:bg-[#050505] hover:text-[#D6B25E] text-[#050505] px-8 py-3 text-sm font-medium tracking-wider uppercase transition-all duration-200"
          >
            View Full Collection
          </Link>
        </div>
      </div>
    </section>
  );
}

async function NewArrivalsSection() {
  const newArrivals = await getNewArrivals();
  if (newArrivals.length === 0) return null;
  return (
    <section className="bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif-brand text-xl text-[#050505] text-center mb-8">
          New Arrivals
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── skeleton fallbacks ──────────────────────────────────────────────────────

function CategoriesSkeleton() {
  return (
    <div className="bg-[#F8F4EA] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="h-5 w-40 bg-gray-200 rounded mx-auto mb-6 animate-pulse" />
        <div className="flex flex-wrap justify-center gap-2">
          {[80, 100, 70, 90, 80, 60].map((w, i) => (
            <div key={i} style={{ width: w }} className="h-9 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="bg-[#F8F4EA] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="h-5 w-48 bg-gray-200 rounded mx-auto mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white rounded overflow-hidden border border-gray-100 animate-pulse">
              <div className="aspect-[3/4] bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-16 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── static sections (no data, render instantly) ─────────────────────────────

const BENEFITS = [
  { icon: Truck, title: "Cash on Delivery", desc: "Pay when your order arrives." },
  { icon: UserX, title: "No Account Needed", desc: "Quick guest checkout." },
  { icon: Package, title: "Fast Delivery", desc: "Packed and shipped with care." },
  { icon: Gem, title: "Boutique Quality", desc: "Premium Gulf-inspired fashion." },
];

// ── page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* HERO — static, renders immediately */}
      <section className="bg-[#050505] py-12 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="arabic-brand text-[#D6B25E] text-2xl mb-3 opacity-80">
            الخليجية
          </p>
          <h1 className="font-serif-brand text-3xl sm:text-5xl text-white leading-tight mb-3">
            Gulf-Inspired Fashion
          </h1>
          <p className="text-[#D8C7A1] opacity-60 text-sm sm:text-base mb-7">
            Premium women&apos;s fashion delivered to your door. Cash on delivery.
            No account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/products"
              className="w-full sm:w-auto bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold px-8 py-3.5 text-sm tracking-wide uppercase transition-colors duration-200 min-h-[48px] flex items-center justify-center touch-manipulation"
            >
              Shop Collection
            </Link>
            <Link
              href="/products?sort=new"
              className="w-full sm:w-auto border border-[#D6B25E50] text-[#D6B25E] hover:border-[#D6B25E] px-8 py-3.5 text-sm tracking-wide uppercase transition-colors duration-200 min-h-[48px] flex items-center justify-center touch-manipulation"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFITS — static */}
      <section className="bg-[#0B0B0B] border-y border-[#D6B25E15] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-2">
                <Icon className="w-6 h-6 text-[#D6B25E]" />
                <h3 className="text-[#D8C7A1] text-sm font-semibold">{title}</h3>
                <p className="text-[#D8C7A1] opacity-40 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES — streams in from cache */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>

      {/* FEATURED — streams in from cache */}
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <FeaturedSection />
      </Suspense>

      {/* NEW ARRIVALS — streams in from cache */}
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <NewArrivalsSection />
      </Suspense>

      {/* CTA — static */}
      <section className="bg-[#050505] py-14 px-4 text-center">
        <h2 className="font-serif-brand text-2xl text-white mb-3">
          Ready to Elevate Your Style?
        </h2>
        <p className="text-[#D8C7A1] opacity-60 mb-7 text-sm">
          Browse our full Gulf fashion collection — premium pieces for every
          occasion.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold px-10 py-3 text-sm tracking-wide uppercase transition-colors duration-200"
        >
          Explore Collection
        </Link>
      </section>
    </>
  );
}
