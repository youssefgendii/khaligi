import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import type { AdminStats, Order } from "@/lib/types";

async function getStats(): Promise<AdminStats> {
  const { data } = await supabaseAdmin
    .from("orders")
    .select("status, total");
  const orders = data ?? [];
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    out_for_delivery: orders.filter((o) => o.status === "out_for_delivery").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    total_revenue: orders
      .filter((o) => o.status === "delivered")
      .reduce((s, o) => s + (o.total ?? 0), 0),
  };
}

async function getLatestOrders(): Promise<Order[]> {
  const { data } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  return (data as Order[]) ?? [];
}

const STATUS_BADGE: Record<string, { variant: "yellow" | "blue" | "purple" | "green" | "red" | "gray"; label: string }> = {
  pending: { variant: "yellow", label: "Pending" },
  confirmed: { variant: "blue", label: "Confirmed" },
  out_for_delivery: { variant: "purple", label: "Out for Delivery" },
  delivered: { variant: "green", label: "Delivered" },
  cancelled: { variant: "red", label: "Cancelled" },
};

export default async function AdminDashboard() {
  const [stats, orders] = await Promise.all([getStats(), getLatestOrders()]);

  const statCards = [
    { label: "Total Orders", value: stats.total, color: "border-[#D6B25E]" },
    { label: "Pending", value: stats.pending, color: "border-yellow-400" },
    { label: "Confirmed", value: stats.confirmed, color: "border-blue-400" },
    { label: "Out for Delivery", value: stats.out_for_delivery, color: "border-purple-400" },
    { label: "Delivered", value: stats.delivered, color: "border-green-400" },
    { label: "Cancelled", value: stats.cancelled, color: "border-red-400" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Al Khalejia Fashion — Admin Overview
        </p>
      </div>

      {/* Revenue highlight */}
      <div className="bg-[#050505] text-white rounded-lg p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[#D8C7A1] text-sm opacity-70 uppercase tracking-wide text-xs mb-1">
            Total Revenue (Delivered Orders)
          </p>
          <p className="text-3xl font-bold text-[#D6B25E]">
            {formatPrice(stats.total_revenue)}
          </p>
        </div>
        <span className="text-[#D6B25E] text-4xl opacity-20">✦</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded border-l-4 ${card.color} p-4 shadow-sm`}
          >
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-[#A9822B] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Order #", "Customer", "Phone", "City", "Total", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
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
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#050505]">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {order.customer_full_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.customer_phone}</td>
                    <td className="px-4 py-3 text-gray-600">{order.city}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString("en-EG")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#A9822B] hover:underline text-xs font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
