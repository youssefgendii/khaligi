import { supabaseAdmin } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category } from "@/lib/types";

async function getCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug")
    .order("name");
  return (data as Category[]) ?? [];
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="mb-6">
        <a
          href="/admin/products"
          className="text-sm text-gray-400 hover:text-[#A9822B] mb-2 inline-block"
        >
          ← Back to Products
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <ProductForm mode="new" categories={categories} />
    </div>
  );
}
