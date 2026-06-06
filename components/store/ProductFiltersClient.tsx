"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "One Size"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];
const SEARCH_DEBOUNCE_MS = 350;

interface Props {
  categories: Category[];
}

interface DebouncedTextFilterProps {
  initialValue: string;
  placeholder: string;
  onDebouncedChange: (value: string) => void;
  showSearchIcon?: boolean;
}

function DebouncedTextFilter({
  initialValue,
  placeholder,
  onDebouncedChange,
  showSearchIcon = false,
}: DebouncedTextFilterProps) {
  const [value, setValue] = useState(initialValue);
  const emitChange = useEffectEvent(onDebouncedChange);

  useEffect(() => {
    if (value === initialValue) return;

    const timeout = window.setTimeout(() => {
      emitChange(value);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [value, initialValue]);

  return (
    <div className="relative">
      {showSearchIcon && (
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded border border-gray-300 bg-white py-2 text-sm focus:border-[#D6B25E]",
          showSearchIcon ? "pl-8 pr-3" : "px-3"
        )}
      />
    </div>
  );
}

export function ProductFiltersClient({ categories }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = {
    q: sp.get("q") ?? "",
    code: sp.get("code") ?? "",
    category: sp.get("category") ?? "",
    sort: sp.get("sort") ?? "newest",
    size: sp.get("size") ?? "",
    color: sp.get("color") ?? "",
  };

  const navigateWith = useCallback((nextParams: URLSearchParams) => {
    const query = nextParams.toString();
    startTransition(() => {
      router.push(query ? `/products?${query}` : "/products");
    });
  }, [router, startTransition]);

  const updateImmediate = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigateWith(params);
  }, [sp, navigateWith]);

  const updateDebounced = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigateWith(params);
  }, [sp, navigateWith]);

  function clearAll() {
    startTransition(() => router.push("/products"));
  }

  const hasFilters =
    current.q || current.code || current.category || current.size || current.color;

  const filterContent = (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#050505]">
          Search
        </label>
        <DebouncedTextFilter
          key={`q:${current.q}`}
          initialValue={current.q}
          placeholder="Product name..."
          onDebouncedChange={(value) => updateDebounced("q", value)}
          showSearchIcon
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#050505]">
          Search by Code
        </label>
        <DebouncedTextFilter
          key={`code:${current.code}`}
          initialValue={current.code}
          placeholder="e.g. 7005"
          onDebouncedChange={(value) => updateDebounced("code", value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#050505]">
          Sort By
        </label>
        <select
          value={current.sort}
          onChange={(e) => updateImmediate("sort", e.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#D6B25E]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {categories.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#050505]">
            Category
          </label>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => updateImmediate("category", "")}
              className={cn(
                "rounded px-2 py-1.5 text-left text-sm transition-colors",
                !current.category
                  ? "bg-[#050505] font-semibold text-[#D6B25E]"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateImmediate("category", cat.slug)}
                className={cn(
                  "rounded px-2 py-1.5 text-left text-sm transition-colors",
                  current.category === cat.slug
                    ? "bg-[#050505] font-semibold text-[#D6B25E]"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#050505]">
          Size
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() =>
                updateImmediate("size", current.size === size ? "" : size)
              }
              className={cn(
                "rounded-sm border px-2.5 py-1 text-xs transition-all",
                current.size === size
                  ? "border-[#D6B25E] bg-[#050505] text-[#D6B25E]"
                  : "border-gray-300 text-gray-600 hover:border-[#D6B25E]"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-red-500 transition-colors hover:text-red-700"
        >
          <X size={12} /> Clear All Filters
        </button>
      )}

      {isPending && (
        <p className="animate-pulse text-xs text-[#D6B25E]">Filtering...</p>
      )}
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="mb-4 flex items-center gap-2 rounded border border-[#D6B25E40] bg-white px-4 py-2 text-sm font-medium text-[#050505] lg:hidden"
        onClick={() => setMobileOpen((open) => !open)}
      >
        <SlidersHorizontal size={16} className="text-[#D6B25E]" />
        Filters & Search
      </button>

      {mobileOpen && (
        <div className="mb-6 rounded border border-gray-200 bg-white p-4 lg:hidden">
          {filterContent}
        </div>
      )}

      <div className="sticky top-20 hidden rounded border border-gray-200 bg-white p-5 lg:block">
        <h3 className="mb-4 border-b border-[#D6B25E20] pb-2 text-sm font-semibold uppercase tracking-wider text-[#050505]">
          Filters
        </h3>
        {filterContent}
      </div>
    </>
  );
}
