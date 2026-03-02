"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/wards", label: "Wards" },
  { href: "/admin/polling-units", label: "Polling Units" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-green-900 text-white flex flex-col">
      <div className="p-5 border-b border-green-700">
        <div className="text-yellow-400 font-black text-lg tracking-widest">GIDAN AMANA</div>
        <div className="text-green-300 text-xs tracking-wider">Admin Portal</div>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-5 py-3 text-sm transition-colors ${
              pathname === item.href
                ? "bg-yellow-400 text-green-900 font-bold"
                : "hover:bg-green-800 text-green-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-green-700">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full text-sm text-green-300 hover:text-white transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
