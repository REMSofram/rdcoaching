import { Calendar } from '@/components/shared/calendar';
import { UpcomingSessions } from '@/components/shared/calendar/UpcomingSessions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendrier',
  description: 'Visualisez votre calendrier de suivi',
};

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Mon Calendrier</h1>
        <div className="bg-card rounded-lg shadow p-6">
          <Calendar 
            isCoach={false}
            emptyState={
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Aucune période n'a été définie pour le moment. Votre coach vous en définira prochainement.
                </p>
              </div>
            }
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Prochaines périodes</h2>
        <div className="bg-card rounded-lg shadow p-6">
          <UpcomingSessions isCoach={false} limit={5} />
        </div>
      </div>
    </div>
  );
}
