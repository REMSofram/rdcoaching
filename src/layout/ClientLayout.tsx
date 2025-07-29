"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Home,
  Calendar,
  BarChart2,
  Utensils,
  User,
  Dumbbell,
  Activity,
} from "lucide-react";
import { useState } from "react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const accentColors = [
  {
    name: "Bleu",
    bg: "bg-blue-100",
    text: "text-blue-800",
    active: "bg-blue-500 text-white",
  },
  {
    name: "Vert",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    active: "bg-emerald-500 text-white",
  },
  {
    name: "Violet",
    bg: "bg-violet-100",
    text: "text-violet-800",
    active: "bg-violet-500 text-white",
  },
  {
    name: "Orange",
    bg: "bg-amber-100",
    text: "text-amber-900",
    active: "bg-amber-400 text-white",
  },
  {
    name: "Gris",
    bg: "bg-slate-200",
    text: "text-slate-900",
    active: "bg-slate-500 text-white",
  },
];

type AccentColor = (typeof accentColors)[number];

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive }) => (
  <Link
    href={href}
    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? "bg-slate-500 text-white"
        : "text-slate-900 hover:bg-slate-200 hover:text-slate-900"
    }`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </Link>
);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Retirer useState et accentColors

  const navItems = [
    { href: "/client/dashboard", icon: <Home size={20} />, label: "Accueil" },
    {
      href: "/client/suivi",
      icon: <Activity size={20} />,
      label: "Suivi",
    },
    {
      href: "/client/programme",
      icon: <Dumbbell size={20} />,
      label: "Programme",
    },
    {
      href: "/client/nutrition",
      icon: <Utensils size={20} />,
      label: "Nutrition",
    },
    {
      href: "/client/calendrier",
      icon: <Calendar size={20} />,
      label: "Calendrier",
    },
  ];

  const bottomNavItems = [
    { 
      href: "/client/profile", 
      icon: <User size={20} />, 
      label: "Profil" 
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <h1 className="text-lg font-bold bg-slate-200 text-slate-800 rounded px-3 py-1 tracking-wide shadow-inner border border-slate-300">
                Mon Espace
              </h1>
            </div>
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>
            <div className="mt-auto">
              {bottomNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={async () => {
                const { signOut } = await import("@/lib/auth");
                await signOut();
                window.location.href = "/";
              }}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="mr-3" size={20} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
