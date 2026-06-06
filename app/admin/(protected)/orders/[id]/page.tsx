import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { Badge } from "@/components/ui/Badge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

const STATUS_BADGE: Record<
  string,
  {
    variant: "yellow" | "blue" | "purple" | "green" | "red" | "gray";
    label: string;
  }
> = {
  pending: { variant: "yellow", label: "Pending" },
  confirmed: { variant: "blue", label: "Confirmed" },
  out_for_delivery: { variant: "purple", label: "Out for Delivery" },
  delivered: { variant: "green", label: "Delivered" },
  cancelled: { variant: "red", label: "Cancelled" },
};

async function getOrder(id: string): Promise<Order | null> {
  const { data } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  return (data as Order) ?? null;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const statusInfo = STATUS_BADGE[order.status] ?? {
    variant: "gray" as const,
    label: order.status,
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="mb-2 inline-block text-sm text-gray-400 hover:text-[#A9822B]"
          >
            Back to Orders
          </Link>
          <h1 className="font-mono text-2xl font-bold text-gray-900">
            {order.order_number}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {formatDate(order.created_at)}
          </p>
        </div>
        <Badge variant={statusInfo.variant} className="px-3 py-1 text-sm">
          {statusInfo.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-4 border-b border-gray-100 pb-3 font-semibold text-gray-900">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-50">
                    {item.product_image_url ? (
                      <Image
                        src={item.product_image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg text-[#D6B25E] opacity-30">*</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-1 inline-block bg-[#050505] px-2 py-0.5 text-[11px] font-bold tracking-widest text-[#D6B25E]">
                      CODE: {item.product_code}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.product_name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.brand_ar} - {item.brand}
                    </p>
                    <div className="mt-1.5 flex gap-4">
                      <div className="border border-[#D6B25E30] bg-[#D6B25E15] px-2 py-1 text-xs">
                        <span className="text-gray-500">Size: </span>
                        <strong className="text-[#050505]">
                          {item.selected_size}
                        </strong>
                      </div>
                      <div className="border border-[#D6B25E30] bg-[#D6B25E15] px-2 py-1 text-xs">
                        <span className="text-gray-500">Color: </span>
                        <strong className="text-[#050505]">
                          {item.selected_color}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(item.line_total)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatPrice(item.unit_price)} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>{formatPrice(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Payment</span>
                <span className="font-medium">Cash on Delivery</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Payment Status</span>
                <Badge
                  variant={order.payment_status === "paid" ? "green" : "yellow"}
                >
                  {order.payment_status}
                </Badge>
              </div>
            </div>
          </div>

          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            currentNotes={order.admin_notes ?? ""}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-4 border-b border-gray-100 pb-3 font-semibold text-gray-900">
              Customer
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="mb-0.5 text-xs uppercase tracking-wide text-gray-400">
                  Name
                </p>
                <p className="font-semibold text-gray-900">
                  {order.customer_full_name}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-xs uppercase tracking-wide text-gray-400">
                  Phone
                </p>
                <a
                  href={`tel:${order.customer_phone}`}
                  className="text-base font-semibold text-[#A9822B] hover:underline"
                >
                  {order.customer_phone}
                </a>
              </div>
              {order.customer_email && (
                <div>
                  <p className="mb-0.5 text-xs uppercase tracking-wide text-gray-400">
                    Email
                  </p>
                  <p className="text-gray-700">{order.customer_email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-4 border-b border-gray-100 pb-3 font-semibold text-gray-900">
              Delivery Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-base font-semibold text-gray-900">
                {order.city}
              </p>
              <p className="text-gray-700">{order.address_line1}</p>
              {order.address_line2 && (
                <p className="text-gray-500">{order.address_line2}</p>
              )}
              {order.notes && (
                <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-yellow-700">
                    Customer Notes:
                  </p>
                  <p className="text-xs text-yellow-700">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
