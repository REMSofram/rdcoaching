"use client";

import { CalendarCardWithInfo as CalendarCardType } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

type CalendarCardProps = {
  card: CalendarCardType;
  onEdit?: (card: CalendarCardType) => void;
  onDelete?: (id: string) => void;
  className?: string;
};

export function CalendarCard({ card, onEdit, onDelete, className }: CalendarCardProps) {
  const isSingleDay = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start.toDateString() === end.toDateString();
  };

  const { id, title, description, start_date, end_date, status } = card;
  const isEvent = isSingleDay(start_date, end_date);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDuration = (startDate: string, endDate: string) => {
    if (isSingleDay(startDate, endDate)) {
      return ''; // Pas de durée pour un événement d'une journée
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 car la date de fin est incluse
    
    if (days < 7) {
      return ` • ${days} ${days > 1 ? 'jours' : 'jour'}`;
    }
    
    const weeks = Math.floor(days / 7);
    return ` • ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  };

  return (
    <div 
      className={cn(
        'rounded-lg border bg-card text-card-foreground p-4 shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">{title}</h3>
            {status && (
              <span className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                status === 'current' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                status === 'upcoming' && isEvent ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              )}>
                {status === 'current' && isEvent ? 'Aujourd\'hui' :
                 status === 'current' ? 'En cours' : 
                 status === 'upcoming' && isEvent ? 'Événement à venir' : 
                 status === 'upcoming' ? 'À venir' : 'Terminé'}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isEvent ? formatDate(start_date) : `${formatDate(start_date)} - ${formatDate(end_date)}`}{formatDuration(start_date, end_date)}
          </p>
        </div>
      </div>

      {description && (
        <div className="mt-3 mb-2">
          <p className="text-sm text-muted-foreground whitespace-pre-line">{description}</p>
        </div>
      )}

      {(onEdit || onDelete) && (
        <div className="mt-3 flex justify-end space-x-2">
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onEdit(card)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Modifier</span>
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(id as string)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Supprimer</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
