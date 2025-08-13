"use client";

import Link from "next/link";

interface FloatingActionButtonProps {
  href?: string;
  label?: string;
}

export default function FloatingActionButton({
  href = "/client/daily-log",
  label = "Remplir mon journal",
}: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      className="md:hidden fixed bottom-16 right-4 z-40"
      aria-label={label}
    >
      <div className="rounded-full shadow-lg bg-slate-900 text-white px-5 py-4 active:scale-95 transition-transform">
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}
