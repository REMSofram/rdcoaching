"use client";

import React from "react";

interface HistoryCardProps {
  date: string;
  weight?: number;
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  appetiteLabel?: string;
}

export default function HistoryCard({
  date,
  weight,
  sleepHours,
  sleepQuality,
  energyLevel,
  appetiteLabel,
}: HistoryCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="text-sm font-medium text-gray-900">{date}</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500">Poids</div>
          <div className="text-base font-semibold text-gray-900">{weight ? `${weight} kg` : '-'}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500">Sommeil</div>
          <div className="text-base font-semibold text-gray-900">
            {sleepHours ? `${sleepHours}h` : '-'}{sleepQuality ? ` (${sleepQuality}/5)` : ''}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500">Énergie</div>
          <div className="text-base font-semibold text-gray-900">{energyLevel ? `${energyLevel}/5` : '-'}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500">Appétit</div>
          <div className="text-base font-semibold text-gray-900">{appetiteLabel || '-'}</div>
        </div>
      </div>
    </div>
  );
}
