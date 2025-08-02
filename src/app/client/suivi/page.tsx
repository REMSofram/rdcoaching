'use client';

import { DailyLogButton } from '@/components/ui/DailyLogButton';
import { LogHistory } from '@/components/tracking/LogHistory';
import { MetricsSummary } from '@/components/tracking/MetricsSummary';

export default function SuiviPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suivi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Consultez votre historique de suivi et vos progrès au fil du temps.
          </p>
        </div>
        <DailyLogButton />
      </div>
      
      <div className="space-y-6">
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Résumé des indicateurs</h2>
          <MetricsSummary />
        </section>
        
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Historique des enregistrements</h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
            </div>
          </div>
          
          <LogHistory className="mt-4" />
        </section>
      </div>
    </div>
  );
}
