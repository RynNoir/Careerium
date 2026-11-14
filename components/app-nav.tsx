"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesColumn, History, House, MessagesSquare, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";

const ITEMS = [
  { href: "/mulai", label: "Mulai", icon: House },
  { href: "/hasil", label: "Hasil", icon: ChartNoAxesColumn },
  { href: "/wawancara", label: "Wawancara", icon: MessagesSquare },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/masuk", label: "Akun", icon: UserRound },
] as const;

const AKUN = ["/masuk", "/daftar", "/lupa-password", "/akun"];

/** Item "Akun" ke /akun saat login, ke /masuk saat tamu. */
function useItems() {
  const { user } = useAuth();
  return ITEMS.map((it) => (it.href === "/masuk" && user ? { ...it, href: "/akun" } : it));
}

function isActive(path: string, href: string) {
  if (href === "/masuk" || href === "/akun") return AKUN.some((p) => path.startsWith(p));
  return path === href || path.startsWith(`${href}/`) || (href === "/mulai" && (path === "/" || path === "/profil"));
}

/** Desktop ≥1024 px: bar ikon vertikal 76 px. */
export function Sidebar() {
  const path = usePathname();
  const items = useItems();
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-y-[26px] left-0 z-20 hidden print:hidden w-[76px] flex-col items-center gap-2.5 rounded-r-[30px] bg-sidebar py-[18px] lg:flex"
    >
      <Link
        href="/mulai"
        aria-label="Careerium, ke halaman Mulai"
        className="mb-1.5 grid size-11 place-items-center"
      >
        {/* Kotak 38 px sesuai DESIGN.md, area klik 44 px */}
        <span className="grid size-9.5 place-items-center rounded-xl border-2 border-sidebar-fg bg-primary font-display text-lg font-extrabold text-primary-fg">
          C
        </span>
      </Link>
      {items.map(({ href, label, icon: Icon }) => {
        const on = isActive(path, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            aria-current={on ? "page" : undefined}
            className={`grid size-11 place-items-center rounded-[14px] ${
              on ? "bg-primary text-primary-fg shadow-[3px_3px_0_var(--sidebar-fg)]" : "text-sidebar-fg"
            }`}
          >
            <Icon className="size-5" aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}

/** Ponsel: navigasi bawah mengambang. */
export function BottomNav() {
  const path = usePathname();
  const items = useItems();
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-4 bottom-3 z-20 flex justify-around rounded-[22px] bg-sidebar px-1 py-1.5 lg:hidden print:hidden"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const on = isActive(path, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 rounded-[14px] px-1 text-[11px] font-semibold ${
              on ? "bg-primary text-primary-fg" : "text-sidebar-fg"
            }`}
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
