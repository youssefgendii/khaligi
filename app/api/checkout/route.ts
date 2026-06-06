import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateOrderNumber } from "@/lib/utils";
import type { CartItem, CheckoutFormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { form, items, delivery_fee } = body as {
      form: CheckoutFormData;
      items: CartItem[];
      delivery_fee: number;
    };

    // Validate
    if (!form.full_name?.trim()) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!form.phone?.trim()) return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    if (!form.address_line1?.trim()) return NextResponse.json({ error: "Address is required." }, { status: 400 });
    if (!form.city?.trim()) return NextResponse.json({ error: "City is required." }, { status: 400 });
    if (!items || items.length === 0) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });

    // Validate each item has size and color
    for (const item of items) {
      if (!item.selected_size) return NextResponse.json({ error: `Missing size for ${item.name}.` }, { status: 400 });
      if (!item.selected_color) return NextResponse.json({ error: `Missing color for ${item.name}.` }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fee = delivery_fee ?? 50;
    const total = subtotal + fee;
    const order_number = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number,
        customer_full_name: form.full_name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email?.trim() || null,
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2?.trim() || null,
        city: form.city.trim(),
        notes: form.notes?.trim() || null,
        status: "pending",
        payment_method: "cash_on_delivery",
        payment_status: "unpaid",
        subtotal,
        delivery_fee: fee,
        total,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_code: item.product_code,
      brand: item.brand,
      brand_ar: item.brand_ar,
      product_name: item.name,
      product_image_url: item.image_url || null,
      selected_size: item.selected_size,
      selected_color: item.selected_color,
      unit_price: item.price,
      quantity: item.quantity,
      line_total: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      // Order was created, log the error but don't fail
    }

    return NextResponse.json({ success: true, order_number });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
