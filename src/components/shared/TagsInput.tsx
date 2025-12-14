'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type TagsInputProps = {
  userId: string;
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  className?: string;
};

export function TagsInput({ userId, initialTags = [], onTagsChange, className }: TagsInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Charger les tags disponibles depuis la base de données
  useEffect(() => {
    fetchAvailableTags();
  }, []);

  const fetchAvailableTags = async () => {
    try {
      // Récupérer les tags des profils des clients du coach
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: coachData } = await supabase
        .from('profiles')
        .select('available_tags')
        .eq('id', user.id)
        .single();

      if (coachData?.available_tags) {
        setAvailableTags(coachData.available_tags);
      } else {
        // Aucun tag par défaut - tableau vide
        const defaultTags: string[] = [];
        setAvailableTags(defaultTags);
        // Sauvegarder le tableau vide
        await saveAvailableTags(defaultTags);
      }
    } catch (error) {
      console.error('Error fetching available tags:', error);
    }
  };

  const saveAvailableTags = async (tags: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ available_tags: tags })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error saving available tags:', error);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      updateProfileTags(newTags);
      setInputValue('');
      onTagsChange?.(newTags);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    updateProfileTags(newTags);
    onTagsChange?.(newTags);
  };

  const updateProfileTags = async (newTags: string[]) => {
    try {
      await supabase
        .from('profiles')
        .update({ types: newTags })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating profile tags:', error);
    }
  };

  const handleAddNewTag = () => {
    if (inputValue.trim() && !availableTags.includes(inputValue.trim())) {
      const newTag = inputValue.trim();
      const newAvailableTags = [...availableTags, newTag];
      setAvailableTags(newAvailableTags);
      saveAvailableTags(newAvailableTags);
      handleAddTag(newTag);
      setInputValue('');
      setIsOpen(false);
    }
  };

  const filteredAvailableTags = availableTags.filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
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
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Rechercher ou créer un tag"
                  className="h-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filteredAvailableTags.length === 0) {
                        handleAddNewTag();
                      } else {
                        handleAddTag(filteredAvailableTags[0]);
                      }
                    }
                  }}
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredAvailableTags.length > 0 ? (
                  <div className="space-y-1">
                    {filteredAvailableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          handleAddTag(tag);
                          setInputValue('');
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : inputValue ? (
                  <button
                    type="button"
                    onClick={handleAddNewTag}
                    className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded"
                  >
                    Ajouter "{inputValue}" comme nouveau tag
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
    </div>
  );
}
