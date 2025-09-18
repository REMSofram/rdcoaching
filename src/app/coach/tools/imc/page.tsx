'use client';

import { useState } from 'react';
import { ToolForm } from '@/components/coach/tools/ToolForm';

export default function IMCPage() {
  const [result, setResult] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weight = parseFloat(formData.get('weight') as string);
    const height = parseFloat(formData.get('height') as string);
    
    if (isNaN(weight) || weight <= 0) {
      setResult('Veuillez entrer un poids valide');
      return;
    }
    
    if (isNaN(height) || height <= 0) {
      setResult('Veuillez entrer une taille valide');
      return;
    }
    
    const imc = weight / (height * height);
    let interpretation = '';
    
    if (imc < 18.5) interpretation = 'Insuffisance pondérale';
    else if (imc < 25) interpretation = 'Poids normal';
    else if (imc < 30) interpretation = 'Surpoids';
    else interpretation = 'Obésité';
    
    setResult(`Votre IMC est de ${imc.toFixed(1)} (${interpretation})`);
  };

  return (
    <ToolForm
      title="Calculateur d'IMC"
      description="Calculez votre Indice de Masse Corporelle"
      backLink="/coach/tools"
      inputs={[
        {
          id: 'weight',
          label: 'Poids (kg)',
          type: 'number',
          placeholder: '70',
        },
        {
          id: 'height',
          label: 'Taille (m)',
          type: 'number',
          step: '0.01',
          placeholder: '1.75',
        },
      ]}
      onSubmit={handleSubmit}
      result={result}
    >
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-900">Interprétation de l'IMC</h3>
        <ul className="mt-2 text-sm text-gray-600 space-y-1">
          <li>• Moins de 18,5 : Insuffisance pondérale</li>
          <li>• 18,5 à 24,9 : Poids normal</li>
          <li>• 25,0 à 29,9 : Surpoids</li>
          <li>• 30,0 et plus : Obésité</li>
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          Note : L'IMC est un indicateur général et ne tient pas compte de la masse musculaire. 
          Consultez un professionnel de santé pour une évaluation plus complète.
        </p>
      </div>
    </ToolForm>
  );
}
