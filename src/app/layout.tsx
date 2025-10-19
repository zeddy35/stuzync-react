// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";

const inter = Inter({ subsets: ["latin-ext"], display: "swap" });

export const metadata: Metadata = {
  title: "StuZync",
  description: "Birlikte çalış, akıllıca senkronize ol.",
  icons: {
    icon: [
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/images/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Theme before paint (EJS'deki gibi FOUC koruması) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const saved = localStorage.getItem("theme");
                const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                const theme = saved || system;
                document.documentElement.classList.toggle("dark", theme === "dark");
              } catch {}
            })();`,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full bg-gray-50 text-neutral-900 dark:bg-[#0b1020] dark:text-neutral-100`}>
        {/* animated orbs background */}
        <div className="zync-bg" aria-hidden="true" />

        {/* header include */}
        <Header />

        {/* flash toasts (reads ?success= & ?error=) */}
        <Toast />

        {/* main container — same sizing as EJS */}
        <main className="max-w-5xl mx-auto px-4 mt-8 mb-16">
          {children}
        </main>

        {/* footer include */}
        <Footer />
      </body>
    </html>
  );
}
