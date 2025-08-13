"use client";

import React from "react";

type Status = "completed" | "pending" | "missed";

export default function ClientStatusIndicators({
  logs,
}: {
  logs: Array<{ date: Date; status: Status }>;
}) {
  const recent = [...(logs || [])]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  const iconFor = (s: Status) => {
    switch (s) {
      case "completed":
        return "✅";
      case "pending":
        return "🕑";
      case "missed":
      default:
        return "😕";
    }
  };

  const items = recent.length
    ? recent
    : [0, 1, 2].map((i) => ({ date: new Date(Date.now() - i * 86400000), status: (i === 0 ? "pending" : "missed") as Status }));

  return (
    <div className="flex items-center gap-2">
      {items.map((l, idx) => (
        <div key={idx} className="h-11 min-w-11 px-3 flex items-center justify-center rounded-lg bg-gray-50 text-xl">
          <span aria-label={l.status}>{iconFor(l.status)}</span>
        </div>
      ))}
    </div>
  );
}
