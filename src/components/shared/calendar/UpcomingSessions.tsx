"use client";

import { useEffect, useState } from 'react';
import { CalendarCard as CalendarCardType } from '@/types/calendar';
import { 
  getCalendarCardsWithInfo, 
  createCalendarCard, 
  updateCalendarCard, 
  deleteCalendarCard 
} from '@/services/calendarService';
import { CalendarCard } from './CalendarCard';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { CalendarCardForm } from './CalendarCardForm';
import { cn } from '@/lib/utils';

type UpcomingSessionsProps = {
  clientId?: string; // Rendons clientId optionnel avec une valeur par défaut
  isCoach?: boolean;
  limit?: number;
  className?: string; // Ajout de la propriété className
};

export function UpcomingSessions({ 
  clientId = '', // Valeur par défaut vide
  isCoach = false, 
  limit = 5,
  className = ''
}: UpcomingSessionsProps) {
  const [sessions, setSessions] = useState<CalendarCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CalendarCardType | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getCalendarCardsWithInfo(clientId);
        
        if (error) throw error;
        
        // Filtrer pour ne garder que les sessions futures ou du jour
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit pour la comparaison
        
        const upcomingSessions = (data || [])
          .filter(session => {
            const endDate = new Date(session.end_date);
            endDate.setHours(23, 59, 59, 999); // Fin de la journée pour la comparaison
            return endDate >= now;
          })
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .slice(0, limit);
        
        setSessions(upcomingSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
        toast.error('Impossible de charger les séances à venir');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [clientId, limit]);

  const handleAddSession = () => {
    setSelectedSession(null);
    setIsFormOpen(true);
  };

  const handleEditSession = (session: CalendarCardType) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  };

  const handleDeleteSession = (id: string) => {
    setSessionToDelete(id);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    
    try {
      setIsDeleting(true);
      const { error } = await deleteCalendarCard(sessionToDelete);
      if (error) throw error;
      
      // Mettre à jour la liste des sessions
      setSessions(prev => prev.filter(session => session.id !== sessionToDelete));
      toast.success('La période a été supprimée avec succès');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Une erreur est survenue lors de la suppression de la période');
    } finally {
      setIsDeleting(false);
      setSessionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setSessionToDelete(null);
  };

  const handleSubmit = async (data: Omit<CalendarCardType, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
    try {
      setIsSubmitting(true);
      
      if (selectedSession && selectedSession.id) {
        // Mise à jour d'une séance existante
        const { error } = await updateCalendarCard(selectedSession.id, data);
        if (error) throw error;
        
        // Mettre à jour la liste des sessions
        setSessions(prev => 
          prev.map(session => 
            session.id === selectedSession.id 
              ? { ...session, ...data } 
              : session
          )
        );
        
        toast.success('La période a été mise à jour avec succès');
      } else {
        // Création d'une nouvelle séance
        const { error } = await createCalendarCard({
          ...data,
          client_id: data.client_id || clientId || '',
        });
        
        if (error) throw error;
        
        // Recharger les sessions pour inclure la nouvelle
        const { data: updatedData } = await getCalendarCardsWithInfo(clientId);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit pour la comparaison
        
        const upcomingSessions = (updatedData || [])
          .filter(session => {
            const endDate = new Date(session.end_date);
            endDate.setHours(23, 59, 59, 999); // Fin de la journée pour la comparaison
            return endDate >= now;
          })
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .slice(0, limit);
        
        setSessions(upcomingSessions);
        
        toast.success('La période a été créée avec succès');
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating/updating session:', error);
      toast.error('Une erreur est survenue lors de la création ou de la mise à jour de la période');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Chargement des séances...</div>;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Périodes à venir</h3>
        {isCoach && (
          <Button onClick={handleAddSession} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une séance
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {isCoach ? (
            'Aucune période définie pour le moment'
          ) : (
            'Aucune période de suivi à venir. Votre coach vous ajoutera des périodes de suivi prochainement.'
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <CalendarCard
              key={session.id}
              card={session}
              onEdit={isCoach ? () => handleEditSession(session) : undefined}
              onDelete={isCoach ? () => handleDeleteSession(session.id) : undefined}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            />
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSession ? 'Modifier la période' : 'Nouvelle période'}
            </DialogTitle>
            <DialogDescription>
              {selectedSession ? 'Modifiez les détails de la période' : 'Créez une nouvelle période'}
            </DialogDescription>
          </DialogHeader>
          <CalendarCardForm
            initialData={selectedSession || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
            clientId={clientId}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={!!sessionToDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Supprimer la période"
        description="Êtes-vous sûr de vouloir supprimer cette période ? Cette action est irréversible."
        confirmButtonText="Supprimer la période"
        isLoading={isDeleting}
      />
    </div>
  );
}

