'use client';

import { useState } from 'react';

export function IMCCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const weightValue = parseFloat(weight.replace(',', '.'));
    const heightValue = parseFloat(height.replace(',', '.'));
    
    if (isNaN(weightValue) || weightValue <= 0) {
      setResult('Veuillez entrer un poids valide');
      return;
    }
    
    if (isNaN(heightValue) || heightValue <= 0) {
      setResult('Veuillez entrer une taille valide');
      return;
    }
    
    const imc = weightValue / (heightValue * heightValue);
    let interpretation = '';
    
    if (imc < 18.5) interpretation = 'Insuffisance pondérale';
    else if (imc < 25) interpretation = 'Poids normal';
    else if (imc < 30) interpretation = 'Surpoids';
    else interpretation = 'Obésité';
    
    setResult(`Votre IMC est de ${imc.toFixed(1)} (${interpretation})`);
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

      <div>
        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
          Taille (m)
        </label>
        <input
          type="text"
          id="height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: 1.75"
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
