import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al Khalejia Fashion | الخليجية",
  description:
    "Premium Gulf-inspired women's fashion. Shop blouses, dresses, sets, and more. Cash on delivery. No account required.",
  keywords: "women fashion, Gulf fashion, Arabic fashion, boutique, الخليجية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0B0B0B",
              color: "#D6B25E",
              border: "1px solid #D6B25E40",
              borderRadius: "4px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#D6B25E", secondary: "#0B0B0B" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
              style: {
                background: "#0B0B0B",
                color: "#f87171",
                border: "1px solid #ef444440",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
