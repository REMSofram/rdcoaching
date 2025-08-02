'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { DailyLog, createDailyLog, getLogByDate, updateDailyLog } from '@/services/dailyLogService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/shared/Input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RatingButtons } from '@/components/ui/RatingButtons';

export default function DailyLogForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [showTrainingFields, setShowTrainingFields] = useState(false);
  
  const [formData, setFormData] = useState<Omit<DailyLog, 'id' | 'client_id' | 'created_at' | 'updated_at'>>({
    log_date: today,
    weight: undefined,
    energy_level: undefined,
    sleep_hours: undefined,
    sleep_quality: undefined,
    appetite: undefined,
    training_done: false,
    training_type: '',
    plaisir_seance: undefined,
    notes: ''
  });
  const [existingLogId, setExistingLogId] = useState<string | null>(null);

  // Fonction pour charger le log d'une date spécifique
  const loadLogForDate = async (date: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      const { data: log, error } = await getLogByDate(user.id, date);
      
      if (error) throw error;
      
      if (log) {
        setExistingLogId(log.id || null);
        setFormData({
          log_date: log.log_date || date,
          weight: log.weight,
          energy_level: log.energy_level,
          sleep_hours: log.sleep_hours,
          sleep_quality: log.sleep_quality,
          appetite: log.appetite as 'faible' | 'moyen' | 'élevé' | undefined,
          training_done: log.training_done || false,
          training_type: log.training_type || '',
          plaisir_seance: log.plaisir_seance,
          notes: log.notes || ''
        });
        setShowTrainingFields(!!log.training_done);
      } else {
        setExistingLogId(null);
        setFormData({
          log_date: date,
          weight: undefined,
          energy_level: undefined,
          sleep_hours: undefined,
          sleep_quality: undefined,
          appetite: undefined,
          training_done: false,
          training_type: '',
          plaisir_seance: undefined,
          notes: ''
        });
        setShowTrainingFields(false);
      }
    } catch (error) {
      console.error('Error loading log:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.id) {
      loadLogForDate(formData.log_date);
    }
  }, [formData.log_date, user?.id]);
  
  // Charger le log pour la date actuelle au montage
  useEffect(() => {
    loadLogForDate(today);
  }, [user?.id]);
  
  // Gérer le changement de date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    // Mettre à jour la date dans le formulaire
    setFormData(prev => ({
      ...prev,
      log_date: newDate,
      // Réinitialiser les autres champs qui dépendent de la date
      weight: undefined,
      energy_level: undefined,
      sleep_hours: undefined,
      sleep_quality: undefined,
      appetite: undefined,
      training_type: '',
      plaisir_seance: undefined,
      notes: ''
    }));
    setShowTrainingFields(false);
    // Charger le log pour la nouvelle date
    loadLogForDate(newDate);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'training_done') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setShowTrainingFields(isChecked);
      setFormData(prev => ({
        ...prev,
        training_done: isChecked,
        ...(!isChecked && {
          training_type: '',
          plaisir_seance: undefined
        })
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? value === '' ? undefined : parseFloat(value)
        : value
    }));
  };

  const handleTrainingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowTrainingFields(isChecked);
    
    setFormData(prev => ({
      ...prev,
      training_done: isChecked,
      ...(!isChecked && {
        training_type: '',
        plaisir_seance: undefined
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsSubmitting(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        client_id: user.id,
        // S'assurer que training_done est bien un booléen
        training_done: !!formData.training_done,
        // Ne pas inclure les champs d'entraînement si pas d'entraînement
        ...(!formData.training_done && {
          training_type: undefined,
          plaisir_seance: undefined
        })
      };
      
      if (existingLogId) {
        await updateDailyLog(existingLogId, dataToSubmit);
      } else {
        await createDailyLog(dataToSubmit);
      }
      
      // Afficher la notification et rediriger
      showNotification('Votre suivi quotidien a bien été enregistré !');
      router.push('/client/suivi');
      
    } catch (error) {
      console.error('Error saving daily log:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Journal du jour</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Input
              type="date"
              name="log_date"
              value={formData.log_date}
              onChange={handleChange}
              max={today}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
            <Input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight ?? ''}
              onChange={handleChange}
              placeholder="Ex: 75.5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heures de sommeil</label>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="sleep_hours"
              value={formData.sleep_hours ?? ''}
              onChange={handleChange}
              placeholder="Ex: 7.5"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Qualité du sommeil</label>
              <span className="text-xs text-gray-500">1 (Mauvaise) à 5 (Excellente)</span>
            </div>
            <RatingButtons
              value={formData.sleep_quality ?? null}
              onChange={(value) => setFormData({...formData, sleep_quality: value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appétit</label>
            <select
              name="appetite"
              value={formData.appetite ?? ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionnez...</option>
              <option value="faible">Faible</option>
              <option value="moyen">Moyen</option>
              <option value="élevé">Élevé</option>
            </select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Niveau d'énergie</label>
              <span className="text-xs text-gray-500">1 (Très bas) à 5 (Très élevé)</span>
            </div>
            <RatingButtons
              value={formData.energy_level ?? null}
              onChange={(value) => setFormData({...formData, energy_level: value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="training_done"
                name="training_done"
                checked={showTrainingFields}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="training_done" className="ml-2 block text-sm text-gray-700">
                Entraînement effectué aujourd'hui
              </label>
            </div>
            
            {showTrainingFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type d'entraînement</label>
                  <Input
                    type="text"
                    name="training_type"
                    value={formData.training_type}
                    onChange={handleChange}
                    placeholder="Ex: Musculation, Cardio..."
                    required
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Plaisir de la séance</label>
                    <span className="text-xs text-gray-500">1 (Aucun plaisir) à 5 (Beaucoup)</span>
                  </div>
                  <RatingButtons
                    value={formData.plaisir_seance ?? null}
                    onChange={(value) => setFormData({...formData, plaisir_seance: value})}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarques (optionnel)</label>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Ajoutez des remarques sur votre journée..."
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer mon journal'}
          </Button>
        </div>
      </form>


    </div>
  );
}
