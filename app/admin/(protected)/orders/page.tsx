import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AdminOrdersSearch } from "@/components/admin/AdminOrdersSearch";
import type { Order } from "@/lib/types";

const STATUS_BADGE: Record<string, { variant: "yellow" | "blue" | "purple" | "green" | "red" | "gray"; label: string }> = {
  pending: { variant: "yellow", label: "Pending" },
  confirmed: { variant: "blue", label: "Confirmed" },
  out_for_delivery: { variant: "purple", label: "Out for Delivery" },
  delivered: { variant: "green", label: "Delivered" },
  cancelled: { variant: "red", label: "Cancelled" },
};

async function getOrders(q: string, status: string): Promise<Order[]> {
  let query = supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,customer_full_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`
    );
  }
  const { data } = await query;
  return (data as Order[]) ?? [];
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = sp.status ?? "";
  const orders = await getOrders(q, status);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search + filter */}
      <AdminOrdersSearch currentQ={q} currentStatus={status} />

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 shadow-sm mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Order #", "Customer", "Phone", "City", "Total", "Status", "Date", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const s = STATUS_BADGE[order.status] ?? { variant: "gray" as const, label: order.status };
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[#050505] whitespace-nowrap">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {order.customer_full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{order.customer_phone}</td>
                  <td className="px-4 py-3 text-gray-600">{order.city}</td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString("en-EG")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[#A9822B] hover:underline text-xs font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
