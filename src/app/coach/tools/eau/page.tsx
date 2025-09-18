'use client';

import { useState } from 'react';
import { ToolForm } from '@/components/coach/tools/ToolForm';

export default function EauPage() {
  const [result, setResult] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weight = parseFloat(formData.get('weight') as string);
    
    if (isNaN(weight) || weight <= 0) {
      setResult('Veuillez entrer un poids valide');
      return;
    }
    
    // Calcul basique : 30-35ml par kg de poids corporel
    const waterMl = Math.round(weight * 33);
    const waterGlasses = Math.round(waterMl / 250);
    
    setResult(`Besoin journalier : ${waterMl} ml (environ ${waterGlasses} verres de 250ml)`);
  };

  return (
    <ToolForm
      title="Calculateur de besoins en eau"
      description="Estimez vos besoins quotidiens en eau"
      backLink="/coach/tools"
      inputs={[
        {
          id: 'weight',
          label: 'Poids (kg)',
          type: 'number',
          placeholder: '70',
        },
      ]}
      onSubmit={handleSubmit}
      result={result}
    >
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-900">Conseils d'hydratation</h3>
        <ul className="mt-2 text-sm text-blue-800 space-y-1">
          <li>• Buvez régulièrement tout au long de la journée</li>
          <li>• Augmentez votre consommation lors des entraînements</li>
          <li>• L'urine claire est un bon indicateur d'une bonne hydratation</li>
        </ul>
        <p className="mt-2 text-xs text-blue-700">
          Note : Les besoins peuvent varier en fonction de l'activité physique, 
          de la température ambiante et d'autres facteurs individuels.
        </p>
      </div>
    </ToolForm>
  );
}
