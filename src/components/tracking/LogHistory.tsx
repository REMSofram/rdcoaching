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
import HistoryCard from '@/components/mobile/HistoryCard';

type TimeRange = 'all' | 'month' | 'week';

interface DailyLog {
  id: string;
  log_date: string;
  weight?: number;
  sleep_quality?: number;
  sleep_hours?: number;
  energy_level?: number;
  appetite_level?: number;
  appetite?: 'faible' | 'moyen' | 'élevé';
  notes?: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  training_done?: boolean;
  training_type?: string;
  plaisir_seance?: number; // 1-5
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
  const [mobileVisible, setMobileVisible] = useState(limit);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const openLogDialog = (log: DailyLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const closeLogDialog = () => {
    setIsDialogOpen(false);
    setSelectedLog(null);
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement de l&apos;historique...</span>
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
    <>
      {/* Mobile cards */}
      <div className={`md:hidden ${className}`}>
        <div className="flex items-center justify-between px-2 py-2">
          <h3 className="text-base font-medium text-gray-900">Historique</h3>
          <div className="w-36">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="month">30 jours</SelectItem>
                <SelectItem value="week">7 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          {filteredLogs.slice(0, mobileVisible).map((log) => (
            <div
              key={log.id}
              className="cursor-pointer active:scale-[0.99]"
              onClick={() => openLogDialog(log)}
            >
              <HistoryCard
                date={formatDate(log.log_date)}
                weight={log.weight}
                sleepHours={log.sleep_hours}
                sleepQuality={log.sleep_quality}
                energyLevel={log.energy_level}
                appetiteLabel={getAppetiteLabel(log.appetite)}
              />
            </div>
          ))}
        </div>
        {mobileVisible < filteredLogs.length && (
          <div className="flex justify-center mt-3">
            <button
              className="px-4 py-2 text-sm rounded bg-slate-900 text-white active:scale-95"
              onClick={() => setMobileVisible((v) => v + limit)}
            >
              Voir plus
            </button>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className={`hidden md:block overflow-hidden bg-white shadow rounded-lg ${className}`}>
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
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                  Date
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Poids (kg)
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Sommeil
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Énergie
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Appétit
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Remarques
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openLogDialog(log)}
                >
                  <td className="px-3 py-4 text-sm font-medium text-gray-900 max-w-[176px] truncate" title={formatDate(log.log_date)}>
                    {formatDate(log.log_date)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-24">
                    {log.weight ? `${log.weight} kg` : '-'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-32">
                    {log.sleep_hours ? `${log.sleep_hours}h` : '-'}
                    {log.sleep_quality && ` (${log.sleep_quality}/5)`}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-24">
                    {log.energy_level ? `${log.energy_level}/5` : '-'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-28">
                    {getAppetiteLabel(log.appetite)}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-[192px] truncate" title={log.notes || ''}>
                    {log.notes ? log.notes : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dialog moved below to be available for mobile and desktop */}
      </div>
      {/* Dialog for full log details (rendered globally for responsiveness) */}
      {isDialogOpen && selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/40" onClick={closeLogDialog} />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg bg-white shadow-lg border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h4 className="text-base font-semibold text-gray-900">Détail du log</h4>
              <button
                className="text-gray-500 hover:text-gray-700 px-2 py-1"
                onClick={closeLogDialog}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{formatDate(selectedLog.log_date)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Poids</span><span>{selectedLog.weight ? `${selectedLog.weight} kg` : '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Sommeil</span><span>{selectedLog.sleep_hours ? `${selectedLog.sleep_hours}h` : '-'}{selectedLog.sleep_quality && ` (${selectedLog.sleep_quality}/5)`}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Énergie</span><span>{selectedLog.energy_level ? `${selectedLog.energy_level}/5` : '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Appétit</span><span>{getAppetiteLabel(selectedLog.appetite)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type de séance</span><span>{selectedLog.training_type || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Plaisir séance</span><span>{selectedLog.plaisir_seance ? `${selectedLog.plaisir_seance}/5` : '-'}</span></div>
              <div>
                <div className="text-gray-500 mb-1">Remarques</div>
                <div className="whitespace-pre-wrap break-words text-gray-800 bg-gray-50 border border-gray-200 rounded p-3">
                  {selectedLog.notes || '—'}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end">
              <button
                className="inline-flex items-center rounded bg-slate-900 text-white px-4 py-2 text-sm active:scale-95"
                onClick={closeLogDialog}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
