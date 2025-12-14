'use client';

import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { cn } from '@/lib/utils';

type ClientTagsProps = {
  clientId: string;
  initialTags: string[];
  availableTags: string[];
  onUpdate?: (tags: string[]) => void;
};

export function ClientTags({ clientId, initialTags, availableTags, onUpdate }: ClientTagsProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  const addTag = async (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      await updateTags(newTags);
    }
  };

  const removeTag = async (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          types: newTags.length > 0 ? newTags : null 
        } as any) // Type assertion temporaire
        .eq('id', clientId);
        
      if (error) throw error;
      
      if (onUpdate) {
        onUpdate(newTags);
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      // Revert on error
      setTags(tags);
    }
  };

  const updateTags = async (newTags: string[]) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          types: newTags.length > 0 ? newTags : null 
        } as any) // Type assertion temporaire
        .eq('id', clientId);

      if (error) throw error;
      
      if (onUpdate) {
        onUpdate(newTags);
      }
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const handleAddNewTag = async () => {
    const tag = newTag.trim();
    if (!tag) return;
    
    try {
      // Add the new tag to available tags if it doesn't exist
      if (!availableTags.includes(tag)) {
        const newAvailableTags = [...availableTags, tag];
        
        // Update coach's available tags
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ 
              available_tags: newAvailableTags 
            } as any) // Type assertion temporaire
            .eq('id', user.id);
        }
      }
      
      // Add the tag to the client
      await addTag(tag);
      setNewTag('');
    } catch (error) {
      console.error('Error adding new tag:', error);
    }
  };

  const filteredAvailableTags = availableTags.filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(newTag.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="ml-1 rounded-full hover:bg-muted p-0.5"
            aria-label={`Supprimer le tag ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 rounded-full"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTag.trim()) {
                  e.preventDefault();
                  if (filteredAvailableTags.length === 0) {
                    handleAddNewTag();
                  } else {
                    addTag(filteredAvailableTags[0]);
                  }
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Rechercher ou créer un tag"
              className="w-full px-2 py-1 text-sm border rounded"
            />
            <div className="max-h-40 overflow-y-auto">
              {filteredAvailableTags.length > 0 ? (
                <div className="space-y-1">
                  {filteredAvailableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addTag(tag);
                        setNewTag('');
                      }}
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : newTag ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddNewTag();
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded"
                >
                  Ajouter "{newTag}" comme nouveau tag
                </button>
              ) : (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  Aucun tag disponible
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
