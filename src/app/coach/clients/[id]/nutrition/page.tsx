'use client';

import { useState, useEffect, useCallback } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getActiveNutritionProgram, 
  createNutritionProgram, 
  updateNutritionProgram,
  deleteNutritionProgram
} from '@/services/nutritionService';
import { NutritionProgram, NutritionDayInput } from '@/types/Nutrition';
import { ProgramDay } from '@/types/Program';
import { TabSystem } from '@/components/shared/TabSystem';
import { Button } from '@/components/ui/button';
import { Trash2, Save, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface NutritionFormData {
  title: string;
  days: NutritionDayInput[];
}

// Fonction utilitaire pour créer un nouveau jour par défaut
const createDefaultDay = (index: number): NutritionDayInput => {
  // Template par défaut pour le contenu du jour
  const defaultContent = index === 0 
    ? `## Petit-déjeuner
- 
## Déjeuner
- 
## Collation
- 
## Dîner
- 
`
    : '';

  return {
    day_title: `Jour ${index + 1} - Nouvelle journée`,
    content: defaultContent,
    day_order: index
  };
};

export default function ClientNutritionPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Dans Next.js 14, nous pouvons utiliser params directement dans les composants de page
  const clientId = params.id;
  
  const [program, setProgram] = useState<NutritionProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // L'ID du client est maintenant disponible directement via params.id
  const [formData, setFormData] = useState<NutritionFormData>({
    title: '',
    days: [createDefaultDay(0)]
  });

  // Charger le programme existant avec ses jours
  useEffect(() => {
    const loadProgram = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        const activeProgram = await getActiveNutritionProgram(clientId);
        setProgram(activeProgram);
        
        if (activeProgram) {
          setFormData({
            title: activeProgram.title,
            days: activeProgram.nutrition_days?.length 
              ? activeProgram.nutrition_days.map(day => ({
                  id: day.id,
                  day_title: day.day_title,
                  content: day.content,
                  day_order: day.day_order
                }))
              : [createDefaultDay(0)]
          });
        }
      } catch (err) {
        console.error('Error loading nutrition program:', err);
        setError('Erreur lors du chargement du programme nutritionnel.');
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [clientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gère les changements des jours via le TabSystem
  const handleDaysChange = useCallback((days: NutritionDayInput[]) => {
    setFormData(prev => ({
      ...prev,
      days: days.map((day, index) => ({
        ...day,
        day_order: index
      }))
    }));
  }, []);

  // Ajouter un nouveau jour
  const handleAddDay = () => {
    setFormData(prev => ({
      ...prev,
      days: [
        ...prev.days,
        createDefaultDay(prev.days.length)
      ]
    }));
  };

  // Supprimer un jour
  const handleRemoveDay = (index: number) => {
    if (formData.days.length <= 1) return;
    
    const newDays = [...formData.days];
    newDays.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      days: newDays.map((day, idx) => ({
        ...day,
        day_order: idx
      }))
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !clientId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Afficher la notification avant la redirection
      toast.success('Enregistrement en cours...');
      
      // Valider qu'il y a au moins un jour avec un titre et du contenu
      const hasValidDays = formData.days.every(day => 
        day.day_title.trim() && day.content.trim()
      );
      
      if (!hasValidDays) {
        setError('Chaque jour doit avoir un titre et un contenu.');
        return;
      }
      
      const programData = {
        title: formData.title.trim(),
        days: formData.days.map(day => ({
          ...day,
          day_title: day.day_title.trim(),
          content: day.content.trim()
        }))
      };
      
      // Mettre à jour ou créer le programme
      if (program) {
        const updateData = {
          id: program.id,
          title: programData.title,
          days: formData.days.map((day, index) => ({
            ...day,
            day_order: index
          }))
        };
        
        const updatedProgram = await updateNutritionProgram(program.id, updateData);
        setProgram(updatedProgram);
      } else {
        const newProgram = await createNutritionProgram({
          client_id: clientId,
          title: programData.title,
          days: formData.days.map((day, index) => ({
            day_title: day.day_title,
            content: day.content,
            day_order: index
          }))
        });
        setProgram(newProgram);
      }
      
      // Afficher une notification de succès
      setError(null);
      toast.success('Programme nutritionnel enregistré avec succès !');
      
      // Rediriger vers l'onglet nutrition du client après un court délai
      setTimeout(() => {
        router.push(`/coach/clients/${clientId}?tab=nutrition`);
      }, 1000);
      
    } catch (err) {
      console.error('Error saving nutrition program:', err);
      setError('Erreur lors de l\'enregistrement du programme nutritionnel.');
    } finally {
      setSaving(false);
    }
  };

  // Gérer le clic sur le bouton de suppression
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  // Supprimer le programme
  const handleDelete = async () => {
    if (!program) return;
    
    try {
      setDeleting(true);
      const result = await deleteNutritionProgram(program.id);
      
      if (result.success) {
        setShowDeleteDialog(false);
        toast.success(result.message || 'Programme nutritionnel supprimé avec succès !');
        
        // Rediriger vers la page du client après un court délai
        setTimeout(() => {
          router.push(`/coach/clients/${clientId}`);
        }, 1000);
      } else {
        // Afficher l'erreur retournée par la fonction
        const errorMessage = result.error || 'Erreur inconnue lors de la suppression';
        console.error('Erreur lors de la suppression:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur inattendue lors de la suppression:', err);
      setError('Une erreur est survenue lors de la suppression du programme.');
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion du programme nutritionnel</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {program ? 'Modifier le programme nutritionnel' : 'Créer un programme nutritionnel'}
        </h1>
        {program && (
          <span className="text-sm text-gray-500">
            Mis à jour le {new Date(program.updated_at).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre du programme
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
            placeholder="Ex: Programme Nutrition - Prise de Masse"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Jours de nutrition</h2>
            {!loading && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddDay}
              >
                <Plus className="h-4 w-4 mr-2" /> Ajouter un jour
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded-md"></div>
              <div className="h-64 bg-gray-200 rounded-md"></div>
            </div>
          ) : (
            <TabSystem 
              days={formData.days as unknown as ProgramDay[]} 
              onDaysChange={handleDaysChange}
              readOnly={false}
              className="bg-white p-4 rounded-lg border border-gray-200"
              dayType="nutrition"
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            {program && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={deleting}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer le programme
              </Button>
            )}
          </div>
          <div className="space-x-3">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              disabled={saving || deleting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle>Supprimer le programme nutritionnel</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Êtes-vous sûr de vouloir supprimer ce programme nutritionnel ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
