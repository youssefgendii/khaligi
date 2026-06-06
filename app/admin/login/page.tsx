"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COPYRIGHT_YEAR = 2026;

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="arabic-brand mb-1 text-3xl text-[#D6B25E]">
            Al Khalejia
          </p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#D8C7A1] opacity-70">
            Al Khalejia Fashion
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-[#D6B25E40]" />
            <span className="text-xs text-[#D6B25E]">Admin Panel</span>
            <div className="h-px w-10 bg-[#D6B25E40]" />
          </div>
        </div>

        <div className="rounded border border-[#D6B25E20] bg-[#0B0B0B] p-8">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#D6B25E30] bg-[#D6B25E10]">
            <Lock className="text-[#D6B25E]" size={20} />
          </div>
          <h1 className="mb-6 text-center text-lg font-semibold text-white">
            Admin Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#D8C7A1]">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full rounded border border-[#D6B25E20] bg-[#1a1a1a] px-3 py-3 pr-10 text-sm text-white placeholder:text-gray-600 focus:border-[#D6B25E] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShow((open) => !open)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-[#D6B25E]"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-[#D6B25E] py-3 text-sm font-semibold uppercase tracking-wide text-[#050505] transition-all hover:bg-[#A9822B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#D8C7A1] opacity-30">
          Copyright {COPYRIGHT_YEAR} Al Khalejia Fashion
        </p>
      </div>
    </div>
  );
}
