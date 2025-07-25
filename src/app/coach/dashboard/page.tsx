import { Metadata } from 'next';
import CoachLayout from '@/layout/CoachLayout';

export const metadata: Metadata = {
  title: 'Tableau de bord - Coach',
  description: 'Tableau de bord du coach',
};

export default function CoachDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Coach</h1>
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Bienvenue dans votre espace coach</h2>
        <p className="mt-2 text-gray-600">
          Gérez vos clients, consultez les statistiques et planifiez vos séances.
        </p>
      </div>
    </div>
  );
}

// Envelopper la page avec le layout du coach
CoachDashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <CoachLayout>{page}</CoachLayout>;
};
