'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CoachLayout from '@/layout/CoachLayout';
import { Users, ArrowRight, Loader2, UserPlus, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { fetchClients, fetchClientLogs, ClientProfile } from '@/services/clientService';
import LogStatusIndicator from '@/components/tracking/LogStatusIndicator';
import ClientCard from '@/components/mobile/coach/ClientCard';
import { useNotification } from '@/contexts/NotificationContext';

// Type pour les données des clients
// Type pour les logs avec lastWeight
type ClientLogsWithLastWeight = Array<{
  date: Date;
  status: 'completed' | 'pending' | 'missed';
  weight?: number;
  [key: string]: string | number | boolean | Date | undefined;
}> & {
  lastWeight?: number;
};

type Client = ClientProfile & {
  logs: ClientLogsWithLastWeight;
};

export default function CoachClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const router = useRouter();
  const { showNotification } = useNotification();

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
              // Si lastWeight est défini, on l'utilise comme poids actuel
              current_weight: logs.lastWeight ?? client.current_weight,
              logs: logs || []
            };
          })
        );
        
        console.log('Clients avec logs:', clientsWithLogs);
        // Type-only adaptation: the logs shape returned by service differs slightly from the local type.
        // This cast preserves runtime behavior without changing business logic.
        setClients(clientsWithLogs as unknown as Client[]);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const reloadClients = async () => {
    try {
      setIsLoading(true);
      const clientsData = await fetchClients();
      const clientsWithLogs = await Promise.all(
        clientsData.map(async (client) => {
          const logs = await fetchClientLogs(client.id);
          return {
            ...client,
            current_weight: logs.lastWeight ?? client.current_weight,
            logs: logs || []
          } as Client;
        })
      );
      setClients(clientsWithLogs as unknown as Client[]);
    } catch (e) {
      console.error('Erreur lors du rafraîchissement des clients:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const res = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() })
      });
      // Read as text then try to parse JSON to avoid "Unexpected end of JSON" if body is empty
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || 'Réponse inattendue du serveur' };
      }
      if (!res.ok) {
        throw new Error(data?.error || `Échec de l'invitation (HTTP ${res.status})`);
      }
      // Succès: fermer le modal, reset, recharger la liste
      setIsInviteOpen(false);
      setInviteEmail('');
      await reloadClients();
      showNotification('Invitation envoyée avec succès !');
    } catch (err: any) {
      setInviteError(err?.message || 'Une erreur est survenue');
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="w-full md:w-auto text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">Mes clients</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez vos clients et suivez leur progression</p>
        </div>
        <div className="hidden md:block">
          <Dialog.Root open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <Dialog.Trigger asChild>
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 transition cursor-pointer">
                <UserPlus className="h-4 w-4" />
                Ajouter un client
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40" />
              <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold">Inviter un client</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="rounded p-1 hover:bg-gray-100" aria-label="Fermer">
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>
                <Dialog.Description className="text-sm text-gray-600 mb-3">
                  Entrez l'adresse email du client. Il recevra un Magic Link pour valider son email
                  et accéder à son espace.
                </Dialog.Description>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email du client</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {inviteError && (
                    <p className="text-sm text-red-600">{inviteError}</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Dialog.Close asChild>
                      <button type="button" className="rounded-md border px-4 py-2 hover:bg-gray-50">Annuler</button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      disabled={isInviting}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-60"
                    >
                      {isInviting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        'Envoyer l\'invitation'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Mobile: list as cards */}
      <div className="md:hidden space-y-4 pb-6">
        {/* Mobile action button */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-white hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
        {clients.length === 0 ? (
          <div className="text-center text-sm text-gray-500">Aucun client trouvé</div>
        ) : (
          clients.map((client) => (
            <ClientCard
              key={client.id}
              id={client.id}
              firstName={client.first_name}
              lastName={client.last_name}
              currentWeight={(client.logs?.[0]?.weight ?? client.current_weight) as number | null}
              startingWeight={client.starting_weight as number | null}
              objectives={client.objectives}
              logs={(client.logs || []) as any}
            />
          ))
        )}
      </div>

      {/* Desktop: existing table */}
      <div className="hidden md:block bg-white shadow overflow-hidden sm:rounded-lg">
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
                        {(() => {
                          // Récupérer le poids à afficher (dernier log ou current_weight)
                          const displayWeight = (client.logs?.[0]?.weight != null) 
                            ? client.logs[0].weight 
                            : client.current_weight;
                          
                          // Si aucun poids n'est disponible
                          if (displayWeight == null) return 'N/A';
                          
                          // Formater le poids avec une seule décimale si nécessaire
                          const formattedWeight = Number(displayWeight).toFixed(1).replace(/\.?0+$/, '');
                          
                          return (
                            <>
                              {formattedWeight} kg
                              {client.starting_weight != null && (
                                <span className={`ml-2 text-sm ${
                                  Number(displayWeight) < client.starting_weight ? 'text-green-600' : 
                                  Number(displayWeight) > client.starting_weight ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  {Number(displayWeight) < client.starting_weight ? '↓' : 
                                   Number(displayWeight) > client.starting_weight ? '↑' : '→'} {client.starting_weight} kg
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {client.objectives || 'Non spécifié'}
                      </div>
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
