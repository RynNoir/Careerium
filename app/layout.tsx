import type { Metadata } from "next";
import "./globals.css";

// Font sengaja belum dimuat: ditentukan di DESIGN.md (status BELUM DIKUNCI), lalu dimuat lewat next/font.

export const metadata: Metadata = {
  title: "Careerium",
  description: "Mentor karier berbasis AI untuk mahasiswa dan fresh graduate yang menargetkan karier TI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
