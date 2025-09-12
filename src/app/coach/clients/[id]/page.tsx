'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import CoachLayout from '@/layout/CoachLayout';

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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Utensils, Activity, ArrowLeft, Info, Loader2, XCircle, Dumbbell, ActivitySquare, Calendar, Plus } from 'lucide-react';
import { UpcomingSessions } from '@/components/shared/calendar/UpcomingSessions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getActiveProgram } from '@/services/programService';
import { Program } from '@/types/Program';
import { NutritionProgram } from '@/types/Nutrition';
import { NutritionDay } from '@/types/Nutrition';
import { getActiveNutritionProgram } from '@/services/nutritionService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { fetchClients, fetchClientLogs, updateClientProfile, type ClientProfile, type ClientLogsResult } from '@/services/clientService';
import type { ClientData, LogData, ProfileData, ApiError } from '@/types/client';
import type { TablesUpdate } from '@/types/database.types';

type UserProfile = ClientProfile;
import { MetricsSummary } from '@/components/tracking/MetricsSummary';
import { LogHistory } from '@/components/tracking/LogHistory';
import { RichTextViewer } from '@/components/shared/RichTextViewer';

export default function ClientProfilePage({
  params,
  searchParams = {}
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  // Récupération de l'ID du client depuis les paramètres d'URL
  const clientId = params.id;
  const router = useRouter();
  const activeTab = searchParams.tab || 'profil';

  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [logs, setLogs] = useState<ClientLogsResult>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);
  const [programLoading, setProgramLoading] = useState(true);
  const [nutritionProgram, setNutritionProgram] = useState<NutritionProgram | null>(null);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);


  const handleEditClick = (field: string, currentValue: string | string[] | null | undefined) => {
    setEditingField(field);
    // Convertir les tableaux en chaînes avec des sauts de ligne pour l'affichage
    const value = Array.isArray(currentValue) 
      ? currentValue.join('\n') 
      : currentValue || '';
    setEditedValue(value);
  };

  const handleSave = async (field: string) => {
    if (!profile) return;
    
    try {
      // S'assurer que la valeur est une chaîne de caractères
      const valueToSave = Array.isArray(editedValue) ? editedValue.join('\n') : editedValue;
      
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: valueToSave })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, [field]: valueToSave } : null);
      setEditingField(null);
      toast.success('Modifications enregistrées avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Une erreur est survenue lors de la mise à jour');
    }
  };

  // Charger le programme d'entraînement actif du client
  useEffect(() => {
    const loadProgram = async () => {
      if (!clientId) return;
      
      try {
        setProgramLoading(true);
        const activeProgram = await getActiveProgram(clientId);
        // S'assurer que les jours ont un day_order valide
        if (activeProgram?.program_days) {
          activeProgram.program_days = activeProgram.program_days.map((day, index) => ({
            ...day,
            day_order: day.day_order ?? index
          }));
        }
        setProgram(activeProgram);
      } catch (error) {
        console.error('Erreur lors du chargement du programme d\'entraînement:', error);
        toast.error('Erreur lors du chargement du programme d\'entraînement');
      } finally {
        setProgramLoading(false);
      }
    };
    
    loadProgram();
  }, [clientId]);

  // Charger le programme nutritionnel actif du client
  useEffect(() => {
    const loadNutritionProgram = async () => {
      if (!clientId) return;
      
      try {
        setNutritionLoading(true);
        const activeNutritionProgram = await getActiveNutritionProgram(params.id);
        // S'assurer que les jours ont un day_order valide
        if (activeNutritionProgram?.nutrition_days) {
          activeNutritionProgram.nutrition_days = activeNutritionProgram.nutrition_days.map((day: Partial<NutritionDay>, index: number) => ({
            ...day,
            id: day.id || `temp-${index}`,
            nutrition_program_id: day.nutrition_program_id || activeNutritionProgram.id,
            day_title: day.day_title || `Jour ${index + 1}`,
            content: day.content || '',
            created_at: day.created_at || new Date().toISOString(),
            updated_at: day.updated_at || new Date().toISOString(),
            day_order: day.day_order ?? index
          }));
        }
        setNutritionProgram(activeNutritionProgram);
      } catch (error) {
        console.error('Erreur lors du chargement du programme nutritionnel:', error);
        toast.error('Erreur lors du chargement du programme nutritionnel');
      } finally {
        setNutritionLoading(false);
      }
    };
    
    loadNutritionProgram();
  }, [clientId]);

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        
        const clients = await fetchClients();
        const clientProfile = clients.find(client => client.id === clientId);
        
        if (!clientProfile) {
          toast.error('Profil client non trouvé');
          return;
        }
        
        // Récupérer les logs du client
        const logsData = await fetchClientLogs(clientId);
        
        setProfile(clientProfile);
        setLogs(logsData);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données client:', error);
        toast.error('Erreur lors du chargement des données client');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId, router]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!profile) {
    return <div>Client non trouvé</div>;
  }
  
  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate?: string | null): string => {
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
    return age.toString();
  };

  // Composant pour la modal des informations personnelles
  const PersonalInfoModal = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ClientProfile>>({});
    
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
          injuries: Array.isArray(profile.injuries) ? profile.injuries.join('\n') : (profile.injuries || '')
        });
      }
    }, [profile]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      
      let parsedValue: string | number | null = value;
      
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
        
        // Préparer les données pour la mise à jour avec le bon typage
        const updateData: TablesUpdate<'profiles'> = { 
          ...formData,
          // S'assurer que injuries est une chaîne de caractères ou null
          injuries: formData.injuries !== undefined
            ? (Array.isArray(formData.injuries) 
                ? formData.injuries.join('\n') 
                : formData.injuries) || null
            : undefined,
          // S'assurer que sports_practiced est un tableau de chaînes ou null
          sports_practiced: formData.sports_practiced !== undefined
            ? (Array.isArray(formData.sports_practiced) 
                ? formData.sports_practiced 
                : formData.sports_practiced ? [formData.sports_practiced] : null)
            : undefined
        };
        
        // Journaliser les données envoyées pour le débogage
        console.log('[handleSave] Tentative de mise à jour du profil avec les données:', {
          clientId: profile.id,
          updates: updateData
        });
        
        const { data, error } = await updateClientProfile(profile.id, updateData);
        
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
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="lg:w-1/4">
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

        {/* Objectifs */}
        <div className="lg:w-2/5 bg-white p-4 rounded-lg border border-gray-200 relative group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-green-600" />
              <h3 className="text-sm font-medium text-gray-900">Objectifs</h3>
            </div>
            {editingField !== 'objectives' && (
              <button 
                onClick={() => handleEditClick('objectives', profile?.objectives || '')}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                title="Modifier les objectifs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
          
          {editingField === 'objectives' ? (
            <div className="space-y-2">
              <textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full p-2 text-xs border rounded"
                rows={3}
                placeholder="Décrivez les objectifs du client..."
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setEditingField(null)}
                  className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleSave('objectives')}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div 
                className={`text-xs text-gray-600 whitespace-pre-line overflow-hidden transition-all duration-300 ${expandedCard === 'objectives' ? 'max-h-[500px]' : 'max-h-[80px]'}`}
              >
                {profile?.objectives || 'Aucun objectif défini'}
              </div>
              {(profile?.objectives?.split('\n').length || 0) > 4 && (
                <button 
                  onClick={() => setExpandedCard(expandedCard === 'objectives' ? null : 'objectives')}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 block"
                >
                  {expandedCard === 'objectives' ? 'Voir moins' : 'Voir plus'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Blessures et limitations */}
        <div className="lg:w-2/5 bg-white p-4 rounded-lg border border-gray-200 relative group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-red-600" />
              <h3 className="text-sm font-medium text-gray-900">Blessures / Limitations</h3>
            </div>
            {editingField !== 'injuries' && (
              <button 
                onClick={() => handleEditClick('injuries', Array.isArray(profile?.injuries) ? profile.injuries.join('\n') : (profile?.injuries || ''))}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                title="Modifier les blessures et limitations"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
          
          {editingField === 'injuries' ? (
            <div className="space-y-2">
              <textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full p-2 text-xs border rounded"
                rows={3}
                placeholder="Décrivez les blessures et limitations du client..."
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setEditingField(null)}
                  className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleSave('injuries')}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div 
                className={`text-xs text-gray-600 whitespace-pre-line overflow-hidden transition-all duration-300 ${expandedCard === 'injuries' ? 'max-h-[500px]' : 'max-h-[80px]'}`}
              >
                {Array.isArray(profile?.injuries) 
                  ? profile.injuries.join('\n') 
                  : (profile?.injuries || 'Aucune blessure ou limitation déclarée')}
              </div>
              {(
                (Array.isArray(profile?.injuries) 
                  ? profile?.injuries.join('\n').split('\n').length 
                  : (profile?.injuries?.split('\n').length || 0)
                ) > 4
              ) && (
                <button 
                  onClick={() => setExpandedCard(expandedCard === 'injuries' ? null : 'injuries')}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 block"
                >
                  {expandedCard === 'injuries' ? 'Voir moins' : 'Voir plus'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Onglets */}
        <Tabs defaultValue="suivi" className="w-full">
        <TabsList className="grid w-full md:w-3/4 grid-cols-5 bg-gray-100">
          <TabsTrigger 
            value="suivi" 
            className="flex items-center space-x-2 transition-colors hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ActivitySquare className="h-4 w-4" />
            <span>Suivi</span>
          </TabsTrigger>
          <TabsTrigger 
            value="programme" 
            className="flex items-center space-x-2 transition-colors hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Dumbbell className="h-4 w-4" />
            <span>Programme</span>
          </TabsTrigger>
          <TabsTrigger 
            value="nutrition" 
            className="flex items-center space-x-2 transition-colors hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Utensils className="h-4 w-4" />
            <span>Nutrition</span>
          </TabsTrigger>
          <TabsTrigger 
            value="calendrier" 
            className="flex items-center space-x-2 transition-colors hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            <span>Calendrier</span>
          </TabsTrigger>
        </TabsList>

        {/* Contenu de l'onglet Suivi */}
        <TabsContent value="suivi" className="space-y-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Résumé des indicateurs</h3>
            <MetricsSummary clientId={clientId} />
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <LogHistory clientId={clientId} />
          </div>
        </TabsContent>

        {/* Contenu de l'onglet Programme */}
        <TabsContent value="programme" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Programme d&apos;entraînement</h3>
                <Link 
                  href={
                    {
                      pathname: '/coach/clients/[id]/programme',
                      query: { id: clientId }
                    }
                  }
                  as={`/coach/clients/${clientId}/programme`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {program ? 'Modifier le programme' : 'Créer un programme'}
                </Link>
              </div>
              {program && (
                <p className="text-sm text-gray-500 mt-1">
                  Mis à jour le {new Date(program.updated_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            
            {programLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : program ? (
              <div>
                {program.title && (
                  <h4 className="text-md font-medium text-gray-900 mb-4">{program.title}</h4>
                )}
                
                {program.program_days && program.program_days.length > 0 ? (
                  <div className="w-full">
                    <Tabs 
                      defaultValue={program.program_days[0]?.id || '0'}
                      className="w-full"
                    >
                      <div className="relative">
                        <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap justify-start">
                          {program.program_days
                            .sort((a, b) => (a.day_order || 0) - (b.day_order || 0))
                            .map((day) => (
                              <TabsTrigger 
                                key={day.id}
                                value={day.id}
                                className="text-sm whitespace-nowrap"
                              >
                                {day.day_title || `Jour ${(day.day_order || 0) + 1}`}
                              </TabsTrigger>
                            ))}
                        </TabsList>
                      </div>
                      
                      {program.program_days
                        .sort((a, b) => (a.day_order || 0) - (b.day_order || 0))
                        .map((day) => (
                          <TabsContent key={day.id} value={day.id} className="mt-0">
                            <div className="prose max-w-none">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
                                {day.day_title || `Jour ${(day.day_order || 0) + 1}`}
                              </h2>
                              {day.content ? (
                                <RichTextViewer content={day.content} />
                              ) : (
                                <div className="text-gray-500 italic">Aucun contenu pour ce jour.</div>
                              )}
                            </div>
                          </TabsContent>
                        ))}
                    </Tabs>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="text-gray-500 italic">Aucun contenu de programme disponible.</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun programme défini</h3>
                <p className="mt-1 text-sm text-gray-500">Créez un programme personnalisé pour ce client.</p>
                <div className="mt-6">
                  <Link
                    href={{
                      pathname: '/coach/clients/[id]/programme',
                      query: { id: clientId }
                    }}
                    as={`/coach/clients/${clientId}/programme`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un programme
                  </Link>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contenu de l'onglet Nutrition */}
        <TabsContent value="nutrition" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Programme nutritionnel</h3>
                <Link 
                  href={
                    {
                      pathname: '/coach/clients/[id]/nutrition',
                      query: { id: clientId }
                    }
                  }
                  as={`/coach/clients/${clientId}/nutrition`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {nutritionProgram ? 'Modifier le programme' : 'Créer un programme'}
                </Link>
              </div>
              {nutritionProgram && (
                <p className="text-sm text-gray-500 mt-1">
                  Mis à jour le {new Date(nutritionProgram.updated_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            
            {nutritionLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : nutritionProgram ? (
              <div>
                {nutritionProgram.title && (
                  <h4 className="text-md font-medium text-gray-900 mb-4">{nutritionProgram.title}</h4>
                )}
                
                {nutritionProgram.nutrition_days && nutritionProgram.nutrition_days.length > 0 ? (
                  <div className="w-full">
                    <Tabs 
                      defaultValue={nutritionProgram.nutrition_days[0]?.id || '0'}
                      className="w-full"
                    >
                      <div className="relative">
                        <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap justify-start">
                          {nutritionProgram.nutrition_days
                            .sort((a: { day_order?: number }, b: { day_order?: number }) => (a.day_order || 0) - (b.day_order || 0))
                            .map((day: { id: string; day_order?: number; day_title?: string }) => (
                              <TabsTrigger 
                                key={day.id}
                                value={day.id}
                                className="text-sm whitespace-nowrap"
                              >
                                {day.day_title || `Jour ${(day.day_order || 0) + 1}`}
                              </TabsTrigger>
                            ))}
                        </TabsList>
                      </div>
                      
                      {nutritionProgram.nutrition_days
                        .sort((a: { day_order?: number }, b: { day_order?: number }) => (a.day_order || 0) - (b.day_order || 0))
                        .map((day: { id: string; day_order?: number; day_title?: string; content?: string }) => (
                          <TabsContent key={day.id} value={day.id} className="mt-0">
                            <div className="prose max-w-none">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
                                {day.day_title || `Jour ${(day.day_order || 0) + 1}`}
                              </h2>
                              {day.content ? (
                                <RichTextViewer content={day.content} />
                              ) : (
                                <div className="text-gray-500 italic">Aucun contenu pour ce jour.</div>
                              )}
                            </div>
                          </TabsContent>
                        ))}
                    </Tabs>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="text-gray-500 italic">Aucun contenu de programme nutritionnel disponible.</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun programme nutritionnel défini</h3>
                <p className="mt-1 text-sm text-gray-500">Créez un programme nutritionnel personnalisé pour ce client.</p>
                <div className="mt-6">
                  <Link
                    href={{
                      pathname: '/coach/clients/[id]/nutrition',
                      query: { id: clientId }
                    }}
                    as={`/coach/clients/${clientId}/nutrition`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un programme nutritionnel
                  </Link>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contenu de l'onglet Calendrier */}
        <TabsContent value="calendrier" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <UpcomingSessions clientId={clientId} isCoach={true} limit={10} />
          </div>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Envelopper la page avec le layout du coach
ClientProfilePage.getLayout = function getLayout(page: React.ReactElement) {
  return <CoachLayout>{page}</CoachLayout>;
};
