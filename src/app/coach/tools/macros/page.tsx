'use client';

import { useState } from 'react';
import { ToolForm } from '@/components/coach/tools/ToolForm';
import { Utensils, Info } from 'lucide-react';

export default function MacrosPage() {
  const [result, setResult] = useState('');
  const [goal, setGoal] = useState('maintenance');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weight = parseFloat(formData.get('weight') as string);
    const height = parseFloat(formData.get('height') as string);
    const age = parseFloat(formData.get('age') as string);
    const gender = formData.get('gender') as string;
    const activity = parseFloat(formData.get('activity') as string);
    
    if (isNaN(weight) || weight <= 0) {
      setResult('Veuillez entrer un poids valide');
      return;
    }
    
    if (isNaN(height) || height <= 0) {
      setResult('Veuillez entrer une taille valide');
      return;
    }
    
    if (isNaN(age) || age <= 0) {
      setResult('Veuillez entrer un âge valide');
      return;
    }
    
    // Calcul du métabolisme de base (BMR)
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // Calcul des besoins caloriques journaliers
    const tdee = bmr * activity;
    
    // Ajustement en fonction de l'objectif
    let adjustedCalories = tdee;
    if (goal === 'weight_loss') {
      adjustedCalories = tdee * 0.8; // Réduction de 20% pour la perte de poids
    } else if (goal === 'muscle_gain') {
      adjustedCalories = tdee * 1.1; // Augmentation de 10% pour la prise de masse
    }
    
    // Calcul des macros
    const proteinGrams = Math.round(weight * 2.2); // 2.2g de protéines par kg de poids de corps
    const proteinCals = proteinGrams * 4;
    const fatGrams = Math.round((adjustedCalories * 0.25) / 9); // 25% des calories provenant des lipides
    const fatCals = fatGrams * 9;
    const remainingCals = adjustedCalories - proteinCals - fatCals;
    const carbGrams = Math.round(remainingCals / 4);
    
    setResult(`
      Apport calorique quotidien: ${Math.round(adjustedCalories)} kcal
      
      Protéines: ${proteinGrams}g (${Math.round(proteinCals / adjustedCalories * 100)}%)
      Glucides: ${carbGrams}g (${Math.round(remainingCals / adjustedCalories * 100)}%)
      Lipides: ${fatGrams}g (25%)
      
      Répartition journalière recommandée:
      - Petit-déjeuner: ${Math.round(adjustedCalories * 0.25)} kcal
      - Déjeuner: ${Math.round(adjustedCalories * 0.35)} kcal
      - Collation: ${Math.round(adjustedCalories * 0.15)} kcal
      - Dîner: ${Math.round(adjustedCalories * 0.25)} kcal
    `);
  };

  return (
    <ToolForm
      title="Calculateur de Macros"
      description="Calculez vos besoins en macronutriments en fonction de vos objectifs"
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
          id: 'weight',
          label: 'Poids (kg)',
          type: 'number',
          placeholder: '70',
        },
        {
          id: 'height',
          label: 'Taille (cm)',
          type: 'number',
          placeholder: '175',
        },
        {
          id: 'age',
          label: 'Âge',
          type: 'number',
          placeholder: '30',
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
                  value="weight_loss"
                  checked={goal === 'weight_loss'}
                  onChange={() => setGoal('weight_loss')}
                />
                <span className="ml-2 text-blue-800">Perte de poids</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="goal"
                  value="maintenance"
                  checked={goal === 'maintenance'}
                  onChange={() => setGoal('maintenance')}
                />
                <span className="ml-2 text-blue-800">Maintien</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="goal"
                  value="muscle_gain"
                  checked={goal === 'muscle_gain'}
                  onChange={() => setGoal('muscle_gain')}
                />
                <span className="ml-2 text-blue-800">Prise de muscle</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-green-50 rounded-md">
        <h3 className="font-medium text-green-900">Conseils nutritionnels</h3>
        <ul className="mt-2 text-sm text-green-800 space-y-1">
          <li>• Buvez au moins 2L d'eau par jour</li>
          <li>• Privilégiez les protéines maigres (poulet, poisson, tofu)</li>
          <li>• Choisissez des glucides complexes (riz complet, patate douce, quinoa)</li>
          <li>• Consommez des graisses saines (avocat, noix, huile d'olive)</li>
          <li>• Mangez des légumes à chaque repas</li>
        </ul>
      </div>
    </ToolForm>
  );
}
