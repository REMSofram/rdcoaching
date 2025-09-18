import { Metadata } from 'next';
import { Calculator, Utensils, Target, Droplet, ArrowLeftRight, HeartPulse } from 'lucide-react';
import { ToolCard } from '@/components/coach/tools/ToolCard';

export const metadata: Metadata = {
  title: 'Outils - Coach',
  description: 'Outils de calcul pour les coachs',
};

const tools = [
  {
    id: 'macros',
    icon: <Utensils className="h-6 w-6" />,
    label: 'Calculateur de Macros',
    description: 'Calculez vos besoins en macronutriments',
    color: 'green'
  },
  {
    id: 'poids-cible',
    icon: <Target className="h-6 w-6" />,
    label: 'Poids Cible',
    description: 'Définissez et atteignez vos objectifs de poids',
    color: 'purple'
  },
  {
    id: 'fc-max',
    icon: <HeartPulse className="h-6 w-6" />,
    label: 'FC Max',
    description: 'Calculez la fréquence cardiaque maximale',
    color: 'red'
  },
  {
    id: 'imc',
    icon: <Calculator className="h-6 w-6" />,
    label: 'IMC',
    description: 'Calculez l\'indice de masse corporelle',
    color: 'blue'
  },
  {
    id: 'eau',
    icon: <Droplet className="h-6 w-6" />,
    label: 'Besoins en eau',
    description: 'Calculez les besoins journaliers en eau',
    color: 'blue'
  },
  {
    id: 'conversion',
    icon: <ArrowLeftRight className="h-6 w-6" />,
    label: 'Conversion',
    description: 'Convertissez les unités de mesure',
    color: 'purple'
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Outils de calcul</h1>
        <p className="text-muted-foreground">
          Utilisez ces outils pour effectuer des calculs rapides et utiles
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            id={tool.id}
            icon={tool.icon}
            label={tool.label}
            description={tool.description}
            color={tool.color as any}
          />
        ))}
      </div>
    </div>
  );
}
