'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CoachLayout from '@/layout/CoachLayout';

// Interface pour le type d'erreur retourné par updateClientProfile
interface ApiError {
  message: string;
  code?: string;
  details?: any;
  stack?: string;
}

// Fonction de validation des données du formulaire
const validateFormData = (formData: Partial<UserProfile>): string | null => {
  // Vérifier les champs obligatoires
  if (!formData.first_name?.trim()) return 'Le prénom est obligatoire';
  if (!formData.last_name?.trim()) return 'Le nom est obligatoire';
  
  // Vérifier le format de l'email
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    return 'Format d\'email invalide';
  }
  
  // Vérifier le format de la date de naissance si elle est renseignée
  if (formData.birth_date) {
    try {
      const date = new Date(formData.birth_date);
      if (isNaN(date.getTime())) {
        return 'Format de date invalide. Utilisez le format AAAA-MM-JJ';
      }
    } catch (e) {
      return 'Format de date invalide. Utilisez le format AAAA-MM-JJ';
    }
  }
  
  // Vérifier les champs numériques
  if (formData.height !== undefined && isNaN(Number(formData.height))) {
    return 'La taille doit être un nombre';
  }
  
  if (formData.starting_weight !== undefined && isNaN(Number(formData.starting_weight))) {
    return 'Le poids de départ doit être un nombre';
  }
  
  return null; // Aucune erreur
};

// Interface pour le type d'erreur retourné par updateClientProfile
interface ApiError {
  message: string;
  code?: string;
  details?: any;
  stack?: string;
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, Utensils, Activity, ArrowLeft, Info, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { fetchClients, fetchClientLogs, updateClientProfile, type ClientProfile } from '@/services/clientService';

// Types basés sur la structure de la base de données
type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  height: number;
  phone: string;
  starting_weight: number;
  sports_practiced: string;
  objectives: string;
  injuries: string;
  role: string;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
};

type DailyLog = {
  id: string;
  client_id: string;
  weight?: number;
  energy_level?: number;
  sleep_quality?: number;
  appetite?: string;
  notes?: string;
  created_at: string;
  log_date: string;
  training_type?: string;
  plaisir_seance?: number;
  completed?: boolean;
  missed?: boolean;
  status?: 'completed' | 'pending' | 'missed';
  date?: Date;
};

type ClientProfilePageProps = {
  params: {
    id: string;
  };
};

