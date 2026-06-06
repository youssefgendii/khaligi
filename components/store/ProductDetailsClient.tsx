"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { WhatsAppButton } from "./WhatsAppButton";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Product } from "@/lib/types";

interface Props {
  product: Product;
}

export function ProductDetailsClient({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.available_sizes.length === 1 ? product.available_sizes[0] : ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.available_colors.length === 1 ? product.available_colors[0] : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const displayPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const needsSize = product.available_sizes.length > 1;
  const needsColor = product.available_colors.length > 1;
  const canAdd =
    (!needsSize || selectedSize) && (!needsColor || selectedColor);

  function handleAddToCart() {
    if (!canAdd) {
      if (needsSize && !selectedSize) toast.error("Please select a size.");
      else if (needsColor && !selectedColor) toast.error("Please select a color.");
      return;
    }
    addItem({
      product_id: product.id,
      product_code: product.product_code,
      brand: product.brand,
      brand_ar: product.brand_ar,
      name: product.name,
      image_url: product.image_url,
      selected_size: selectedSize || product.available_sizes[0] || "One Size",
      selected_color: selectedColor || product.available_colors[0] || "Default",
      price: displayPrice,
      quantity,
    });
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Image */}
      <div className="relative">
        <div className="aspect-[3/4] relative overflow-hidden rounded bg-gray-50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F8F4EA] to-[#D8C7A1]">
              <span className="text-[#D6B25E] text-5xl opacity-30">✦</span>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new_arrival && (
              <span className="bg-[#050505] text-[#D6B25E] text-[10px] font-bold px-2 py-1 tracking-widest uppercase">
                New Arrival
              </span>
            )}
            {hasDiscount && (
              <span className="bg-[#D6B25E] text-[#050505] text-[10px] font-bold px-2 py-1 tracking-widest uppercase">
                On Sale
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-5">
        {/* Brand */}
        <div>
          <p className="text-[#A9822B] text-sm font-semibold tracking-wider uppercase">
            {product.brand_ar} — {product.brand}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-white bg-[#050505] px-2 py-1 tracking-wide">
              CODE: {product.product_code}
            </span>
            {product.category && (
              <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-sm">
                {product.category.name}
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <h1 className="font-serif-brand text-2xl sm:text-3xl text-[#050505] leading-tight">
          {product.name}
        </h1>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-[#050505]">
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Short description */}
        {product.short_description && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {product.short_description}
          </p>
        )}

        <div className="h-px bg-[#D6B25E20]" />

        {/* Color selector */}
        {product.available_colors.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[#050505] mb-2 uppercase tracking-wide">
              Color{selectedColor && <span className="font-normal text-gray-500 ml-1 normal-case">— {selectedColor}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.available_colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "px-3 py-1.5 text-sm border rounded transition-all duration-150",
                    selectedColor === color
                      ? "bg-[#050505] text-[#D6B25E] border-[#D6B25E] font-semibold"
                      : "border-gray-300 text-gray-700 hover:border-[#D6B25E]"
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {product.available_sizes.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[#050505] mb-2 uppercase tracking-wide">
              Size{selectedSize && <span className="font-normal text-gray-500 ml-1 normal-case">— {selectedSize}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.available_sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "px-3 py-1.5 text-sm border rounded transition-all duration-150 min-w-[44px]",
                    selectedSize === size
                      ? "bg-[#050505] text-[#D6B25E] border-[#D6B25E] font-semibold"
                      : "border-gray-300 text-gray-700 hover:border-[#D6B25E]"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <p className="text-sm font-semibold text-[#050505] mb-2 uppercase tracking-wide">
            Quantity
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-[#D6B25E] transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-semibold text-[#050505]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-[#D6B25E] transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Validation hint */}
        {!canAdd && (
          <p className="text-xs text-[#A9822B] bg-[#D6B25E10] border border-[#D6B25E30] px-3 py-2 rounded">
            {needsSize && !selectedSize ? "Please select a size." : "Please select a color."}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddToCart}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 rounded-sm",
              added
                ? "bg-green-600 text-white"
                : canAdd
                ? "bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {added ? (
              <>
                <Check size={16} /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Add to Cart
              </>
            )}
          </button>
          <WhatsAppButton
            message={`Hi! I'm interested in: ${product.name} (CODE: ${product.product_code})`}
            className="rounded-sm"
          />
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-2">
            <div className="h-px bg-[#D6B25E20] mb-4" />
            <h3 className="text-sm font-semibold text-[#050505] uppercase tracking-wide mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Cash on delivery note */}
        <div className="bg-[#050505] text-[#D8C7A1] text-xs px-4 py-3 flex items-start gap-2 rounded-sm mt-2">
          <span className="text-[#D6B25E] mt-0.5">✓</span>
          <span>
            Cash on Delivery — Pay when your order arrives. No online payment needed.
          </span>
        </div>
      </div>
    </div>
  );
}
