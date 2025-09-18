'use client';

import { useState } from 'react';
import { ToolForm } from '@/components/coach/tools/ToolForm';
import { Target, Info, TrendingUp, TrendingDown } from 'lucide-react';

export default function PoidsCiblePage() {
  const [result, setResult] = useState('');
  const [goal, setGoal] = useState('lose');
  const [weeklyGoal, setWeeklyGoal] = useState('0.5');

  const calculateTimeToGoal = (currentWeight: number, targetWeight: number, weeklyLossKg: number) => {
    const weightDiff = Math.abs(currentWeight - targetWeight);
    const weeksNeeded = Math.ceil(weightDiff / weeklyLossKg);
    
    if (weeksNeeded === 0) return 'Vous avez déjà atteint votre objectif !';
    
    const months = Math.floor(weeksNeeded / 4.345);
    const remainingWeeks = Math.round(weeksNeeded % 4.345);
    
    let timeStr = '';
    if (months > 0) {
      timeStr += `${months} mois`;
      if (remainingWeeks > 0) {
        timeStr += ` et ${remainingWeeks} semaine${remainingWeeks > 1 ? 's' : ''}`;
      }
    } else {
      timeStr += `${weeksNeeded} semaine${weeksNeeded > 1 ? 's' : ''}`;
    }
    
    return `Temps estimé pour atteindre votre objectif : ${timeStr}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentWeight = parseFloat(formData.get('currentWeight') as string);
    const targetWeight = parseFloat(formData.get('targetWeight') as string);
    const height = parseFloat(formData.get('height') as string);
    const age = parseFloat(formData.get('age') as string);
    const gender = formData.get('gender') as string;
    const activity = parseFloat(formData.get('activity') as string);
    
    if (isNaN(currentWeight) || currentWeight <= 0) {
      setResult('Veuillez entrer un poids actuel valide');
      return;
    }
    
    if (isNaN(targetWeight) || targetWeight <= 0) {
      setResult('Veuillez entrer un poids cible valide');
      return;
    }
    
    if (isNaN(height) || height <= 0) {
      setResult('Veuillez entrer une taille valide');
      return;
    }
    
    // Vérification de la cohérence des objectifs
    if (goal === 'lose' && currentWeight < targetWeight) {
      setResult('Pour une perte de poids, votre poids cible doit être inférieur à votre poids actuel');
      return;
    }
    
    if (goal === 'gain' && currentWeight > targetWeight) {
      setResult('Pour une prise de poids, votre poids cible doit être supérieur à votre poids actuel');
      return;
    }
    
    // Calcul de l'IMC actuel et cible
    const currentBMI = currentWeight / Math.pow(height / 100, 2);
    const targetBMI = targetWeight / Math.pow(height / 100, 2);
    
    // Évaluation de l'IMC
    const evaluateBMI = (bmi: number) => {
      if (bmi < 18.5) return 'Insuffisance pondérale';
      if (bmi < 25) return 'Poids normal';
      if (bmi < 30) return 'Surpoids';
      return 'Obésité';
    };
    
    // Calcul du déficit/surplus calorique nécessaire
    const weightDiff = Math.abs(currentWeight - targetWeight);
    const weeklyLossKg = parseFloat(weeklyGoal);
    const timeToGoal = calculateTimeToGoal(currentWeight, targetWeight, weeklyLossKg);
    
    // Calcul des besoins caloriques pour le poids cible
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * targetWeight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * targetWeight) + (3.098 * height) - (4.330 * age);
    }
    
    const tdee = bmr * activity;
    
    setResult(`
      Votre IMC actuel: ${currentBMI.toFixed(1)} (${evaluateBMI(currentBMI)})
      IMC cible: ${targetBMI.toFixed(1)} (${evaluateBMI(targetBMI)})
      
      ${timeToGoal}
      
      Pour ${goal === 'lose' ? 'perdre' : 'prendre'} ${weightDiff} kg à un rythme de ${weeklyLossKg} kg/semaine,
      vous devriez viser un ${goal === 'lose' ? 'déficit' : 'surplus'} de ${Math.round(weeklyLossKg * 7700 / 7)} calories par jour.
      
      Vos besoins caloriques estimés pour maintenir votre poids cible :
      Environ ${Math.round(tdee)} kcal/jour
      
      Conseil : Pour une perte de poids saine, ne dépassez pas un déficit de 500-750 kcal/jour.
      Pour une prise de poids, visez un surplus de 250-500 kcal/jour maximum.
    `);
  };

  return (
    <ToolForm
      title="Calculateur de Poids Cible"
      description="Définissez et atteignez vos objectifs de poids de manière saine"
      backLink="/coach/tools"
      inputs={[
        {
          id: 'gender',
          label: 'Genre',
          type: 'select',
          options: [
            { value: 'male', label: 'Homme' },
            { value: 'female', label: 'Femme' }
          ],
        },
        {
          id: 'age',
          label: 'Âge',
          type: 'number',
          placeholder: '30',
        },
        {
          id: 'height',
          label: 'Taille (cm)',
          type: 'number',
          placeholder: '175',
        },
        {
          id: 'currentWeight',
          label: 'Poids actuel (kg)',
          type: 'number',
          step: '0.1',
          placeholder: '75',
        },
        {
          id: 'targetWeight',
          label: 'Poids cible (kg)',
          type: 'number',
          step: '0.1',
          placeholder: goal === 'lose' ? '70' : '80',
        },
        {
          id: 'activity',
          label: 'Niveau d\'activité',
          type: 'select',
          options: [
            { value: '1.2', label: 'Sédentaire (peu ou pas d\'exercice)' },
            { value: '1.375', label: 'Légèrement actif (1-3 séances/semaine)' },
            { value: '1.55', label: 'Modérément actif (3-5 séances/semaine)' },
            { value: '1.725', label: 'Très actif (6-7 séances/semaine)' },
            { value: '1.9', label: 'Extrêmement actif (travail physique + entraînement)' }
          ],
        },
      ]}
      onSubmit={handleSubmit}
      result={result}
    >
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900">Objectif</h3>
            <div className="mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="goal"
                  value="lose"
                  checked={goal === 'lose'}
                  onChange={() => setGoal('lose')}
                />
                <span className="ml-2 text-blue-800">Perte de poids</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="goal"
                  value="gain"
                  checked={goal === 'gain'}
                  onChange={() => setGoal('gain')}
                />
                <span className="ml-2 text-blue-800">Prise de masse</span>
              </label>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objectif {goal === 'lose' ? 'de perte' : 'de prise'} hebdomadaire
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(e.target.value)}
              >
                {goal === 'lose' ? (
                  <>
                    <option value="0.25">0.25 kg/semaine (lent et durable)</option>
                    <option value="0.5">0.5 kg/semaine (recommandé)</option>
                    <option value="0.75">0.75 kg/semaine (rapide)</option>
                    <option value="1">1 kg/semaine (très rapide)</option>
                  </>
                ) : (
                  <>
                    <option value="0.125">0.125 kg/semaine (lent et durable)</option>
                    <option value="0.25">0.25 kg/semaine (recommandé)</option>
                    <option value="0.5">0.5 kg/semaine (rapide, risque de prise de graisse)</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-green-50 rounded-md">
        <h3 className="font-medium text-green-900">Conseils pour atteindre votre objectif</h3>
        <ul className="mt-2 text-sm text-green-800 space-y-1">
          {goal === 'lose' ? (
            <>
              <li className="flex items-start">
                <TrendingDown className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>Créez un léger déficit calorique (300-500 kcal/jour)</span>
              </li>
              <li>• Maintenez un apport élevé en protéines pour préserver la masse musculaire</li>
              <li>• Combinez cardio et musculation pour de meilleurs résultats</li>
              <li>• Dormez suffisamment (7-9h par nuit)</li>
              <li>• Gérez votre stress pour éviter les fringales émotionnelles</li>
            </>
          ) : (
            <>
              <li className="flex items-start">
                <TrendingUp className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>Consommez un léger surplus calorique (200-300 kcal/jour)</span>
              </li>
              <li>• Mangez suffisamment de protéines (1.6-2.2g/kg de poids de corps)</li>
              <li>• Privilégiez les aliments riches en nutriments</li>
              <li>• Suivez un programme de musculation progressif</li>
              <li>• Dormez suffisamment pour une récupération optimale</li>
            </>
          )}
        </ul>
      </div>
    </ToolForm>
  );
}
