"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { CalendarCard as CalendarCardType } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type CalendarCardFormProps = {
  initialData?: Partial<CalendarCardType>;
  onSubmit: (data: Omit<CalendarCardType, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  clientId?: string;
};

interface FormData {
  title: string;
  description: string;
  start_date: Date | string;
  end_date: Date | string;
  client_id: string;
  isEvent: boolean;
}

export function CalendarCardForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  clientId 
}: CalendarCardFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
    client_id: '',
    isEvent: false
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    client_id?: string;
    submit?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.client_id) {
      newErrors.client_id = 'Un client doit être sélectionné';
    }
    
    // Convertir les dates en objets Date pour la comparaison
    const startDate = formData.start_date instanceof Date 
      ? formData.start_date 
      : new Date(formData.start_date);
      
    const endDate = formData.end_date instanceof Date 
      ? formData.end_date 
      : new Date(formData.end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      newErrors.start_date = 'Format de date invalide';
    } else if (endDate < startDate) {
      newErrors.end_date = 'La date de fin doit être postérieure à la date de début';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      // S'assurer que les dates sont des objets Date valides avant de les formater
      const startDate = formData.start_date instanceof Date 
        ? formData.start_date 
        : new Date(formData.start_date);
        
      // Pour un événement, la date de fin est la même que la date de début
      const endDate = formData.isEvent 
        ? startDate 
        : formData.end_date instanceof Date 
          ? formData.end_date 
          : new Date(formData.end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Format de date invalide lors de la soumission');
      }
      
      // Créer l'objet de soumission avec les données formatées
      const submissionData: Omit<CalendarCardType, 'id' | 'created_at' | 'updated_at' | 'is_active'> = {
        title: formData.title,
        description: formData.description,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        client_id: formData.client_id
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Une erreur est survenue lors de la soumission du formulaire'
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Initialisation des données du formulaire
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        isEvent: initialData.start_date === initialData.end_date,
        start_date: initialData.start_date ? new Date(initialData.start_date) : new Date(),
        end_date: initialData.end_date ? new Date(initialData.end_date) : new Date(),
      }));
    }
    
    if (clientId && clientId !== formData.client_id) {
      setFormData(prev => ({
        ...prev,
        client_id: clientId
      }));
    }
  }, [clientId, initialData]);
  
  // Mettre à jour la date de fin quand on coche/décoche la case événement
  const handleEventToggle = (isEvent: boolean) => {
    setFormData(prev => ({
      ...prev,
      isEvent,
      end_date: isEvent ? prev.start_date : prev.end_date
    }));
  };
  
  // Mettre à jour la date de fin quand on change la date de début pour un événement
  const handleStartDateChange = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      start_date: date,
      end_date: prev.isEvent ? date : prev.end_date
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Titre de la carte"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description détaillée..."
          rows={6}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isEvent"
            checked={formData.isEvent}
            onChange={(e) => handleEventToggle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isEvent" className="text-sm font-medium leading-none">
            C'est un événement d'une seule journée
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">
              {formData.isEvent ? 'Date de l\'événement *' : 'Date de début *'}
            </Label>
            <div className="relative">
              <Input
                type="date"
                id="start_date"
                value={formData.start_date instanceof Date ? format(formData.start_date, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const date = new Date(e.target.value);
                    handleStartDateChange(date);
                    setErrors(prev => ({ ...prev, start_date: undefined }));
                  }
                }}
                className={cn(
                  "w-full appearance-none",
                  "[&::-webkit-calendar-picker-indicator]:absolute",
                  "[&::-webkit-calendar-picker-indicator]:right-2",
                  "[&::-webkit-calendar-picker-indicator]:top-1/2",
                  "[&::-webkit-calendar-picker-indicator]:-translate-y-1/2",
                  "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                  "[&::-webkit-calendar-picker-indicator]:opacity-100",
                  "[&::-webkit-calendar-picker-indicator]:h-5",
                  "[&::-webkit-calendar-picker-indicator]:w-5",
                  "pr-8",
                  errors.start_date ? 'border-red-500' : ''
                )}
              />
              <CalendarIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
          </div>

          <div className="space-y-2" style={{ opacity: formData.isEvent ? 0.5 : 1, pointerEvents: formData.isEvent ? 'none' : 'auto' }}>
            <Label htmlFor="end_date">Date de fin *</Label>
            <div className="relative">
              <Input
                type="date"
                id="end_date"
                value={formData.end_date instanceof Date ? format(formData.end_date, 'yyyy-MM-dd') : ''}
                min={formData.start_date instanceof Date ? format(formData.start_date, 'yyyy-MM-dd') : ''}
                disabled={formData.isEvent}
                onChange={(e) => {
                  if (e.target.value) {
                    const date = new Date(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      end_date: date
                    }));
                    setErrors(prev => ({ ...prev, end_date: undefined }));
                  }
                }}
                className={cn(
                  "w-full appearance-none",
                  "[&::-webkit-calendar-picker-indicator]:absolute",
                  "[&::-webkit-calendar-picker-indicator]:right-2",
                  "[&::-webkit-calendar-picker-indicator]:top-1/2",
                  "[&::-webkit-calendar-picker-indicator]:-translate-y-1/2",
                  "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                  "[&::-webkit-calendar-picker-indicator]:opacity-100",
                  "[&::-webkit-calendar-picker-indicator]:h-5",
                  "[&::-webkit-calendar-picker-indicator]:w-5",
                  "pr-8",
                  errors.end_date ? 'border-red-500' : ''
                )}
              />
              <CalendarIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
}
