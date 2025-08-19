'use client';

import { useState, useEffect, useCallback } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getActiveProgram, 
  createProgram, 
  updateProgram,
  deleteProgram
} from '@/services/programService';
import { Program, ProgramDay, ProgramDayInput } from '@/types/Program';
import { TabSystem } from '@/components/shared/TabSystem';
import { Button } from '@/components/ui/button';
import { Trash2, Save, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface ExistingDay extends ProgramDayInput {
  id?: string;
  program_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProgramFormData {
  title: string;
  days: ExistingDay[];
}

// Fonction utilitaire pour créer un nouveau jour par défaut
const createDefaultDay = (index: number): ProgramDayInput => ({
  day_title: `Jour ${index + 1} - Nouvelle séance`,
  content: '',
  day_order: index
});

export default function ClientProgramPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Dans Next.js 14, nous pouvons utiliser params directement dans les composants de page
  const clientId = params.id;
  
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProgramFormData>({
    title: '',
    days: [createDefaultDay(0)]
  });

  // Charger le programme existant avec ses jours
  useEffect(() => {
    const loadProgram = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        const activeProgram = await getActiveProgram(clientId);
        setProgram(activeProgram);
        
        if (activeProgram) {
          setFormData({
            title: activeProgram.title,
            days: activeProgram.program_days?.length 
              ? activeProgram.program_days.map(day => ({
                  id: day.id,
                  day_title: day.day_title,
                  content: day.content,
                  day_order: day.day_order
                }))
              : [createDefaultDay(0)]
          });
        }
      } catch (err) {
        console.error('Error loading program:', err);
        setError('Erreur lors du chargement du programme.');
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
  const handleDaysChange = useCallback((updatedDays: ProgramDayInput[]) => {
    setFormData(prev => {
      // Préserver les champs existants et mettre à jour l'ordre
      const updatedDaysWithOrder = updatedDays.map((day, index) => {
        // Trouver le jour existant pour préserver son ID s'il existe
        const existingDay = prev.days.find(d => d.day_title === day.day_title);
        const baseDay = existingDay || {} as ExistingDay;
        
        return {
          ...baseDay,
          ...day,
          day_order: index,
          id: baseDay.id || `temp-${index}`,
          program_id: baseDay.program_id || program?.id || '',
          created_at: baseDay.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as ExistingDay;
      });

      return {
        ...prev,
        days: updatedDaysWithOrder
      };
    });
  }, [program?.id]);

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
        title: formData.title,
        content: formData.days.map(day => day.content).join('\n\n---\n\n'), // Concaténer le contenu de tous les jours
        days: formData.days.map((day, index) => ({
          ...day,
          day_order: index
        }))
      };
      
      if (program) {
        // Mise à jour du programme existant avec ses jours
        const updatedProgram = await updateProgram(program.id, {
          ...programData,
          days: programData.days.map(day => ({
            ...day,
            program_id: program.id
          }))
        });
        setProgram(updatedProgram);
      } else {
        // Création d'un nouveau programme avec ses jours
        const newProgram = await createProgram({
          client_id: clientId,
          ...programData
        });
        setProgram(newProgram);
      }
      
      // Afficher une notification de succès
      setError(null);
      toast.success('Programme enregistré avec succès !');
      
      // Rediriger vers l'onglet programme du client après un court délai
      setTimeout(() => {
        router.push(`/coach/clients/${clientId}?tab=programme`);
      }, 1000);
      
    } catch (err) {
      console.error('Error saving program:', err);
      setError('Erreur lors de l\'enregistrement du programme.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!program?.id) return;
    
    try {
      setDeleting(true);
      await deleteProgram(program.id);
      setShowDeleteDialog(false);
      toast.success('Programme supprimé avec succès !');
      // Rediriger vers la page du client après un court délai
      setTimeout(() => {
        router.push(`/coach/clients/${clientId}`);
      }, 1000);
    } catch (err) {
      console.error('Error deleting program:', err);
      setError('Erreur lors de la suppression du programme.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion du programme</h1>
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
          {program ? 'Modifier le programme' : 'Créer un programme'}
        </h1>
        {program && (
          <span className="text-sm text-gray-500">
            Dernière mise à jour : {new Date(program.updated_at).toLocaleDateString('fr-FR')}
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
            placeholder="Ex: Programme Débutant - Semaine 1"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Jours d&apos;entraînement</h2>
            {!loading && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleDaysChange([...formData.days, createDefaultDay(formData.days.length)])}
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
              days={formData.days.map((day, index) => ({
                id: day.id || `temp-${index}`,
                program_id: program?.id || '',
                day_title: day.day_title,
                content: day.content,
                day_order: day.day_order ?? index,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as ProgramDay))} 
              onDaysChange={handleDaysChange}
              readOnly={false}
              className="bg-white p-4 rounded-lg border border-gray-200"
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
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
              <DialogTitle>Supprimer le programme</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Êtes-vous sûr de vouloir supprimer ce programme ? Cette action est irréversible.
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
