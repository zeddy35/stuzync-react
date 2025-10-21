// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import Providers from "./Providers";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { Suspense } from "react";
import { SidebarSkeleton, TrendsSkeleton } from "@/components/Skeletons";
import MobileTopBar from "@/components/MobileTopBar";
import FloatingCompose from "@/components/FloatingCompose";
import ShellController from "@/components/ShellController";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const saved = localStorage.getItem("theme");
                const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                const theme = saved || system;
                document.documentElement.classList.remove('dark','dim');
                if (theme === 'dark') document.documentElement.classList.add('dark');
                else if (theme === 'dim') document.documentElement.classList.add('dim');

                // Pre-paint shell control to avoid sidebar/skeleton flash on certain routes
                var p = location.pathname;
                var hide = p === '/' || p.indexOf('/login')===0 || p.indexOf('/register')===0 || p.indexOf('/onboarding')===0 || p.indexOf('/(auth)')===0;
                if (hide) document.documentElement.classList.add('no-shell');
                else document.documentElement.classList.remove('no-shell');
              } catch {}
            })();`,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full bg-gray-50 text-neutral-900 dark:bg-[#0b1020] dark:text-neutral-100`}>
        <Providers>
          <Suspense fallback={null}>
            <ShellController />
          </Suspense>
          <Suspense fallback={null}>
            <MobileTopBar />
          </Suspense>
          <Suspense fallback={null}>
            <Toast />
          </Suspense>

          {/* 3-column app layout */}
          <div className="mx-auto max-w-[1280px] px-4 grid grid-cols-12 gap-4 mt-4 mb-12 app-shell-grid">
            <aside className="col-span-3 hidden lg:block app-shell-left">
              <Suspense fallback={<SidebarSkeleton />}>
                {/* @ts-expect-error Server Component */}
                <LeftSidebar />
              </Suspense>
            </aside>
            <main className="col-span-12 lg:col-span-6 app-shell-main">
              <Suspense fallback={<div className="app-fallback" />}>
                {children}
              </Suspense>
            </main>
            <aside className="col-span-3 hidden xl:block app-shell-right">
              <Suspense fallback={<TrendsSkeleton />}>
                <RightSidebar />
              </Suspense>
            </aside>
          </div>

          <Footer />
          <FloatingCompose />
        </Providers>
      </body>
    </html>
  );
}
