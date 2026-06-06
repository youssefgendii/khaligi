"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import { ChevronRight, Lock, Truck, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

const DELIVERY_FEE = 50;
type Step = "information" | "shipping" | "payment";
const STEPS: Step[] = ["information", "shipping", "payment"];
const STEP_LABELS: Record<Step, string> = {
  information: "Information",
  shipping: "Shipping",
  payment: "Payment",
};

interface FormData {
  full_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  notes: string;
}

function StepBreadcrumb({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <nav className="flex items-center gap-1.5 text-xs">
      <Link href="/cart" className="text-[#5C6AC4] hover:underline">Cart</Link>
      {STEPS.map((step, i) => (
        <span key={step} className="flex items-center gap-1.5">
          <ChevronRight size={10} className="text-gray-400" />
          {i < idx ? (
            <button className="text-[#5C6AC4] hover:underline">{STEP_LABELS[step]}</button>
          ) : i === idx ? (
            <span className="font-semibold text-gray-800">{STEP_LABELS[step]}</span>
          ) : (
            <span className="text-gray-400">{STEP_LABELS[step]}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function OrderSummary({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { items, subtotal } = useCartStore();
  const sub = subtotal();
  const total = sub + DELIVERY_FEE;

  return (
    <div className="bg-[#FAFAFA] border-l border-gray-200 lg:h-full">
      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-[#F4F6F8] border-b border-gray-200 text-sm font-medium text-gray-800"
      >
        <span className="flex items-center gap-2 text-[#5C6AC4]">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {open ? "Hide" : "Show"} order summary
        </span>
        <span className="font-bold text-gray-900">{formatPrice(total)}</span>
      </button>

      <div className={`${open ? "block" : "hidden"} lg:block p-6`}>
        {/* Items */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div
              key={`${item.product_id}-${item.selected_size}-${item.selected_color}`}
              className="flex gap-3 items-start"
            >
              <div className="relative w-14 h-16 flex-shrink-0 rounded overflow-hidden border border-gray-200 bg-white">
                <span className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-gray-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300 text-lg">✦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 line-clamp-2">{item.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.selected_size} · {item.selected_color}</p>
              </div>
              <p className="text-xs font-semibold text-gray-900 flex-shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(sub)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{formatPrice(DELIVERY_FEE)}</span>
          </div>
          <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-200 pt-3 mt-1">
            <span>Total</span>
            <span className="text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactReview({ form }: { form: FormData }) {
  return (
    <div className="border border-gray-200 rounded divide-y divide-gray-100 text-sm">
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-gray-500 w-20 flex-shrink-0">Contact</span>
        <span className="text-gray-800 flex-1 mx-4 truncate">{form.phone}{form.email ? ` · ${form.email}` : ""}</span>
      </div>
    </div>
  );
}

function ShippingReview({ form }: { form: FormData }) {
  return (
    <div className="border border-gray-200 rounded divide-y divide-gray-100 text-sm mt-3">
      <div className="flex items-start justify-between px-4 py-2.5">
        <span className="text-gray-500 w-20 flex-shrink-0">Ship to</span>
        <span className="text-gray-800 flex-1 mx-4">
          {form.address_line1}{form.address_line2 ? `, ${form.address_line2}` : ""}, {form.city}
        </span>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-gray-500 w-20 flex-shrink-0">Method</span>
        <span className="text-gray-800 flex-1 mx-4 flex items-center gap-2">
          <Truck size={13} className="text-gray-500" /> Cash on Delivery · {formatPrice(DELIVERY_FEE)}
        </span>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const sub = subtotal();
  const total = sub + DELIVERY_FEE;

  const [step, setStep] = useState<Step>("information");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [form, setForm] = useState<FormData>({
    full_name: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    notes: "",
  });

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validateStep(s: Step): boolean {
    const e: Partial<FormData> = {};
    if (s === "information") {
      if (!form.full_name.trim()) e.full_name = "Full name is required";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      else if (!/^[0-9+\s\-()]{7,20}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    }
    if (s === "shipping") {
      if (!form.address_line1.trim()) e.address_line1 = "Address is required";
      if (!form.city.trim()) e.city = "City is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    if (step === "information" && validateStep("information")) setStep("shipping");
    else if (step === "shipping" && validateStep("shipping")) setStep("payment");
  }

  async function handlePlaceOrder() {
    if (items.length === 0) { toast.error("Your cart is empty."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, items, delivery_fee: DELIVERY_FEE }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Checkout failed."); return; }
      clearCart();
      router.push(`/order-success/${data.order_number}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link href="/products" className="bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold px-8 py-3 text-sm uppercase">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left column */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col gap-3">
          <Link href="/" className="font-serif-brand text-xl text-[#050505]">
            Al Khalejia
          </Link>
          <StepBreadcrumb current={step} />
        </div>

        {/* Mobile order summary toggle */}
        <OrderSummary open={summaryOpen} onToggle={() => setSummaryOpen((v) => !v)} />

        {/* Form area */}
        <div className="flex-1 px-4 sm:px-6 py-8 max-w-lg mx-auto w-full">

          {/* ── STEP 1: INFORMATION ── */}
          {step === "information" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact information</h2>
              <div className="space-y-3">
                <Field label="Full name" required error={errors.full_name}>
                  <input
                    className={input(errors.full_name)}
                    placeholder="Your full name"
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                  />
                </Field>
                <Field label="Phone number" required error={errors.phone}>
                  <input
                    className={input(errors.phone)}
                    type="tel"
                    placeholder="+20 10 0000 0000"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
                <Field label="Email (optional)">
                  <input
                    className={input()}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Link href="/cart" className="text-sm text-[#5C6AC4] hover:underline text-center sm:text-left">← Return to cart</Link>
                <button onClick={nextStep} className={primaryBtn}>Continue to shipping</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: SHIPPING ── */}
          {step === "shipping" && (
            <div>
              <ContactReview form={form} />
              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Shipping address</h2>
              <div className="space-y-3">
                <Field label="Address" required error={errors.address_line1}>
                  <input
                    className={input(errors.address_line1)}
                    placeholder="Street, building, apartment"
                    value={form.address_line1}
                    onChange={(e) => set("address_line1", e.target.value)}
                  />
                </Field>
                <Field label="Apartment / floor (optional)">
                  <input
                    className={input()}
                    placeholder="Floor, landmark"
                    value={form.address_line2}
                    onChange={(e) => set("address_line2", e.target.value)}
                  />
                </Field>
                <Field label="City / area" required error={errors.city}>
                  <input
                    className={input(errors.city)}
                    placeholder="e.g. Cairo, Giza, Alexandria"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>
                <Field label="Order notes (optional)">
                  <textarea
                    className={`${input()} resize-none`}
                    rows={2}
                    placeholder="Special instructions (optional)"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </Field>
              </div>

              {/* Shipping method — fixed */}
              <div className="mt-5">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping method</h3>
                <div className="border-2 border-[#5C6AC4] rounded-md p-3 flex items-center justify-between bg-[#F4F6FF]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-[#5C6AC4] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#5C6AC4]" />
                    </div>
                    <span className="text-sm text-gray-800">Cash on Delivery</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(DELIVERY_FEE)}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button onClick={() => setStep("information")} className="text-sm text-[#5C6AC4] hover:underline text-center sm:text-left">← Return to information</button>
                <button onClick={nextStep} className={primaryBtn}>Continue to payment</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === "payment" && (
            <div>
              <ContactReview form={form} />
              <ShippingReview form={form} />

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Payment</h2>

              {/* Payment method */}
              <div className="border border-gray-200 rounded-md overflow-hidden mb-5">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <Lock size={13} className="text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Secure checkout</span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-[#5C6AC4] flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#5C6AC4]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay in cash when your order arrives.</p>
                    </div>
                  </div>
                  <Truck size={20} className="text-gray-400" />
                </div>
              </div>

              {/* Order total recap */}
              <div className="bg-gray-50 rounded-md p-4 text-sm space-y-2 mb-5 border border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(sub)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span><span>{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total</span><span className="text-base">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button onClick={() => setStep("shipping")} className="text-sm text-[#5C6AC4] hover:underline text-center sm:text-left">← Return to shipping</button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className={`${primaryBtn} ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Placing order…" : `Pay ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 flex flex-wrap gap-4 text-xs text-gray-400">
            <Link href="/">Home</Link>
            <Link href="/products">Collection</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>

      {/* Right column — desktop summary */}
      <div className="hidden lg:block lg:w-[380px] border-l border-gray-200 bg-[#FAFAFA]">
        <div className="p-8 sticky top-0">
          {/* Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div
                key={`${item.product_id}-${item.selected_size}-${item.selected_color}`}
                className="flex gap-3 items-start"
              >
                <div className="relative w-14 h-16 flex-shrink-0 rounded overflow-hidden border border-gray-200 bg-white">
                  <span className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-gray-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300">✦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2">{item.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.selected_size} · {item.selected_color}</p>
                </div>
                <p className="text-xs font-semibold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{formatPrice(DELIVERY_FEE)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Total</span>
              <span className="text-lg">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */
const primaryBtn =
  "w-full sm:w-auto bg-[#5C6AC4] hover:bg-[#4959BD] text-white font-medium px-6 py-3.5 text-sm rounded-md transition-colors duration-200 disabled:opacity-60 touch-manipulation";

function input(error?: string) {
  return `w-full border ${error ? "border-red-400" : "border-gray-300"} rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C6AC4] focus:border-transparent transition-shadow`;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
