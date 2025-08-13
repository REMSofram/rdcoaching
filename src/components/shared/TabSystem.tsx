import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ProgramDayInput } from '@/types/Program';
import { cn } from '@/lib/utils';

// Styles pour masquer la barre de défilement
const scrollbarHideStyles = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

type DayType = 'program' | 'nutrition';

// Type minimal commun aux jours (programme et nutrition)
interface BaseDay {
  id?: string;
  day_title: string;
  content: string;
  day_order: number;
  created_at?: string;
  updated_at?: string;
}

interface TabSystemProps {
  days: BaseDay[];
  onDaysChange?: (days: ProgramDayInput[]) => void;
  readOnly?: boolean;
  className?: string;
  dayType?: DayType;
}

/**
 * Composant d'onglets pour gérer les jours d'un programme d'entraînement
 * @param days - Tableau des jours du programme
 * @param onDaysChange - Callback appelé quand les jours sont modifiés
 * @param readOnly - Si true, désactive l'édition
 * @param className - Classes CSS supplémentaires
 */
export const TabSystem: React.FC<TabSystemProps> = ({
  days = [],
  onDaysChange,
  readOnly = false,
  className = '',
  dayType = 'program',
}) => {
  const [activeTab, setActiveTab] = useState<string>('0');
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Gestion du défilement horizontal des onglets sur mobile
  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (!tabsList) return;

    const handleScroll = () => {
      setShowScrollLeft(tabsList.scrollLeft > 10);
      setShowScrollRight(
        tabsList.scrollLeft < tabsList.scrollWidth - tabsList.clientWidth - 10
      );
    };

    // Vérifier l'état initial
    handleScroll();

    tabsList.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      tabsList.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [days.length]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const tabsList = tabsListRef.current;
    if (!tabsList) return;
    
    const scrollAmount = direction === 'left' ? -200 : 200;
    tabsList.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Gère le changement de contenu d'un jour
  const handleDayChange = useCallback((index: number, field: keyof ProgramDayInput, value: string) => {
    if (readOnly || !onDaysChange) return;
    
    const newDays = [...days];
    newDays[index] = {
      ...newDays[index],
      [field]: value,
    };
    
    onDaysChange(newDays);
  }, [days, onDaysChange, readOnly]);

  // Ajoute un nouveau jour
  const handleAddDay = useCallback(() => {
    if (readOnly || !onDaysChange) return;
    
    const dayTitle = dayType === 'nutrition' 
      ? `Jour ${days.length + 1} - Nutrition`
      : `Jour ${days.length + 1} - Nouveau`;
      
    const defaultContent = dayType === 'nutrition'
      ? '## Petit-déjeuner\n- \n\n## Déjeuner\n- \n\n## Collation\n- \n\n## Dîner\n- '
      : '';
    
    const newDay: ProgramDayInput = {
      day_title: dayTitle,
      content: defaultContent,
      day_order: days.length,
    };
    
    onDaysChange([...days, newDay]);
    setActiveTab(days.length.toString());
    
    // Faire défiler vers le nouvel onglet après un court délai
    setTimeout(() => {
      const tabsList = tabsListRef.current;
      if (tabsList) {
        tabsList.scrollTo({
          left: tabsList.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 100);
  }, [days, onDaysChange, readOnly]);

  // Supprime un jour
  const handleDeleteDay = useCallback((index: number) => {
    if (readOnly || !onDaysChange) return;
    
    if (days.length <= 1) {
      window.alert('Un programme doit avoir au moins un jour.');
      return;
    }
    
    const dayToDelete = days[index];
    
    // Demande de confirmation avant suppression
    if (!window.confirm(`Voulez-vous vraiment supprimer le jour "${dayToDelete.day_title}" ?`)) {
      return;
    }
    
    const newDays = days.filter((_, i) => i !== index);
    onDaysChange(newDays);
    
    // Si on supprime l'onglet actif, on passe au précédent ou au suivant
    if (parseInt(activeTab) === index) {
      const newActiveTab = Math.max(0, index - 1);
      setActiveTab(newActiveTab.toString());
      
      // Faire défiler vers l'onglet actif si nécessaire
      setTimeout(() => {
        const tabsList = tabsListRef.current;
        if (tabsList) {
          const tabElement = tabsList.querySelector(`[data-value="${newActiveTab}"]`) as HTMLElement;
          if (tabElement) {
            tabElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        }
      }, 100);
    } else if (parseInt(activeTab) > index) {
      setActiveTab((parseInt(activeTab) - 1).toString());
    }
    
    window.alert(`Le jour "${dayToDelete.day_title}" a été supprimé.`);
  }, [activeTab, days, onDaysChange, readOnly]);

  // Si pas de jours, on affiche un état vide
  if (days.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50 ${className}`}>
        <p className="text-gray-500 mb-4">Aucun jour d&apos;entraînement défini</p>
        {!readOnly && (
          <Button onClick={handleAddDay}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un jour
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="relative flex items-center mb-4">
          {/* Bouton de défilement gauche (mobile) */}
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className={cn(
              'absolute left-0 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-background shadow-md hover:bg-accent',
              'transition-opacity duration-200',
              showScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none',
              'md:hidden' // Caché sur desktop
            )}
            aria-label="Faire défiler à gauche"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {/* Liste des onglets */}
          <TabsList 
            ref={tabsListRef}
            className={cn(
              'flex-1 flex-nowrap h-auto p-1 bg-gray-100 overflow-x-auto',
              'transition-all duration-200',
              'md:flex-wrap',
              'scrollbar-hide'
            )}
          >
            {days.map((day, index) => (
              <div key={index} className="relative flex-shrink-0 group">
                <TabsTrigger 
                  value={index.toString()}
                  className={cn(
                    'data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm',
                    'whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]',
                    'transition-colors duration-200',
                    'px-3 py-1.5 text-sm',
                    'md:max-w-none md:px-4 md:py-2' // Plus d'espace sur desktop
                  )}
                >
                  <span className="truncate">
                    {day.day_title || `Jour ${index + 1}`}
                  </span>
                </TabsTrigger>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDay(index);
                    }}
                    className={cn(
                      'absolute -right-2 -top-2 z-10 p-1 rounded-full',
                      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                      'transition-opacity duration-200',
                      'opacity-0 group-hover:opacity-100 focus:opacity-100',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      'h-5 w-5 flex items-center justify-center'
                    )}
                    disabled={days.length <= 1}
                    title="Supprimer ce jour"
                    aria-label={`Supprimer le jour ${index + 1}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            
            {!readOnly && (
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className={cn(
                  'ml-2 flex-shrink-0',
                  'h-8 w-8 p-0',
                  'hover:bg-primary/10',
                  'transition-colors duration-200'
                )}
                onClick={handleAddDay}
                title="Ajouter un jour"
                aria-label="Ajouter un jour"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </TabsList>
          
          {/* Bouton de défilement droit (mobile) */}
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className={cn(
              'absolute right-0 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-background shadow-md hover:bg-accent',
              'transition-opacity duration-200',
              showScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none',
              'md:hidden' // Caché sur desktop
            )}
            aria-label="Faire défiler à droite"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {days.map((day, index) => (
          <TabsContent 
            key={index} 
            value={index.toString()}
            className="p-4"
          >
            <div className="space-y-4">
              {!readOnly ? (
                <>
                  <div>
                    <label htmlFor={`day-title-${index}`} className="text-sm font-medium mb-1 block">
                      Titre du jour
                    </label>
                    <input
                      id={`day-title-${index}`}
                      type="text"
                      value={day.day_title}
                      onChange={(e) => handleDayChange(index, 'day_title', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Ex: Jour 1 - Haut du corps"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <label htmlFor={`day-content-${index}`} className="text-sm font-medium mb-1 block">
                      Contenu du jour
                    </label>
                    <Textarea
                      id={`day-content-${index}`}
                      value={day.content}
                      onChange={(e) => handleDayChange(index, 'content', e.target.value)}
                      className="min-h-[300px] w-full"
                      placeholder={
                        readOnly 
                          ? 'Aucun contenu pour ce jour.' 
                          : dayType === 'nutrition'
                            ? 'Détaillez vos repas et collations...\nExemple :\n## Petit-déjeuner\n- Omelette aux épinards et avocat\n- Pain complet\n- Thé vert\n\n## Déjeuner\n- Poulet grillé\n- Quinoa et légumes grillés\n- Yaourt nature'
                            : 'Détaillez les exercices, séries, répétitions...\nExemple :\n- Développé couché : 4x8-12\n- Écarté couché : 3x12-15'
                      }
                      readOnly={readOnly}
                    />
                  </div>
                </>
              ) : (
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">{day.day_title || `Jour ${index + 1}`}</h3>
                  <div className="whitespace-pre-wrap">{day.content || 'Aucun contenu pour ce jour.'}</div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
