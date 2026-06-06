"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Product, Category } from "@/lib/types";

interface Props {
  product?: Partial<Product>;
  categories: Category[];
  mode: "new" | "edit";
}

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "One Size"];
const COMMON_COLORS = ["Black", "White", "Beige", "Brown", "Navy", "Blue", "Pink", "Gray", "Green", "Red", "Purple", "Gold"];

export function ProductForm({ product, categories, mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    brand: product?.brand ?? "Al Khalejia Fashion",
    brand_ar: product?.brand_ar ?? "الخليجية",
    product_code: product?.product_code ?? "",
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category_id: product?.category_id ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    image_url: product?.image_url ?? "",
    price: product?.price?.toString() ?? "",
    sale_price: product?.sale_price?.toString() ?? "",
    stock_quantity: product?.stock_quantity?.toString() ?? "0",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    available_sizes: product?.available_sizes ?? [],
    available_colors: product?.available_colors ?? [],
  });

  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function autoSlug(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    set("slug", slug);
  }

  function addSize(size: string) {
    const s = size.trim();
    if (s && !form.available_sizes.includes(s)) {
      set("available_sizes", [...form.available_sizes, s]);
    }
    setNewSize("");
  }

  function removeSize(size: string) {
    set("available_sizes", form.available_sizes.filter((s) => s !== size));
  }

  function addColor(color: string) {
    const c = color.trim();
    if (c && !form.available_colors.includes(c)) {
      set("available_colors", [...form.available_colors, c]);
    }
    setNewColor("");
  }

  function removeColor(color: string) {
    set("available_colors", form.available_colors.filter((c) => c !== color));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    if (!form.product_code.trim()) { toast.error("Product code is required."); return; }
    if (!form.price) { toast.error("Price is required."); return; }

    setLoading(true);
    try {
      const url = mode === "new" ? "/api/admin/products" : `/api/admin/products/${product?.id}`;
      const method = mode === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
          stock_quantity: parseInt(form.stock_quantity || "0"),
          category_id: form.category_id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to save."); return; }
      toast.success(mode === "new" ? "Product created!" : "Product updated!");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic info */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Product Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Product Code *</label>
                <input
                  type="text"
                  value={form.product_code}
                  onChange={(e) => set("product_code", e.target.value)}
                  required
                  placeholder="e.g. 7005"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => set("category_id", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none bg-white"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { set("name", e.target.value); if (!product?.slug) autoSlug(e.target.value); }}
                  required
                  placeholder="e.g. White Organza Sleeve Blouse"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="auto-generated-from-name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => set("brand", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Brand (Arabic)</label>
                <input type="text" value={form.brand_ar} onChange={(e) => set("brand_ar", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none text-right arabic-brand" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Short Description</label>
                <input type="text" value={form.short_description} onChange={(e) => set("short_description", e.target.value)}
                  placeholder="One-line summary"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Full Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  rows={4} placeholder="Detailed product description"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none resize-none" />
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Available Sizes</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.available_sizes.map((size) => (
                <span key={size} className="flex items-center gap-1 bg-[#050505] text-[#D6B25E] text-xs px-2.5 py-1 rounded-sm">
                  {size}
                  <button type="button" onClick={() => removeSize(size)} className="hover:text-red-400"><X size={11} /></button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {COMMON_SIZES.filter((s) => !form.available_sizes.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => addSize(s)}
                  className="text-xs border border-dashed border-gray-300 px-2.5 py-1 text-gray-500 hover:border-[#D6B25E] hover:text-[#A9822B] rounded-sm transition-colors">
                  + {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newSize} onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize(newSize))}
                placeholder="Custom size" className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none" />
              <button type="button" onClick={() => addSize(newSize)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-[#D6B25E] text-gray-600 hover:text-[#050505] text-sm rounded transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Available Colors</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.available_colors.map((color) => (
                <span key={color} className="flex items-center gap-1 bg-[#D6B25E20] border border-[#D6B25E40] text-[#A9822B] text-xs px-2.5 py-1 rounded-sm">
                  {color}
                  <button type="button" onClick={() => removeColor(color)} className="hover:text-red-400"><X size={11} /></button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {COMMON_COLORS.filter((c) => !form.available_colors.includes(c)).map((c) => (
                <button key={c} type="button" onClick={() => addColor(c)}
                  className="text-xs border border-dashed border-gray-300 px-2.5 py-1 text-gray-500 hover:border-[#D6B25E] hover:text-[#A9822B] rounded-sm transition-colors">
                  + {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor(newColor))}
                placeholder="Custom color" className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none" />
              <button type="button" onClick={() => addColor(newColor)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-[#D6B25E] text-gray-600 hover:text-[#050505] text-sm rounded transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Pricing */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Pricing & Stock</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Price (EGP) *</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)}
                  required className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Sale Price (Optional)</label>
                <input type="number" min="0" step="0.01" value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Stock Quantity</label>
                <input type="number" min="0" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#D6B25E] focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Product Image</h3>
            <p className="text-xs text-gray-400 mb-3">Click or drag a photo to upload</p>
            <ImageUploader
              value={form.image_url}
              onChange={(url) => set("image_url", url)}
            />
          </div>

          {/* Status toggles */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              {[
                { key: "is_active", label: "Active (visible on store)" },
                { key: "is_featured", label: "Featured" },
                { key: "is_new_arrival", label: "New Arrival" },
              ].map((toggle) => (
                <label key={toggle.key} className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => set(toggle.key, !form[toggle.key as keyof typeof form])}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      form[toggle.key as keyof typeof form] ? "bg-[#D6B25E]" : "bg-gray-200"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      form[toggle.key as keyof typeof form] ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </div>
                  <span className="text-sm text-gray-700">{toggle.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold py-3 text-sm rounded transition-colors disabled:opacity-50">
              {loading ? "Saving..." : mode === "new" ? "Create Product" : "Save Changes"}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-4 py-3 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
