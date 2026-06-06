"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

interface Props {
  currentQ: string;
  currentStatus: string;
}

export function AdminOrdersSearch({ currentQ, currentStatus }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/admin/orders?${params.toString()}`));
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          defaultValue={currentQ}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Search by order #, name, phone, email..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded bg-white focus:border-[#D6B25E] focus:outline-none"
        />
      </div>
      <select
        defaultValue={currentStatus}
        onChange={(e) => update("status", e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:border-[#D6B25E] focus:outline-none"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
