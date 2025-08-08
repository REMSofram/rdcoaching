'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveNutritionProgram } from '@/services/nutritionService';
import { NutritionProgram } from '@/types/Nutrition';
import { TabSystem } from '@/components/shared/TabSystem';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NutritionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [program, setProgram] = useState<NutritionProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formate les jours pour le composant TabSystem
  const formatDays = useCallback((program: NutritionProgram) => {
    if (!program.nutrition_days || program.nutrition_days.length === 0) {
      // Création d'un jour par défaut vide
      return [{
        id: 'default',
        day_title: 'Mon programme nutritionnel',
        content: 'Aucun contenu disponible pour le moment. Votre coach vous préparera bientôt un programme personnalisé.',
        day_order: 0,
        nutrition_program_id: program.id,
        created_at: program.created_at,
        updated_at: program.updated_at
      }];
    }
    // Retourne les jours triés par ordre
    return [...program.nutrition_days].sort((a, b) => a.day_order - b.day_order);
  }, []);

  useEffect(() => {
    const fetchProgram = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const activeProgram = await getActiveNutritionProgram(user.id);
        setProgram(activeProgram);
      } catch (err) {
        console.error('Error fetching nutrition program:', err);
        setError('Une erreur est survenue lors du chargement de votre programme nutritionnel.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [user?.id]);

  const BackButton = () => (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="mb-6 flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Retour
    </Button>
  );

  if (loading) {
    return (
      <div className="p-6">
        <BackButton />
        <h1 className="text-2xl font-bold mb-6">Votre programme nutritionnel</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <BackButton />
        <h1 className="text-2xl font-bold mb-6">Votre programme nutritionnel</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-6">
        <BackButton />
        <h1 className="text-2xl font-bold mb-6">Votre programme nutritionnel</h1>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Aucun programme nutritionnel n'a été défini pour le moment. Votre coach vous en préparera un prochainement.
        </div>
      </div>
    );
  }

  const days = formatDays(program);

  return (
    <div className="p-6">
      <BackButton />
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {program.title || 'Mon programme nutritionnel'}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Mis à jour le {new Date(program.updated_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <TabSystem
          days={days}
          readOnly={true}
          dayType="nutrition"
        />
      </div>
    </div>
  );
}
