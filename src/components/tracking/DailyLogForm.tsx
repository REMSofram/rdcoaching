'use client';

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DailyLog, createDailyLog, getTodaysLog, updateDailyLog } from '@/services/dailyLogService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/shared/Input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DailyLogForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  
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

  useEffect(() => {
    const fetchTodaysLog = async () => {
      if (!user?.id) return;
      
      try {
        const { data: todaysLog } = await getTodaysLog(user.id);
        if (todaysLog) {
          setFormData({
            log_date: todaysLog.log_date || today,
            weight: todaysLog.weight,
            energy_level: todaysLog.energy_level,
            sleep_quality: todaysLog.sleep_quality,
            appetite: todaysLog.appetite as 'faible' | 'moyen' | 'élevé' | undefined,
            training_type: todaysLog.training_type || '',
            plaisir_seance: todaysLog.plaisir_seance,
            notes: todaysLog.notes || ''
          });
          setExistingLogId(todaysLog.id);
        }
      } catch (error) {
        console.error('Error fetching today\'s log:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysLog();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : 
             type === 'checkbox' ? (e.target as HTMLInputElement).checked :
             value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsSubmitting(true);
    
    try {
      const logData = {
        ...formData,
        client_id: user.id,
      };
      
      if (existingLogId) {
        await updateDailyLog(existingLogId, logData);
      } else {
        await createDailyLog(logData);
      }
      
      // Show success message or redirect
      alert('Votre journal a été enregistré avec succès!');
    } catch (error) {
      console.error('Error saving daily log:', error);
      alert('Une erreur est survenue lors de l\'enregistrement de votre journal.');
    } finally {
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Qualité du sommeil (1-5)</label>
            <select
              name="sleep_quality"
              value={formData.sleep_quality ?? ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionnez...</option>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} - {num === 1 ? 'Mauvaise' : num === 5 ? 'Excellente' : ''}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'énergie (1-5)</label>
            <select
              name="energy_level"
              value={formData.energy_level ?? ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionnez...</option>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} - {num === 1 ? 'Très bas' : num === 5 ? 'Très élevé' : ''}</option>
              ))}
            </select>
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
          
          <div className="md:col-span-2">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="training_done"
                name="training_done"
                checked={formData.training_done ?? false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="training_done" className="ml-2 block text-sm text-gray-700">
                Entraînement effectué aujourd'hui
              </label>
            </div>
            
            {formData.training_done && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plaisir de la séance (1-5)</label>
                  <select
                    name="plaisir_seance"
                    value={formData.plaisir_seance ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionnez...</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} - {num === 1 ? 'Aucun plaisir' : num === 5 ? 'Beaucoup de plaisir' : ''}</option>
                    ))}
                  </select>
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
