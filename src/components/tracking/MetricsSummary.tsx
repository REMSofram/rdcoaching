'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getClientLogs } from '@/services/dailyLogService';
import { Loader2 } from 'lucide-react';

interface MetricsSummaryProps {
  className?: string;
  clientId?: string; // ID optionnel du client, utilise user.id par défaut
}

export function MetricsSummary({ className = '', clientId }: MetricsSummaryProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const targetClientId = clientId || user?.id;
  const [metrics, setMetrics] = useState({
    lastWeight: 0,
    avgEnergy: 0,
    avgSleep: 0,
    avgSleepQuality: 0,
    weeklySessions: 0,
    currentStreak: 0
  });

  useEffect(() => {
    const calculateMetrics = async () => {
      if (!targetClientId) return;
      
      setIsLoading(true);
      try {
        const { data: logs, error } = await getClientLogs(targetClientId);
        if (error) throw error;
        if (!logs) return;

        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);

        // Dernier poids
        const lastWeightLog = logs
          .filter(log => log.weight && log.weight > 0)
          .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())[0];

        // Moyennes sur 7 jours
        const recentLogs = logs
          .filter(log => new Date(log.log_date) >= oneWeekAgo)
          .filter(log => log.energy_level && log.energy_level > 0);

        const avgEnergy = recentLogs.length > 0
          ? recentLogs.reduce((sum, log) => sum + (log.energy_level || 0), 0) / recentLogs.length
          : 0;

        const sleepLogs = logs
          .filter(log => new Date(log.log_date) >= oneWeekAgo)
          .filter(log => log.sleep_hours && log.sleep_hours > 0);

        const avgSleep = sleepLogs.length > 0
          ? sleepLogs.reduce((sum, log) => sum + (log.sleep_hours || 0), 0) / sleepLogs.length
          : 0;
          
        const sleepQualityLogs = logs
          .filter(log => new Date(log.log_date) >= oneWeekAgo)
          .filter(log => log.sleep_quality && log.sleep_quality > 0);
          
        const avgSleepQuality = sleepQualityLogs.length > 0
          ? sleepQualityLogs.reduce((sum, log) => sum + (log.sleep_quality || 0), 0) / sleepQualityLogs.length
          : 0;

        // Comptage des séances (basé sur training_done)
        const weeklySessions = logs
          .filter(log => new Date(log.log_date) >= oneWeekAgo)
          .filter(log => log.training_done === true).length;
        
        // Calcul de la série actuelle (current streak)
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Trier les logs par date décroissante
        const sortedLogs = [...logs].sort((a, b) => 
          new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
        );
        
        // Vérifier la série actuelle
        let currentDate = new Date(today);
        for (let i = 0; i < sortedLogs.length; i++) {
          const logDate = new Date(sortedLogs[i].log_date);
          logDate.setHours(0, 0, 0, 0);
          
          if (logDate.getTime() === currentDate.getTime()) {
            currentStreak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else if (logDate < currentDate) {
            // Si on trouve un jour manquant, on arrête le comptage
            break;
          }
        }

        setMetrics({
          lastWeight: lastWeightLog?.weight || 0,
          avgEnergy,
          avgSleep,
          avgSleepQuality,
          weeklySessions,
          currentStreak
        });
      } catch (error) {
        console.error('Error calculating metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateMetrics();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className={`grid grid-cols-5 gap-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-5 gap-3 ${className}`}>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <h3 className="text-xs font-medium text-blue-800">Dernier poids</h3>
        <p className="text-lg font-bold text-blue-900">
          {metrics.lastWeight > 0 ? `${metrics.lastWeight} kg` : '-'}
        </p>
      </div>
      
      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
        <h3 className="text-xs font-medium text-green-800">Énergie (7j)</h3>
        <p className="text-lg font-bold text-green-900">
          {metrics.avgEnergy > 0 ? metrics.avgEnergy.toFixed(1) : '-'}
        </p>
      </div>
      
      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
        <h3 className="text-xs font-medium text-purple-800">Sommeil (7j)</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-bold text-purple-900">
            {metrics.avgSleep > 0 ? `${metrics.avgSleep.toFixed(1)}h` : '-'}
          </p>
          {metrics.avgSleepQuality > 0 && (
            <span className="text-xs text-purple-600">
              • {metrics.avgSleepQuality.toFixed(1)}/5
            </span>
          )}
        </div>
      </div>
      
      <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
        <h3 className="text-xs font-medium text-amber-800">Séances (7j)</h3>
        <p className="text-lg font-bold text-amber-900">
          {metrics.weeklySessions > 0 ? metrics.weeklySessions : '-'}
        </p>
      </div>
      
      <div className="bg-red-50 p-3 rounded-lg border border-red-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-red-800">Série actuelle</h3>
          {metrics.currentStreak > 3 && (
            <svg 
              className="w-4 h-4 text-red-600" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fillRule="evenodd" 
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.329-.425-.231-.902.121-1.259a1 1 0 00.001-1.418l-3.43-3.403z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </div>
        <p className="text-lg font-bold text-red-900 mt-1">
          {metrics.currentStreak > 0 ? `${metrics.currentStreak}j` : '-'}
        </p>
      </div>
    </div>
  );
}
