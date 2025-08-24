"use client";

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { eachDayOfInterval } from 'date-fns/fp';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarCard as CalendarCardType } from '@/types/calendar';
import { CalendarCard } from './CalendarCard';
// Suppression de l'import Card inutilisé
import { toast } from 'sonner';
import { getCalendarCardsWithInfo } from '@/services/calendarService';

type CalendarViewProps = {
  clientId?: string; // Optionnel : si défini, filtre les cartes pour ce client
  onAddCard?: () => void;
  onEditCard?: (card: CalendarCardType) => void;
  onDeleteCard?: (id: string) => Promise<void>;
  className?: string;
  emptyState?: React.ReactNode; // Contenu à afficher lorsque le calendrier est vide
};

export function CalendarView({ clientId, onAddCard, onEditCard, onDeleteCard, className, emptyState }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cards, setCards] = useState<CalendarCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les cartes
  useEffect(() => {
    const loadCards = async () => {
      try {
        const { data, error } = await getCalendarCardsWithInfo(clientId);
        
        if (error) throw error;
        
        setCards(data || []);
      } catch (error) {
        console.error('Error loading calendar cards:', error);
        toast.error('Impossible de charger les cartes du calendrier');
      }
    };

    loadCards();
  }, [clientId]);

  // Générer les jours du mois courant
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtenir les cartes pour un jour spécifique
  const getCardsForDay = (day: Date): CalendarCardType[] => {
    return cards.filter(card => {
      const cardStart = new Date(card.start_date);
      const cardEnd = new Date(card.end_date);
      return (day >= cardStart && day <= cardEnd);
    });
  };

  // Navigation entre les mois
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const resetToToday = () => setCurrentMonth(new Date());

  if (isLoading) {
    return null;
  }

  if (cards.length === 0 && emptyState) {
    return <div className="py-12">{emptyState}</div>;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetToToday}>
            Aujourd'hui
          </Button>
        </div>
        
        {onAddCard && (
          <Button onClick={onAddCard}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle carte
          </Button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center font-medium text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day: Date, i: number) => {
          const dayCards = getCardsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          
          return (
            <div 
              key={day.toString()}
              className={cn(
                'min-h-32 p-2 border rounded-md',
                !isCurrentMonth && 'opacity-50',
                isTodayDate && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
                'flex flex-col',
                'overflow-hidden'
              )}
            >
              <div className={cn(
                'text-sm font-medium mb-1 self-end',
                isTodayDate && 'text-blue-600 dark:text-blue-400',
                !isCurrentMonth && 'text-muted-foreground'
              )}>
                {format(day, 'd')}
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayCards.slice(0, 2).map((card) => (
                  <CalendarCard 
                    key={card.id}
                    card={card} 
                    className="text-xs p-2"
                    onEdit={onEditCard}
                    onDelete={onDeleteCard}
                  />
                ))}
                {dayCards.length > 2 && (
                  <div className="text-xs text-center text-muted-foreground">
                    +{dayCards.length - 2} de plus
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Fonction utilitaire pour joindre les classes CSS
function cn(...classes: Array<string | undefined | null | boolean>): string {
  return classes.filter(Boolean).join(' ');
}
