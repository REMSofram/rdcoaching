"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Dumbbell, Utensils, Calendar, Menu, User, LogOut } from "lucide-react";
import { useState } from "react";

export default function MobileNavigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Bottom navigation (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden">
        <div className="mx-auto max-w-screen-sm grid grid-cols-5">
          <Link
            href="/client/suivi"
            className={`flex flex-col items-center justify-center py-2 text-xs ${
              isActive("/client/suivi") ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <Activity className="h-5 w-5" />
            <span>Suivi</span>
          </Link>
          <Link
            href="/client/programme"
            className={`flex flex-col items-center justify-center py-2 text-xs ${
              isActive("/client/programme") ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <Dumbbell className="h-5 w-5" />
            <span>Programme</span>
          </Link>
          <Link
            href="/client/nutrition"
            className={`flex flex-col items-center justify-center py-2 text-xs ${
              isActive("/client/nutrition") ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <Utensils className="h-5 w-5" />
            <span>Nutrition</span>
          </Link>
          <Link
            href="/client/calendrier"
            className={`flex flex-col items-center justify-center py-2 text-xs ${
              isActive("/client/calendrier") ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Calendrier</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 text-xs text-slate-500"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* Simple overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-lg">
            <div className="mx-auto max-w-screen-sm space-y-2">
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-2 text-slate-600"
                aria-label="Fermer"
              >
                Fermer
              </button>
              <Link href="/client/profile" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <User className="h-5 w-5" />
                <span>Profil</span>
              </Link>
              <button
                className="flex items-center gap-3 p-3 rounded-lg bg-red-50 text-red-700 w-full"
                onClick={async () => {
                  const { signOut } = await import("@/lib/auth");
                  await signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
