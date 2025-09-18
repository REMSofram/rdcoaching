'use client';

import { useState } from 'react';

type UnitType = 'weight' | 'distance';
type Unit = {
  id: string;
  name: string;
  type: UnitType;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
};

const units: Unit[] = [
  // Poids
  { id: 'kg', name: 'Kilogrammes (kg)', type: 'weight', toBase: (v) => v, fromBase: (v) => v },
  { id: 'g', name: 'Grammes (g)', type: 'weight', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'lb', name: 'Livres (lb)', type: 'weight', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
  { id: 'oz', name: 'Ounces (oz)', type: 'weight', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
  
  // Distance
  { id: 'km', name: 'Kilomètres (km)', type: 'distance', toBase: (v) => v, fromBase: (v) => v },
  { id: 'm', name: 'Mètres (m)', type: 'distance', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'mi', name: 'Miles (mi)', type: 'distance', toBase: (v) => v * 1.60934, fromBase: (v) => v / 1.60934 },
  { id: 'yd', name: 'Yards (yd)', type: 'distance', toBase: (v) => v * 0.0009144, fromBase: (v) => v / 0.0009144 },
];

export function UnitConverter() {
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('lb');
  const [result, setResult] = useState<string | null>(null);

  const convert = () => {
    const numValue = parseFloat(value.replace(',', '.'));
    
    if (isNaN(numValue)) {
      setResult('Veuillez entrer une valeur valide');
      return;
    }
    
    const from = units.find(u => u.id === fromUnit);
    const to = units.find(u => u.id === toUnit);
    
    if (!from || !to) {
      setResult('Erreur de conversion');
      return;
    }
    
    if (from.type !== to.type) {
      setResult('Impossible de convertir entre des unités de types différents');
      return;
    }
    
    // Convertir en unité de base, puis en unité cible
    const baseValue = from.toBase(numValue);
    const convertedValue = to.fromBase(baseValue);
    
    setResult(`${value} ${from.id} = ${convertedValue.toFixed(6).replace(/\.?0+$/, '')} ${to.id}`);
  };

  const fromUnitObj = units.find(u => u.id === fromUnit);
  const compatibleUnits = fromUnitObj 
    ? units.filter(u => u.type === fromUnitObj.type && u.id !== fromUnit)
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
            Valeur
          </label>
          <input
            type="text"
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez une valeur"
          />
        </div>

        <div>
          <label htmlFor="fromUnit" className="block text-sm font-medium text-gray-700 mb-1">
            De
          </label>
          <select
            id="fromUnit"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {units.map((unit) => (
              <option key={`from-${unit.id}`} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="toUnit" className="block text-sm font-medium text-gray-700 mb-1">
            À
          </label>
          <select
            id="toUnit"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {compatibleUnits.map((unit) => (
              <option key={`to-${unit.id}`} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={convert}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Convertir
      </button>

      {result && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-md">
          {result}
        </div>
      )}
    </div>
  );
}
