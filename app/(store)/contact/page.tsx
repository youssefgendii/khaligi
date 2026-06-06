import { MapPin, Phone, Mail } from "lucide-react";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";

export default function ContactPage() {
  return (
    <div className="bg-[#F8F4EA] min-h-screen">
      {/* Header */}
      <div className="bg-[#050505] py-14 text-center">
        <p className="arabic-brand text-[#D6B25E] text-2xl mb-1">الخليجية</p>
        <h1 className="font-serif-brand text-3xl text-white">Contact Us</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="h-px w-16 bg-[#D6B25E40]" />
          <span className="text-[#D6B25E]">✦</span>
          <div className="h-px w-16 bg-[#D6B25E40]" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="bg-white border border-gray-100 rounded p-8 space-y-6">
            <div>
              <p className="arabic-brand text-[#D6B25E] text-xl mb-0.5">الخليجية</p>
              <h2 className="font-serif-brand text-xl text-[#050505]">
                Al Khalejia Fashion
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Premium Gulf-inspired women&apos;s fashion
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-[#D6B25E] mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm font-medium text-[#050505]">Address</p>
                  <p className="text-sm text-gray-500">Cairo, Egypt</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-[#D6B25E] mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm font-medium text-[#050505]">Phone</p>
                  <a
                    href="tel:+201000000000"
                    className="text-sm text-gray-500 hover:text-[#A9822B] transition-colors"
                  >
                    +20 10 0000 0000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-[#D6B25E] mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm font-medium text-[#050505]">Email</p>
                  <a
                    href="mailto:info@alkhaleiafashion.com"
                    className="text-sm text-gray-500 hover:text-[#A9822B] transition-colors"
                  >
                    info@alkhaleiafashion.com
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <a
                href="#"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E1306C] transition-colors"
              >
                {/* Instagram SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
                Instagram
              </a>
              <a
                href="#"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1877F2] transition-colors"
              >
                {/* Facebook SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Facebook
              </a>
            </div>
          </div>

          {/* WhatsApp + info */}
          <div className="space-y-5">
            <div className="bg-[#050505] rounded p-6 text-center">
              <p className="arabic-brand text-[#D6B25E] text-2xl mb-2">الخليجية</p>
              <h3 className="text-white font-semibold mb-2">
                Chat with Us on WhatsApp
              </h3>
              <p className="text-[#D8C7A1] text-sm opacity-70 mb-5">
                For order inquiries, product questions, and support.
              </p>
              <WhatsAppButton
                message="Hello! I'm interested in Al Khalejia Fashion products."
                size="lg"
                className="justify-center w-full"
              />
            </div>

            <div className="bg-white border border-gray-100 rounded p-6">
              <h3 className="font-semibold text-[#050505] mb-4">
                How We Work
              </h3>
              <div className="space-y-3">
                {[
                  ["Browse", "Explore our full collection."],
                  ["Order", "Add to cart and checkout — no account needed."],
                  ["Confirm", "We call you to confirm your order."],
                  ["Deliver", "Your order arrives. Pay cash on delivery."],
                ].map(([step, desc]) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="text-[#D6B25E] font-bold text-sm w-5 flex-shrink-0">
                      ✦
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-[#050505]">
                        {step}:{" "}
                      </span>
                      <span className="text-sm text-gray-500">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#D6B25E10] border border-[#D6B25E30] rounded p-4 text-sm text-[#A9822B] text-center">
              <strong>Cash on Delivery</strong> — You only pay when your order
              is in your hands. No online payment required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
