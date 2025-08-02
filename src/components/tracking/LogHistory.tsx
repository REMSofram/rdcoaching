'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getClientLogs } from '@/services/dailyLogService';
// Formatage simple de la date sans dépendance à la locale
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

interface LogHistoryProps {
  className?: string;
  limit?: number;
}

export function LogHistory({ className = '', limit = 10 }: LogHistoryProps) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await getClientLogs(user.id);
        
        if (fetchError) {
          throw new Error('Erreur lors du chargement des logs');
        }
        
        if (data) {
          // Trier par date décroissante et limiter le nombre d'éléments
          const sortedLogs = [...data]
            .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())
            .slice(0, limit);
          
          setLogs(sortedLogs);
        }
      } catch (err) {
        console.error('Error loading logs:', err);
        setError('Impossible de charger l\'historique des logs');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLogs();
  }, [user?.id, limit]);

  const formatDate = (dateString: string) => {
    return formatDateString(dateString);
  };

  const getAppetiteLabel = (appetite?: string) => {
    switch (appetite) {
      case 'faible': return 'Faible';
      case 'moyen': return 'Moyen';
      case 'élevé': return 'Élevé';
      default: return 'Non renseigné';
    }
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

  if (logs.length === 0) {
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poids
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
            {logs.map((log) => (
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
