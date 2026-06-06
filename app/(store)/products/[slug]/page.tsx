export const unstable_instant = { prefetch: "static" };

import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { ProductDetailsClient } from "@/components/store/ProductDetailsClient";
import { ProductCard } from "@/components/store/ProductCard";
import type { Product } from "@/lib/types";

async function getProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product-${slug}`);
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as Product) ?? null;
}

async function getRelated(product: Product): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  let query = supabase
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);
  if (product.category_id) query = query.eq("category_id", product.category_id);
  const { data } = await query.order("created_at", { ascending: false });
  return (data as Product[]) ?? [];
}

// ── metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — Al Khalejia Fashion`,
    description: product.short_description ?? product.name,
  };
}

// ── streaming sections ───────────────────────────────────────────────────────

async function ProductContent({ slug }: { slug: string }) {
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <ProductDetailsClient product={product} />
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts product={product} />
      </Suspense>
    </>
  );
}

async function RelatedProducts({ product }: { product: Product }) {
  const related = await getRelated(product);
  if (related.length === 0) return null;
  return (
    <section className="py-12 border-t border-[#D6B25E20] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif-brand text-xl text-[#050505] text-center mb-8">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="bg-[#F8F4EA] animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/2 aspect-[3/4] bg-gray-200 rounded" />
          <div className="lg:w-1/2 space-y-4 pt-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-px bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
              <div className="h-4 w-4/6 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedSkeleton() {
  return (
    <div className="py-12 bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-5 w-48 bg-gray-200 rounded mx-auto mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded overflow-hidden">
              <div className="aspect-[3/4] bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="bg-[#F8F4EA]">
      {/* Breadcrumb — static, renders immediately */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#A9822B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#A9822B] transition-colors">
            Collection
          </Link>
          <span>/</span>
          <span className="text-[#050505] font-medium">Product</span>
        </div>
      </div>

      {/* Product content + related — both stream in */}
      <Suspense fallback={<ProductDetailSkeleton />}>
        {params.then(({ slug }) => <ProductContent slug={slug} />)}
      </Suspense>
    </div>
  );
}
