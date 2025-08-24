"use client";

import { useState, useCallback } from 'react';
import { CalendarView } from './CalendarView';
import { CalendarCardForm } from './CalendarCardForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CalendarCard as CalendarCardType } from '@/types/calendar';
import { createCalendarCard, updateCalendarCard, deleteCalendarCard } from '@/services/calendarService';
import { toast } from 'sonner';

type CalendarProps = {
  clientId?: string; // Optionnel : si on veut filtrer pour un client spécifique
  isCoach?: boolean; // Si true, permet d'ajouter/modifier des cartes
  emptyState?: React.ReactNode; // Contenu à afficher lorsque le calendrier est vide
};

export function Calendar({ clientId, isCoach = false, emptyState }: CalendarProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CalendarCardType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAddCard = () => {
    setSelectedCard(null);
    setIsFormOpen(true);
  };

  const handleEditCard = (card: CalendarCardType) => {
    setSelectedCard(card);
    setIsFormOpen(true);
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;
    
    try {
      const { error } = await deleteCalendarCard(id);
      if (error) throw error;
      
      toast.success('La carte a été supprimée avec succès');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Une erreur est survenue lors de la suppression de la carte');
    }
  };

  const handleSubmit = async (data: Omit<CalendarCardType, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
    try {
      setIsSubmitting(true);
      
      if (selectedCard && selectedCard.id) {
        // Mise à jour d'une carte existante
        const { error } = await updateCalendarCard(selectedCard.id, data);
        if (error) throw error;
        
        toast.success('La carte a été mise à jour avec succès');
      } else {
        // Création d'une nouvelle carte
        const { error } = await createCalendarCard({
          ...data,
          client_id: data.client_id || clientId || '',
        });
        if (error) throw error;
        
        toast.success('La carte a été créée avec succès');
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating/updating card:', error);
      toast.error('Une erreur est survenue lors de la création ou de la mise à jour de la carte');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {isCoach && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Calendrier de suivi</h2>
          <p className="text-muted-foreground mb-4">
            Planifiez et gérez les périodes de suivi de votre client.
          </p>
          <button
            onClick={handleAddCard}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ajouter une période
          </button>
        </div>
      )}

  <CalendarView 
        clientId={clientId}
        onAddCard={isCoach ? handleAddCard : undefined}
        onEditCard={isCoach ? handleEditCard : undefined}
        onDeleteCard={isCoach ? handleDeleteCard : undefined}
        emptyState={!isCoach ? emptyState : undefined}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">
            {selectedCard ? 'Modifier la carte' : 'Nouvelle carte'}
          </h2>
          <CalendarCardForm
            initialData={selectedCard || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
            clientId={clientId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