export default function ClientProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        // Récupérer tous les clients et filtrer celui qui correspond à l'ID
        const clients = await fetchClients();
        const clientProfile = clients.find(client => client.id === params.id);
        
        if (!clientProfile) {
          toast.error('Profil client non trouvé');
          router.push('/coach/clients');
          return;
        }
        
        // Récupérer les logs du client
        const logsData = await fetchClientLogs(params.id as string);
        
        setProfile(clientProfile);
        setLogs(logsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données du client:', error);
        toast.error('Erreur lors du chargement du profil client');
        router.push('/coach/clients');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, router]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!profile) {
    return <div>Client non trouvé</div>;
  }
  
  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'Non spécifié';
    
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    
    // Vérifier si la date est valide
    if (isNaN(birthDateObj.getTime())) return 'Date invalide';
    
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  // Composant pour la modal des informations personnelles
  const PersonalInfoModal = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<ClientProfile>>({});
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
      if (profile) {
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          birth_date: profile.birth_date || '',
          height: profile.height || 0,
          starting_weight: profile.starting_weight || 0,
          sports_practiced: profile.sports_practiced || '',
          objectives: profile.objectives || '',
          injuries: profile.injuries || ''
        });
      }
    }, [profile]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      
      let parsedValue: any = value;
      
      if (type === 'number') {
        parsedValue = value === '' ? null : parseFloat(value);
      } else if (name === 'birth_date') {
        // Formater la date pour la base de données
        parsedValue = value ? new Date(value).toISOString() : null;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: parsedValue
      }));
    };
    
    const handleSave = async () => {
      if (!profile) return;
      
      try {
        setIsSaving(true);
        
        // Pré-valider les données avant envoi
        const validationError = validateFormData(formData);
        if (validationError) {
          throw new Error(validationError);
        }
        
        // Journaliser les données envoyées pour le débogage
        console.log('[handleSave] Tentative de mise à jour du profil avec les données:', {
          clientId: profile.id,
          updates: formData
        });
        
        const { data, error } = await updateClientProfile(profile.id, formData);
        
        if (error) {
          // Type assertion pour l'erreur
          const apiError = error as ApiError;
          
          // Journaliser l'erreur complète
          console.error('[handleSave] Erreur détaillée du serveur:', {
            message: apiError.message,
            code: apiError.code,
            details: apiError.details,
            timestamp: new Date().toISOString()
          });
          
          // Afficher un message d'erreur plus détaillé à l'utilisateur
          let errorMessage = 'Erreur lors de la mise à jour du profil';
          
          // Messages d'erreur personnalisés en fonction du code d'erreur
          if (apiError.code === 'NETWORK_ERROR') {
            errorMessage = 'Erreur de connexion. Vérifiez votre connexion Internet.';
          } else if (apiError.code === '42501') {
            errorMessage = 'Permission refusée. Vérifiez que vous avez les droits nécessaires.';
          } else if (apiError.details) {
            // Si des détails supplémentaires sont disponibles, les inclure
            const details = typeof apiError.details === 'string' 
              ? apiError.details 
              : JSON.stringify(apiError.details);
            
            // Essayer d'extraire un message d'erreur plus lisible
            if (details.includes('invalid input syntax for type date')) {
              errorMessage = 'Format de date invalide. Utilisez le format AAAA-MM-JJ.';
            } else if (details.includes('null value in column')) {
              const columnMatch = details.match(/column \"(.*?)\"/);
              const column = columnMatch ? columnMatch[1] : 'un champ obligatoire';
              errorMessage = `Le champ ${column} est obligatoire.`;
            } else {
              errorMessage += `: ${details}`;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        if (data && data[0]) {
          // Mettre à jour les données du profil avec la réponse du serveur
          console.log('[handleSave] Profil mis à jour avec succès:', data[0]);
          setProfile(data[0]);
          toast.success('Profil mis à jour avec succès');
          setIsEditing(false);
        } else {
          console.warn('[handleSave] Aucune donnée retournée après la mise à jour');
          toast.success('Modifications enregistrées (aucune donnée mise à jour)');
          setIsEditing(false);
        }
      } catch (error) {
        console.error('[handleSave] Erreur lors de la mise à jour du profil:', error);
        
        // Afficher le message d'erreur à l'utilisateur
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Une erreur inconnue est survenue';
          
        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    };
    
    if (!profile) return null;
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2">
            <Info className="h-4 w-4 mr-2" />
            Voir les informations personnelles
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex justify-between items-center">
            <DialogHeader>
              <DialogTitle>Informations personnelles</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 w-8 p-0 text-gray-500 hover:text-primary"
              >
                {isEditing ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m13.5 6.5 4 4"/>
                  </svg>
                )}
                <span className="sr-only">{isEditing ? 'Annuler' : 'Modifier'}</span>
              </Button>
            </div>
          </div>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Prénom</p>
                {isEditing ? (
                  <input
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{profile.first_name || 'Non spécifié'}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nom</p>
                {isEditing ? (
                  <input
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{profile.last_name || 'Non spécifié'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{profile.email || 'Non spécifié'}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Téléphone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{profile.phone || 'Non spécifié'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Date de naissance</p>
                {isEditing ? (
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date ? formData.birth_date.toString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">
                    {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Taille (cm)</p>
                {isEditing ? (
                  <input
                    type="number"
                    name="height"
                    value={formData.height || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{profile.height || '0'} cm</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Poids de départ (kg)</p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.1"
                    name="starting_weight"
                    value={formData.starting_weight || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{profile.starting_weight ? `${profile.starting_weight} kg` : 'Non spécifié'}</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Sports pratiqués</p>
              {isEditing ? (
                <input
                  type="text"
                  name="sports_practiced"
                  value={formData.sports_practiced || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile.sports_practiced || 'Non spécifié'}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Objectifs</p>
              {isEditing ? (
                <textarea
                  name="objectives"
                  value={formData.objectives || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900 whitespace-pre-line">{profile.objectives || 'Non spécifié'}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Blessures / Antécédents</p>
              {isEditing ? (
                <textarea
                  name="injuries"
                  value={formData.injuries || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900 whitespace-pre-line">{profile.injuries || 'Aucune information'}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/coach/clients" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la liste des clients
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h1>
            <span className="text-sm text-gray-500">
              {calculateAge(profile.birth_date)} ans
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {profile.email} • {profile.phone}
          </p>
          <PersonalInfoModal />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Objectifs */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <Activity className="h-4 w-4 mr-2 text-green-600" />
            <h3 className="text-sm font-medium text-gray-900">Objectifs</h3>
          </div>
          <p className="text-xs text-gray-600">
            {profile.objectives || 'Aucun objectif défini'}
          </p>
        </div>

        {/* Blessures et limitations */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <Activity className="h-4 w-4 mr-2 text-red-600" />
            <h3 className="text-sm font-medium text-gray-900">Blessures / Limitations</h3>
          </div>
          <p className="text-xs text-gray-600">
            {profile.injuries || 'Aucune blessure ou limitation signalée'}
          </p>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="suivi" className="w-full">
        <TabsList className="grid w-full md:w-1/2 grid-cols-3 bg-gray-100">
          <TabsTrigger 
            value="suivi" 
            className="flex items-center space-x-2 transition-colors hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Activity className="h-4 w-4" />
            <span>Suivi</span>
          </TabsTrigger>
          <TabsTrigger 
            value="programme" 
            className="flex items-center space-x-2 transition-colors hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            <span>Programme</span>
          </TabsTrigger>
          <TabsTrigger 
            value="nutrition" 
            className="flex items-center space-x-2 transition-colors hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Utensils className="h-4 w-4" />
            <span>Nutrition</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suivi" className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poids (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Énergie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sommeil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appétit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entraînement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plaisir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(log.log_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.weight !== undefined ? `${log.weight.toFixed(1)} kg` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.energy_level}/5
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.sleep_quality}/5
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.appetite}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.training_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.plaisir_seance}/5
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="programme" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Programme d'entraînement</h3>
            <p className="text-sm text-gray-600">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez bientôt créer et gérer les programmes d'entraînement de vos clients.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Suivi nutritionnel</h3>
            <p className="text-sm text-gray-600">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez bientôt suivre et gérer la nutrition de vos clients.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Envelopper la page avec le layout du coach
ClientProfilePage.getLayout = function getLayout(page: React.ReactElement) {
  return <CoachLayout>{page}</CoachLayout>;
};
