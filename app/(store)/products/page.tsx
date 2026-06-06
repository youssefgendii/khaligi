export const unstable_instant = { prefetch: "static", unstable_disableValidation: true };

import Link from "next/link";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";
import type { Product, Category } from "@/lib/types";
import { ProductFiltersClient } from "@/components/store/ProductFiltersClient";

interface SearchParams {
  q?: string;
  code?: string;
  category?: string;
  sort?: string;
  size?: string;
  color?: string;
  min?: string;
  max?: string;
}

async function getProducts(params: SearchParams): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  let query = supabase
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .eq("is_active", true);

  if (params.q) query = query.ilike("name", `%${params.q}%`);
  if (params.code) query = query.ilike("product_code", `%${params.code}%`);
  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (params.min) query = query.gte("price", parseFloat(params.min));
  if (params.max) query = query.lte("price", parseFloat(params.max));

  const sort = params.sort ?? "newest";
  if (sort === "newest" || sort === "new") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "featured") {
    query = query.eq("is_featured", true).order("created_at", { ascending: false });
  } else if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data } = await query.limit(60);
  let products = (data as Product[]) ?? [];

  if (params.size) {
    products = products.filter((p) =>
      p.available_sizes.some((s) => s.toLowerCase() === params.size!.toLowerCase())
    );
  }
  if (params.color) {
    products = products.filter((p) =>
      p.available_colors.some((c) => c.toLowerCase() === params.color!.toLowerCase())
    );
  }

  return products;
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

// ── streaming product grid ─────────────────────────────────────────────────��

async function ProductsGrid({ params }: { params: SearchParams }) {
  const products = await getProducts(params);
  const activeSearch = params.q || params.code;

  return (
    <>
      <p className="text-sm text-gray-500 mb-5">
        {products.length} product{products.length !== 1 ? "s" : ""}
        {activeSearch && <span className="ml-1">for &quot;{params.q || params.code}&quot;</span>}
      </p>

      {products.length === 0 ? (
        <EmptyState
          icon={<Search size={40} />}
          title="No products found"
          description={
            activeSearch
              ? `No products match "${params.q || params.code}". Try a different search.`
              : "No products available in this category yet."
          }
          action={
            <Link
              href="/products"
              className="bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold px-6 py-2.5 text-sm"
            >
              Clear Filters
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

// ── streaming filters sidebar ───────────────────────────────────────────────

async function FiltersSidebar({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const categories = await getCategories();
  return <ProductFiltersClient categories={categories} />;
}

function FiltersSkeleton() {
  return (
    <div className="lg:w-60 flex-shrink-0 animate-pulse space-y-4">
      <div className="h-5 w-24 bg-gray-200 rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-100 rounded" />
      ))}
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="bg-[#F8F4EA] min-h-screen">
      {/* Static header — renders immediately */}
      <div className="bg-[#050505] py-10 text-center">
        <p className="arabic-brand text-[#D6B25E] text-xl mb-1">الخليجية</p>
        <h1 className="font-serif-brand text-3xl text-white">Our Collection</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="h-px w-16 bg-[#D6B25E40]" />
          <span className="text-[#D6B25E] text-sm">Al Khalejia Fashion</span>
          <div className="h-px w-16 bg-[#D6B25E40]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar — streams from cache */}
          <Suspense fallback={<FiltersSkeleton />}>
            <FiltersSidebar searchParams={searchParams} />
          </Suspense>

          {/* Products grid — streams via searchParams.then() */}
          <div className="flex-1">
            <Suspense fallback={<ProductGridSkeleton />}>
              {searchParams.then((params) => <ProductsGrid params={params} />)}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
