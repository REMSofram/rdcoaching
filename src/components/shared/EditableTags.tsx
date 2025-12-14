'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, X as XIcon, MoreVertical, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EditableTagsProps {
  tags: string[];
  availableTags: string[];
  onSave: (tags: string[]) => Promise<void>;
  onDeleteTag?: (tag: string) => Promise<void>;
  className?: string;
}

export function EditableTags({ tags, availableTags, onSave, onDeleteTag, className }: EditableTagsProps) {
  const [currentTags, setCurrentTags] = useState<string[]>(tags);
  const [newTag, setNewTag] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mettre à jour les tags locaux quand les props changent
  useEffect(() => {
    setCurrentTags(tags);
  }, [tags]);

  // Sauvegarder automatiquement les modifications
  const saveTags = async (updatedTags: string[]) => {
    console.log('saveTags called with:', updatedTags);
    try {
      console.log('Appel de onSave...');
      await onSave(updatedTags);
      console.log('onSave terminé avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tags:', error);
      // Revenir à l'état précédent en cas d'erreur
      console.log('Retour aux tags précédents:', tags);
      setCurrentTags(tags);
    }
  };

  // Ajouter un tag
  const handleAddTag = async (tag: string) => {
    console.log('handleAddTag called with tag:', tag);
    if (!tag) {
      console.log('Tag vide, sortie');
      return;
    }
    
    const tagToAdd = tag.trim();
    console.log('Tag à ajouter (après trim):', tagToAdd);
    
    if (!tagToAdd) {
      console.log('Tag vide après trim, sortie');
      return;
    }
    
    if (currentTags.includes(tagToAdd)) {
      console.log('Tag déjà présent, sortie');
      return;
    }
    
    const updatedTags = [...currentTags, tagToAdd];
    console.log('Nouveaux tags:', updatedTags);
    
    setCurrentTags(updatedTags);
    setNewTag('');
    console.log('Avant saveTags');
    await saveTags(updatedTags);
    console.log('Après saveTags');
  };

  // Supprimer un tag du client actuel
  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    setCurrentTags(updatedTags);
    await saveTags(updatedTags);
  };
  
  // Gestion du clic sur le bouton de menu
  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  // Supprimer un tag de la liste des tags disponibles
  const handleDeleteTag = async (tagToDelete: string) => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      console.log('Suppression du tag:', tagToDelete);
      
      // Si on a une fonction onDeleteTag, on l'utilise
      if (onDeleteTag) {
        console.log('Appel de onDeleteTag pour le tag:', tagToDelete);
        await onDeleteTag(tagToDelete);
      } else {
        console.log('Aucune fonction onDeleteTag fournie, suppression locale uniquement');
        // Mettre à jour les tags du client actuel
        const updatedTags = currentTags.filter(tag => tag !== tagToDelete);
        setCurrentTags(updatedTags);
        await onSave(updatedTags);
      }
      
      console.log(`Tag "${tagToDelete}" supprimé avec succès`);
      
      // Fermer le menu déroulant
      const dropdownMenu = document.querySelector('[role="menu"]');
      if (dropdownMenu) {
        (dropdownMenu as HTMLElement).style.display = 'none';
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Gestion de la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag(newTag.trim());
    }
  };

  // Filtrer les tags disponibles
  const availableFilteredTags = availableTags
    .filter(tag => !currentTags.includes(tag))
    .filter(tag => 
      !newTag || tag.toLowerCase().includes(newTag.toLowerCase())
    );
    
  // Tous les tags disponibles (non filtrés par la recherche)
  const allAvailableTags = availableTags.filter(tag => !currentTags.includes(tag));
  
  // Logs pour le débogage (uniquement en développement)
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Debug EditableTags ===');
    console.log('Props reçues - tags:', tags);
    console.log('Props reçues - availableTags:', availableTags);
    console.log('État local - currentTags:', currentTags);
    console.log('Tags disponibles (non attribués):', allAvailableTags);
    console.log('Tags filtrés (recherche):', availableFilteredTags);
    console.log('Nouveau tag en cours de saisie:', newTag);
    console.log('==========================');
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap items-center gap-1">
        {/* Affichage des tags existants */}
        {currentTags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Bouton pour ajouter un nouveau tag */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                setIsPopoverOpen(true);
              }}
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64 p-2" 
            align="start" 
            sideOffset={5}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
          >
            <div className="space-y-2">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher ou créer un tag"
                  className="h-8 text-sm pr-8"
                  onClick={(e) => e.stopPropagation()}
                />
                {newTag && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewTag('');
                      inputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Conteneur principal des tags disponibles */}
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {/* Option pour créer un nouveau tag (uniquement si le tag n'existe pas déjà) */}
                {newTag && !availableTags.includes(newTag.trim()) && (
                  <div className="p-1">
                    <button
                      className="w-full text-left p-1.5 text-sm rounded hover:bg-accent flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTag(newTag.trim());
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Créer "{newTag.trim()}"
                    </button>
                  </div>
                )}

              {/* Section des tags suggérés (correspondant à la recherche) */}
              {newTag && availableFilteredTags.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-2 py-1">Suggestions</p>
                  {availableFilteredTags.map((tag) => (
                    <div 
                      key={tag} 
                      className="p-1.5 hover:bg-accent rounded text-sm flex items-center justify-between group"
                    >
                      <span 
                        className="flex-grow cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTag(tag);
                        }}
                      >
                        {tag}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onClick={handleMenuClick}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTag(tag);
                            }}
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                  ))}
                </div>
              )}

              {/* Section des tags disponibles (toujours visible sauf pendant la recherche) */}
              {(!newTag || availableFilteredTags.length === 0) && allAvailableTags.length > 0 && (
                <div className="space-y-1">
                  {newTag && <div className="border-t border-border my-1"></div>}
                  <p className="text-xs text-muted-foreground px-2 py-1">
                    {newTag ? 'Aucun résultat' : 'Tous les tags disponibles'}
                  </p>
                  {allAvailableTags.map((tag) => (
                    <div 
                      key={tag} 
                      className="p-1.5 hover:bg-accent rounded text-sm flex items-center justify-between group"
                    >
                      <span 
                        className="flex-grow cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTag(tag);
                        }}
                      >
                        {tag}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onClick={handleMenuClick}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTag(tag);
                            }}
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
