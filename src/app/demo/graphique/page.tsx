'use client';

import { CombinedChart } from '@/components/shared/charts';

// Données factices pour la démonstration
const demoData = [
  {
    date: '12/09',
    dateLabel: 'lundi 12 septembre 2025',
    poids: 70.6,
    sommeil: 6,
    energie: 2,
    appetit: 3,
    sommeilConverti: 3
  },
  {
    date: '13/09',
    dateLabel: 'mardi 13 septembre 2025',
    poids: 70.4,
    sommeil: 7,
    energie: 3,
    appetit: 4,
    sommeilConverti: 3.5
  },
  {
    date: '14/09',
    dateLabel: 'mercredi 14 septembre 2025',
    poids: 70.2,
    sommeil: 5,
    energie: 2,
    appetit: 3,
    sommeilConverti: 2.5
  },
  {
    date: '15/09',
    dateLabel: 'jeudi 15 septembre 2025',
    poids: 70.0,
    sommeil: 8,
    energie: 4,
    appetit: 5,
    sommeilConverti: 4
  },
  {
    date: '16/09',
    dateLabel: 'vendredi 16 septembre 2025',
    poids: 69.8,
    sommeil: 7,
    energie: 3,
    appetit: 4,
    sommeilConverti: 3.5
  },
  {
    date: '17/09',
    dateLabel: 'samedi 17 septembre 2025',
    poids: 69.9,
    sommeil: 9,
    energie: 5,
    appetit: 5,
    sommeilConverti: 4.5
  },
  {
    date: '18/09',
    dateLabel: 'dimanche 18 septembre 2025',
    poids: 70.1,
    sommeil: 8,
    energie: 4,
    appetit: 5,
    sommeilConverti: 4
  },
];

export default function GraphiqueDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Démonstration du Graphique de Suivi</h1>
      <div className="mb-8 p-6 bg-slate-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Utilisez les boutons en haut à droite pour changer la période d'affichage (1 semaine, 1 mois, 3 mois)</li>
          <li>Cliquez sur les icônes d'œil pour afficher/masquer les différentes métriques</li>
          <li>Survolez le graphique pour voir les valeurs détaillées à chaque date</li>
          <li>Les cartes en bas affichent les moyennes pour chaque métrique</li>
        </ul>
      </div>
      
      <CombinedChart 
        data={demoData} 
        clientName="Maxime Schweiger" 
        className="mb-12" 
      />
      
      <div className="mt-12 p-6 bg-slate-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">À propos de ce graphique</h2>
        <p className="mb-4 text-gray-700">
          Ce composant de graphique interactif permet de suivre l'évolution de plusieurs indicateurs de santé et de bien-être dans le temps.
        </p>
        <p className="text-gray-700">
          Il est entièrement responsive et s'adaptera à la taille de l'écran de l'utilisateur.
        </p>
      </div>
    </div>
  );
}
