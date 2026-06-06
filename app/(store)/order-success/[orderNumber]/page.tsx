import Link from "next/link";
import { connection } from "next/server";
import { CheckCircle, Phone, ShoppingBag } from "lucide-react";

export const unstable_instant = false;

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  await connection();

  const { orderNumber } = await params;

  return (
    <div className="bg-[#F8F4EA] min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-[#050505] rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="text-[#D6B25E]" size={40} />
          </div>
        </div>

        {/* Brand */}
        <p className="arabic-brand text-[#D6B25E] text-xl mb-1">الخليجية</p>
        <p className="text-[#A9822B] text-[11px] tracking-[0.25em] uppercase mb-6">
          Al Khalejia Fashion
        </p>

        {/* Main message */}
        <div className="bg-white border border-[#D6B25E20] rounded p-8 shadow-sm">
          <h1 className="font-serif-brand text-2xl text-[#050505] mb-3">
            Thank You for Your Order!
          </h1>

          <div className="bg-[#050505] text-[#D6B25E] px-4 py-3 rounded inline-block my-4">
            <p className="text-[10px] tracking-widest uppercase opacity-70 mb-0.5">
              Order Number
            </p>
            <p className="text-lg font-bold tracking-wider">{orderNumber}</p>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mt-4">
            <div className="flex items-start gap-2 text-left">
              <span className="text-[#D6B25E] mt-0.5 flex-shrink-0">✓</span>
              <span>
                <strong className="text-[#050505]">Payment:</strong> Cash on
                Delivery — you will pay when your order arrives.
              </span>
            </div>
            <div className="flex items-start gap-2 text-left">
              <Phone size={14} className="text-[#D6B25E] mt-0.5 flex-shrink-0" />
              <span>
                Our team will contact you shortly by phone to{" "}
                <strong className="text-[#050505]">confirm your order</strong>{" "}
                and provide a delivery time.
              </span>
            </div>
            <div className="flex items-start gap-2 text-left">
              <span className="text-[#D6B25E] mt-0.5 flex-shrink-0">✓</span>
              <span>
                Please keep your phone available for our confirmation call.
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold px-6 py-3 text-sm uppercase tracking-wide transition-all"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 border border-[#050505] hover:bg-[#050505] hover:text-[#D6B25E] text-[#050505] px-6 py-3 text-sm uppercase tracking-wide transition-all"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Save your order number for reference:{" "}
          <strong className="text-[#050505]">{orderNumber}</strong>
        </p>
      </div>
    </div>
  );
}
