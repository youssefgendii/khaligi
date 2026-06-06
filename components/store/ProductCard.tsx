import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  return (
    <div className="group bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 hover:border-[#D6B25E30] flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-[3/4] relative bg-gray-50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F8F4EA] to-[#D8C7A1]">
              <span className="text-[#D6B25E] text-3xl opacity-30">✦</span>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_new_arrival && (
              <span className="bg-[#050505] text-[#D6B25E] text-[10px] font-semibold px-2 py-0.5 tracking-wide uppercase">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="bg-[#D6B25E] text-[#050505] text-[10px] font-semibold px-2 py-0.5 tracking-wide uppercase">
                Sale
              </span>
            )}
          </div>
        </div>
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-[#050505] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-[#050505] text-[#D6B25E] text-xs px-3 py-2 flex items-center gap-1.5 font-medium">
            <Eye size={12} /> Quick View
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        {/* Brand + Code */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#A9822B] tracking-wider uppercase font-medium">
            {product.brand_ar}
          </span>
          <span className="text-[10px] font-bold text-[#050505] bg-[#D6B25E20] px-1.5 py-0.5 rounded tracking-wide">
            CODE: {product.product_code}
          </span>
        </div>

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-[#A9822B] transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Sizes */}
        {product.available_sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {product.available_sizes.slice(0, 5).map((size) => (
              <span
                key={size}
                className="text-[9px] border border-gray-200 px-1.5 py-0.5 text-gray-500 rounded-sm font-medium"
              >
                {size}
              </span>
            ))}
            {product.available_sizes.length > 5 && (
              <span className="text-[9px] text-gray-400">+{product.available_sizes.length - 5}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-sm font-bold text-[#050505]">
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <Link
          href={`/products/${product.slug}`}
          className="mt-2 w-full bg-[#050505] hover:bg-[#D6B25E] text-[#D6B25E] hover:text-[#050505] border border-[#D6B25E30] hover:border-[#D6B25E] text-xs font-semibold py-2 flex items-center justify-center gap-1.5 transition-all duration-200 rounded-sm"
        >
          <ShoppingBag size={12} />
          Select Options
        </Link>
      </div>
    </div>
  );
}
