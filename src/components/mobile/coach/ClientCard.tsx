"use client";

import React from "react";
import { Users, ArrowRight } from "lucide-react";
import LogStatusIndicator from "@/components/tracking/LogStatusIndicator";
import { useRouter } from "next/navigation";

type Status = "completed" | "pending" | "missed";

export default function ClientCard({
  id,
  firstName,
  lastName,
  currentWeight,
  startingWeight,
  objectives,
  profilePictureUrl,
  logs,
}: {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  currentWeight?: number | null;
  startingWeight?: number | null;
  objectives?: string | null;
  profilePictureUrl?: string | null;
  logs: Array<{ date: Date; status: Status; weight?: number | null }>;
}) {
  const router = useRouter();

  const displayWeight = logs?.[0]?.weight != null ? logs[0].weight : currentWeight;
  const formattedWeight =
    displayWeight == null ? undefined : Number(displayWeight).toFixed(1).replace(/\.?0+$/, "");

  const trend =
    displayWeight == null || startingWeight == null
      ? null
      : Number(displayWeight) < startingWeight
      ? "down"
      : Number(displayWeight) > startingWeight
      ? "up"
      : "flat";

  // Ajout de logs pour déboguer
  console.log('ClientCard - profilePictureUrl:', profilePictureUrl);
  console.log('ClientCard - firstName:', firstName);
  console.log('ClientCard - lastName:', lastName);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Erreur de chargement de l\'image:', e);
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.style.display = 'none';
    
    // Créer un élément de secours
    const parent = target.parentElement;
    if (parent) {
      const fallback = document.createElement('div');
      fallback.className = 'h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center';
      fallback.innerHTML = '<svg class="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
      parent.appendChild(fallback);
    }
  };

  return (
    <div
      className="client-card client-card-mobile bg-white rounded-lg border p-4 shadow-sm active:scale-[0.99] transition select-none"
      onClick={() => router.push(`/coach/clients/${id}`)}
      role="button"
      aria-label={`Voir le profil de ${firstName ?? ""} ${lastName ?? ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {profilePictureUrl ? (
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
            <img 
              src={profilePictureUrl} 
              alt={`${firstName || ''} ${lastName || ''}`.trim() || 'Photo de profil'}
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={() => console.log('Image chargée avec succès:', profilePictureUrl)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#f3f4f6' // Couleur de fond en cas de problème de chargement
              }}
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-slate-600" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[18px] font-semibold text-gray-900">
            {(firstName || lastName) ? `${firstName ?? ""} ${lastName ?? ""}`.trim() : "Client"}
          </div>
          <div className="text-xs text-gray-500 truncate">Objectif: {objectives || "Non spécifié"}</div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-3 space-y-3">
        {/* Poids */}
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs text-gray-500">Poids actuel</div>
          <div className="text-base font-semibold text-gray-900 flex items-center gap-2">
            {formattedWeight ? `${formattedWeight} kg` : "N/A"}
            {startingWeight != null && formattedWeight && (
              <span
                className={
                  trend === "down"
                    ? "text-green-600"
                    : trend === "up"
                    ? "text-red-600"
                    : "text-gray-500"
                }
              >
                {trend === "down" ? "↓" : trend === "up" ? "↑" : "→"} {startingWeight} kg
              </span>
            )}
          </div>
        </div>

        {/* Suivi */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Suivi (4 derniers jours)</div>
          <div className="flex items-center justify-start">
            {(() => {
              const recent = [...(logs || [])]
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 4);
              const items = recent.length
                ? recent
                : [0, 1, 2, 3].map((daysAgo) => ({
                    date: new Date(Date.now() - daysAgo * 86400000),
                    status: (daysAgo === 0 ? "pending" : "missed") as Status,
                  }));
              return items.map((log, idx) => (
                <LogStatusIndicator key={idx} status={log.status} date={log.date} size="lg" />
              ));
            })()}
          </div>
        </div>

        {/* Action */}
        <div className="pt-1">
          <div className="h-11 flex items-center justify-center w-full rounded-md bg-slate-900 text-white text-[16px] font-medium active:scale-95">
            Voir le profil <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
