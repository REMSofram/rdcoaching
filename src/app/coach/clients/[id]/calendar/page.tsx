import { Calendar } from '@/components/shared/calendar';
import { Metadata } from 'next';

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Calendrier Client',
  description: 'Gérez le calendrier de suivi de votre client',
};

export default function ClientCalendarPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendrier Client</h1>
      </div>
      
      <div className="bg-card rounded-lg shadow p-6">
        <Calendar 
          clientId={params.id} 
          isCoach={true} 
        />
      </div>
    </div>
  );
}
