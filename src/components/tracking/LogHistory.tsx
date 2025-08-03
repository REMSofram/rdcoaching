'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getClientLogs } from '@/services/dailyLogService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, subMonths } from 'date-fns';
import { isWithinInterval } from 'date-fns/isWithinInterval';
import { fr } from 'date-fns/locale';
const formatDateString = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
import { Loader2 } from 'lucide-react';

type TimeRange = 'all' | 'month' | 'week';

interface DailyLog {
  id: string;
  log_date: string;
  weight?: number;
  sleep_quality?: number;
  sleep_hours?: number;
  energy_level?: number;
  appetite_level?: number;
  appetite?: 'faible' | 'normal' | 'élevé';
  notes?: string;
  client_id: string;
  created_at: string;
  updated_at: string;
}

interface LogHistoryProps {
  className?: string;
  limit?: number;
  clientId?: string; // ID optionnel du client, utilise user.id par défaut
}

export function LogHistory({ className = '', limit = 10, clientId }: LogHistoryProps) {
  const { user } = useAuth();
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DailyLog[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const targetClientId = clientId || user?.id;

  // Fonction pour filtrer les logs en fonction de la période sélectionnée
  const filterLogsByTimeRange = (logs: DailyLog[], range: TimeRange) => {
    const now = new Date();
    let fromDate: Date;

    switch (range) {
      case 'week':
        fromDate = subDays(now, 7);
        break;
      case 'month':
        fromDate = subMonths(now, 1);
        break;
      case 'all':
      default:
        return logs; // Pas de filtre pour 'all'
    }

    return logs.filter(log => {
      const logDate = new Date(log.log_date);
      return isWithinInterval(logDate, { start: fromDate, end: now });
    });
  };

  // Charger tous les logs une seule fois
  useEffect(() => {
    const loadLogs = async () => {
      if (!targetClientId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await getClientLogs(targetClientId);
        
        if (fetchError) {
          throw new Error('Erreur lors du chargement des logs');
        }
        
        if (data) {
          // Trier par date décroissante
          const sortedLogs = [...data].sort(
            (a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
          );
          
          setAllLogs(sortedLogs);
          // Appliquer le filtre initial
          setFilteredLogs(filterLogsByTimeRange(sortedLogs, timeRange).slice(0, limit));
        }
      } catch (err) {
        console.error('Error loading logs:', err);
        setError('Impossible de charger l\'historique des logs');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLogs();
  }, [targetClientId]);

  // Mettre à jour les logs filtrés lorsque la période change
  useEffect(() => {
    if (allLogs.length > 0) {
      setFilteredLogs(filterLogsByTimeRange(allLogs, timeRange).slice(0, limit));
    }
  }, [timeRange, allLogs, limit]);

  const formatDate = (dateString: string) => {
    return formatDateString(dateString);
  };

  const getSleepEmoji = (quality?: number) => {
    if (quality === undefined || quality === null) return '😴';
    if (quality >= 4) return '😊';
    if (quality >= 2) return '😐';
    return '😞';
  };

  const getEnergyEmoji = (level?: number) => {
    if (level === undefined || level === null) return '⚡';
    if (level >= 4) return '⚡';
    if (level >= 2) return '🔋';
    return '🪫';
  };

  const getAppetiteEmoji = (level?: number) => {
    if (level === undefined || level === null) return '🍽️';
    if (level >= 4) return '😋';
    if (level >= 2) return '😐';
    return '🤢';
  };

  const getAppetiteLabel = (appetite?: string) => {
    switch (appetite) {
      case 'faible': return 'Faible';
      case 'moyen': return 'Moyen';
      case 'élevé': return 'Élevé';
      default: return 'Non renseigné';
    }
  };

  // Gestion du changement de période
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement de l'historique...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 text-red-700 rounded ${className}`}>
        {error}
      </div>
    );
  }



  if (filteredLogs.length === 0 && !isLoading) {
    return (
      <div className={`p-4 bg-gray-50 rounded border border-gray-200 ${className}`}>
        <p className="text-center text-gray-500">
          Aucun enregistrement de suivi pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-white shadow rounded-lg ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h3 className="text-base font-medium text-gray-900">Historique des enregistrements</h3>
        <div className="w-40">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
              <SelectItem value="week">7 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poids (kg)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sommeil
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Énergie
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appétit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDate(log.log_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.weight ? `${log.weight} kg` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.sleep_hours ? `${log.sleep_hours}h` : '-'}
                  {log.sleep_quality && ` (${log.sleep_quality}/5)`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.energy_level ? `${log.energy_level}/5` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getAppetiteLabel(log.appetite)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
