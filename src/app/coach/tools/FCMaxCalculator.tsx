'use client';

import { useState } from 'react';

export function FCMaxCalculator() {
  const [age, setAge] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const ageValue = parseInt(age, 10);
    if (isNaN(ageValue) || ageValue <= 0) {
      setResult('Veuillez entrer un âge valide');
      return;
    }
    
    const fcmax = 220 - ageValue;
    setResult(`Votre fréquence cardiaque maximale est de ${fcmax} battements par minute.`);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
          Âge
        </label>
        <input
          type="number"
          id="age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Entrez votre âge"
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
