import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AdminProductsSearch } from "@/components/admin/AdminProductsSearch";
import type { Product } from "@/lib/types";

async function getProducts(q: string, active: string): Promise<Product[]> {
  let query = supabaseAdmin
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) query = query.or(`name.ilike.%${q}%,product_code.ilike.%${q}%`);
  if (active === "true") query = query.eq("is_active", true);
  if (active === "false") query = query.eq("is_active", false);

  const { data } = await query;
  return (data as Product[]) ?? [];
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; active?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const active = sp.active ?? "";
  const products = await getProducts(q, active);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold px-4 py-2 text-sm rounded transition-colors"
        >
          + Add Product
        </Link>
      </div>

      <AdminProductsSearch currentQ={q} currentActive={active} />

      <div className="bg-white rounded border border-gray-200 shadow-sm mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Image", "Code", "Name", "Category", "Price", "Stock", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="relative w-10 h-12 bg-gray-100 rounded overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[#D6B25E] text-xs opacity-40">✦</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-[#050505]">
                  {product.product_code}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px]">
                  <p className="truncate">{product.name}</p>
                  {product.is_featured && (
                    <span className="text-[10px] text-[#A9822B]">★ Featured</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {product.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 font-semibold whitespace-nowrap">
                  {formatPrice(product.sale_price ?? product.price)}
                  {product.sale_price && (
                    <span className="text-xs text-gray-400 line-through ml-1">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{product.stock_quantity}</td>
                <td className="px-4 py-3">
                  <Badge variant={product.is_active ? "green" : "gray"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-[#A9822B] hover:underline text-xs font-medium"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  No products found.{" "}
                  <Link href="/admin/products/new" className="text-[#A9822B] hover:underline">
                    Add your first product.
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
