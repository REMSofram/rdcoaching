'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveProgram } from '@/services/programService';
import { Program } from '@/types/Program';

export default function ProgrammePage() {
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const activeProgram = await getActiveProgram(user.id);
        setProgram(activeProgram);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError('Une erreur est survenue lors du chargement de votre programme.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Votre programme</h1>
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
        <h1 className="text-2xl font-bold mb-6">Votre programme</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Votre programme</h1>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Aucun programme n'a été défini pour le moment. Votre coach vous en assignera un prochainement.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Votre programme</h1>
        <span className="text-sm text-gray-500">
          Mis à jour le {new Date(program.updated_at).toLocaleDateString('fr-FR')}
        </span>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{program.title}</h2>
        <div 
          className="prose max-w-none whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ 
            __html: program.content.replace(/\n/g, '<br />') 
          }} 
        />
      </div>
    </div>
  );
}
