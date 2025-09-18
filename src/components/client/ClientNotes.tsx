'use client';

import { useEffect, useState } from 'react';
import { TipTapEditor } from '../shared/editor';
import { noteService } from '../../services/noteService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ClientNotesProps {
  clientId: string;
  className?: string;
}

export function ClientNotes({ clientId, className = '' }: ClientNotesProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Charger la note du client
  useEffect(() => {
    const loadNote = async () => {
      try {
        setIsLoading(true);
        const note = await noteService.getOrCreateClientNote(clientId);
        setContent(note.content || '');
      } catch (error) {
        console.error('Erreur lors du chargement de la note:', error);
        toast.error('Impossible de charger la note du client.');
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      loadNote();
    }
  }, [clientId, toast]);

  // Mettre à jour la note avec un délai pour éviter trop de requêtes
  const handleContentChange = async (newContent: string) => {
    setContent(newContent);
    
    try {
      await noteService.updateNoteContent(clientId, newContent);
      // Pas besoin de toast pour chaque sauvegarde, c'est automatique
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      toast.error('Impossible de sauvegarder la note.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <TipTapEditor
          value={content}
          onChange={handleContentChange}
          placeholder="Écrivez vos notes sur ce client ici..."
          className="min-h-[300px] bg-white rounded-md p-4"
        />
      </div>
    </div>
  );
}
