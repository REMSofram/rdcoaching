import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SuiviPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suivi</h1>
        <Link href="/client/daily-log">
          <Button>
            Remplir mon journal du jour
          </Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Historique de suivi</h2>
        <p className="text-gray-600">
          Consultez votre historique de suivi et vos progrès au fil du temps.
        </p>
        
        {/* Ici, nous pouvons ajouter un tableau ou un graphique d'historique plus tard */}
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-center text-gray-500">
            Aucun enregistrement de suivi pour le moment.
          </p>
        </div>
      </div>
    </div>
  );
}
