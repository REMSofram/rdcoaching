'use client';

import { useState, useEffect } from 'react';
import CombinedChart, { type DataPoint } from './CombinedChart';
import { getClientTrackingData } from '@/services/trackingService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function DemoChart({ 
  clientName = 'Client',
  clientId  
}: { 
  clientName?: string;
  clientId?: string;
}) {
  const { user } = useAuth();
  const [trackingData, setTrackingData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | '3months'>('week');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Utiliser l'ID du client fourni ou celui de l'utilisateur connecté
        const targetClientId = clientId || user?.id;
        
        if (!targetClientId) {
          throw new Error('Aucun client sélectionné');
        }

        const data = await getClientTrackingData(targetClientId, period);
        
        if (data.length === 0) {
          setError('Aucune donnée de suivi disponible pour cette période');
        }
        
        setTrackingData(data);
      } catch (err) {
        console.error('Erreur lors du chargement des données de suivi:', err);
        setError('Impossible de charger les données de suivi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackingData();
  }, [clientId, user?.id, period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Afficher tous les contrôles même s'il n'y a pas de données
  return (
    <div className="min-h-[600px]">
      <div className="mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {[
            { value: 'week' as const, label: '1 Semaine' },
            { value: 'month' as const, label: '1 Mois' },
            { value: '3months' as const, label: '3 Mois' },
          ].map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setPeriod(range.value)}
              className={`px-4 py-2 text-sm font-medium ${
                period === range.value 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 ${
                range.value === 'week' ? 'rounded-l-lg' : ''
              } ${
                range.value === '3months' ? 'rounded-r-lg' : ''
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <CombinedChart 
        data={trackingData} 
        clientName={clientName}
        hideChart={trackingData.length === 0}
        noDataMessage={error || 'Aucune donnée de suivi disponible pour cette période'}
        timeRange={period}
        hidePeriodSelector={true}
      />
    </div>
  );
}
