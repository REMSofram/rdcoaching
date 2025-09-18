'use client';

import { useState } from 'react';
import { ToolForm } from '@/components/coach/tools/ToolForm';

export default function ConversionPage() {
  const [result, setResult] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = parseFloat(formData.get('value') as string);
    const from = formData.get('from') as string;
    const to = formData.get('to') as string;
    
    if (isNaN(value)) {
      setResult('Veuillez entrer une valeur valide');
      return;
    }
    
    if (from === to) {
      setResult('Les unités doivent être différentes');
      return;
    }
    
    let resultValue = 0;
    let unit = '';
    
    // Conversion de poids
    if (from === 'kg' && to === 'lb') {
      resultValue = value * 2.20462;
      unit = 'lb';
    } else if (from === 'lb' && to === 'kg') {
      resultValue = value * 0.453592;
      unit = 'kg';
    } 
    // Conversion de distance
    else if (from === 'km' && to === 'mi') {
      resultValue = value * 0.621371;
      unit = 'miles';
    } else if (from === 'mi' && to === 'km') {
      resultValue = value * 1.60934;
      unit = 'km';
    } else {
      setResult('Conversion non supportée entre ces unités');
      return;
    }
    
    setResult(`${value} ${from} = ${resultValue.toFixed(2)} ${unit}`);
  };

  return (
    <ToolForm
      title="Convertisseur d'unités"
      description="Convertissez facilement entre différentes unités de mesure"
      backLink="/coach/tools"
      inputs={[
        {
          id: 'value',
          label: 'Valeur',
          type: 'number',
          placeholder: '1',
        },
        {
          id: 'from',
          label: 'De',
          type: 'select',
          options: ['kg', 'lb', 'km', 'mi'],
        },
        {
          id: 'to',
          label: 'À',
          type: 'select',
          options: ['lb', 'kg', 'mi', 'km'],
        },
      ]}
      onSubmit={handleSubmit}
      result={result}
    >
      <div className="mt-6 p-4 bg-purple-50 rounded-md">
        <h3 className="font-medium text-purple-900">Unités disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <h4 className="font-medium text-sm text-purple-800">Poids</h4>
            <ul className="text-sm text-purple-700 space-y-1 mt-1">
              <li>• kg → lb (kilogrammes en livres)</li>
              <li>• lb → kg (livres en kilogrammes)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm text-purple-800">Distance</h4>
            <ul className="text-sm text-purple-700 space-y-1 mt-1">
              <li>• km → mi (kilomètres en miles)</li>
              <li>• mi → km (miles en kilomètres)</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolForm>
  );
}
