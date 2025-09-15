'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogHistory } from './LogHistory';
import { DemoChart } from '../shared/charts/DemoChart';

interface LogsAndChartTabsProps {
  clientId?: string;
  clientName?: string;
}

export function LogsAndChartTabs({ clientId, clientName }: LogsAndChartTabsProps) {
  const [activeTab, setActiveTab] = useState('logs');

  return (
    <div className="w-full">
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-4">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs' 
              ? 'bg-white shadow-sm text-gray-900' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Mes enregistrements
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'chart' 
              ? 'bg-white shadow-sm text-gray-900' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Graphique
        </button>
      </div>
      
      {activeTab === 'logs' && (
        <LogHistory clientId={clientId} />
      )}
      
      {activeTab === 'chart' && (
        <DemoChart 
          clientName={clientName || 'Vos'} 
          clientId={clientId}
        />
      )}
    </div>
  );
}
