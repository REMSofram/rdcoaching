'use client';

import { useState } from 'react';

export function WaterIntakeCalculator() {
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const weightValue = parseFloat(weight.replace(',', '.'));
    
    if (isNaN(weightValue) || weightValue <= 0) {
      setResult('Veuillez entrer un poids valide');
      return;
    }
    
    // Calcul basique : 30-35ml par kg de poids corporel
    const waterMl = Math.round(weightValue * 33);
    const waterGlasses = Math.round(waterMl / 250);
    
    setResult(`Vos besoins journaliers en eau sont d'environ ${waterMl} ml (soit environ ${waterGlasses} verres de 250 ml).`);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
          Poids (kg)
        </label>
        <input
          type="text"
          id="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: 70"
        />
      </div>

      <button
        onClick={calculate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Calculer
      </button>

      {result && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-md">
          {result}
        </div>
      )}
    </div>
  );
}
