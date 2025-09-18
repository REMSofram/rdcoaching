'use client';

import { useState } from 'react';
import { ToolForm } from '@/components/coach/tools/ToolForm';

export default function FCMaxPage() {
  const [result, setResult] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const age = parseFloat(formData.get('age') as string);
    
    if (isNaN(age) || age <= 0) {
      setResult('Veuillez entrer un âge valide');
      return;
    }
    
    const fcmax = Math.round(220 - age);
    setResult(`Votre fréquence cardiaque maximale est de ${fcmax} bpm`);
  };

  return (
    <ToolForm
      title="Calculateur de FC Max"
      description="Calculez votre fréquence cardiaque maximale en fonction de votre âge"
      backLink="/coach/tools"
      inputs={[
        {
          id: 'age',
          label: 'Âge',
          type: 'number',
          placeholder: '30',
        },
      ]}
      onSubmit={handleSubmit}
      result={result}
    >
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-900">Comment interpréter ce résultat ?</h3>
        <p className="mt-1 text-sm text-gray-600">
          La fréquence cardiaque maximale (FC Max) est le nombre maximal de battements cardiaques par minute que votre cœur peut atteindre pendant un effort intense. 
          Elle diminue généralement avec l'âge. Cette valeur est utilisée pour calculer vos zones d'entraînement cardiaque.
        </p>
      </div>
    </ToolForm>
  );
}
