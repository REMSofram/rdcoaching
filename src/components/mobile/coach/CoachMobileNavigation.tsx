"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Users, Menu, User, LogOut } from "lucide-react";
import React from "react";

export default function CoachMobileNavigation() {
  const pathname = usePathname();

  const items = [
    { href: "/coach/dashboard", label: "Dashboard", icon: <BarChart2 size={20} /> },
    { href: "/coach/clients", label: "Clients", icon: <Users size={20} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white z-40">
      <div className="flex items-center justify-between h-14 px-2">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center text-xs gap-1 py-2 ${
                active ? "text-slate-900" : "text-slate-500"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div className="flex items-center gap-3 pl-2">
          <button
            aria-label="Menu"
            className="p-2 rounded-full active:scale-95 text-slate-700"
            onClick={async () => {
              // Simple action sheet replacement: go to profile for now
              window.location.href = "/coach/profile";
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
