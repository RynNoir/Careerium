import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Suspense } from "react";
import Link from "next/link";
import { BottomNav, Sidebar } from "@/components/app-nav";
import { FlowProvider } from "@/components/flow-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  weight: ["800"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "Careerium",
  description: "Mentor karier berbasis AI untuk mahasiswa dan fresh graduate yang menargetkan karier TI.",
};

export const viewport: Viewport = { themeColor: "#F5F8FF" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full">
        <FlowProvider>
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>
          <div className="mx-auto flex min-h-full w-full max-w-275 flex-col px-4 pb-28 lg:pb-12 lg:pl-27 lg:pr-8 lg:max-w-310">
            <header className="flex items-center justify-between py-4 lg:py-6">
              <Link href="/mulai" className="font-display text-[19px] font-extrabold">
                Careerium
              </Link>
            </header>
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </FlowProvider>
      </body>
    </html>
  );
}
