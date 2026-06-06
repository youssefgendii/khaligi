"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

interface Props {
  currentQ: string;
  currentActive: string;
}

export function AdminProductsSearch({ currentQ, currentActive }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/admin/products?${params.toString()}`));
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          defaultValue={currentQ}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Search by product name or code..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded bg-white focus:border-[#D6B25E] focus:outline-none"
        />
      </div>
      <select
        defaultValue={currentActive}
        onChange={(e) => update("active", e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:border-[#D6B25E] focus:outline-none"
      >
        <option value="">All Products</option>
        <option value="true">Active Only</option>
        <option value="false">Inactive Only</option>
      </select>
    </div>
  );
}
