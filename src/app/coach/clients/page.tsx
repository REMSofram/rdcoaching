'use client';

import { useEffect, useState, SyntheticEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CoachLayout from '@/layout/CoachLayout';
import { Users, ArrowRight, Loader2, UserPlus, X, Cake, Tag, Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { fetchClients, fetchClientLogs, ClientProfile } from '@/services/clientService';
import LogStatusIndicator from '@/components/tracking/LogStatusIndicator';
import ClientCard from '@/components/mobile/coach/ClientCard';
import { useNotification } from '@/contexts/NotificationContext';
import { ClientTags } from '@/components/shared/ClientTags';
import { EditableTags } from '@/components/shared/EditableTags';
import { createClient } from '@/utils/supabase/client';

// Type pour les données des clients
// Fonction pour vérifier si c'est l'anniversaire du client
const isBirthdayToday = (birthDate?: string | null): boolean => {
  if (!birthDate) return false;
  
  try {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    
    // Vérifier si le jour et le mois correspondent
    return (
      birthDateObj.getDate() === today.getDate() &&
      birthDateObj.getMonth() === today.getMonth()
    );
  } catch (error) {
    console.error('Erreur lors de la vérification de la date de naissance:', error);
    return false;
  }
};

// Type pour les logs avec lastWeight
type ClientLogsWithLastWeight = Array<{
  id: string;
  client_id: string;
  log_date: string;
  date: Date;
  status: 'completed' | 'pending' | 'missed';
  weight?: number;
  [key: string]: unknown;
}> & {
  lastWeight?: number;
};

type Client = ClientProfile & {
  logs: ClientLogsWithLastWeight;
  types?: string[];
};

export default function CoachClientsPage() {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  // Charger l'utilisateur actuel
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    loadUser();
  }, [supabase]);

  useEffect(() => {
    if (!currentUser) return;
    
    const loadAvailableTags = async () => {
      try {

        // 1. Récupérer les tags du coach
        const { data: coachData } = await supabase
          .from('profiles')
          .select('available_tags')
          .eq('id', currentUser.id)
          .single();

        // 2. Récupérer tous les tags utilisés par les clients
        const { data: clientsData } = await supabase
          .from('profiles')
          .select('types')
          .not('types', 'is', null);

        // 3. Extraire tous les tags uniques des clients
        const allClientTags = new Set<string>();
        clientsData?.forEach(client => {
          if (client.types && Array.isArray(client.types)) {
            client.types.forEach((tag: string) => allClientTags.add(tag));
          }
        });

        // 4. Combiner avec les tags du coach
        const defaultTags = [
          'Actif',
          'Inactif',
          'Course',
          'Musculation',
          'Perte de poids',
          'Prise de masse',
          'Débutant',
          'Intermédiaire',
          'Avancé'
        ];

        // 5. Fusionner tous les tags (ceux du coach + ceux des clients + valeurs par défaut)
        const allTags = [
          ...(coachData?.available_tags || []),
          ...Array.from(allClientTags),
          ...defaultTags
        ];

        // 6. Éliminer les doublons et trier
        const uniqueTags = Array.from(new Set(allTags)).sort();

        // 7. Mettre à jour l'état local
        setAvailableTags(uniqueTags);
        
        // 8. Mettre à jour les tags disponibles du coach s'ils sont différents
        if (JSON.stringify(coachData?.available_tags || []) !== JSON.stringify(uniqueTags)) {
          await supabase
            .from('profiles')
            .update({ available_tags: uniqueTags })
            .eq('id', currentUser.id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des tags disponibles:', error);
      }
    };

    loadAvailableTags();
    
    // Configurer un abonnement aux changements de la table profiles
    const subscription = supabase
      .channel('profiles_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: 'types=not.is.null'
        }, 
        (payload) => {
          console.log('Changement détecté dans les tags:', payload);
          loadAvailableTags(); // Recharger les tags
        }
      )
      .subscribe();

    // Nettoyer l'abonnement lors du démontage du composant
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const updateAvailableTags = async (newTags: string[]) => {
    if (!currentUser?.id) {
      console.error('Aucun utilisateur connecté');
      return;
    }
    
    try {
      console.log('Mise à jour des tags disponibles:', newTags);
      
      // S'assurer que les tags sont uniques
      const uniqueTags = Array.from(new Set(newTags));
      
      // Utiliser une fonction RPC pour la mise à jour des tags
      const { data, error } = await supabase.rpc('update_available_tags', {
        p_user_id: currentUser.id,
        p_tags: uniqueTags
      });
      
      if (error) {
        console.error('Erreur lors de la mise à jour des tags disponibles:', error);
        throw error;
      }
      
      if (data) {
        setAvailableTags(data || []);
        console.log('Tags disponibles mis à jour avec succès:', data);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des tags disponibles:', error);
      throw error;
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!currentUser?.id) {
      console.error('Aucun utilisateur connecté');
      showNotification('Erreur: Utilisateur non connecté');
      return;
    }
    
    try {
      // 1. Mettre à jour les tags disponibles en retirant le tag supprimé
      const updatedAvailableTags = availableTags.filter(tag => tag !== tagToDelete);
      
      // 2. Mettre à jour la base de données avec les nouveaux tags disponibles
      await updateAvailableTags(updatedAvailableTags);
      
      // 3. Mettre à jour les clients qui ont ce tag
      const { data: clientsWithTag, error: fetchError } = await supabase
        .from('profiles')
        .select('id, types')
        .contains('types', [tagToDelete]);
        
      if (fetchError) throw fetchError;
      
      // 4. Mettre à jour chaque client qui avait ce tag
      if (clientsWithTag && clientsWithTag.length > 0) {
        const updates = clientsWithTag.map(client => {
          const updatedTags = (client.types || []).filter((tag: string) => tag !== tagToDelete);
          return supabase
            .from('profiles')
            .update({ types: updatedTags })
            .eq('id', client.id);
        });
        
        // Attendre que toutes les mises à jour soient terminées
        const results = await Promise.all(updates);
        const errors = results.filter(result => result.error);
        
        if (errors.length > 0) {
          throw new Error(`Erreur lors de la mise à jour de ${errors.length} clients`);
        }
      }
      
      // 5. Mettre à jour l'état local
      setClients(prevClients => 
        prevClients.map(client => ({
          ...client,
          types: client.types?.filter(tag => tag !== tagToDelete) || []
        }))
      );
      
      console.log(`Tag "${tagToDelete}" supprimé avec succès`);
      showNotification('Tag supprimé avec succès');
      
      // Recharger les données pour s'assurer que tout est à jour
      const { data: coachData } = await supabase
        .from('profiles')
        .select('available_tags')
        .eq('id', currentUser.id)
        .single();
        
      if (coachData) {
        setAvailableTags(coachData.available_tags || []);
      }
      
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error);
      showNotification('Erreur lors de la suppression du tag');
    }
  };

  // Récupérer l'utilisateur actuel
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    
    getCurrentUser();
  }, [supabase]);
  
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
              logs: logs || [],
              types: client.types || [] // S'assurer que types est toujours un tableau
            };
          })
        );
        
        console.log('Clients avec logs et tags:', clientsWithLogs);
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
            logs: logs || [],
            types: client.types || []
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
    <div className="space-y-6">
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
      <div className="md:hidden space-y-3">
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
              profilePictureUrl={client.profile_picture_url}
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
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Tags
                  </div>
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[320px]"
                >
                  Suivi (4 derniers jours)
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr 
                    key={client.id} 
                    className={`hover:bg-gray-50 cursor-pointer group relative ${isBirthdayToday(client.birth_date) ? 'bg-gray-900/5 border-l-4 border-blue-800' : ''}`}
                    onClick={() => router.push(`/coach/clients/${client.id}`)}
                    title={isBirthdayToday(client.birth_date) ? `Joyeux anniversaire ${client.first_name} ! 🎉` : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {client.profile_picture_url ? (
                            <Image
                              className="h-10 w-10 rounded-full"
                              src={client.profile_picture_url}
                              alt={`${client.first_name} ${client.last_name}`}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                            {isBirthdayToday(client.birth_date) && (
                              <Cake className="ml-2 h-4 w-4 text-blue-800" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <EditableTags 
                        tags={client.types || []} 
                        availableTags={availableTags}
                        onDeleteTag={handleDeleteTag}
                        onSave={async (newTags) => {
                          try {
                            console.log('Mise à jour des tags pour le client:', client.id, 'Nouveaux tags:', newTags);
                            
                            // S'assurer que les tags sont uniques
                            const uniqueNewTags = Array.from(new Set(newTags));
                            
                            // 1. Mettre à jour les tags du client
                            const { error: updateError } = await supabase
                              .from('profiles')
                              .update({ 
                                types: uniqueNewTags,
                                updated_at: new Date().toISOString()
                              })
                              .eq('id', client.id);
                            
                            if (updateError) {
                              console.error('Erreur lors de la mise à jour des tags du client:', updateError);
                              throw updateError;
                            }
                            
                            // 2. Vérifier s'il y a de nouveaux tags à ajouter aux tags disponibles
                            const newUniqueTags = uniqueNewTags.filter(tag => 
                              !availableTags.includes(tag)
                            );
                            
                            // 3. Si de nouveaux tags ont été ajoutés, mettre à jour availableTags
                            if (newUniqueTags.length > 0) {
                              console.log('Nouveaux tags détectés, mise à jour des tags disponibles...');
                              const updatedAvailableTags = [...availableTags, ...newUniqueTags];
                              await updateAvailableTags(updatedAvailableTags);
                            }
                            
                            // 4. Mettre à jour l'état local
                            setClients(prevClients => 
                              prevClients.map(c => 
                                c.id === client.id 
                                  ? { ...c, types: uniqueNewTags } 
                                  : c
                              )
                            );
                            
                            console.log('Tags mis à jour avec succès pour le client:', client.id);
                            showNotification('Tags mis à jour avec succès');
                            
                          } catch (error) {
                            console.error('Erreur lors de la mise à jour des tags:', error);
                            showNotification('Erreur lors de la mise à jour des tags');
                            
                            // Recharger les tags depuis la base de données en cas d'erreur
                            try {
                              const { data: clientData, error: fetchError } = await supabase
                                .from('profiles')
                                .select('types')
                                .eq('id', client.id)
                                .single();
                                
                              if (!fetchError && clientData) {
                                setClients(prevClients => 
                                  prevClients.map(c => 
                                    c.id === client.id 
                                      ? { ...c, types: clientData.types || [] } 
                                      : c
                                  )
                                );
                              }
                            } catch (reloadError) {
                              console.error('Erreur lors du rechargement des tags:', reloadError);
                            }
                            
                            // Relancer l'erreur pour qu'elle soit gérée par le composant parent si nécessaire
                            throw error;
                          }
                        }}
                      />
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
                      <div className="flex items-center space-x-1">
                        {[0, 1, 2, 3].map((daysAgo) => {
                          const targetDate = new Date();
                          targetDate.setHours(0, 0, 0, 0); // S'assurer que l'heure est à minuit
                          targetDate.setDate(targetDate.getDate() - daysAgo);
                          
                          // Log pour déboguer
                          console.log(`\n--- Jour ${daysAgo} ---`);
                          console.log('Date cible:', targetDate.toISOString().split('T')[0]);
                          console.log('Tous les logs du client:', client.logs.map(l => ({
                            date: l.date?.toISOString?.()?.split('T')[0],
                            status: l.status,
                            isDateValid: l.date instanceof Date && !isNaN(l.date.getTime())
                          })));
                          
                          // Trouver le log correspondant à cette date
                          const logForDate = client.logs.find(log => {
                            if (!log?.date) {
                              console.log('Log sans date:', log);
                              return false;
                            }
                            if (!(log.date instanceof Date) || isNaN(log.date.getTime())) {
                              console.log('Date invalide dans le log:', log);
                              return false;
                            }
                            
                            const logDate = new Date(log.date);
                            logDate.setHours(0, 0, 0, 0); // Normaliser l'heure à minuit
                            
                            const isMatch = 
                              logDate.getDate() === targetDate.getDate() &&
                              logDate.getMonth() === targetDate.getMonth() &&
                              logDate.getFullYear() === targetDate.getFullYear();
                            
                            console.log('Comparaison avec log:', {
                              logDate: logDate.toISOString(),
                              logDateLocal: logDate.toLocaleDateString('fr-FR'),
                              targetDate: targetDate.toISOString(),
                              targetDateLocal: targetDate.toLocaleDateString('fr-FR'),
                              isMatch,
                              logStatus: log.status,
                              daysAgo
                            });
                            
                            return isMatch;
                          });
                          
                          console.log(`Résultat pour ${targetDate.toLocaleDateString('fr-FR')}:`, logForDate ? 'Trouvé' : 'Non trouvé');
                          
                          return (
                            <LogStatusIndicator 
                              key={daysAgo}
                              status={logForDate ? logForDate.status : (daysAgo === 0 ? 'pending' : 'missed')}
                              date={targetDate}
                            />
                          );
                        })}
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
