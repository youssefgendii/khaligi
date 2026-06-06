import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product, Category } from "@/lib/types";

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Product) ?? null;
}

async function getCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug")
    .order("name");
  return (data as Category[]) ?? [];
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <a
          href="/admin/products"
          className="text-sm text-gray-400 hover:text-[#A9822B] mb-2 inline-block"
        >
          ← Back to Products
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500 font-mono mt-0.5">{product.product_code}</p>
      </div>

      <ProductForm mode="edit" product={product} categories={categories} />
    </div>
  );
}
