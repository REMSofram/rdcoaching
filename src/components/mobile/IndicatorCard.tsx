"use client";

import React from "react";

interface IndicatorCardProps {
  title: string;
  value: React.ReactNode;
  color?: "blue" | "green" | "purple" | "amber" | "red" | "slate";
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    title: "text-blue-800",
    value: "text-blue-900",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-100",
    title: "text-green-800",
    value: "text-green-900",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-100",
    title: "text-purple-800",
    value: "text-purple-900",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "text-amber-800",
    value: "text-amber-900",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-100",
    title: "text-red-800",
    value: "text-red-900",
  },
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-100",
    title: "text-slate-800",
    value: "text-slate-900",
  },
};

export default function IndicatorCard({ title, value, color = "slate" }: IndicatorCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-lg p-4 flex items-center justify-between`}> 
      <h3 className={`text-sm font-medium ${c.title}`}>{title}</h3>
      <div className={`text-xl font-bold ${c.value}`}>{value}</div>
    </div>
  );
}
