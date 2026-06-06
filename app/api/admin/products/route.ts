import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/auth/admin";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sp = req.nextUrl.searchParams;
  const search = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const active = sp.get("active");

  let query = supabaseAdmin
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,product_code.ilike.%${search}%`);
  }
  if (category) query = query.eq("category_id", category);
  if (active === "true") query = query.eq("is_active", true);
  if (active === "false") query = query.eq("is_active", false);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  if (!body.name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!body.product_code?.trim()) return NextResponse.json({ error: "Product code is required." }, { status: 400 });
  if (!body.price) return NextResponse.json({ error: "Price is required." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      brand: body.brand ?? "Al Khalejia Fashion",
      brand_ar: body.brand_ar ?? "الخليجية",
      product_code: body.product_code.trim(),
      name: body.name.trim(),
      slug: body.slug?.trim() || body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category_id: body.category_id || null,
      short_description: body.short_description?.trim() || null,
      description: body.description?.trim() || null,
      image_url: body.image_url?.trim() || null,
      price: parseFloat(body.price),
      sale_price: body.sale_price ? parseFloat(body.sale_price) : null,
      available_sizes: body.available_sizes ?? [],
      available_colors: body.available_colors ?? [],
      stock_quantity: parseInt(body.stock_quantity ?? 0),
      is_active: body.is_active ?? true,
      is_featured: body.is_featured ?? false,
      is_new_arrival: body.is_new_arrival ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag("products", "max");
  return NextResponse.json(data, { status: 201 });
}
