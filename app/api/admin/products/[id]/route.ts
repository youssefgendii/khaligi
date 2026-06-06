import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/auth/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const fields = [
    "brand", "brand_ar", "product_code", "name", "slug", "category_id",
    "short_description", "description", "image_url", "price", "sale_price",
    "available_sizes", "available_colors", "stock_quantity",
    "is_active", "is_featured", "is_new_arrival",
  ];
  for (const f of fields) {
    if (f in body) update[f] = body[f];
  }
  if (update.price) update.price = parseFloat(update.price as string);
  if (update.sale_price) update.sale_price = parseFloat(update.sale_price as string);
  if (update.stock_quantity !== undefined) update.stock_quantity = parseInt(update.stock_quantity as string);

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag("products", "max");
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag("products", "max");
  return NextResponse.json({ success: true });
}
