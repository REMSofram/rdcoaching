import { UpcomingSessions } from '@/components/shared/calendar/UpcomingSessions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendrier',
  description: 'Visualisez vos prochaines périodes de suivi',
};

export default function CalendrierPage() {
  return (
    <div className="container mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Mes prochaines périodes</h1>
        <div className="bg-card rounded-lg shadow p-6">
          <UpcomingSessions isCoach={false} limit={10} />
        </div>
      </div>
    </div>
  );
}
