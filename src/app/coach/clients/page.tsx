'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CoachLayout from '@/layout/CoachLayout';
import { Users, ArrowRight, Loader2 } from 'lucide-react';
import { fetchClients, fetchClientLogs, ClientProfile } from '@/services/clientService';
import LogStatusIndicator from '@/components/tracking/LogStatusIndicator';

// Type pour les données des clients
type Client = ClientProfile & {
  logs: Array<{
    date: Date;
    status: 'completed' | 'pending' | 'missed';
  }>;
};

export default function CoachClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadClients = async () => {
      try {
        console.log('Chargement des clients...');
        setIsLoading(true);
        const clientsData = await fetchClients();
        console.log('Clients récupérés dans le composant:', clientsData);
        
        if (!clientsData || clientsData.length === 0) {
          console.warn('Aucun client trouvé dans la base de données');
          setClients([]);
          return;
        }
        
        // Charger les logs pour chaque client
        console.log('Chargement des logs pour chaque client...');
        const clientsWithLogs = await Promise.all(
          clientsData.map(async (client) => {
            console.log(`Chargement des logs pour le client ${client.id} (${client.email})`);
            const logs = await fetchClientLogs(client.id);
            console.log(`Logs récupérés pour ${client.email}:`, logs);
            return {
              ...client,
              logs: logs || []
            };
          })
        );
        
        console.log('Clients avec logs:', clientsWithLogs);
        setClients(clientsWithLogs);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes clients</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos clients et suivez leur progression
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Poids actuel
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Objectifs
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Suivi (3 derniers jours)
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-gray-50 cursor-pointer group"
                    onClick={() => router.push(`/coach/clients/${client.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.current_weight ? `${client.current_weight} kg` : 'N/A'}
                        {client.starting_weight && client.current_weight && (
                          <span className={`ml-2 text-sm ${client.current_weight < client.starting_weight ? 'text-green-600' : client.current_weight > client.starting_weight ? 'text-red-600' : 'text-gray-500'}`}>
                            {client.current_weight < client.starting_weight ? '↓' : client.current_weight > client.starting_weight ? '↑' : '→'} {client.starting_weight} kg
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.objectives || 'Non spécifié'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-start space-x-1">
                        {client.logs.length > 0 ? (
                          // Trier les logs par date décroissante pour afficher du plus récent au plus ancien
                          [...client.logs]
                            .sort((a, b) => b.date.getTime() - a.date.getTime())
                            .map((log, index) => (
                              <LogStatusIndicator 
                                key={index} 
                                status={log.status} 
                                date={log.date} 
                              />
                            ))
                        ) : (
                          // Si pas de logs, afficher les 3 derniers jours
                          [0, 1, 2].map((daysAgo) => {
                            const date = new Date();
                            date.setDate(date.getDate() - daysAgo);
                            return (
                              <LogStatusIndicator 
                                key={daysAgo} 
                                status={daysAgo === 0 ? 'pending' : 'missed'}
                                date={date} 
                              />
                            );
                          })
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="text-blue-600 group-hover:text-blue-800 transition-colors flex items-center justify-end">
                        Voir le profil <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Envelopper la page avec le layout du coach
CoachClientsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <CoachLayout>{page}</CoachLayout>;
};
