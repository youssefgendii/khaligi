"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { OrderStatus } from "@/lib/types";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
  currentNotes: string;
}

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderStatusUpdater({ orderId, currentStatus, currentNotes }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Order updated successfully.");
      router.refresh();
    } catch {
      toast.error("Failed to update order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
        Update Order
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Order Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:border-[#D6B25E] focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Admin Notes (Internal)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add internal notes about this order..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white resize-none focus:border-[#D6B25E] focus:outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#050505] hover:bg-[#1a1a1a] text-[#D6B25E] font-semibold py-2.5 text-sm rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
