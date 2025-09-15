'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DailyLogButton } from '@/components/ui/DailyLogButton';
import { MetricsSummary } from '@/components/tracking/MetricsSummary';
import { LogsAndChartTabs } from '@/components/tracking/LogsAndChartTabs';

export default function SuiviPage() {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900">Suivi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Consultez votre historique de suivi et vos progrès au fil du temps.
          </p>
        </div>
        <div className="hidden md:block">
          <DailyLogButton />
        </div>
      </div>
      
      <div className="space-y-6">
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Résumé des indicateurs</h2>
          <MetricsSummary />
        </section>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isClient && user && (
            <LogsAndChartTabs 
              clientId={user.id}
              clientName="Vos"
            />
          )}
        </div>
      </div>
    </div>
  );
}
