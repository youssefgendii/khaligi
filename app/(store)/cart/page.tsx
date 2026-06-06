"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

const DELIVERY_FEE = 50;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const sub = subtotal();
  const total = sub + DELIVERY_FEE;

  return (
    <div className="bg-[#F8F4EA] min-h-screen">
      {/* Header */}
      <div className="bg-[#050505] py-10 text-center">
        <h1 className="font-serif-brand text-3xl text-white">Shopping Cart</h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="h-px w-12 bg-[#D6B25E40]" />
          <span className="text-[#D6B25E] text-sm">✦</span>
          <div className="h-px w-12 bg-[#D6B25E40]" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Your cart is empty"
            description="Explore our collection and add something beautiful."
            action={
              <Link
                href="/products"
                className="bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold px-8 py-3 text-sm uppercase tracking-wide transition-all"
              >
                Shop Collection
              </Link>
            }
            className="py-24"
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Items */}
            <div className="flex-1 space-y-4">
              <p className="text-sm text-gray-500 mb-2">
                {items.length} item{items.length > 1 ? "s" : ""} in your cart
              </p>
              {items.map((item) => (
                <div
                  key={`${item.product_id}-${item.selected_size}-${item.selected_color}`}
                  className="bg-white border border-gray-100 rounded p-4 flex gap-4 hover:border-[#D6B25E30] transition-colors"
                >
                  {/* Image */}
                  <div className="relative w-20 h-24 flex-shrink-0 bg-gray-50 rounded overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[#D6B25E] text-xl opacity-30">✦</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-[#A9822B] font-bold tracking-wide mb-0.5">
                          CODE: {item.product_code}
                        </p>
                        <h3 className="text-sm font-semibold text-[#050505] line-clamp-2">
                          {item.name}
                        </h3>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span>
                            Size:{" "}
                            <span className="font-medium text-[#050505]">
                              {item.selected_size}
                            </span>
                          </span>
                          <span>
                            Color:{" "}
                            <span className="font-medium text-[#050505]">
                              {item.selected_color}
                            </span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(
                            item.product_id,
                            item.selected_size,
                            item.selected_color
                          )
                        }
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.selected_size,
                              item.selected_color,
                              item.quantity - 1
                            )
                          }
                          className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:border-[#D6B25E] transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.selected_size,
                              item.selected_color,
                              item.quantity + 1
                            )
                          }
                          className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:border-[#D6B25E] transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      {/* Line total */}
                      <p className="text-sm font-bold text-[#050505]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white border border-gray-100 rounded p-6 sticky top-20">
                <h2 className="font-serif-brand text-lg text-[#050505] border-b border-[#D6B25E20] pb-3 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#050505]">
                      {formatPrice(sub)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium text-[#050505]">
                      {formatPrice(DELIVERY_FEE)}
                    </span>
                  </div>
                  <div className="h-px bg-[#D6B25E20]" />
                  <div className="flex justify-between font-bold text-base text-[#050505]">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 w-full bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold py-3.5 text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-200"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>

                <div className="mt-4 text-center">
                  <Link
                    href="/products"
                    className="text-xs text-gray-400 hover:text-[#A9822B] transition-colors"
                  >
                    ← Continue Shopping
                  </Link>
                </div>

                <div className="mt-4 bg-[#050505] text-[#D8C7A1] text-xs px-3 py-2.5 text-center">
                  <span className="text-[#D6B25E]">✓</span> Cash on Delivery
                  available
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
