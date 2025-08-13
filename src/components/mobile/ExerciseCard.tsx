"use client";

import React from "react";

interface ExerciseCardProps {
  name: string;
  details?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function ExerciseCard({ name, details, checked, onChange }: ExerciseCardProps) {
  return (
    <label className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div>
        <div className="text-sm font-semibold text-gray-900">{name}</div>
        {details && <div className="text-xs text-gray-600 mt-0.5">{details}</div>}
      </div>
    </label>
  );
}
